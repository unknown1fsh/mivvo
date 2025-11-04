/**
 * AI Routes Tests
 * 
 * AI Analysis ve AI Test route testleri
 */

import request from 'supertest';
import app from '../../index';
import { getTestPrisma, createTestUser, cleanDatabase } from '../helpers/database';
import { generateTestToken, getAuthHeader } from '../helpers/auth';
import bcrypt from 'bcryptjs';

const prisma = getTestPrisma();

describe('AI Analysis Routes', () => {
  let testUser: any;
  let testUserToken: string;

  beforeAll(async () => {
    await cleanDatabase();
  });

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('password123', 12);
    testUser = await createTestUser(`ai${Date.now()}@example.com`, passwordHash, 'USER', 1000);
    testUserToken = generateTestToken(testUser.id);
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  describe('GET /api/ai-analysis/status', () => {
    it('should get AI status successfully', async () => {
      const response = await request(app)
        .get('/api/ai-analysis/status')
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/ai-analysis/status')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/ai-analysis/history', () => {
    it('should get AI analysis history successfully', async () => {
      const response = await request(app)
        .get('/api/ai-analysis/history')
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/ai-analysis/history?page=1&limit=10')
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/ai-analysis/history')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/ai-analysis/advanced', () => {
    it('should return 400 if imagePath is missing', async () => {
      const response = await request(app)
        .post('/api/ai-analysis/advanced')
        .set(getAuthHeader(testUserToken))
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/ai-analysis/advanced')
        .send({ imagePath: '/test.jpg' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/ai-analysis/damage-detection', () => {
    it('should return 400 if imagePath is missing', async () => {
      const response = await request(app)
        .post('/api/ai-analysis/damage-detection')
        .set(getAuthHeader(testUserToken))
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/ai-analysis/damage-detection')
        .send({ imagePath: '/test.jpg' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/ai-analysis/test', () => {
    it('should return 400 if testType is missing', async () => {
      const response = await request(app)
        .post('/api/ai-analysis/test')
        .set(getAuthHeader(testUserToken))
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/ai-analysis/test')
        .send({ testType: 'paint' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/ai-analysis/train', () => {
    it('should return 400 if modelType is missing', async () => {
      const response = await request(app)
        .post('/api/ai-analysis/train')
        .set(getAuthHeader(testUserToken))
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/ai-analysis/train')
        .send({ modelType: 'paint' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

describe('AI Test Routes', () => {
  let testUser: any;
  let testUserToken: string;

  beforeAll(async () => {
    await cleanDatabase();
  });

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('password123', 12);
    testUser = await createTestUser(`aitest${Date.now()}@example.com`, passwordHash, 'USER', 1000);
    testUserToken = generateTestToken(testUser.id);
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  describe('GET /api/ai-test/status', () => {
    it('should get AI test status successfully', async () => {
      const response = await request(app)
        .get('/api/ai-test/status')
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/ai-test/status')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/ai-test/paint', () => {
    it('should return 400 if imagePath is missing', async () => {
      const response = await request(app)
        .post('/api/ai-test/paint')
        .set(getAuthHeader(testUserToken))
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/ai-test/paint')
        .send({ imagePath: '/test.jpg' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/ai-test/damage', () => {
    it('should return 400 if imagePath is missing', async () => {
      const response = await request(app)
        .post('/api/ai-test/damage')
        .set(getAuthHeader(testUserToken))
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/ai-test/damage')
        .send({ imagePath: '/test.jpg' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/ai-test/engine', () => {
    it('should return 400 if audioPath is missing', async () => {
      const response = await request(app)
        .post('/api/ai-test/engine')
        .set(getAuthHeader(testUserToken))
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/ai-test/engine')
        .send({ audioPath: '/test.mp3' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/ai-test/openai', () => {
    it('should return 400 if imagePath is missing', async () => {
      const response = await request(app)
        .post('/api/ai-test/openai')
        .set(getAuthHeader(testUserToken))
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/ai-test/openai')
        .send({ imagePath: '/test.jpg' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/ai-test/comprehensive', () => {
    it('should return 400 if imagePath is missing', async () => {
      const response = await request(app)
        .post('/api/ai-test/comprehensive')
        .set(getAuthHeader(testUserToken))
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/ai-test/comprehensive')
        .send({ imagePath: '/test.jpg' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

