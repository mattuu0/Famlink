const User = require('../models/userModel');
const { generateInviteCode } = require('../utils/inviteCode');

/**
 * ユーザー関連のビジネスロジックを担当するサービス
 */
const userService = {
  // ユーザー登録処理
  registerUser: async (email, password, user_name) => {
    console.log(`新規ユーザー登録試行: ${email}`);
    const invite_code = generateInviteCode();
    try {
      const userId = await User.create(email, password, user_name, invite_code);
      console.log(`User.create から返ってきたID: ${userId}`);
      if (!userId) {
        console.warn('警告: User.create が有効な ID を返しませんでした。');
      }
      return { userId, invite_code };
    } catch (err) {
      console.error('User.create 実行中にエラー:', err.message);
      throw err;
    }
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
