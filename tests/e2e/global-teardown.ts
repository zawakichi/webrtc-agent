import { FullConfig } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E test global teardown...');

  // Clean up test data
  console.log('🗑️ Cleaning up test data...');
  try {
    await execAsync('npm run db:clean:test');
    console.log('✅ Test data cleanup completed');
  } catch (error) {
    console.error('❌ Failed to clean up test data:', error);
    // Don't throw error in teardown to avoid masking test failures
  }

  // Generate test reports
  console.log('📊 Generating test reports...');
  try {
    await execAsync('npm run test:reports:generate');
    console.log('✅ Test reports generated');
  } catch (error) {
    console.error('❌ Failed to generate test reports:', error);
  }

  console.log('✅ E2E test global teardown completed');
}

export default globalTeardown;