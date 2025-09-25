# MVP Core Features - Increment 1
Feature: Google Meet参加とBasic AI対話
  As a システム開発相談を求める顧客
  I want AIエージェントが会議に参加して基本的な対話ができること
  So that 要件ヒアリングの第一歩を実現できる

  Background:
    Given システムが正常に動作している
    And OpenAI Realtime APIが利用可能である
    And 開発用のGoogle Meet会議が準備されている

  @mvp @core @webrtc
  Scenario: Google Meet会議への基本参加
    Given 有効なGoogle Meet URLが提供される
    When AIエージェントが会議参加を試行する
    Then 会議に正常に参加できる
    And 音声接続が確立される
    And 参加者リストに"Development Consultation Agent"が表示される
    And 参加確認メッセージが音声で流れる

  @mvp @core @webrtc
  Scenario: 音声品質確認と基本応答
    Given AIエージェントが会議に参加している
    And 音声接続が確立されている
    When ユーザーが"聞こえていますか？"と発言する
    Then AIエージェントが2秒以内に応答を開始する
    And "はい、よく聞こえています。システム開発相談エージェントです"と応答する
    And 音声品質が明瞭である（ノイズレベル < 20%）

  @mvp @core @conversation
  Scenario: 基本的な自己紹介と役割説明
    Given AIエージェントが会議に参加している
    When ユーザーが"どのような支援ができますか？"と質問する
    Then AIエージェントが自己紹介を行う
    And "システム開発の要件定義をお手伝いします"と説明する
    And "どのようなシステムを開発されますか？"と逆質問する
    And 会話ログに発言内容が記録される

  @mvp @core @conversation
  Scenario: システム概要の基本ヒアリング
    Given AIエージェントが基本対話を開始している
    When ユーザーが"Webアプリケーションを作りたい"と発言する
    Then AIエージェントが"どのような機能が必要ですか？"と質問する
    And "何人くらいのユーザーを想定していますか？"と追加質問する
    And "どのような業界・業務でご利用予定ですか？"と詳細確認する
    And 回答内容が構造化されて記録される

  @mvp @core @error-handling
  Scenario: 音声が聞き取れない場合の対応
    Given AIエージェントが会議に参加している
    When 不明瞭な音声や雑音が入力される
    Then AIエージェントが"申し訳ございません、音声が聞き取りづらいです"と応答する
    And "もう一度お聞かせください"と再発言を促す
    And 3回連続で聞き取れない場合は"技術的な問題が発生している可能性があります"と報告する

  @mvp @core @session-management
  Scenario: 会話セッションの基本管理
    Given AIエージェントが対話を行っている
    When 5分間発言がない状態が続く
    Then "まだお話を伺えますでしょうか？"と確認する
    When ユーザーが"終了します"と発言する
    Then "ありがとうございました。ヒアリング内容を整理いたします"と応答する
    And セッション状態が"COMPLETED"に変更される
    And 会話ログが保存される

  @mvp @core @basic-export
  Scenario: 基本的な会話サマリー生成
    Given 10分間の対話が完了している
    And 少なくとも3つの要求事項が確認されている
    When ユーザーが"これまでの内容をまとめてください"と依頼する
    Then AIエージェントが会話内容のサマリーを音声で読み上げる
    And 確認された要求事項を番号付きで列挙する
    And "詳細な要件定義書の作成も可能です"と追加サービスを提案する

  @mvp @core @connection-recovery
  Scenario: 接続断からの自動復旧
    Given AIエージェントが会議に参加している
    When ネットワーク接続が一時的に切断される
    Then システムが自動的に再接続を試行する
    And 30秒以内に接続が復旧する
    And "接続が復旧しました。続きをお聞かせください"と再開を通知する
    And 会話履歴が保持されている

  @mvp @core @multi-participant
  Scenario: 複数参加者での対話管理
    Given AIエージェントが会議に参加している
    And 複数のユーザー（User A, User B）が参加している
    When User Aが"在庫管理システムが必要です"と発言する
    And User Bが"売上分析機能も欲しいです"と追加する
    Then AIエージェントが発言者を区別して応答する
    And "Aさんがおっしゃった在庫管理について詳しく教えてください"と質問する
    And "Bさんの売上分析についても後ほど詳しく伺います"と進行管理する

  @mvp @technical @performance
  Scenario: 音声遅延の品質確認
    Given AIエージェントが会議に参加している
    When ユーザーが質問を完了する
    Then AIエージェントが500ms以内に応答を開始する
    And 音声の途切れや遅延が発生しない
    And CPU使用率が80%を超えない
    And メモリ使用量が512MB以下である

  @mvp @technical @audio-quality
  Scenario: 音声品質の最適化確認
    Given 複数の参加者が同時に発言している
    When 背景ノイズが存在する環境である
    Then AIエージェントが主要発言者の音声を識別する
    And 背景ノイズが30%以下に抑制される
    And 発言内容の認識精度が85%以上を維持する

  @mvp @security @data-protection
  Scenario: 音声データの適切な処理
    Given AIエージェントが音声を処理している
    Then 音声データが一時的にのみメモリに保持される
    And 処理完了後1時間以内に音声データが削除される
    And 永続化されるのはテキスト化された会話ログのみである
    And 個人を特定できる音声特徴は保存されない