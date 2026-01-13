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