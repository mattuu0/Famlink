const familyService = require('../services/familyService');

/**
 * 家族管理に関するリクエストを処理するコントローラー
 */
const familyController = {
  // 家族作成
  create: async (req, res) => {
    try {
      const { family_id, family_name, email } = req.body;
      const id = await familyService.createFamily(family_id, family_name, email);
      res.send({ message: '家族グループ作成完了！', family_id: id });
    } catch (err) {
      console.error('家族作成エラー:', err);
      res.status(500).send(err.message);
    }
  },

  // 家族参加
  join: async (req, res) => {
    try {
      const { family_id, email } = req.body;
      if (!family_id) {
        return res.status(400).json({ message: '招待コードを入力してください' });
      }
      const id = await familyService.joinFamily(family_id, email);
      res.send({ message: '家族グループに参加しました！', family_id: id });
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  },

  // 家族脱退
  leave: async (req, res) => {
    try {
      const { email } = req.body;
      await familyService.leaveFamily(email);
      res.send({ message: '家族グループから脱退しました。' });
    } catch (err) {
      console.error('脱退エラー:', err.message, err.stack);
      res.status(500).json({ message: 'サーバーエラーが発生しました', error: err.message });
    }
  }
};

module.exports = familyController;
