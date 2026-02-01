const db = require("../config/db");

const ScheduleResponse = {
  // 回答を作成または更新
  createOrUpdate: async (
    schedule_id,
    user_id,
    user_name,
    selected_time_slots,
  ) => {
    const [result] = await db.execute(
      `INSERT INTO schedule_responses (schedule_id, user_id, user_name, selected_time_slots)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       selected_time_slots = VALUES(selected_time_slots),
       created_at = CURRENT_TIMESTAMP`,
      [schedule_id, user_id, user_name, JSON.stringify(selected_time_slots)],
    );
    return result.insertId || result.affectedRows;
  },

  // 特定のスケジュールへの全回答を取得
  findByScheduleId: async (schedule_id) => {
    const [rows] = await db.query(
      "SELECT * FROM schedule_responses WHERE schedule_id = ?",
      [schedule_id],
    );
    return rows;
  },

  // 特定のスケジュールへの回答数を取得
  countByScheduleId: async (schedule_id) => {
    const [rows] = await db.query(
      "SELECT COUNT(*) as count FROM schedule_responses WHERE schedule_id = ?",
      [schedule_id],
    );
    return rows[0].count;
  },

  // 特定のユーザーが特定のスケジュールに回答済みかチェック
  hasUserResponded: async (schedule_id, user_id) => {
    const [rows] = await db.query(
      "SELECT id FROM schedule_responses WHERE schedule_id = ? AND user_id = ?",
      [schedule_id, user_id],
    );
    return rows.length > 0;
  },
};

module.exports = ScheduleResponse;
