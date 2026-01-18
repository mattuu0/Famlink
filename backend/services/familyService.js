const Family = require('../models/familyModel');
const User = require('../models/userModel');
const db = require('../config/db');

/**
 * 家族管理関連のビジネスロジックを担当するサービス
 */
const familyService = {
  // 家族グループ作成
  createFamily: async (family_id, family_name, email) => {
    if (!family_id || typeof family_id !== 'string' || family_id.trim() === '') {
      throw new Error('家族IDが無効です。');
    }
    
    const normalizedId = family_id.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!normalizedId) {
      throw new Error('招待コードから有効な家族IDを生成できません。');
    }

    try {
      let finalFamilyId;

      // 1. まず正規化されたIDで家族を探す
      let family = await Family.findById(normalizedId);
      if (family) {
        finalFamilyId = normalizedId;
        console.log(`正規化IDで見つかりました: ${finalFamilyId}`);
      } else {
        // 2. 見つからなければ、元のIDでも探す（過去データ救済）
        family = await Family.findById(family_id);
        if (family) {
          finalFamilyId = family_id;
          console.log(`元のIDで見つかりました: ${finalFamilyId}`);
        }
      }
      
      // 3. どちらも見つからなければ、正規化IDで新規作成
      if (!finalFamilyId) {
        await Family.create(normalizedId, family_name || '家族');
        finalFamilyId = normalizedId;
        console.log(`新規家族を作成しました: ${finalFamilyId}`);
      }
      
      // 4. ユーザーのfamily_idを最終的なIDで更新
      await User.updateFamilyId(email, finalFamilyId);
      
      return finalFamilyId;

    } catch (error) {
      console.error('createFamilyで予期せぬエラー:', error);
      throw error;
    }
  },

  // 家族グループ参加
  joinFamily: async (code, email) => {
    const trimmedCode = code.trim();
    console.log(`家族参加試行: User=${email}, Code='${trimmedCode}'`);

    // 1. 直接家族IDとして存在するか確認
    const existingFamily = await Family.findById(trimmedCode);
    if (existingFamily) {
      console.log(`既存の家族が見つかりました: ${trimmedCode}`);
      await User.updateFamilyId(email, trimmedCode);
      return trimmedCode;
    }

    // 2. 招待コードとしてユーザーを検索
    console.log(`招待コードとして検索中...`);
    
    // 正規化: 英数字以外を全て削除 (ハイフンやスペースも削除)
    const normalizedCode = trimmedCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
    console.log(`正規化された入力コード: '${normalizedCode}'`);
    
    // 招待コードとしてユーザーを検索（DB直接クエリ）
    const [usersWithCode] = await db.query(
      `SELECT email, invite_code, family_id
       FROM users
       WHERE REPLACE(REPLACE(UPPER(invite_code), '-', ''), ' ', '') = ?`,
      [normalizedCode]
    );
    console.log(`DBクエリ結果 (usersWithCode):`, usersWithCode);
    const targetUser = usersWithCode[0];

    if (!targetUser) {
      console.log(`エラー: 招待コード "${trimmedCode}" (正規化: ${normalizedCode}) に一致するユーザーが見つかりません`);
      throw new Error('招待コードが正しくないか、家族グループが見つかりません');
    }

    console.log(`招待者が見つかりました: ${targetUser.email}`);
    let targetFamilyId = targetUser.family_id;

    if (!targetFamilyId) {
      // 招待した側がまだ家族を作っていない場合、招待コードを正規化して家族IDとして新規作成
      console.log('招待者が家族未作成のため、新規作成します');
      
      const normalizedFamilyId = targetUser.invite_code.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (!normalizedFamilyId) {
        throw new Error('招待コードから有効な家族IDを生成できませんでした。');
      }
      
      targetFamilyId = normalizedFamilyId;

      try {
        // 既存の家族がいないか正規化IDで確認
        const existingFamily = await Family.findById(targetFamilyId);
        if (!existingFamily) {
          await Family.create(targetFamilyId, '家族');
          console.log(`家族グループを新規作成しました: ${targetFamilyId}`);
        } else {
          console.log(`家族は既に作成されていました: ${targetFamilyId}`);
        }
      } catch (err) {
        // 念のためのエラーハンドリング
        console.error('家族作成中に予期せぬエラー:', err);
        throw err;
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
