import { test as base, expect } from '@playwright/test';
import { AgentController } from './agent-controller';
import { MockGoogleMeet } from './mock-google-meet';
import { TestDatabase } from './test-database';
import { AudioTestUtils } from './audio-test-utils';

// Extend basic test fixtures with custom fixtures
export const test = base.extend<{
  agentController: AgentController;
  mockGoogleMeet: MockGoogleMeet;
  testDatabase: TestDatabase;
  audioUtils: AudioTestUtils;
}>({
  // Agent Controller fixture
  agentController: async ({ page }, use) => {
    const controller = new AgentController(page);
    await controller.initialize();
    await use(controller);
    await controller.cleanup();
  },

  // Mock Google Meet fixture
  mockGoogleMeet: async ({ page }, use) => {
    const mockMeet = new MockGoogleMeet(page);
    await mockMeet.setup();
    await use(mockMeet);
    await mockMeet.teardown();
  },

  // Test Database fixture
  testDatabase: async ({}, use) => {
    const db = new TestDatabase();
    await db.connect();
    await db.clean();
    await use(db);
    await db.disconnect();
  },

  // Audio Test Utils fixture
  audioUtils: async ({ page }, use) => {
    const audioUtils = new AudioTestUtils(page);
    await audioUtils.setup();
    await use(audioUtils);
    await audioUtils.cleanup();
  },
});

export { expect } from '@playwright/test';