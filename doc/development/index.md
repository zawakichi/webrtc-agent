# 開発ガイド

WebRTC Agent の開発環境セットアップと開発フローについて説明します。

## クイックスタート

```bash
# 開発環境の起動
docker-compose -f environment/docker/docker-compose.dev.yml up -d

# ログの確認
docker-compose -f environment/docker/docker-compose.dev.yml logs -f
```

## 開発環境

- [セットアップ](setup.md): 開発環境の構築手順
- [ワークフロー](workflow.md): 開発からデプロイまでのフロー
- [テスト](testing.md): 各種テストの実行方法

## サービス構成

| サービス | ポート | 説明 |
|---------|--------|------|
| Frontend | 3000 | React 開発サーバー |
| Backend | 3001 | Go API サーバー |
| Docs | 8000 | MkDocs ドキュメントサーバー |
| MySQL | 3306 | データベース |
| Redis | 6379 | キャッシュ・セッション |
| Nginx | 80 | リバースプロキシ |

## アクセス URL

- **メインアプリ**: http://localhost
- **ドキュメント**: http://docs.localhost
- **API**: http://localhost/api
- **WebSocket**: ws://localhost/socket.io