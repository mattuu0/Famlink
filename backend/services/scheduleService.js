const Schedule = require('../models/scheduleModel');

/**
 * 日程調整関連のビジネスロジックを担当するサービス
 */
const scheduleService = {
  // 要望の保存
  createSchedule: async (family_id, sender_name, meetup_type, time_ranges, sender_id) => {
    if (!family_id || !sender_name || !meetup_type || !time_ranges) {
      throw new Error('必須項目が不足しています');
    }
    return await Schedule.create(family_id, sender_name, meetup_type, time_ranges, sender_id);
  },

  // 家族の要望一覧取得
  getFamilySchedules: async (family_id) => {
    return await Schedule.findByFamilyId(family_id);
  }
};

module.exports = scheduleService;
