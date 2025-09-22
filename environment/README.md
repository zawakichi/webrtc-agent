# Environment

開発環境設定ファイルが格納されています。

## フォルダ構成

```
environment/
├── README.md           # このファイル
├── docker/             # Docker設定
│   ├── Dockerfile      # メインDockerfile (統合アプリ)
│   ├── Dockerfile.frontend  # フロントエンド専用
│   ├── Dockerfile.backend   # バックエンド専用
│   └── nginx.conf      # Nginx設定
└── devcontainer/       # VS Code DevContainer設定
    ├── devcontainer.json    # DevContainer設定
    ├── Dockerfile           # DevContainer用Dockerfile
    └── docker-compose.yml   # DevContainer用compose
```

## 使用方法

### Docker Bake (推奨)
```bash
# すべてのイメージをビルド
docker buildx bake

# 特定のターゲットをビルド
docker buildx bake app
docker buildx bake frontend backend

# プッシュ付きビルド
docker buildx bake --push

# Makefileを使用 (推奨)
make build
make build-frontend
make build-backend
make build-prod
```

### Docker Compose (ローカル開発)
```bash
# 開発環境起動
docker compose up -d

# 特定のサービスのみ
docker compose up -d mysql redis

# テスト環境
docker compose --profile test up -d

# 停止
docker compose down
```

### DevContainer
1. VS Codeでプロジェクトを開く
2. コマンドパレットで「Dev Containers: Reopen in Container」を実行
3. 自動的にDevContainer環境が構築される

## 環境変数

必要な環境変数は`.env.example`を参考に`.env`ファイルを作成してください。

```bash
# 例
OPENAI_API_KEY=your_openai_api_key
GOOGLE_MEET_API_KEY=your_google_meet_api_key
DATABASE_URL=mysql://webrtc_user:webrtc_pass@mysql:3306/webrtc_agent
```

## Docker Bake ターゲット

- **app**: 統合アプリケーション (フロントエンド + バックエンド)
- **frontend**: フロントエンドのみ (Nginx + React)
- **backend**: バックエンドのみ (Node.js + Bun)
- **devcontainer**: VS Code DevContainer
- **test**: テスト実行用イメージ
- **production**: 本番最適化イメージ

## マルチステージビルド

各Dockerfileはマルチステージビルドを使用しています:

1. **base**: 基本環境とパッケージインストール
2. **development**: 開発用設定
3. **build**: ビルド実行
4. **test**: テスト実行
5. **production**: 本番用最適化

## パフォーマンス最適化

- **Bun**: 高速パッケージマネージャ使用
- **Layer Caching**: Docker レイヤーキャッシュ最適化
- **Multi-platform**: AMD64/ARM64 対応
- **Build Cache**: GitHub Actions キャッシュ活用