# Source Code

WebRTC System Development Consultation Agentのソースコードディレクトリです。

## フォルダ構成

```
src/
├── README.md           # このファイル
├── core/               # コアモジュール
│   ├── agent/          # AIエージェント実装
│   ├── webrtc/         # WebRTC管理
│   ├── audio/          # 音声処理
│   └── events/         # イベント管理
├── agents/             # 専門エージェント
│   ├── consultation/   # 開発相談エージェント
│   ├── documentation/  # ドキュメント生成エージェント
│   └── analysis/       # 要件分析エージェント
├── services/           # 外部サービス統合
│   ├── openai/         # OpenAI Realtime API
│   ├── meet/           # Google Meet統合
│   └── storage/        # データ保存
├── utils/              # ユーティリティ
│   ├── audio/          # 音声処理ユーティリティ
│   ├── network/        # ネットワークユーティリティ
│   └── validation/     # バリデーション
└── types/              # TypeScript型定義
    ├── agent.ts        # エージェント型
    ├── audio.ts        # 音声データ型
    ├── webrtc.ts       # WebRTC型
    └── api.ts          # API型
```

## 開発ガイドライン

### コーディング規約
- TypeScript Strict Mode使用
- ESLint + Prettier適用
- 関数・クラス名: camelCase
- 定数: UPPER_SNAKE_CASE
- ファイル名: kebab-case

### アーキテクチャ原則
- 単一責任原則
- 依存性注入
- インターフェース分離
- 非同期処理優先

### テスト
- ユニットテスト: Jest
- 統合テスト: Supertest
- E2Eテスト: Playwright