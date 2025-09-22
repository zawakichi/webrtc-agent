# Environment

開発環境設定ファイルが格納されています。

## フォルダ構成

```
environment/
├── README.md           # このファイル
├── docker/             # Docker設定
│   ├── Dockerfile      # メインDockerfile
│   ├── docker-compose.yml  # 開発環境用compose
│   └── docker-compose.prod.yml  # 本番環境用compose
└── devcontainer/       # VS Code DevContainer設定
    ├── devcontainer.json    # DevContainer設定
    ├── Dockerfile           # DevContainer用Dockerfile
    └── docker-compose.yml   # DevContainer用compose
```

## 使用方法

### Docker開発環境
```bash
# 開発環境起動
docker-compose -f environment/docker/docker-compose.yml up -d

# ビルド
docker-compose -f environment/docker/docker-compose.yml build
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
```