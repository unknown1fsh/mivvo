/**
 * Vehicle Routes Tests
 * 
 * Vehicle report endpoint testleri
 */

import request from 'supertest';
import app from '../../index';
import { getTestPrisma, createTestUser, cleanDatabase, createTestReport, createTestServicePricing } from '../helpers/database';
import { generateTestToken, getAuthHeader } from '../helpers/auth';
import bcrypt from 'bcryptjs';
import { ReportType, ReportStatus, ServiceType } from '@prisma/client';

const prisma = getTestPrisma();

describe('Vehicle Routes', () => {
  let testUser: any;
  let testUserToken: string;

  beforeAll(async () => {
    await cleanDatabase();
  });

  beforeEach(async () => {
    // Her test için yeni kullanıcı oluştur (yeterli kredi ile)
    const passwordHash = await bcrypt.hash('password123', 12);
    testUser = await createTestUser(`vehicle${Date.now()}@example.com`, passwordHash, 'USER', 1000);
    testUserToken = generateTestToken(testUser.id);

    // ServicePricing kayıtlarını oluştur (test için gerekli)
    await createTestServicePricing(ServiceType.DAMAGE_ASSESSMENT, 100, true);
    await createTestServicePricing(ServiceType.PAINT_ANALYSIS, 100, true);
    await createTestServicePricing(ServiceType.VALUE_ESTIMATION, 100, true);
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  describe('POST /api/vehicle/reports', () => {
    it('should create a report successfully', async () => {
      const reportData = {
        reportType: 'DAMAGE_ASSESSMENT',
        vehiclePlate: '34ABC123',
        vehicleBrand: 'Toyota',
        vehicleModel: 'Corolla',
        vehicleYear: 2020,
      };

      const response = await request(app)
        .post('/api/vehicle/reports')
        .set(getAuthHeader(testUserToken))
        .send(reportData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('report');
      expect(response.body.data.report.reportType).toBe('DAMAGE_ASSESSMENT');
    });

    it('should return 400 if reportType is invalid', async () => {
      const reportData = {
        reportType: 'INVALID_TYPE',
        vehiclePlate: '34ABC123',
      };

      const response = await request(app)
        .post('/api/vehicle/reports')
        .set(getAuthHeader(testUserToken))
        .send(reportData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 if insufficient credits', async () => {
      // Kredisi az kullanıcı oluştur
      const poorUser = await createTestUser(`poor${Date.now()}@example.com`, await bcrypt.hash('password123', 12), 'USER', 10);
      const poorUserToken = generateTestToken(poorUser.id);

      const reportData = {
        reportType: 'DAMAGE_ASSESSMENT',
        vehiclePlate: '34ABC123',
        vehicleBrand: 'Toyota',
        vehicleModel: 'Corolla',
        vehicleYear: 2020,
      };

      const response = await request(app)
        .post('/api/vehicle/reports')
        .set(getAuthHeader(poorUserToken))
        .send(reportData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const reportData = {
        reportType: 'DAMAGE_ASSESSMENT',
        vehiclePlate: '34ABC123',
      };

      const response = await request(app)
        .post('/api/vehicle/reports')
        .send(reportData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/vehicle/reports', () => {
    beforeEach(async () => {
      // Test için rapor oluştur
      await createTestReport(testUser.id, undefined, ReportType.DAMAGE_ASSESSMENT, ReportStatus.COMPLETED);
    });

    it('should get reports successfully', async () => {
      const response = await request(app)
        .get('/api/vehicle/reports')
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('reports');
      expect(Array.isArray(response.body.data.reports)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/vehicle/reports?page=1&limit=10')
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/vehicle/reports')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/vehicle/reports/:id', () => {
    let reportId: number;

    beforeEach(async () => {
      const report = await createTestReport(testUser.id, undefined, ReportType.DAMAGE_ASSESSMENT, ReportStatus.COMPLETED);
      reportId = report.id;
    });

    it('should get report detail successfully', async () => {
      const response = await request(app)
        .get(`/api/vehicle/reports/${reportId}`)
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('report');
      expect(response.body.data.report.id).toBe(reportId);
    });

    it('should return 404 for non-existent report', async () => {
      const response = await request(app)
        .get('/api/vehicle/reports/99999')
        .set(getAuthHeader(testUserToken))
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get(`/api/vehicle/reports/${reportId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/vehicle/reports/:id/images', () => {
    let reportId: number;

    beforeEach(async () => {
      const report = await createTestReport(testUser.id, undefined, ReportType.DAMAGE_ASSESSMENT, ReportStatus.PROCESSING);
      reportId = report.id;
    });

    it('should upload images successfully', async () => {
      const imageData = {
        images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      };

      const response = await request(app)
        .post(`/api/vehicle/reports/${reportId}/images`)
        .set(getAuthHeader(testUserToken))
        .send(imageData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should return 404 for non-existent report', async () => {
      const imageData = {
        images: ['https://example.com/image1.jpg'],
      };

      const response = await request(app)
        .post('/api/vehicle/reports/99999/images')
        .set(getAuthHeader(testUserToken))
        .send(imageData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post(`/api/vehicle/reports/${reportId}/images`)
        .send({ images: [] })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/vehicle/reports/:id/analysis', () => {
    let reportId: number;

    beforeEach(async () => {
      const report = await createTestReport(testUser.id, undefined, ReportType.DAMAGE_ASSESSMENT, ReportStatus.COMPLETED);
      reportId = report.id;
    });

    it('should get analysis results successfully', async () => {
      const response = await request(app)
        .get(`/api/vehicle/reports/${reportId}/analysis`)
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should return 404 for non-existent report', async () => {
      const response = await request(app)
        .get('/api/vehicle/reports/99999/analysis')
        .set(getAuthHeader(testUserToken))
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get(`/api/vehicle/reports/${reportId}/analysis`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/vehicle/reports/:id/download', () => {
    let reportId: number;

    beforeEach(async () => {
      const report = await createTestReport(testUser.id, undefined, ReportType.DAMAGE_ASSESSMENT, ReportStatus.COMPLETED);
      reportId = report.id;
    });

    it('should download report successfully', async () => {
      const response = await request(app)
        .get(`/api/vehicle/reports/${reportId}/download`)
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 404 for non-existent report', async () => {
      const response = await request(app)
        .get('/api/vehicle/reports/99999/download')
        .set(getAuthHeader(testUserToken))
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get(`/api/vehicle/reports/${reportId}/download`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

