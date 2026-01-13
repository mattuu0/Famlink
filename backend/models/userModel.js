const db = require('../config/db');

/**
 * ユーザー情報のデータベース操作を行うモデル
 */
const User = {
  // メールアドレスでユーザーを検索
  findByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  // 新規ユーザー登録
  create: async (email, password, user_name, invite_code) => {
    console.log(`SQL実行: INSERT INTO users (email, password, user_name, invite_code) VALUES ('${email}', '...', '${user_name}', '${invite_code}')`);
    const [result] = await db.execute(
      'INSERT INTO users (email, password, user_name, invite_code) VALUES (?, ?, ?, ?)',
      [email, password, user_name, invite_code]
    );
    return result.insertId;
  },

  // ユーザーの家族IDを更新
  updateFamilyId: async (email, family_id) => {
    const [result] = await db.query('UPDATE users SET family_id = ? WHERE email = ?', [family_id, email]);
    return result;
  },

  // 招待コードでユーザーを検索
  findByInviteCode: async (invite_code) => {
    const [rows] = await db.query('SELECT * FROM users WHERE invite_code = ?', [invite_code]);
    return rows[0];
  },

  // 招待コードを更新（既存ユーザーへの割り当て用）
  updateInviteCode: async (id, invite_code) => {
    const [result] = await db.query('UPDATE users SET invite_code = ? WHERE id = ?', [invite_code, id]);
    return result;
  },

  // 家族脱退（family_idをNULLにする）
  leaveFamily: async (email) => {
    const [result] = await db.query('UPDATE users SET family_id = NULL WHERE email = ?', [email]);
    return result;
  }
};

module.exports = User;
