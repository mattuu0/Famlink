# 問題

## 入れたり入れなかったりする

### 失敗するシナリオ

1. 両方のリクエストがほぼ同時にバックエンドに到着
2. joinFamily が招待者の family_id をチェック → まだ null (createFamilyが完了していない)
3. joinFamily が新しい家族を作成し始める
4. 同時に createFamily も新しい家族を作成し始める
5. 重複キー制約違反またはデータの不整合が発生

## 他

### 1

familyService.js:76~80

なぜ正規化の方法が違うんだ...
???
ponkotu?? kawaiiyo
```
// SQLクエリ（DBで実行）
WHERE REPLACE(REPLACE(UPPER(invite_code), '-', ''), ' ', '') = ?

// JavaScriptの正規化
const normalizedCode = trimmedCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
```

### 2

Lock wait timeout exceeded

1. sample@1が sample@2の招待コード O7F-2VQ-LR2 で参加
   - 新しい家族 O7F2VQLR2 を作成
   - sample@2のfamily_idを O7F2VQLR2 に更新
   - sample@1のfamily_idを O7F2VQLR2 に更新 → ここは問題ないはず
2. sample@2が sample@1の招待コード REM-9LW-JS6 で参加しようとする
   - sample@1は既に家族に所属している (O7F2VQLR2)
   - でもコードは、sample@1のfamily_idがnullだと想定して新しい家族を作成しようとする
   - sample@1のfamily_idを REM9LWJS6 に上書きしようとする → これダメな気がする
   - 同時にsample@2のfamily_idも更新しようとする
   - ロック競合が発生

### 3

http://127.0.0.1:3002/api/messages

Unknown column 'user_id' in 'field list'

これないとそもそも動かない説
```
const [messageColumns] = await pool.query("SHOW COLUMNS FROM messages LIKE 'user_id'");
if (messageColumns.length === 0) {
  await pool.query("ALTER TABLE messages ADD COLUMN user_id INT");
  console.log('messages テーブルに user_id カラムを追加しました');
}
```