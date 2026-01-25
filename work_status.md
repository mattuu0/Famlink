# プロジェクト進捗状況：Famlink

## 未実装
1.会いたいボタンの処理
    ・通知からボタンを押すと、日時の選択ができてそれも通知する→家族全員の予定が会う日に合うのがっけていする→通知
2.名前変更
    ・家族に参加した後で名前変更できるようにしたい（家族に参加するときにも名前設定できたらいいな）
3.家族の最近の様子を直近6件だけ表示して、残りはスクロールで見れるようにしたい  
4.感情を今は固定で送ってるけど、自由に送れるようにしたい  
5.予定が合わなかったときの処理を実装する
5.LINEと連携
    ・通知見たり、会いたいって言われた側が日程を選ぶときLINEでやりたい

1.
## プロジェクト概要
家族間のコミュニケーションとスケジュール調整を支援するアプリケーション。
感情の共有機能や、会いたいという要望の送信、日程調整などの機能を備えています。

## 技術スタック
- **フロントエンド**: React (v19), Vite, React Router DOM (v7)
- **バックエンド**: Node.js, Express, MySQL (mysql2), CORS
- **データベース**: MySQL
- **外部連携**: LINEログイン（実装中）

## 現在の実装状況

### フロントエンド (frontnd/src/pages)
- **認証系**:
    - `Title.jsx`: スプラッシュ画面（3秒の待機）。
    - `AuthScreen.jsx`, `LoginScreen.jsx`, `RegisterScreen.jsx`: ログイン・新規登録フロー。**招待コードの取得・保存に対応。**
    - `LineCallbackPage.jsx`: LINEログインのコールバック処理。
- **家族管理**:
    - `FamilySelectScreen.jsx`, `JoinFamilyScreen.jsx`, `InviteFamilyScreen.jsx`: 家族の選択、参加、招待機能。
    - **`InviteFamilyScreen.jsx`**: **1カウント1つの固定招待コードを表示するように修正。**
- **メイン機能**:
    - `HomePage.jsx`: 
        - 5段階の感情選択とコメント送信。
        - 家族の最近の様子（メッセージ履歴）の表示。
        - **ログインユーザーの family_id に基づく動的なデータ取得に対応。**
    - `MeetupPage.jsx`: 「会いたい」要望のタイプ選択（食事、お茶、家、その他）。
    - `SchedulePage.jsx`: カレンダー等を用いた日程調整（実装中）。
    - `ConfirmationPage.jsx`, `CompletePage.jsx`: 要望の確認と送信完了画面。

### バックエンド (backend/index.js)
- Expressサーバーの構築。
- MySQLデータベースへの接続設定。
- **DBの自動更新**: 起動時に `users` テーブルへのカラム追加、および `schedules` テーブルの自動作成機能を実装。
- **サーバー起動**: `node index.js` コマンドで起動可能。
- **APIエンドポイント**:
    - `POST /api/register`: ユーザー登録。
    - `POST /api/login`: ユーザー認証。
    - `POST /api/families/create`: 家族グループの作成。
    - `POST /api/families/join`: 招待コードによる参加。
    - `GET /api/users/:email`: ユーザー情報取得。
    - `POST /api/messages`: 感情メッセージの保存。
    - `GET /api/messages/:family_id`: 履歴取得。
    - `POST /api/families/leave`: 家族脱退。
    - **`POST /api/schedules`**: 会いたい要望（日程調整）の保存。
    - **`GET /api/schedules/:family_id`**: 家族の要望一覧取得。


### データベース (mysql)
mysql -u root -p
pw:root

## 今後の課題・未実装事項
1. **要望の承認・調整機能**: `SchedulePage.jsx` やホーム画面で届いた要望を確認し、承諾するフローの実装。
2. **LINE通知連携**: 要望が送られた際のリアルタイム通知。
3. **セキュリティ向上**: パスワードのハッシュ化（bcrypt)。

---
作成日: 2026年1月13日
