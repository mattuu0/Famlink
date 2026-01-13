require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MySQL接続設定
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('MySQL接続エラー:', err);
    return;
  }
  console.log('MySQLに接続成功！');

  // カラムの追加（存在確認を行ってから実行）
  db.query("SHOW COLUMNS FROM users LIKE 'invite_code'", (err, results) => {
    if (err) {
      console.error('カラム確認エラー:', err);
      return;
    }
    
    if (results.length === 0) {
      // カラムが存在しない場合のみ追加
      const addColumnSql = "ALTER TABLE users ADD COLUMN invite_code VARCHAR(20) UNIQUE";
      db.query(addColumnSql, (err) => {
        if (err) {
          console.error('カラム追加エラー:', err);
        } else {
          console.log('invite_code カラムを新しく追加しました');
        }
      });
    } else {
      console.log('invite_code カラムは既に存在します');
    }
  });
});

// 招待コード生成関数
const generateInviteCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 9; i++) {
    if (i > 0 && i % 3 === 0) code += '-';
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

// --- ユーザー認証 API ---

// 1. 新規登録 API
app.post('/api/register', (req, res) => {
  const { email, password, user_name } = req.body;
  const invite_code = generateInviteCode();
  const sql = 'INSERT INTO users (email, password, user_name, invite_code) VALUES (?, ?, ?, ?)';
  db.query(sql, [email, password, user_name, invite_code], (err, result) => {
    if (err) {
      console.error('登録エラー:', err);
      return res.status(500).send(err);
    }
    res.send({ message: '登録完了！', userId: result.insertId, invite_code });
  });
});

// 2. ログイン API
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) {
      return res.status(401).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
    }
    
    const user = results[0];
    
    // 招待コードがまだない既存ユーザーへの対応
    if (!user.invite_code) {
      const newCode = generateInviteCode();
      db.query('UPDATE users SET invite_code = ? WHERE id = ?', [newCode, user.id], (updErr) => {
        user.invite_code = newCode;
        res.json({ message: 'ログイン成功', user: user });
      });
    } else {
      res.json({ message: 'ログイン成功', user: user });
    }
  });
});

// --- 家族管理 API ---

// 3. 家族作成 API
app.post('/api/families/create', (req, res) => {
  const { family_id, family_name, email } = req.body;
  
  // すでにその家族が存在するか確認
  db.query('SELECT * FROM families WHERE family_id = ?', [family_id], (err, results) => {
    if (err) return res.status(500).send(err);
    
    const updateUser = () => {
      db.query('UPDATE users SET family_id = ? WHERE email = ?', [family_id, email], (err) => {
        if (err) return res.status(500).send(err);
        res.send({ message: '家族グループ作成完了！', family_id });
      });
    };

    if (results.length === 0) {
      const sqlCreateFamily = 'INSERT INTO families (family_id, family_name) VALUES (?, ?)';
      db.query(sqlCreateFamily, [family_id, family_name || '家族'], (err) => {
        if (err) return res.status(500).send(err);
        updateUser();
      });
    } else {
      // すでに存在する場合は、そのままユーザーの所属を更新
      updateUser();
    }
  });
});

// 4. 家族参加 API
app.post('/api/families/join', (req, res) => {
  const { family_id, email } = req.body; 
  
  if (!family_id) {
    return res.status(400).json({ message: '招待コードを入力してください' });
  }

  const code = family_id.trim();

  // 1. まず families テーブルに直接その ID があるか確認
  db.query('SELECT * FROM families WHERE family_id = ?', [code], (err, results) => {
    if (err) return res.status(500).send(err);
    
    if (results.length > 0) {
      // 既存の家族が見つかった場合
      updateUserFamily(code, email, res);
    } else {
      // 2. 見つからない場合、users テーブルの invite_code として探す
      db.query('SELECT family_id, invite_code FROM users WHERE invite_code = ?', [code], (err, userResults) => {
        if (err) return res.status(500).send(err);
        
        if (userResults.length > 0) {
          const targetUser = userResults[0];
          if (targetUser.family_id) {
            // そのユーザーが既に家族に所属しているなら、その家族に参加
            updateUserFamily(targetUser.family_id, email, res);
          } else {
            // そのユーザーがまだ家族を作成していないなら、招待コードを家族IDとして新規作成
            const newFamilyId = targetUser.invite_code;
            db.query('INSERT INTO families (family_id, family_name) VALUES (?, ?)', [newFamilyId, '家族'], (err) => {
              // 重複エラー(ER_DUP_ENTRY)は無視して進める
              if (err && err.errno !== 1062) return res.status(500).send(err);
              
              // 招待した側のユーザーもその家族に所属させる
              db.query('UPDATE users SET family_id = ? WHERE invite_code = ?', [newFamilyId, newFamilyId], (err) => {
                if (err) return res.status(500).send(err);
                updateUserFamily(newFamilyId, email, res);
              });
            });
          }
        } else {
          return res.status(404).json({ message: '招待コードが正しくないか、家族グループが見つかりません' });
        }
      });
    }
  });
});

// ユーザーの家族IDを更新するヘルパー関数
function updateUserFamily(family_id, email, res) {
  const sqlUpdateUser = 'UPDATE users SET family_id = ? WHERE email = ?';
  db.query(sqlUpdateUser, [family_id, email], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ message: '家族グループに参加しました！', family_id });
  });
}

// 5. ユーザー情報取得 API (family_id 確認用)
app.get('/api/users/:email', (req, res) => {
  const { email } = req.params;
  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length === 0) return res.status(404).send('User not found');
    res.json(results[0]);
  });
});

// 1. メッセージ保存 API (POST)
// フロントから送られてきた family_id も一緒に保存します
app.post('/api/messages', (req, res) => {
  const { user_name, emotion, comment, family_id } = req.body;
  const sql = 'INSERT INTO messages (user_name, emotion, comment, family_id) VALUES (?, ?, ?, ?)';
  
  db.query(sql, [user_name, emotion, comment, family_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send({ message: '保存完了！', id: result.insertId });
  });
});

// 2. メッセージ取得 API (GET)
// URLの最後につけた family_id を元に、その家族の分だけを取得します
app.get('/api/messages/:family_id', (req, res) => {
  const { family_id } = req.params;
  const sql = 'SELECT * FROM messages WHERE family_id = ? ORDER BY created_at DESC';
  
  db.query(sql, [family_id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});