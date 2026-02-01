const scheduleResponseService = require("../services/scheduleResponseService");

const scheduleResponseController = {
  // 回答を保存
  saveResponse: async (req, res) => {
    console.log(
      "API Request: POST /api/schedules/:schedule_id/responses",
      req.body,
    );
    try {
      const { schedule_id } = req.params;
      const { user_id, user_name, selected_time_slots } = req.body;

      const result = await scheduleResponseService.saveResponse(
        schedule_id,
        user_id,
        user_name,
        selected_time_slots,
      );

      res.status(201).json({
        message: "回答を保存しました",
        isComplete: result.isComplete,
      });
    } catch (err) {
      console.error("回答保存エラー:", err.message);
      res.status(500).json({ message: err.message });
    }
  },

  // 特定のスケジュールへの全回答を取得
  getResponses: async (req, res) => {
    const { schedule_id } = req.params;
    console.log(`API Request: GET /api/schedules/${schedule_id}/responses`);
    try {
      const responses = await scheduleResponseService.getResponses(schedule_id);
      res.json(responses);
    } catch (err) {
      console.error("回答取得エラー:", err.message);
      res.status(500).json({ message: err.message });
    }
  },

  // 決まった日程を取得
  getFinalSchedule: async (req, res) => {
    const { schedule_id } = req.params;
    console.log(`API Request: GET /api/schedules/${schedule_id}/final`);
    try {
      const finalSchedule =
        await scheduleResponseService.calculateFinalSchedule(schedule_id);
      res.json(finalSchedule);
    } catch (err) {
      console.error("最終日程取得エラー:", err.message);
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = scheduleResponseController;
