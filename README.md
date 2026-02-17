# Famlink アプリケーション環境設定ガイド

このドキュメントは、Famlink アプリケーションをローカル環境でセットアップし、実行するための手順を説明します。

## 概要

Famlink は、家族間のコミュニケーションとスケジュール調整を支援するアプリケーションです。
フロントエンドは React と Vite、バックエンドは Express.js と MySQL で構築されています。

## 動作環境 (Prerequisites)

本プロジェクトを実行するために、以下のソフトウェアがインストールされていることを確認してください。

*   **Node.js**: 最新のLTSバージョンを推奨します。
    *   [Node.js公式サイト](https://nodejs.org/)
*   **npm** または **Yarn**: Node.jsと同時にインストールされます。
*   **MySQL Server**: バージョン8.0以上を推奨します。
    *   [MySQL公式サイト](https://www.mysql.com/)
*   **Git**: ソースコードをクローンするために必要です。
    *   [Git公式サイト](https://git-scm.com/)

## インストール (Installation)

### 1. リポジトリのクローン

まず、このリポジトリをローカルにクローンします。

```bash
git clone <リポジトリのURL>
cd Famlink
```

### 2. 依存関係のインストール

プロジェクトのルートディレクトリで、フロントエンドとバックエンドの両方の依存関係をインストールします。

```bash
# フロントエンドの依存関係をインストール
npm install

# バックエンドの依存関係をインストール
cd backend
npm install
cd ..
```

## データベース設定 (Database Setup)

本プロジェクトでは MySQL を使用しています。

### 1. MySQLサーバーの起動

MySQLサーバーが起動していることを確認してください。

### 2. 環境変数の設定

`backend` ディレクトリの`.env`ファイルと、プロジェクトルートディレクトリの`.env`ファイルにデータベース接続情報を設定します。

**backend/.env (例):**

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=famlink_db
```

**プロジェクトルート/.env (例):**

```env
VITE_API_URL=http://localhost:3000
```
`backend/config/db.js` にて、環境変数 `DB_NAME` で指定されたデータベースが存在しない場合、自動的に作成されます。また、必要なテーブル（`users`, `families`, `messages`, `schedules`, `schedule_responses`）も自動的に作成されます。

**注意:**
`DB_PASSWORD` はご自身のMySQLのrootパスワード、または設定したデータベースユーザーのパスワードに置き換えてください。

### 3. データのダンプ (オプション)

現在のところ、初期データダンプは提供されていません。バックエンドが起動する際にテーブルは自動的に作成されます。必要に応じて、`backend/mocks/db.json` を参考にしてデータを投入することも可能です。

## 外部API (LINE API)

本アプリケーションは LINE API と連携します。LINEログインおよびメッセージング機能を使用するため、LINE Developers でアプリケーションを登録し、以下の情報を取得する必要があります。

1.  **LINE Developers 登録**: [LINE Developers コンソール](https://developers.line.biz/console/) にアクセスし、プロバイダーとチャネルを作成します。
2.  **チャネルアクセストークンとチャネルシークレットの取得**: 作成したチャネルの「チャネル基本設定」タブから、チャネルアクセストークンとチャネルシークレットを取得します。
3.  **LINE Login 設定**: LINE Login チャネルを作成し、コールバックURLをアプリケーションのURL (`http://localhost:5173/line-callback` など) に設定します。
4.  **環境変数の設定**: 取得した情報を`.env`ファイルに追加します。

**backend/.env (追加):**

```env
LINE_CHANNEL_ID=your_line_channel_id
LINE_CHANNEL_SECRET=your_line_channel_secret
LINE_CALLBACK_URL=http://localhost:5173/line-callback # またはデプロイ先のURL
```

**プロジェクトルート/.env (追加):**

```env
VITE_LINE_CHANNEL_ID=your_line_channel_id
```

## プロジェクトの実行 (Running the Project)

### 1. バックエンドサーバーの起動

プロジェクトのルートディレクトリで、新しいターミナルを開き、バックエンドサーバーを起動します。

```bash
cd backend
npm run dev # 開発モード (nodemon を使用)
# または npm start # 本番モード
cd ..
```

バックエンドサーバーは通常 `http://localhost:3000` で起動します。

### 2. フロントエンドアプリケーションの起動

プロジェクトのルートディレクトリで、別のターミナルを開き、フロントエンドアプリケーションを起動します。

```bash
npm run dev
```

フロントエンドアプリケーションは通常 `http://localhost:5173` で起動します。

ブラウザで `http://localhost:5173` にアクセスすると、アプリケーションを利用できます。