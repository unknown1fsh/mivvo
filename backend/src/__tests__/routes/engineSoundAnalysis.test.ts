/**
 * Engine Sound Analysis Routes Tests
 * 
 * Engine sound analysis endpoint testleri
 */

import request from 'supertest';
import app from '../../index';
import { getTestPrisma, createTestUser, cleanDatabase, createTestReport, createTestServicePricing } from '../helpers/database';
import { generateTestToken, getAuthHeader } from '../helpers/auth';
import bcrypt from 'bcryptjs';
import { ReportType, ReportStatus, ServiceType } from '@prisma/client';

const prisma = getTestPrisma();

describe('Engine Sound Analysis Routes', () => {
  let testUser: any;
  let testUserToken: string;

  beforeAll(async () => {
    await cleanDatabase();
  });

  beforeEach(async () => {
    // Her test için yeni kullanıcı oluştur (yeterli kredi ile)
    const passwordHash = await bcrypt.hash('password123', 12);
    testUser = await createTestUser(`engine${Date.now()}@example.com`, passwordHash, 'USER', 1000);
    testUserToken = generateTestToken(testUser.id);

    // ServicePricing kaydı oluştur
    await createTestServicePricing(ServiceType.ENGINE_SOUND_ANALYSIS, 100, true);
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  describe('GET /api/engine-sound-analysis/history', () => {
    beforeEach(async () => {
      // Test için rapor oluştur
      await createTestReport(testUser.id, undefined, ReportType.ENGINE_SOUND_ANALYSIS, ReportStatus.COMPLETED);
    });

    it('should get history successfully', async () => {
      const response = await request(app)
        .get('/api/engine-sound-analysis/history')
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/engine-sound-analysis/history')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/engine-sound-analysis/:reportId', () => {
    let reportId: number;

    beforeEach(async () => {
      const report = await createTestReport(testUser.id, undefined, ReportType.ENGINE_SOUND_ANALYSIS, ReportStatus.PROCESSING);
      reportId = report.id;
    });

    it('should get report successfully', async () => {
      const response = await request(app)
        .get(`/api/engine-sound-analysis/${reportId}`)
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should return 404 for non-existent report', async () => {
      const response = await request(app)
        .get('/api/engine-sound-analysis/99999')
        .set(getAuthHeader(testUserToken))
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get(`/api/engine-sound-analysis/${reportId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/engine-sound-analysis/:reportId/status', () => {
    let reportId: number;

    beforeEach(async () => {
      const report = await createTestReport(testUser.id, undefined, ReportType.ENGINE_SOUND_ANALYSIS, ReportStatus.PROCESSING);
      reportId = report.id;
    });

    it('should get status successfully', async () => {
      const response = await request(app)
        .get(`/api/engine-sound-analysis/${reportId}/status`)
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status');
    });

    it('should return 404 for non-existent report', async () => {
      const response = await request(app)
        .get('/api/engine-sound-analysis/99999/status')
        .set(getAuthHeader(testUserToken))
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get(`/api/engine-sound-analysis/${reportId}/status`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/engine-sound-analysis/:reportId/download', () => {
    let reportId: number;

    beforeEach(async () => {
      const report = await createTestReport(testUser.id, undefined, ReportType.ENGINE_SOUND_ANALYSIS, ReportStatus.COMPLETED);
      reportId = report.id;
    });

    it('should download report successfully', async () => {
      const response = await request(app)
        .get(`/api/engine-sound-analysis/${reportId}/download`)
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('referenceId');
      expect(response.body).toHaveProperty('vehicleInfo');
    });

    it('should return 404 for non-existent report', async () => {
      const response = await request(app)
        .get('/api/engine-sound-analysis/99999/download')
        .set(getAuthHeader(testUserToken))
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get(`/api/engine-sound-analysis/${reportId}/download`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

