/**
 * Test Setup
 * 
 * Jest testleri için global setup dosyası
 * - Environment variables
 * - Database connection
 * - Global mocks
 */

import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.test') });

// Set default test environment variables if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
process.env.DATABASE_URL = process.env.DATABASE_URL || process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db';

// Mock console methods to reduce noise in tests (optional - can be commented out for debugging)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Global test timeout
// @ts-ignore - Test dosyası, build'den exclude edilmiş
if (typeof jest !== 'undefined') {
  // @ts-ignore
  jest.setTimeout(30000);
}

// Cleanup after all tests
// @ts-ignore - Test dosyası, build'den exclude edilmiş
afterAll(async () => {
  // Close database connections if needed
  // This will be handled by individual test files
});

