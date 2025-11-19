/**
 * Environment Validation Tests
 */

import { validateEnv, isProduction, isDevelopment, isTest } from '../../utils/envValidation';

describe('Environment Validation', () => {
  beforeEach(() => {
    // Reset environment
    delete process.env.JWT_SECRET;
    delete process.env.DATABASE_URL;
  });

  it('should validate required environment variables', () => {
    process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-characters-long';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.NODE_ENV = 'test';

    expect(() => validateEnv()).not.toThrow();
  });

  it('should throw error if JWT_SECRET is missing', () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.NODE_ENV = 'test';

    expect(() => validateEnv()).toThrow();
  });

  it('should throw error if JWT_SECRET is too short', () => {
    process.env.JWT_SECRET = 'short';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.NODE_ENV = 'test';

    expect(() => validateEnv()).toThrow();
  });

  it('should throw error if JWT_SECRET contains default values', () => {
    process.env.JWT_SECRET = 'your-secret-key-here-change-this-in-production';
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    process.env.NODE_ENV = 'development';

    expect(() => validateEnv()).toThrow();
  });

  it('should detect production environment', () => {
    process.env.NODE_ENV = 'production';
    expect(isProduction()).toBe(true);
    expect(isDevelopment()).toBe(false);
    expect(isTest()).toBe(false);
  });

  it('should detect development environment', () => {
    process.env.NODE_ENV = 'development';
    expect(isProduction()).toBe(false);
    expect(isDevelopment()).toBe(true);
    expect(isTest()).toBe(false);
  });

  it('should detect test environment', () => {
    process.env.NODE_ENV = 'test';
    expect(isProduction()).toBe(false);
    expect(isDevelopment()).toBe(false);
    expect(isTest()).toBe(true);
  });
});

