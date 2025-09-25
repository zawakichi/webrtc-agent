# BDD テスト戦略

## 1. BDD (Behavior-Driven Development) 概要

### 1.1 BDDの目的
- ビジネス価値に焦点を当てたテスト
- ステークホルダー間の共通理解
- 実行可能な仕様書としてのテスト

### 1.2 使用ツール
- **Gherkin**: 自然言語でのシナリオ記述
- **Jest-Cucumber**: Gherkinシナリオの実行
- **Playwright**: E2Eテストの実行環境

## 2. テスト階層戦略

```mermaid
graph TB
    subgraph "BDD Test Pyramid"
        E2E_BDD[E2E BDD Tests<br/>完全なユーザージャーニー]
        INT_BDD[Integration BDD Tests<br/>コンポーネント間の連携]
        UNIT_BDD[Unit BDD Tests<br/>個別機能の振る舞い]
    end

    subgraph "Test Tools"
        GHERKIN[Gherkin Scenarios]
        JEST_CUC[Jest-Cucumber]
        PLAYWRIGHT[Playwright]
    end

    GHERKIN --> JEST_CUC
    JEST_CUC --> UNIT_BDD
    JEST_CUC --> INT_BDD
    PLAYWRIGHT --> E2E_BDD
```

## 3. フィーチャーファイル設計

### 3.1 主要フィーチャー

#### 会議参加フィーチャー
```gherkin
# tests/bdd/features/meeting-join.feature
Feature: Google Meet会議への参加
  As a システム開発相談を求めるユーザー
  I want AIエージェントがGoogle Meet会議に参加できること
  So that リアルタイムで開発相談ができる

  Background:
    Given システムが正常に動作している
    And OpenAI Realtime APIが利用可能である

  Scenario: 有効なMeet URLでの会議参加
    Given 有効なGoogle Meet URLが提供される
    When AIエージェントが会議参加を試行する
    Then 会議に正常に参加できる
    And 音声接続が確立される
    And 参加者リストにAIエージェントが表示される

  Scenario: 無効なMeet URLでの会議参加失敗
    Given 無効なGoogle Meet URLが提供される
    When AIエージェントが会議参加を試行する
    Then 会議参加が失敗する
    And 適切なエラーメッセージが表示される

  Scenario: 既に終了した会議への参加試行
    Given 既に終了したGoogle Meet URLが提供される
    When AIエージェントが会議参加を試行する
    Then 会議参加が失敗する
    And "会議は既に終了しています"というメッセージが表示される
```

#### 開発相談フィーチャー
```gherkin
# tests/bdd/features/consultation.feature
Feature: システム開発相談
  As a システム開発相談を求めるユーザー
  I want AIエージェントと音声で開発相談ができること
  So that 要件定義や技術選定のアドバイスを受けられる

  Background:
    Given AIエージェントが会議に参加している
    And 音声接続が確立されている

  Scenario: 新規Webアプリケーション開発の相談
    Given ユーザーが"新しいWebアプリケーションを作りたい"と発言する
    When AIエージェントが応答する
    Then "どのような機能が必要ですか"という質問がされる
    And 相談セッションが開始される

  Scenario: 要件定義書の自動生成
    Given 開発相談が10分間続いている
    And ユーザーが複数の要件を話している
    When ユーザーが"要件定義書を作成してください"と依頼する
    Then 要件定義書が自動生成される
    And Mermaid図表が含まれている
    And ダウンロード可能な形式で提供される

  Scenario: 技術スタック推奨
    Given ユーザーが"どの技術を使えばいいか分からない"と発言する
    When AIエージェントが質問を行う
    Then プロジェクトの規模や要件について確認される
    And 適切な技術スタックが推奨される
    And 推奨理由が説明される
```

#### 音声処理フィーチャー
```gherkin
# tests/bdd/features/audio-processing.feature
Feature: リアルタイム音声処理
  As a システム利用者
  I want 音声の品質が良好であること
  So that スムーズな相談ができる

  Scenario: 音声品質の最適化
    Given 複数の参加者が会議に参加している
    When 背景ノイズがある環境で音声が送信される
    Then ノイズが除去される
    And 音声が明瞭に聞こえる

  Scenario: 音声遅延の最小化
    Given 音声通話が開始されている
    When ユーザーが発言する
    Then 500ms以内にAIエージェントが応答を開始する
    And 音声の途切れがない

  Scenario: 複数言語対応
    Given 日本語で相談が開始されている
    When ユーザーが英語で質問する
    Then AIエージェントが英語で応答する
    And 言語切り替えがスムーズに行われる
```

### 3.2 ステップ定義実装

```typescript
// tests/bdd/step-definitions/meeting-steps.ts
import { defineFeature, loadFeature } from 'jest-cucumber';
import { Page } from '@playwright/test';

const feature = loadFeature('./tests/bdd/features/meeting-join.feature');

defineFeature(feature, test => {
  let page: Page;
  let meetingUrl: string;
  let agentController: AgentController;

  test('有効なMeet URLでの会議参加', ({ given, when, then, and }) => {
    given('システムが正常に動作している', async () => {
      // システム起動確認
      await agentController.healthCheck();
    });

    given('OpenAI Realtime APIが利用可能である', async () => {
      // API接続確認
      await agentController.checkOpenAIConnection();
    });

    given('有効なGoogle Meet URLが提供される', () => {
      meetingUrl = 'https://meet.google.com/abc-def-ghi';
    });

    when('AIエージェントが会議参加を試行する', async () => {
      await agentController.joinMeeting(meetingUrl);
    });

    then('会議に正常に参加できる', async () => {
      const isJoined = await agentController.isMeetingJoined();
      expect(isJoined).toBe(true);
    });

    and('音声接続が確立される', async () => {
      const isAudioConnected = await agentController.isAudioConnected();
      expect(isAudioConnected).toBe(true);
    });

    and('参加者リストにAIエージェントが表示される', async () => {
      const participants = await agentController.getParticipants();
      expect(participants).toContain('AI Development Consultant');
    });
  });
});
```

