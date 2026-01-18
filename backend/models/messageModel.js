const db = require('../config/db');

/**
 * メッセージ（感情・コメント）のデータベース操作を行うモデル
 */
const Message = {
  // メッセージを保存
  create: async (user_name, emotion, comment, family_id) => {
    // 念のため正規化して保存
    const normalizedId = family_id ? family_id.toUpperCase().replace(/[^A-Z0-9]/g, '') : null;
    const [result] = await db.query(
      'INSERT INTO messages (user_name, emotion, comment, family_id) VALUES (?, ?, ?, ?)',
      [user_name, emotion, comment, normalizedId]
    );
    return result.insertId;
  },

  // 家族ごとのメッセージ履歴を取得
  findByFamilyId: async (family_id) => {
    // 渡されたfamily_idを正規化してから検索する
    const normalizedId = family_id ? family_id.toUpperCase().replace(/[^A-Z0-9]/g, '') : null;
    if (!normalizedId) {
      return []; // 無効なIDの場合は空の結果を返す
    }
    const [rows] = await db.query(
      'SELECT * FROM messages WHERE family_id = ? ORDER BY created_at DESC',
      [normalizedId]
    );
    return rows;
  }
};

module.exports = Message;
