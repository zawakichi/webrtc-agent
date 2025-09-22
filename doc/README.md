# Documentation

このフォルダには、WebRTC System Development Consultation Agentに関するすべてのドキュメントが格納されています。

## フォルダ構成

```
doc/
├── README.md                    # このファイル
├── CLAUDE.md                    # Claude Code用プロジェクト指示書
├── specifications/              # 仕様書
│   └── SPECIFICATIONS.md        # プロジェクト仕様書
├── architecture/                # アーキテクチャドキュメント
│   ├── system-architecture.md   # システムアーキテクチャ
│   ├── component-design.md      # コンポーネント設計
│   └── diagrams/                # Mermaid/PlantUML図表
└── api/                         # API仕様書
    ├── webrtc-api.md            # WebRTC API
    ├── realtime-api.md          # Realtime API
    └── agent-api.md             # Agent API
```

## ドキュメント作成ガイドライン

### 図表作成
- システム構成図: Mermaid
- UMLダイアグラム: PlantUML
- フローチャート: Mermaid
- シーケンス図: Mermaid/PlantUML

### ドキュメント更新
コード変更時は関連ドキュメントも同時に更新してください。

### 言語
- 技術仕様: 日本語
- コメント: 英語/日本語併記
- 図表ラベル: 英語推奨