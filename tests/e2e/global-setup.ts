import { chromium, FullConfig } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test global setup...');

  // Database setup
  console.log('📊 Setting up test database...');
  try {
    await execAsync('npm run db:setup:test');
    console.log('✅ Test database setup completed');
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }

  // Wait for services to be ready
  console.log('⏳ Waiting for services to be ready...');
  await waitForService('http://localhost:3001/health', 30000);
  await waitForService('http://localhost:3000', 30000);

  // Create test data
  console.log('📝 Creating test data...');
  await createTestData();

  console.log('✅ E2E test global setup completed');
}

async function waitForService(url: string, timeout: number): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const browser = await chromium.launch();
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle' });
      await browser.close();
      console.log(`✅ Service at ${url} is ready`);
      return;
    } catch (error) {
      console.log(`⏳ Waiting for service at ${url}...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  throw new Error(`Service at ${url} did not become ready within ${timeout}ms`);
}

async function createTestData(): Promise<void> {
  try {
    // Create test meetings
    await execAsync('npm run db:seed:test');
    console.log('✅ Test data created successfully');
  } catch (error) {
    console.error('❌ Failed to create test data:', error);
    throw error;
  }
}

export default globalSetup;