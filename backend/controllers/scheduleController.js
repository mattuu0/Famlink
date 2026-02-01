const scheduleService = require('../services/scheduleService');

/**
 * 日程調整のリクエストを処理するコントローラー
 */
const scheduleController = {
  // スケジュール作成
  create: async (req, res) => {
    console.log('API Request: POST /api/schedules', req.body);
    try {
      const { family_id, sender_name, meetup_type, time_ranges, sender_id } = req.body;
      const id = await scheduleService.createSchedule(family_id, sender_name, meetup_type, time_ranges, sender_id);
      res.status(201).json({ message: 'スケジュールを保存しました', id });
    } catch (err) {
      console.error('スケジュール保存エラー:', err.message);
      res.status(500).json({ message: err.message });
    }
  },

  // 家族のスケジュール取得
  list: async (req, res) => {
    const { family_id } = req.params;
    console.log(`API Request: GET /api/schedules/${family_id}`);
    try {
      const results = await scheduleService.getFamilySchedules(family_id);
      res.json(results);
    } catch (err) {
      console.error('スケジュール取得エラー:', err.message);
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = scheduleController;
