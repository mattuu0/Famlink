const ScheduleResponse = require('../models/scheduleResponseModel');
const Schedule = require('../models/scheduleModel');
const db = require('../config/db');

const scheduleResponseService = {
  // 回答を保存
  saveResponse: async (schedule_id, user_id, user_name, selected_time_slots) => {
    if (!schedule_id || !user_id || !selected_time_slots) {
      throw new Error('必須項目が不足しています');
    }

    // 回答を保存
    await ScheduleResponse.createOrUpdate(schedule_id, user_id, user_name, selected_time_slots);

    // 全員が回答したかチェック
    const isComplete = await scheduleResponseService.checkAllResponded(schedule_id);

    // 全員が回答したら、決まった日程を計算して保存
    if (isComplete) {
      const finalSchedule = await scheduleResponseService.calculateFinalSchedule(schedule_id);
      await Schedule.updateFinalSchedule(schedule_id, finalSchedule);
    }

    return { success: true, isComplete };
  },

  // 特定のスケジュールへの全回答を取得
  getResponses: async (schedule_id) => {
    return await ScheduleResponse.findByScheduleId(schedule_id);
  },

  // 全員が回答したかチェック
  checkAllResponded: async (schedule_id) => {
    // スケジュール情報を取得
    const [schedules] = await db.query(
      "SELECT family_id, sender_id FROM schedules WHERE id = ?",
      [schedule_id]
    );

    if (schedules.length === 0) {
      throw new Error('スケジュールが見つかりません');
    }

    const { family_id, sender_id } = schedules[0];
    
    if (!family_id || !sender_id) {
      throw new Error('スケジュールの家族情報が不完全です');
    }
    
    // 家族の全メンバー数を取得（送信者を除く）
    const [familyMembers] = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE family_id = ? AND id != ?",
      [family_id, sender_id]
    );

    const expectedResponses = familyMembers[0].count;

    // 実際の回答数を取得
    const actualResponses = await ScheduleResponse.countByScheduleId(schedule_id);

    return actualResponses >= expectedResponses;
  },

  // 決まった日程を計算（全員の選択が重なる時間帯）
  calculateFinalSchedule: async (schedule_id) => {
    const responses = await ScheduleResponse.findByScheduleId(schedule_id);

    if (responses.length === 0) {
      return null;
    }

    // 各回答者の選択した時間帯を集計
    const allSelections = responses.map(response => {
      const slots = typeof response.selected_time_slots === 'string'
        ? JSON.parse(response.selected_time_slots)
        : response.selected_time_slots;
      return {
        user_name: response.user_name,
        slots: slots
      };
    });
    
    return allSelections;
  }
};

module.exports = scheduleResponseService;
