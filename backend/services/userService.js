const User = require('../models/userModel');
const { generateInviteCode } = require('../utils/inviteCode');

/**
 * ユーザー関連のビジネスロジックを担当するサービス
 */
const userService = {
  // ユーザー登録処理
  registerUser: async (email, password, user_name) => {
    const invite_code = generateInviteCode();
    const userId = await User.create(email, password, user_name, invite_code);
    return { userId, invite_code };
  },

  // ログイン処理
  loginUser: async (email, password) => {
    console.log(`ログイン試行: ${email}`);
    const user = await User.findByEmail(email);
    
    if (!user) {
      console.log('ユーザーが見つかりません');
      throw new Error('メールアドレスまたはパスワードが正しくありません');
    }

    if (user.password.trim() !== password.trim()) {
      console.log('パスワードが一致しません');
      throw new Error('メールアドレスまたはパスワードが正しくありません');
    }

    console.log('ログイン成功');

    // 招待コードがない既存ユーザーへの補完処理
    if (!user.invite_code) {
      const newCode = generateInviteCode();
      await User.updateInviteCode(user.id, newCode);
      user.invite_code = newCode;
    }

    return user;
  },

  // ユーザー情報取得
  getUserByEmail: async (email) => {
    const user = await User.findByEmail(email);
    if (!user) throw new Error('User not found');
    return user;
  }
};

module.exports = userService;
