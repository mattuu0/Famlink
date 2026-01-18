const messageService = require('../services/messageService');

/**
 * メッセージ送信・取得に関するリクエストを処理するコントローラー
 */
const messageController = {
  // メッセージ保存
  postMessage: async (req, res) => {
    try {
      const { user_name, mood, comment, family_id } = req.body;
      const id = await messageService.postMessage(user_name, mood, comment, family_id);
      res.send({ message: '保存完了！', id });
    } catch (err) {
      res.status(500).send(err.message);
    }
  },

  // メッセージ履歴取得
  getMessages: async (req, res) => {
    try {
      const { family_id } = req.params;
      const results = await messageService.getFamilyMessages(family_id);
      res.json(results);
    } catch (err) {
      res.status(500).send(err.message);
    }
  }
};

module.exports = messageController;
