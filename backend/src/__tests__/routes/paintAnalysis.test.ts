/**
 * Paint Analysis Routes Tests
 * 
 * Paint analysis endpoint testleri
 */

import request from 'supertest';
import app from '../../index';
import { getTestPrisma, createTestUser, cleanDatabase, createTestReport, createTestServicePricing } from '../helpers/database';
import { generateTestToken, getAuthHeader } from '../helpers/auth';
import bcrypt from 'bcryptjs';
import { ReportType, ReportStatus, ServiceType } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = getTestPrisma();

describe('Paint Analysis Routes', () => {
  let testUser: any;
  let testUserToken: string;

  beforeAll(async () => {
    await cleanDatabase();
  });

  beforeEach(async () => {
    // Her test için yeni kullanıcı oluştur (yeterli kredi ile)
    const passwordHash = await bcrypt.hash('password123', 12);
    testUser = await createTestUser(`paint${Date.now()}@example.com`, passwordHash, 'USER', 1000);
    testUserToken = generateTestToken(testUser.id);

    // ServicePricing kaydı oluştur
    await createTestServicePricing(ServiceType.PAINT_ANALYSIS, 100, true);
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  describe('POST /api/paint-analysis/start', () => {
    it('should start paint analysis successfully', async () => {
      const vehicleData = {
        vehicleInfo: {
          plate: `34PAINT${Date.now()}`,
          make: 'Toyota',
          model: 'Corolla',
          year: 2020,
        },
      };

      const response = await request(app)
        .post('/api/paint-analysis/start')
        .set(getAuthHeader(testUserToken))
        .send(vehicleData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('reportId');
      expect(response.body.data).toHaveProperty('status');
    });

    it('should return 400 if plate is missing', async () => {
      const vehicleData = {
        vehicleInfo: {
          make: 'Toyota',
          model: 'Corolla',
        },
      };

      const response = await request(app)
        .post('/api/paint-analysis/start')
        .set(getAuthHeader(testUserToken))
        .send(vehicleData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/paint-analysis/start')
        .send({ vehicleInfo: { plate: '34ABC123' } })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/paint-analysis/:reportId', () => {
    let reportId: number;

    beforeEach(async () => {
      const report = await createTestReport(testUser.id, undefined, ReportType.PAINT_ANALYSIS, ReportStatus.PROCESSING);
      reportId = report.id;
    });

    it('should get report successfully', async () => {
      const response = await request(app)
        .get(`/api/paint-analysis/${reportId}`)
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should return 404 for non-existent report', async () => {
      const response = await request(app)
        .get('/api/paint-analysis/99999')
        .set(getAuthHeader(testUserToken))
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get(`/api/paint-analysis/${reportId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

