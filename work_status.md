# プロジェクト進捗状況：Famlink

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
- **DBの自動更新**: 起動時に `users` テーブルに `invite_code` カラムを自動追加する機能。
- **APIエンドポイント**:
    - `POST /api/register`: ユーザー登録（**一意の固定招待コードの自動生成に対応**）。
    - `POST /api/login`: ユーザー認証（**既存ユーザーへの招待コード割り当てに対応**）。
    - `POST /api/families/create`: 家族グループの作成と招待コードの登録。
    - `POST /api/families/join`: 招待コードによる家族グループへの参加。
    - `GET /api/users/:email`: ユーザー情報（所属家族ID含む）の取得。
    - `POST /api/messages`: ユーザーの感情とコメントを保存。
    - `GET /api/messages/:family_id`: 特定の家族のメッセージ履歴を取得。

## 今後の課題・未実装事項
1. **日程調整機能の詳細**: `SchedulePage.jsx` における具体的な日時選択ロジックの構築。
2. **LINE通知連携**: 感情共有や会いたい要望が送られた際のLINE通知機能。
3. **セキュリティ向上**: パスワードのハッシュ化（bcrypt）やJWTトークンの導入。
4. **UI/UXのブラッシュアップ**: レスポンシブ対応の強化。

---
作成日: 2026年1月13日
