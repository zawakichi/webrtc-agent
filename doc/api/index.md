# API仕様

WebRTC Agent の API 仕様について説明します。

## API 概要

本システムでは、以下の API を提供します：

- **REST API**: HTTP/HTTPS による標準的な Web API
- **WebSocket API**: リアルタイム双方向通信
- **WebRTC API**: P2P リアルタイム通信

## API エンドポイント

### 基本情報
- **Base URL**: `http://localhost/api`
- **Version**: `v1`
- **Content-Type**: `application/json`

## 認証

API へのアクセスには JWT トークンによる認証が必要です。

```http
Authorization: Bearer <JWT_TOKEN>
```

## レスポンス形式

成功時：
```json
{
  "success": true,
  "data": {
    // レスポンスデータ
  }
}
```

エラー時：
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ"
  }
}
```

## API 種別

### [REST API](rest.md)
- Meeting 管理
- Consultation 操作
- User 認証
- Document 生成

### [WebSocket API](websocket.md)
- リアルタイムメッセージング
- 接続状態の管理
- イベント通知

### [WebRTC API](webrtc.md)
- P2P 接続の確立
- 音声・映像ストリーム
- Google Meet 統合

## SDK・クライアント

### JavaScript/TypeScript
```typescript
import { WebRTCAgent } from '@webrtc-agent/client';

const client = new WebRTCAgent({
  apiUrl: 'http://localhost/api',
  authToken: 'your-jwt-token'
});
```

### Go
```go
import "github.com/zawakichi/webrtc-agent/client"

client := client.New(&client.Config{
    APIUrl: "http://localhost/api",
    AuthToken: "your-jwt-token",
})
```

## 利用例

### 基本的な使用フロー

1. **認証**: JWT トークンの取得
2. **ミーティング作成**: REST API でミーティングを作成
3. **WebRTC接続**: WebRTC API で P2P 接続を確立
4. **リアルタイム通信**: WebSocket API でメッセージ交換
5. **ドキュメント生成**: AI による要件定義書の生成

## エラーハンドリング

### HTTP ステータスコード

- `200 OK`: 成功
- `400 Bad Request`: リクエストエラー
- `401 Unauthorized`: 認証エラー
- `403 Forbidden`: 権限エラー
- `404 Not Found`: リソースが見つからない
- `500 Internal Server Error`: サーバーエラー

### エラーコード一覧

| コード | 説明 |
|--------|------|
| `AUTH_FAILED` | 認証に失敗 |
| `INVALID_REQUEST` | 不正なリクエスト |
| `RESOURCE_NOT_FOUND` | リソースが見つからない |
| `WEBRTC_CONNECTION_FAILED` | WebRTC接続エラー |
| `AI_SERVICE_UNAVAILABLE` | AI サービスが利用不可 |

## 開発者向け情報

### API テスト
```bash
# ヘルスチェック
curl http://localhost/api/health

# 認証テスト
curl -H "Authorization: Bearer <token>" http://localhost/api/user/profile
```

### デバッグ情報
開発環境では、以下のエンドポイントでデバッグ情報を取得できます：

- `/api/debug/metrics`: パフォーマンスメトリクス
- `/api/debug/logs`: ログ情報
- `/api/debug/connections`: 接続状況