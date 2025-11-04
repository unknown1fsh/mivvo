/**
 * User Routes Tests
 * 
 * User endpoint testleri (credits, reports, account management)
 */

import request from 'supertest';
import app from '../../index';
import { getTestPrisma, createTestUser, cleanDatabase } from '../helpers/database';
import { generateTestToken, getAuthHeader } from '../helpers/auth';
import bcrypt from 'bcryptjs';

const prisma = getTestPrisma();

describe('User Routes', () => {
  let testUser: any;
  let testUserToken: string;

  beforeAll(async () => {
    await cleanDatabase();
  });

  beforeEach(async () => {
    // Her test için yeni kullanıcı oluştur
    const passwordHash = await bcrypt.hash('password123', 12);
    testUser = await createTestUser(`user${Date.now()}@example.com`, passwordHash, 'USER', 100);
    testUserToken = generateTestToken(testUser.id);
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  describe('GET /api/user/credits', () => {
    it('should get user credits successfully', async () => {
      const response = await request(app)
        .get('/api/user/credits')
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('credits');
      expect(response.body.data.credits).toHaveProperty('balance');
      expect(response.body.data.credits).toHaveProperty('totalPurchased');
      expect(response.body.data.credits).toHaveProperty('totalUsed');
      expect(parseFloat(response.body.data.credits.balance)).toBe(100);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/user/credits')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/user/credits/purchase', () => {
    it('should purchase credits successfully', async () => {
      const purchaseData = {
        amount: 50,
        paymentMethod: 'test',
      };

      const response = await request(app)
        .post('/api/user/credits/purchase')
        .set(getAuthHeader(testUserToken))
        .send(purchaseData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should return 400 if amount is missing', async () => {
      const response = await request(app)
        .post('/api/user/credits/purchase')
        .set(getAuthHeader(testUserToken))
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/user/credits/purchase')
        .send({ amount: 50 })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/user/credits/history', () => {
    it('should get credit history successfully', async () => {
      const response = await request(app)
        .get('/api/user/credits/history')
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('transactions');
      expect(Array.isArray(response.body.data.transactions)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/user/credits/history?page=1&limit=10')
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/user/credits/history')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/user/reports', () => {
    it('should get user reports successfully', async () => {
      const response = await request(app)
        .get('/api/user/reports')
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('reports');
      expect(Array.isArray(response.body.data.reports)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/user/reports?page=1&limit=10')
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/user/reports')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/user/account', () => {
    it('should delete account successfully', async () => {
      const response = await request(app)
        .delete('/api/user/account')
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .delete('/api/user/account')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

