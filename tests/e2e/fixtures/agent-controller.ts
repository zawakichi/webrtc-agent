import { Page, expect } from '@playwright/test';

export class AgentController {
  constructor(private page: Page) {}

  async initialize(): Promise<void> {
    // Initialize agent controller
    await this.page.goto('/agent-dashboard');
    await this.waitForAgentReady();
  }

  async cleanup(): Promise<void> {
    // Cleanup any active sessions
    try {
      await this.disconnectFromMeeting();
    } catch (error) {
      console.log('Cleanup error (non-critical):', error);
    }
  }

  async joinMeeting(meetingUrl: string): Promise<void> {
    await this.page.fill('[data-testid="meeting-url-input"]', meetingUrl);
    await this.page.click('[data-testid="join-meeting-button"]');
    await this.waitForMeetingJoined();
  }

  async disconnectFromMeeting(): Promise<void> {
    if (await this.isMeetingJoined()) {
      await this.page.click('[data-testid="leave-meeting-button"]');
      await this.waitForMeetingLeft();
    }
  }

  async isMeetingJoined(): Promise<boolean> {
    try {
      await this.page.waitForSelector('[data-testid="meeting-status"][data-status="joined"]', {
        timeout: 5000
      });
      return true;
    } catch {
      return false;
    }
  }

  async isAudioConnected(): Promise<boolean> {
    try {
      await this.page.waitForSelector('[data-testid="audio-status"][data-status="connected"]', {
        timeout: 5000
      });
      return true;
    } catch {
      return false;
    }
  }

  async getParticipants(): Promise<string[]> {
    const participants = await this.page.locator('[data-testid="participant-name"]').allTextContents();
    return participants;
  }

  async sendAudioMessage(message: string): Promise<void> {
    // Simulate audio input by directly calling the audio processor
    await this.page.evaluate((msg) => {
      window.testAudioProcessor?.simulateUserSpeech(msg);
    }, message);
  }

  async getLastAgentResponse(): Promise<string> {
    await this.page.waitForSelector('[data-testid="agent-response"]:last-child', {
      timeout: 10000
    });
    return await this.page.locator('[data-testid="agent-response"]:last-child').textContent() || '';
  }

  async requestDocumentGeneration(docType: 'requirements' | 'specification'): Promise<void> {
    await this.page.click(`[data-testid="generate-${docType}-button"]`);
  }

  async waitForDocumentGenerated(docType: 'requirements' | 'specification'): Promise<void> {
    await this.page.waitForSelector(`[data-testid="${docType}-document"][data-status="generated"]`, {
      timeout: 30000
    });
  }

  async downloadDocument(docType: 'requirements' | 'specification'): Promise<string> {
    const downloadPromise = this.page.waitForEvent('download');
    await this.page.click(`[data-testid="download-${docType}-button"]`);
    const download = await downloadPromise;

    const path = await download.path();
    if (!path) {
      throw new Error('Failed to download document');
    }

    return path;
  }

  async getAgentStatus(): Promise<string> {
    const statusElement = await this.page.locator('[data-testid="agent-status"]');
    return await statusElement.getAttribute('data-status') || 'unknown';
  }

  async waitForAgentReady(): Promise<void> {
    await this.page.waitForSelector('[data-testid="agent-status"][data-status="ready"]', {
      timeout: 30000
    });
  }

  async waitForMeetingJoined(): Promise<void> {
    await this.page.waitForSelector('[data-testid="meeting-status"][data-status="joined"]', {
      timeout: 30000
    });
  }

  async waitForMeetingLeft(): Promise<void> {
    await this.page.waitForSelector('[data-testid="meeting-status"][data-status="disconnected"]', {
      timeout: 10000
    });
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.page.request.get('/api/health');
      return response.status() === 200;
    } catch {
      return false;
    }
  }

  async checkOpenAIConnection(): Promise<boolean> {
    try {
      const response = await this.page.request.get('/api/health/openai');
      return response.status() === 200;
    } catch {
      return false;
    }
  }

  async setAgentPersonality(personality: string): Promise<void> {
    await this.page.click('[data-testid="agent-settings-button"]');
    await this.page.selectOption('[data-testid="personality-select"]', personality);
    await this.page.click('[data-testid="save-settings-button"]');
  }

  async getConversationHistory(): Promise<Array<{ speaker: string, message: string, timestamp: string }>> {
    const conversations = await this.page.locator('[data-testid="conversation-item"]').all();

    const history = [];
    for (const item of conversations) {
      const speaker = await item.locator('[data-testid="speaker"]').textContent();
      const message = await item.locator('[data-testid="message"]').textContent();
      const timestamp = await item.locator('[data-testid="timestamp"]').textContent();

      history.push({
        speaker: speaker || '',
        message: message || '',
        timestamp: timestamp || ''
      });
    }

    return history;
  }

  async simulateAudioError(): Promise<void> {
    await this.page.evaluate(() => {
      window.testAudioProcessor?.simulateError('AUDIO_CONNECTION_LOST');
    });
  }

  async waitForErrorRecovery(): Promise<void> {
    await this.page.waitForSelector('[data-testid="audio-status"][data-status="connected"]', {
      timeout: 15000
    });
  }
}