import { test, expect } from '../fixtures/test-fixtures';

test.describe('Meeting Join', () => {
  test.beforeEach(async ({ agentController, testDatabase }) => {
    // Clear any existing test data
    await testDatabase.clean();
    await testDatabase.seed('basic-meeting-data');
  });

  test('should successfully join a valid Google Meet', async ({
    agentController,
    mockGoogleMeet,
    page
  }) => {
    // Arrange
    const meetingUrl = await mockGoogleMeet.createMockMeeting();

    // Act
    await agentController.joinMeeting(meetingUrl);

    // Assert
    await expect(async () => {
      const isJoined = await agentController.isMeetingJoined();
      expect(isJoined).toBe(true);
    }).toPass({ timeout: 30000 });

    await expect(async () => {
      const isAudioConnected = await agentController.isAudioConnected();
      expect(isAudioConnected).toBe(true);
    }).toPass({ timeout: 15000 });

    const participants = await agentController.getParticipants();
    expect(participants).toContain('AI Development Consultant');
  });

  test('should fail to join an invalid Google Meet URL', async ({
    agentController,
    page
  }) => {
    // Arrange
    const invalidUrl = 'https://meet.google.com/invalid-meeting-id';

    // Act & Assert
    await agentController.joinMeeting(invalidUrl);

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'Failed to join meeting'
    );

    // Should not be in joined state
    const isJoined = await agentController.isMeetingJoined();
    expect(isJoined).toBe(false);
  });

  test('should handle meeting that has already ended', async ({
    agentController,
    mockGoogleMeet,
    page
  }) => {
    // Arrange
    const endedMeetingUrl = await mockGoogleMeet.createEndedMeeting();

    // Act
    await agentController.joinMeeting(endedMeetingUrl);

    // Assert
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'Meeting has already ended'
    );

    const isJoined = await agentController.isMeetingJoined();
    expect(isJoined).toBe(false);
  });

  test('should maintain connection stability', async ({
    agentController,
    mockGoogleMeet,
    audioUtils
  }) => {
    // Arrange
    const meetingUrl = await mockGoogleMeet.createMockMeeting();
    await agentController.joinMeeting(meetingUrl);

    // Act - Simulate network fluctuation
    await mockGoogleMeet.simulateNetworkIssue(2000); // 2 seconds

    // Assert - Should recover automatically
    await expect(async () => {
      const isJoined = await agentController.isMeetingJoined();
      expect(isJoined).toBe(true);
    }).toPass({ timeout: 30000 });

    await expect(async () => {
      const isAudioConnected = await agentController.isAudioConnected();
      expect(isAudioConnected).toBe(true);
    }).toPass({ timeout: 15000 });
  });

  test('should properly leave meeting when requested', async ({
    agentController,
    mockGoogleMeet
  }) => {
    // Arrange
    const meetingUrl = await mockGoogleMeet.createMockMeeting();
    await agentController.joinMeeting(meetingUrl);

    // Verify joined
    expect(await agentController.isMeetingJoined()).toBe(true);

    // Act
    await agentController.disconnectFromMeeting();

    // Assert
    await expect(async () => {
      const isJoined = await agentController.isMeetingJoined();
      expect(isJoined).toBe(false);
    }).toPass({ timeout: 10000 });

    const agentStatus = await agentController.getAgentStatus();
    expect(agentStatus).toBe('ready');
  });

  test('should handle multiple participants joining', async ({
    agentController,
    mockGoogleMeet
  }) => {
    // Arrange
    const meetingUrl = await mockGoogleMeet.createMockMeeting();
    await agentController.joinMeeting(meetingUrl);

    // Act - Simulate additional participants joining
    await mockGoogleMeet.addParticipant('John Doe');
    await mockGoogleMeet.addParticipant('Jane Smith');

    // Assert
    const participants = await agentController.getParticipants();
    expect(participants).toContain('AI Development Consultant');
    expect(participants).toContain('John Doe');
    expect(participants).toContain('Jane Smith');
    expect(participants.length).toBe(3);
  });

  test('should handle meeting room capacity limits', async ({
    agentController,
    mockGoogleMeet,
    page
  }) => {
    // Arrange
    const fullMeetingUrl = await mockGoogleMeet.createFullMeeting();

    // Act
    await agentController.joinMeeting(fullMeetingUrl);

    // Assert
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'Meeting room is full'
    );

    const isJoined = await agentController.isMeetingJoined();
    expect(isJoined).toBe(false);
  });
});