/**
 * Admin Routes Tests
 * 
 * Admin endpoint testleri (user management, reports, stats, settings, pricing)
 */

import request from 'supertest';
import app from '../../index';
import { getTestPrisma, createTestUser, cleanDatabase, createTestAdmin, createTestReport, createTestServicePricing } from '../helpers/database';
import { generateTestToken, generateAdminToken, getAuthHeader } from '../helpers/auth';
import bcrypt from 'bcryptjs';
import { ReportType, ReportStatus, ServiceType, Role } from '@prisma/client';

const prisma = getTestPrisma();

describe('Admin Routes', () => {
  let adminUser: any;
  let adminToken: string;
  let regularUser: any;

  beforeAll(async () => {
    await cleanDatabase();
  });

  beforeEach(async () => {
    // Admin kullanıcı oluştur
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    adminUser = await createTestAdmin(`admin${Date.now()}@example.com`, adminPasswordHash);
    adminToken = generateAdminToken(adminUser.id);

    // Regular user oluştur (test için)
    const userPasswordHash = await bcrypt.hash('password123', 12);
    regularUser = await createTestUser(`user${Date.now()}@example.com`, userPasswordHash, 'USER', 100);
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  describe('POST /api/admin/auth/login', () => {
    it('should login admin successfully', async () => {
      const loginData = {
        username: adminUser.email,
        password: 'admin123',
      };

      const response = await request(app)
        .post('/api/admin/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.role).toBe('ADMIN');
    });

    it('should return 401 with invalid credentials', async () => {
      const loginData = {
        username: adminUser.email,
        password: 'wrongpassword',
      };

      const response = await request(app)
        .post('/api/admin/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/admin/users', () => {
    it('should get all users successfully', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set(getAuthHeader(adminToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('users');
      expect(Array.isArray(response.body.data.users)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/admin/users?page=1&limit=10')
        .set(getAuthHeader(adminToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should support search', async () => {
      const response = await request(app)
        .get(`/api/admin/users?search=${regularUser.email}`)
        .set(getAuthHeader(adminToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 403 for non-admin user', async () => {
      const userToken = generateTestToken(regularUser.id);
      const response = await request(app)
        .get('/api/admin/users')
        .set(getAuthHeader(userToken))
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/admin/users/:id', () => {
    it('should get user by id successfully', async () => {
      const response = await request(app)
        .get(`/api/admin/users/${regularUser.id}`)
        .set(getAuthHeader(adminToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.id).toBe(regularUser.id);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/admin/users/99999')
        .set(getAuthHeader(adminToken))
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get(`/api/admin/users/${regularUser.id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/admin/users/:id', () => {
    it('should update user successfully', async () => {
      const updateData = {
        role: 'ADMIN',
      };

      const response = await request(app)
        .put(`/api/admin/users/${regularUser.id}`)
        .set(getAuthHeader(adminToken))
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .put('/api/admin/users/99999')
        .set(getAuthHeader(adminToken))
        .send({ role: 'ADMIN' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${regularUser.id}`)
        .send({ role: 'ADMIN' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/admin/reports', () => {
    beforeEach(async () => {
      // Test için rapor oluştur
      await createTestReport(regularUser.id, undefined, ReportType.DAMAGE_ASSESSMENT, ReportStatus.COMPLETED);
    });

    it('should get all reports successfully', async () => {
      const response = await request(app)
        .get('/api/admin/reports')
        .set(getAuthHeader(adminToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('reports');
      expect(Array.isArray(response.body.data.reports)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/admin/reports?page=1&limit=10')
        .set(getAuthHeader(adminToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/admin/reports')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/admin/reports/:id', () => {
    let reportId: number;

    beforeEach(async () => {
      const report = await createTestReport(regularUser.id, undefined, ReportType.DAMAGE_ASSESSMENT, ReportStatus.COMPLETED);
      reportId = report.id;
    });

    it('should get report by id successfully', async () => {
      const response = await request(app)
        .get(`/api/admin/reports/${reportId}`)
        .set(getAuthHeader(adminToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('report');
      expect(response.body.data.report.id).toBe(reportId);
    });

    it('should return 404 for non-existent report', async () => {
      const response = await request(app)
        .get('/api/admin/reports/99999')
        .set(getAuthHeader(adminToken))
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get(`/api/admin/reports/${reportId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/admin/reports/:id/status', () => {
    let reportId: number;

    beforeEach(async () => {
      const report = await createTestReport(regularUser.id, undefined, ReportType.DAMAGE_ASSESSMENT, ReportStatus.PROCESSING);
      reportId = report.id;
    });

    it('should update report status successfully', async () => {
      const updateData = {
        status: 'COMPLETED',
      };

      const response = await request(app)
        .put(`/api/admin/reports/${reportId}/status`)
        .set(getAuthHeader(adminToken))
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 404 for non-existent report', async () => {
      const response = await request(app)
        .put('/api/admin/reports/99999/status')
        .set(getAuthHeader(adminToken))
        .send({ status: 'COMPLETED' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .put(`/api/admin/reports/${reportId}/status`)
        .send({ status: 'COMPLETED' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/admin/stats', () => {
    it('should get system stats successfully', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .set(getAuthHeader(adminToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('users');
      expect(response.body.data.users).toHaveProperty('total');
      expect(response.body.data.users).toHaveProperty('active');
      expect(response.body.data).toHaveProperty('reports');
      expect(response.body.data.reports).toHaveProperty('total');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/admin/stats')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/admin/pricing', () => {
    beforeEach(async () => {
      // ServicePricing kaydı oluştur
      await createTestServicePricing(ServiceType.DAMAGE_ASSESSMENT, 100, true);
    });

    it('should get service pricing successfully', async () => {
      const response = await request(app)
        .get('/api/admin/pricing')
        .set(getAuthHeader(adminToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('pricing');
      expect(Array.isArray(response.body.data.pricing)).toBe(true);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/admin/pricing')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/admin/pricing', () => {
    beforeEach(async () => {
      // ServicePricing kaydı oluştur
      await createTestServicePricing(ServiceType.DAMAGE_ASSESSMENT, 100, true);
    });

    it('should update service pricing successfully', async () => {
      // Önce pricing kaydını oluştur
      const pricing = await createTestServicePricing(ServiceType.DAMAGE_ASSESSMENT, 100, true);
      
      const updateData = {
        pricing: [
          {
            id: pricing.id,
            basePrice: 150,
            isActive: true,
          },
        ],
      };

      const response = await request(app)
        .put('/api/admin/pricing')
        .set(getAuthHeader(adminToken))
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .put('/api/admin/pricing')
        .send({ serviceType: 'DAMAGE_ASSESSMENT', basePrice: 150 })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/admin/settings', () => {
    it('should get system settings successfully', async () => {
      const response = await request(app)
        .get('/api/admin/settings')
        .set(getAuthHeader(adminToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/admin/settings')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/admin/users/:id/credits/add', () => {
    it('should add credits to user successfully', async () => {
      const creditData = {
        amount: 50,
        description: 'Test kredi ekleme',
      };

      const response = await request(app)
        .post(`/api/admin/users/${regularUser.id}/credits/add`)
        .set(getAuthHeader(adminToken))
        .send(creditData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/admin/users/99999/credits/add')
        .set(getAuthHeader(adminToken))
        .send({ amount: 50 })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post(`/api/admin/users/${regularUser.id}/credits/add`)
        .send({ amount: 50 })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/admin/users/:id/suspend', () => {
    it('should suspend user successfully', async () => {
      const response = await request(app)
        .post(`/api/admin/users/${regularUser.id}/suspend`)
        .set(getAuthHeader(adminToken))
        .send({ reason: 'Test suspension' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/admin/users/99999/suspend')
        .set(getAuthHeader(adminToken))
        .send({ reason: 'Test' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post(`/api/admin/users/${regularUser.id}/suspend`)
        .send({ reason: 'Test' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/admin/users/:id/activate', () => {
    it('should activate user successfully', async () => {
      const response = await request(app)
        .post(`/api/admin/users/${regularUser.id}/activate`)
        .set(getAuthHeader(adminToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/admin/users/99999/activate')
        .set(getAuthHeader(adminToken))
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post(`/api/admin/users/${regularUser.id}/activate`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

