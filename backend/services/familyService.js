const Family = require('../models/familyModel');
const User = require('../models/userModel');
const db = require('../config/db');

/**
 * 家族管理関連のビジネスロジックを担当するサービス
 */
const familyService = {
  // 家族グループ作成
  createFamily: async (family_id, family_name, email) => {
    const existingFamily = await Family.findById(family_id);
    
    if (!existingFamily) {
      await Family.create(family_id, family_name || '家族');
    }
    
    await User.updateFamilyId(email, family_id);
    return family_id;
  },

  // 家族グループ参加
  joinFamily: async (code, email) => {
    const trimmedCode = code.trim();
    console.log(`家族参加試行: User=${email}, Code=${trimmedCode}`);

    // 1. 直接家族IDとして存在するか確認
    const existingFamily = await Family.findById(trimmedCode);
    if (existingFamily) {
      console.log(`既存の家族が見つかりました: ${trimmedCode}`);
      await User.updateFamilyId(email, trimmedCode);
      return trimmedCode;
    }

    // 2. 招待コードとしてユーザーを検索
    console.log(`招待コードとして検索中...`);
    
    // 入力されたコードを大文字に変換し、ハイフンを除去して検索しやすくする
    const normalizedCode = trimmedCode.toUpperCase().replace(/-/g, '');
    
    // DB内の全てのユーザーを取得して、正規化したコードで比較（インデックスが効かないが、小規模なら確実）
    // 本来はDB側で正規化カラムを持つべきだが、一旦ここで対応
    const [allUsers] = await db.query('SELECT email, invite_code, family_id FROM users');
    console.log('現在登録されている全招待コード:', allUsers.map(u => u.invite_code));

    const targetUser = allUsers.find(u => {
      if (!u.invite_code) return false;
      return u.invite_code.toUpperCase().replace(/-/g, '') === normalizedCode;
    });

    if (!targetUser) {
      console.log(`エラー: 招待コード "${trimmedCode}" (正規化: ${normalizedCode}) に一致するユーザーが見つかりません`);
      throw new Error('招待コードが正しくないか、家族グループが見つかりません');
    }

    console.log(`招待者が見つかりました: ${targetUser.email}`);
    let targetFamilyId = targetUser.family_id;

    if (!targetFamilyId) {
      // 招待した側がまだ家族を作っていない場合、招待コードをそのまま家族IDとして新規作成
      console.log('招待者が家族未作成のため、新規作成します');
      targetFamilyId = targetUser.invite_code;
      try {
        await Family.create(targetFamilyId, '家族');
        console.log(`家族グループを新規作成しました: ${targetFamilyId}`);
      } catch (err) {
        if (err.errno !== 1062) {
          console.error('家族作成中にエラー:', err);
          throw err;
        }
        console.log('家族は既に作成されていました(同時実行等)');
      }
      // 招待した側のユーザーもその家族に所属させる
      await User.updateFamilyId(targetUser.email, targetFamilyId);
      console.log(`招待者の家族IDを更新しました: ${targetUser.email} -> ${targetFamilyId}`);
    }

    // 参加する側の所属を更新
    await User.updateFamilyId(email, targetFamilyId);
    console.log(`参加者の家族IDを更新しました: ${email} -> ${targetFamilyId}`);
    return targetFamilyId;
  },

  // 家族脱退
  leaveFamily: async (email) => {
    return await User.leaveFamily(email);
  }
};

module.exports = familyService;
