const userService = require('../services/userService');

/**
 * ユーザー認証・情報取得に関するリクエストを処理するコントローラー
 */
const userController = {
  // 新規登録
  register: async (req, res) => {
    console.log('API Request: POST /api/register');
    try {
      const { email, password, user_name } = req.body;
      const result = await userService.registerUser(email, password, user_name);
      res.send({ message: '登録完了！', ...result });
    } catch (err) {
      console.error('登録エラー:', err);
      res.status(500).send(err.message);
    }
  },

  // ログイン
  login: async (req, res) => {
    console.log('API Request: POST /api/login');
    try {
      const { email, password } = req.body;
      const user = await userService.loginUser(email, password);
      res.json({ message: 'ログイン成功', user });
    } catch (err) {
      console.error('ログインエラー:', err.message);
      res.status(401).json({ message: err.message });
    }
  },

  // ユーザー情報取得
  getUserInfo: async (req, res) => {
    console.log(`API Request: GET /api/users/${req.params.email}`);
    try {
      const { email } = req.params;
      const user = await userService.getUserByEmail(email);
      res.json(user);
    } catch (err) {
      console.error('ユーザー情報取得エラー:', err.message);
      res.status(404).send(err.message);
    }
  }
};

module.exports = userController;