```typescript
// tests/bdd/step-definitions/consultation-steps.ts
import { defineFeature, loadFeature } from 'jest-cucumber';

const feature = loadFeature('./tests/bdd/features/consultation.feature');

defineFeature(feature, test => {
  let consultationSession: ConsultationSession;
  let audioProcessor: AudioProcessor;

  test('新規Webアプリケーション開発の相談', ({ given, when, then, and }) => {
    given('AIエージェントが会議に参加している', async () => {
      consultationSession = await ConsultationSession.start();
    });

    given('音声接続が確立されている', async () => {
      audioProcessor = await AudioProcessor.initialize();
    });

    given(/ユーザーが"(.*)"と発言する/, async (utterance: string) => {
      await audioProcessor.simulateUserSpeech(utterance);
    });

    when('AIエージェントが応答する', async () => {
      await consultationSession.waitForResponse();
    });

    then(/という質問がされる/, async (expectedQuestion: string) => {
      const response = await consultationSession.getLastResponse();
      expect(response).toContain(expectedQuestion);
    });

    and('相談セッションが開始される', async () => {
      const sessionStatus = await consultationSession.getStatus();
      expect(sessionStatus).toBe('active');
    });
  });
});
```

## 4. テスト実行戦略

### 4.1 CI/CDパイプラインでのBDD実行

```yaml
# .github/workflows/bdd-tests.yml
name: BDD Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  bdd-tests:
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: test_password
          MYSQL_DATABASE: webrtc_agent_test
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run BDD Unit Tests
        run: npm run test:bdd:unit

      - name: Run BDD Integration Tests
        run: npm run test:bdd:integration

      - name: Run BDD E2E Tests
        run: npm run test:bdd:e2e
        env:
          DATABASE_URL: mysql://root:test_password@localhost:3306/webrtc_agent_test
          OPENAI_API_KEY: ${{ '{{ secrets.OPENAI_API_KEY }}' }}

      - name: Upload BDD Reports
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: bdd-reports
          path: |
            tests/bdd/reports/
            test-results/
```

### 4.2 ローカル開発でのBDD実行

```json
// package.json scripts
{
  "scripts": {
    "test:bdd": "npm run test:bdd:unit && npm run test:bdd:integration && npm run test:bdd:e2e",
    "test:bdd:unit": "jest --config=tests/bdd/jest.unit.config.js",
    "test:bdd:integration": "jest --config=tests/bdd/jest.integration.config.js",
    "test:bdd:e2e": "playwright test --config=tests/bdd/playwright.config.ts",
    "test:bdd:watch": "jest --config=tests/bdd/jest.unit.config.js --watch",
    "test:bdd:coverage": "jest --config=tests/bdd/jest.unit.config.js --coverage"
  }
}
```

## 5. リビングドキュメンテーション

### 5.1 実行可能仕様書
BDDテストは実行可能な仕様書として機能し、以下の利点を提供：

- **最新性保証**: テストが失敗すれば仕様が古いことが分かる
- **共通理解**: 技術者と非技術者が同じ仕様を参照
- **回帰防止**: 既存機能の破壊を早期発見

### 5.2 テストレポート自動生成

```typescript
// tests/bdd/reporters/cucumber-reporter.ts
export class CucumberHtmlReporter {
  public static generateReport(): void {
    const options = {
      theme: 'bootstrap',
      jsonFile: 'tests/bdd/reports/cucumber_report.json',
      output: 'tests/bdd/reports/cucumber_report.html',
      reportSuiteAsScenarios: true,
      scenarioTimestamp: true,
      launchReport: false,
      metadata: {
        "App Version": process.env.npm_package_version,
        "Test Environment": process.env.NODE_ENV,
        "Browser": "Chromium",
        "Platform": process.platform,
        "Parallel": "Scenarios",
        "Executed": new Date().toISOString()
      }
    };

    reporter.generate(options);
  }
}
```

## 6. BDDベストプラクティス

### 6.1 シナリオ記述ガイドライン

1. **Given-When-Then構造を明確に**
   - Given: 前提条件
   - When: 実行するアクション
   - Then: 期待される結果

2. **ビジネス価値に焦点**
   - 技術的な詳細ではなく、ユーザー価値を記述
   - "As a... I want... So that..."形式を使用

3. **再利用可能なステップ**
   - 共通のステップ定義を作成
   - パラメータ化で柔軟性を確保

### 6.2 メンテナンス戦略

1. **定期的なシナリオレビュー**
   - ビジネス要件変更時の更新
   - 不要になったシナリオの削除

2. **ステップ定義の最適化**
   - 重複コードの排除
   - テストデータの外部化

3. **実行時間の最適化**
   - 並列実行の活用
   - 重いテストの特定と改善