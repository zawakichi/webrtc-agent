import { test, expect } from '../fixtures/test-fixtures';

test.describe('Consultation Flow', () => {
  test.beforeEach(async ({ agentController, mockGoogleMeet, testDatabase }) => {
    await testDatabase.clean();
    await testDatabase.seed('consultation-test-data');

    // Join meeting first
    const meetingUrl = await mockGoogleMeet.createMockMeeting();
    await agentController.joinMeeting(meetingUrl);
  });

  test('should start consultation session when user speaks', async ({
    agentController,
    audioUtils
  }) => {
    // Act
    await agentController.sendAudioMessage('I want to create a new web application');

    // Assert
    const response = await agentController.getLastAgentResponse();
    expect(response).toContain('web application');
    expect(response).toMatch(/(what|どんな|機能|features)/i);

    const agentStatus = await agentController.getAgentStatus();
    expect(agentStatus).toBe('consulting');
  });

  test('should gather requirements through conversation', async ({
    agentController,
    audioUtils
  }) => {
    // Arrange - Start consultation
    await agentController.sendAudioMessage('I need help building an e-commerce website');
    await agentController.getLastAgentResponse();

    // Act - Continue conversation
    await agentController.sendAudioMessage('It should have user registration and product catalog');
    const response1 = await agentController.getLastAgentResponse();

    await agentController.sendAudioMessage('Also need shopping cart and payment processing');
    const response2 = await agentController.getLastAgentResponse();

    // Assert
    expect(response1).toMatch(/(payment|決済|checkout|カート)/i);
    expect(response2).toMatch(/(database|データベース|技術|technology)/i);

    const history = await agentController.getConversationHistory();
    expect(history.length).toBeGreaterThan(4); // User + Agent interactions
  });

  test('should generate requirements document', async ({
    agentController,
    page
  }) => {
    // Arrange - Have a conversation
    await agentController.sendAudioMessage('I want to build a task management system');
    await agentController.getLastAgentResponse();

    await agentController.sendAudioMessage('Users should create, edit, and delete tasks');
    await agentController.getLastAgentResponse();

    await agentController.sendAudioMessage('Tasks should have deadlines and priorities');
    await agentController.getLastAgentResponse();

    // Act
    await agentController.requestDocumentGeneration('requirements');

    // Assert
    await agentController.waitForDocumentGenerated('requirements');

    // Check document content preview
    await expect(page.locator('[data-testid="requirements-preview"]')).toContainText('Task Management System');
    await expect(page.locator('[data-testid="requirements-preview"]')).toContainText('create, edit, and delete tasks');
    await expect(page.locator('[data-testid="requirements-preview"]')).toContainText('deadlines and priorities');

    // Check Mermaid diagram exists
    await expect(page.locator('[data-testid="requirements-mermaid-diagram"]')).toBeVisible();
  });

  test('should generate functional specification document', async ({
    agentController,
    page
  }) => {
    // Arrange - Complete requirements discussion
    await agentController.sendAudioMessage('I need a blog platform with user authentication');
    await agentController.getLastAgentResponse();

    await agentController.sendAudioMessage('Users should write, edit, and publish blog posts');
    await agentController.getLastAgentResponse();

    await agentController.sendAudioMessage('Include comments and social sharing features');
    await agentController.getLastAgentResponse();

    // Act
    await agentController.requestDocumentGeneration('specification');

    // Assert
    await agentController.waitForDocumentGenerated('specification');

    // Check specification content
    await expect(page.locator('[data-testid="specification-preview"]')).toContainText('Blog Platform');
    await expect(page.locator('[data-testid="specification-preview"]')).toContainText('Authentication');
    await expect(page.locator('[data-testid="specification-preview"]')).toContainText('Blog Posts');

    // Check technical details are included
    await expect(page.locator('[data-testid="specification-preview"]')).toContainText('Database Schema');
    await expect(page.locator('[data-testid="specification-preview"]')).toContainText('API Endpoints');

    // Check PlantUML diagram exists
    await expect(page.locator('[data-testid="specification-plantuml-diagram"]')).toBeVisible();
  });

  test('should download generated documents', async ({
    agentController
  }) => {
    // Arrange
    await agentController.sendAudioMessage('I want to create a simple CRM system');
    await agentController.getLastAgentResponse();

    await agentController.requestDocumentGeneration('requirements');
    await agentController.waitForDocumentGenerated('requirements');

    // Act
    const downloadPath = await agentController.downloadDocument('requirements');

    // Assert
    expect(downloadPath).toBeTruthy();
    expect(downloadPath).toMatch(/requirements.*\.md$/);
  });

  test('should handle technical questions appropriately', async ({
    agentController
  }) => {
    // Act
    await agentController.sendAudioMessage('What database should I use for my application?');
    const response1 = await agentController.getLastAgentResponse();

    await agentController.sendAudioMessage('How about scalability considerations?');
    const response2 = await agentController.getLastAgentResponse();

    // Assert
    expect(response1).toMatch(/(MySQL|PostgreSQL|MongoDB|データベース)/i);
    expect(response2).toMatch(/(scale|スケール|performance|パフォーマンス|load|負荷)/i);
  });

  test('should provide technology stack recommendations', async ({
    agentController
  }) => {
    // Arrange
    await agentController.sendAudioMessage('I want to build a real-time chat application');
    await agentController.getLastAgentResponse();

    // Act
    await agentController.sendAudioMessage('What technology stack do you recommend?');
    const response = await agentController.getLastAgentResponse();

    // Assert
    expect(response).toMatch(/(WebSocket|Socket\.io|React|Node\.js|フレームワーク)/i);
    expect(response).toContain('real-time');
  });

  test('should maintain conversation context', async ({
    agentController
  }) => {
    // Arrange
    await agentController.sendAudioMessage('I am building an online learning platform');
    const response1 = await agentController.getLastAgentResponse();

    await agentController.sendAudioMessage('Students should be able to enroll in courses');
    const response2 = await agentController.getLastAgentResponse();

    // Act
    await agentController.sendAudioMessage('What about the instructors?');
    const response3 = await agentController.getLastAgentResponse();

    // Assert
    expect(response3).toMatch(/(instructor|teacher|講師|先生)/i);
    expect(response3).toMatch(/(course|コース|lesson|レッスン)/i);
    // Should remember we're talking about learning platform
    expect(response3).toMatch(/(learning|学習|platform|プラットフォーム)/i);
  });

  test('should handle audio quality issues gracefully', async ({
    agentController,
    audioUtils,
    page
  }) => {
    // Act
    await agentController.simulateAudioError();

    // Assert
    await expect(page.locator('[data-testid="audio-error-notification"]')).toBeVisible();

    // Should attempt recovery
    await agentController.waitForErrorRecovery();

    const isAudioConnected = await agentController.isAudioConnected();
    expect(isAudioConnected).toBe(true);
  });

  test('should support multi-language consultation', async ({
    agentController
  }) => {
    // Act - Start in Japanese
    await agentController.sendAudioMessage('Webアプリケーションを作りたいです');
    const japaneseResponse = await agentController.getLastAgentResponse();

    // Switch to English
    await agentController.sendAudioMessage('Please continue in English');
    const englishResponse = await agentController.getLastAgentResponse();

    // Assert
    expect(japaneseResponse).toMatch(/[ひらがなカタカナ漢字]/);
    expect(englishResponse).toMatch(/^[A-Za-z\s.,!?]+$/);
  });
});