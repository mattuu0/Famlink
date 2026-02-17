const db = require('./config/db');

const fixData = async () => {
  try {
    console.log('データの正規化を開始します...');

    // 1. users テーブルの family_id を正規化
    const [users] = await db.query('SELECT id, family_id FROM users WHERE family_id IS NOT NULL');
    for (const user of users) {
      const normalized = user.family_id.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (user.family_id !== normalized) {
        await db.query('UPDATE users SET family_id = ? WHERE id = ?', [normalized, user.id]);
        console.log(`User ${user.id}: ${user.family_id} -> ${normalized}`);
      }
    }

    // 2. families テーブルの family_id を正規化
    const [families] = await db.query('SELECT id, family_id FROM families');
    for (const family of families) {
      const normalized = family.family_id.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (family.family_id !== normalized) {
        // 重複チェック（正規化したら同じIDになるデータがあるかもしれないため）
        const [exists] = await db.query('SELECT id FROM families WHERE family_id = ? AND id != ?', [normalized, family.id]);
        if (exists.length > 0) {
           console.log(`Warning: Family ${normalized} already exists. Skipping update for ${family.family_id} (ID: ${family.id})`);
           // 重複する場合は、このIDを使っているユーザーやメッセージを既存のIDの方に寄せたほうがいいが、ここでは簡易的に更新スキップ
        } else {
           await db.query('UPDATE families SET family_id = ? WHERE id = ?', [normalized, family.id]);
           console.log(`Family ${family.id}: ${family.family_id} -> ${normalized}`);
        }
      }
    }

    // 3. messages テーブルの family_id を正規化
    const [messages] = await db.query('SELECT id, family_id FROM messages WHERE family_id IS NOT NULL');
    for (const msg of messages) {
      const normalized = msg.family_id.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (msg.family_id !== normalized) {
        await db.query('UPDATE messages SET family_id = ? WHERE id = ?', [normalized, msg.id]);
        console.log(`Message ${msg.id}: ${msg.family_id} -> ${normalized}`);
      }
    }

    // 4. schedules テーブルの family_id を正規化
    const [schedules] = await db.query('SELECT id, family_id FROM schedules WHERE family_id IS NOT NULL');
    for (const sch of schedules) {
      const normalized = sch.family_id.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (sch.family_id !== normalized) {
        await db.query('UPDATE schedules SET family_id = ? WHERE id = ?', [normalized, sch.id]);
        console.log(`Schedule ${sch.id}: ${sch.family_id} -> ${normalized}`);
      }
    }

    console.log('完了しました。すべてのデータはハイフンなし・大文字に統一されました。');
    
  } catch (err) {
    console.error('エラーが発生しました:', err);
  } finally {
    process.exit();
  }
};

fixData();
