# ビルドとデプロイ ガイド

このプロジェクトでは、GitHub Actions を使用して Docker イメージを自動ビルドし、GitHub Container Registry (ghcr.io) に保存しています。

## GitHub Actions でのビルド

`v*`（例: `v1.0.0`）形式のタグをプッシュすると、自動的にビルドが開始されます。

```bash
git tag v1.0.0
git push origin v1.0.0
```

## docker-compose でのイメージ利用方法

ローカル環境やサーバーで、ビルド済みのイメージを使用して起動する方法です。

### 1. GitHub Container Registry へのログイン

イメージをプルするには、GitHub のパーソナルアクセストークン（PAT）を使用してログインする必要があります。

```bash
echo $YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

### 2. docker-compose.yaml の設定例

ビルド済みイメージを使用する場合の `docker-compose.yaml` の記載例です。`IMAGE_TAG` は `v1.0.0` などを指定します。

```yaml
services:
  backend:
    image: ghcr.io/YOUR_GITHUB_USERNAME/famlink/backend:${IMAGE_TAG:-latest}
    ports:
      - "3001:3001"
    env_file:
      - ./config/backend.env

  frontend:
    image: ghcr.io/YOUR_GITHUB_USERNAME/famlink/frontend:${IMAGE_TAG:-latest}
    ports:
      - "5173:80"
    env_file:
      - ./config/frontend.env
```

### 3. 起動コマンド

```bash
# 環境変数を指定して起動
IMAGE_TAG=v1.0.0 docker-compose up -d
```

## フロントエンドの API URL について

フロントエンドのイメージはビルド時に `VITE_API_URL` が `https://famlink-api.aoioq.com` に固定されています。
別の URL を使用したい場合は、GitHub Actions の `frontend-publish.yml` 内の `build-args` を変更して再ビルドしてください。
