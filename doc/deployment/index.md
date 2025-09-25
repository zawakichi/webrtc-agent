# デプロイメント

WebRTC Agent のデプロイメント方法について説明します。

## デプロイメント概要

本システムは、以下の環境でのデプロイメントをサポートしています：

- **Docker**: コンテナベースデプロイメント
- **Kubernetes**: オーケストレーションによる本格運用
- **クラウド**: AWS/GCP/Azure での運用

## デプロイメント方式

### 🐳 [Docker デプロイメント](docker.md)

最もシンプルなデプロイメント方式：

```bash
# 本番環境の起動
docker-compose -f environment/docker/compose.yaml up -d

# Docker Bake による本番ビルド
docker buildx bake -f environment/docker/docker-bake.hcl production
```

### ☸️ [Kubernetes デプロイメント](kubernetes.md)

スケーラブルな本格運用：

```bash
# Kubernetes マニフェストの適用
kubectl apply -f environment/k8s/
```

### 🚀 [CI/CD パイプライン](cicd.md)

自動デプロイメント：

- GitHub Actions による自動ビルド
- 自動テスト実行
- ステージング・本番への自動デプロイ

## 環境別設定

### 開発環境
```bash
# 開発環境の起動
task dev

# アクセス
# - メインアプリ: http://localhost
# - ドキュメント: http://docs.localhost
```

### ステージング環境
```bash
# ステージング環境への自動デプロイ
# main ブランチへのプッシュで自動実行
git push origin main
```

### 本番環境
```bash
# 本番環境への自動デプロイ
# タグの作成で自動実行
git tag v1.0.0
git push origin v1.0.0
```

## 必要なリソース

### 最小構成
- **CPU**: 2 vCPU
- **Memory**: 4GB RAM
- **Storage**: 20GB SSD
- **Network**: 100Mbps

### 推奨構成
- **CPU**: 4 vCPU
- **Memory**: 8GB RAM
- **Storage**: 50GB SSD
- **Network**: 1Gbps

### 高負荷対応
- **CPU**: 8+ vCPU
- **Memory**: 16GB+ RAM
- **Storage**: 100GB+ SSD
- **Network**: 10Gbps

## 監視・ログ

### ヘルスチェック
```bash
# システム全体のヘルスチェック
curl http://your-domain/api/health

# 各サービスの状態確認
task health
```

### ログ監視
```bash
# アプリケーションログ
docker-compose logs -f webrtc-agent

# システムメトリクス
curl http://your-domain/api/metrics
```

## セキュリティ考慮事項

### SSL/TLS 証明書
```yaml
# Let's Encrypt を使用した自動証明書取得
services:
  nginx:
    environment:
      - CERTBOT_EMAIL=your-email@domain.com
      - DOMAINS=your-domain.com
```

### 環境変数の管理
```bash
# 本番環境では必ず以下を設定
export OPENAI_API_KEY="your-production-key"
export JWT_SECRET="secure-random-secret"
export DB_PASSWORD="secure-database-password"
```

### ファイアウォール設定
```bash
# 必要なポートのみ開放
# HTTP: 80
# HTTPS: 443
# WebRTC: 3478 (STUN)
# WebRTC: 49152-65535 (RTP)
```

## トラブルシューティング

### よくある問題

1. **WebRTC 接続エラー**
   - STUN/TURN サーバーの設定確認
   - ファイアウォール設定の確認

2. **データベース接続エラー**
   - 接続文字列の確認
   - ネットワーク到達性の確認

3. **AI API エラー**
   - API キーの有効性確認
   - レート制限の確認

### デバッグコマンド
```bash
# システム全体の状態確認
task health

# ログの詳細表示
task dev:logs

# ネットワーク接続テスト
curl -v http://localhost/api/health
```

## パフォーマンス最適化

### データベース最適化
- インデックスの適切な設定
- クエリの最適化
- 接続プールの調整

### WebRTC 最適化
- TURN サーバーの地理的分散
- 帯域幅の最適化
- コーデックの選択

### キャッシュ戦略
- Redis による セッション管理
- CDN による静的ファイル配信
- API レスポンスのキャッシュ