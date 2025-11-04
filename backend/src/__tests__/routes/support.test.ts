/**
 * Support Routes Tests
 * 
 * Support, Contact, Career, Pricing, Notifications, VIN route testleri
 */

import request from 'supertest';
import app from '../../index';
import { getTestPrisma, createTestUser, cleanDatabase, createTestAdmin } from '../helpers/database';
import { generateTestToken, generateAdminToken, getAuthHeader } from '../helpers/auth';
import bcrypt from 'bcryptjs';

const prisma = getTestPrisma();

describe('Support Routes', () => {
  let testUser: any;
  let testUserToken: string;
  let adminUser: any;
  let adminToken: string;

  beforeAll(async () => {
    await cleanDatabase();
  });

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('password123', 12);
    testUser = await createTestUser(`support${Date.now()}@example.com`, passwordHash, 'USER', 100);
    testUserToken = generateTestToken(testUser.id);

    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    adminUser = await createTestAdmin(`admin${Date.now()}@example.com`, adminPasswordHash);
    adminToken = generateAdminToken(adminUser.id);
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  describe('POST /api/support/tickets', () => {
    it('should create ticket successfully', async () => {
      const ticketData = {
        subject: 'Test Ticket',
        description: 'Test message',
        priority: 'NORMAL',
      };

      const response = await request(app)
        .post('/api/support/tickets')
        .set(getAuthHeader(testUserToken))
        .send(ticketData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/support/tickets')
        .send({ subject: 'Test', message: 'Test' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/support/tickets', () => {
    it('should get user tickets successfully', async () => {
      const response = await request(app)
        .get('/api/support/tickets')
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/support/tickets')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

describe('Contact Routes', () => {
  let adminUser: any;
  let adminToken: string;

  beforeAll(async () => {
    await cleanDatabase();
  });

  beforeEach(async () => {
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    adminUser = await createTestAdmin(`admin${Date.now()}@example.com`, adminPasswordHash);
    adminToken = generateAdminToken(adminUser.id);
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  describe('POST /api/contact/submit', () => {
    it('should create contact inquiry successfully', async () => {
      const inquiryData = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Subject',
        message: 'Test message',
        inquiryType: 'GENERAL',
      };

      const response = await request(app)
        .post('/api/contact/submit')
        .send(inquiryData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/contact/submit')
        .send({ name: 'Test' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/contact/admin/contact-inquiries', () => {
    it('should get contact inquiries successfully', async () => {
      const response = await request(app)
        .get('/api/contact/admin/contact-inquiries')
        .set(getAuthHeader(adminToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/contact/admin/contact-inquiries')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

describe('Career Routes', () => {
  let adminUser: any;
  let adminToken: string;

  beforeAll(async () => {
    await cleanDatabase();
  });

  beforeEach(async () => {
    const adminPasswordHash = await bcrypt.hash('admin123', 12);
    adminUser = await createTestAdmin(`admin${Date.now()}@example.com`, adminPasswordHash);
    adminToken = generateAdminToken(adminUser.id);
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  describe('POST /api/career/submit', () => {
    it('should create career application successfully', async () => {
      const applicationData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '5551234567',
        position: 'Software Engineer',
      };

      const response = await request(app)
        .post('/api/career/submit')
        .send(applicationData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/career/submit')
        .send({ name: 'Test' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/career/admin/career-applications', () => {
    it('should get career applications successfully', async () => {
      const response = await request(app)
        .get('/api/career/admin/career-applications')
        .set(getAuthHeader(adminToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/career/admin/career-applications')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

describe('Pricing Routes', () => {
  describe('GET /api/pricing/packages', () => {
    it('should get pricing packages successfully', async () => {
      const response = await request(app)
        .get('/api/pricing/packages')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('GET /api/pricing/campaigns', () => {
    it('should get active campaigns successfully', async () => {
      const response = await request(app)
        .get('/api/pricing/campaigns')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });
});

describe('Notifications Routes', () => {
  let testUser: any;
  let testUserToken: string;

  beforeAll(async () => {
    await cleanDatabase();
  });

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('password123', 12);
    testUser = await createTestUser(`notif${Date.now()}@example.com`, passwordHash, 'USER', 100);
    testUserToken = generateTestToken(testUser.id);
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  describe('GET /api/user/notifications', () => {
    it('should get notifications successfully', async () => {
      const response = await request(app)
        .get('/api/user/notifications')
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/user/notifications')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/user/notifications/unread-count', () => {
    it('should get unread count successfully', async () => {
      const response = await request(app)
        .get('/api/user/notifications/unread-count')
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/user/notifications/unread-count')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

describe('VIN Routes', () => {
  describe('POST /api/vin/decode', () => {
    it('should decode VIN successfully', async () => {
      const vinData = {
        vin: '1HGBH41JXMN109186',
      };

      const response = await request(app)
        .post('/api/vin/decode')
        .send(vinData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 400 for invalid VIN format', async () => {
      const response = await request(app)
        .post('/api/vin/decode')
        .send({ vin: 'INVALID' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/vin/basic/:vin', () => {
    it('should get basic VIN info successfully', async () => {
      const response = await request(app)
        .get('/api/vin/basic/1HGBH41JXMN109186')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('GET /api/vin/history', () => {
    it('should get VIN lookup history successfully', async () => {
      const response = await request(app)
        .get('/api/vin/history')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });
});

