const db = require("../config/db");

/**
 * 日程調整（会いたい要望）のデータベース操作を行うモデル
 */
const Schedule = {
  // 新規スケジュール作成
  create: async (family_id, sender_name, meetup_type, time_ranges, sender_id) => {
    // 家族IDを正規化
    const normalizedId = family_id
      ? family_id.toUpperCase().replace(/[^A-Z0-9]/g, "")
      : null;
    // time_ranges はオブジェクトまたは配列なので文字列化して保存
    const [result] = await db.execute(
      "INSERT INTO schedules (family_id, sender_name, meetup_type, time_ranges, sender_id) VALUES (?, ?, ?, ?, ?)",
      [normalizedId, sender_name, meetup_type, JSON.stringify(time_ranges), sender_id],
    );
    return result.insertId;
  },

  // 家族ごとのスケジュール一覧取得
  findByFamilyId: async (family_id) => {
    const normalizedId = family_id
      ? family_id.toUpperCase().replace(/[^A-Z0-9]/g, "")
      : "";

    if (!normalizedId) {
      return [];
    }

    const connection = await db.getConnection();

    try {
      await connection.query("COMMIT");

      await connection.query(
        "SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED",
      );

      const [rows] = await connection.query(
        "SELECT * FROM schedules WHERE family_id = ? ORDER BY created_at DESC",
        [normalizedId],
      );
      return rows;
    } finally {
      connection.release();
    }
  },

  // ステータス更新
  updateStatus: async (id, status) => {
    const [result] = await db.execute(
      "UPDATE schedules SET status = ? WHERE id = ?",
      [status, id],
    );
    return result;
  },

  // 決まった日程を保存
  updateFinalSchedule: async (id, final_schedule) => {
    const [result] = await db.execute(
      "UPDATE schedules SET status = 'completed', final_schedule = ? WHERE id = ?",
      [JSON.stringify(final_schedule), id],
    );
    return result;
  },
};

module.exports = Schedule;
