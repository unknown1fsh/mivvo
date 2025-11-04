/**
 * Auth Routes Tests
 * 
 * Authentication endpoint testleri
 */

import request from 'supertest';
import app from '../../index';
import { getTestPrisma, createTestUser, cleanDatabase } from '../helpers/database';
import { generateTestToken, getAuthHeader } from '../helpers/auth';
import { mockRegisterData, mockLoginData, mockProfileUpdateData, mockChangePasswordData } from '../helpers/mocks';
import bcrypt from 'bcryptjs';

const prisma = getTestPrisma();

describe('Auth Routes', () => {
  let testUser: any;
  let testUserToken: string;
  const prisma = getTestPrisma();

  beforeAll(async () => {
    // Clean database before tests
    await cleanDatabase();
  });

  afterAll(async () => {
    // Clean database after tests
    await cleanDatabase();
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const registerData = mockRegisterData();
      const response = await request(app)
        .post('/api/auth/register')
        .send(registerData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(registerData.email);
      expect(response.body.data.user.firstName).toBe(registerData.firstName);
      expect(response.body.data.user.lastName).toBe(registerData.lastName);

      // Store for other tests
      testUser = response.body.data.user;
      testUserToken = response.body.data.token;
    });

    it('should return 400 if email already exists', async () => {
      const registerData = mockRegisterData();
      await request(app)
        .post('/api/auth/register')
        .send(registerData)
        .expect(400);

      expect((await request(app).post('/api/auth/register').send(registerData)).body.success).toBe(false);
    });

    it('should return 400 if email is invalid', async () => {
      const invalidData = {
        ...mockRegisterData(),
        email: 'invalid-email',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 if password is too short', async () => {
      const invalidData = {
        ...mockRegisterData(),
        email: 'shortpass@example.com',
        password: '12345', // Less than 6 characters
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidData = {
        email: 'missing@example.com',
        // Missing firstName, lastName, password
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    let loginUser: any;

    beforeEach(async () => {
      // Her test için benzersiz kullanıcı oluştur
      const uniqueEmail = `login${Date.now()}@example.com`;
      const passwordHash = await bcrypt.hash('password123', 12);
      loginUser = await createTestUser(uniqueEmail, passwordHash);
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: loginUser.email,
        password: 'password123',
      };
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.user).not.toHaveProperty('passwordHash');
    });

    it('should return 401 with invalid email', async () => {
      const loginData = mockLoginData('nonexistent@example.com', 'password123');
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 with invalid password', async () => {
      const loginData = mockLoginData('login@example.com', 'wrongpassword');
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 if email is invalid format', async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 if password is missing', async () => {
      const loginData = {
        email: 'login@example.com',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    beforeEach(async () => {
      if (!testUser) {
        const user = await createTestUser('logout@example.com');
        testUser = user;
        testUserToken = generateTestToken(user.id);
      }
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set(getAuthHeader('invalid-token'))
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/profile', () => {
    beforeEach(async () => {
      if (!testUser) {
        const user = await createTestUser('profile@example.com');
        testUser = user;
        testUserToken = generateTestToken(user.id);
      }
    });

    it('should get profile successfully with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).toHaveProperty('firstName');
      expect(response.body.user).toHaveProperty('lastName');
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/auth/profile', () => {
    beforeEach(async () => {
      if (!testUser) {
        const user = await createTestUser('updateprofile@example.com');
        testUser = user;
        testUserToken = generateTestToken(user.id);
      }
    });

    it('should update profile successfully', async () => {
      const updateData = mockProfileUpdateData();
      const response = await request(app)
        .put('/api/auth/profile')
        .set(getAuthHeader(testUserToken))
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.firstName).toBe(updateData.firstName);
      expect(response.body.data.user.lastName).toBe(updateData.lastName);
    });

    it('should return 400 if phone format is invalid', async () => {
      const invalidData = {
        phone: '123456', // Invalid Turkish phone format
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set(getAuthHeader(testUserToken))
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .send(mockProfileUpdateData())
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/auth/change-password', () => {
    let changePassUser: any;
    let changePassToken: string;

    beforeEach(async () => {
      // Her test için benzersiz email ile yeni kullanıcı oluştur
      const uniqueEmail = `changepass${Date.now()}@example.com`;
      const passwordHash = await bcrypt.hash('oldpassword123', 12);
      changePassUser = await createTestUser(uniqueEmail, passwordHash);
      changePassToken = generateTestToken(changePassUser.id);
    });

    it('should change password successfully with valid current password', async () => {
      const changePasswordData = {
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword123',
      };

      const response = await request(app)
        .put('/api/auth/change-password')
        .set(getAuthHeader(changePassToken))
        .send(changePasswordData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 400 with invalid current password', async () => {
      const changePasswordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
      };

      const response = await request(app)
        .put('/api/auth/change-password')
        .set(getAuthHeader(changePassToken))
        .send(changePasswordData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 if new password is too short', async () => {
      const changePasswordData = {
        currentPassword: 'oldpassword123',
        newPassword: '12345', // Less than 6 characters
      };

      const response = await request(app)
        .put('/api/auth/change-password')
        .set(getAuthHeader(changePassToken))
        .send(changePasswordData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .put('/api/auth/change-password')
        .send(mockChangePasswordData())
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      if (!testUser) {
        const user = await createTestUser('forgotpass@example.com');
        testUser = user;
      }
    });

    it('should send password reset email for existing user', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'forgotpass@example.com' })
        .expect(200);

      // Response should be successful even if email service is not configured
      expect(response.body).toHaveProperty('success');
    });

    it('should return success even for non-existent email (security)', async () => {
      // For security, we don't reveal if email exists
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('success');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should return 400 with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          newPassword: 'newpassword123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 if new password is too short', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'some-token',
          newPassword: '12345',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/verify-email/:token', () => {
    it('should return 400 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify-email/invalid-token')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/resend-verification', () => {
    beforeEach(async () => {
      // Test için kullanıcı oluştur (emailVerified: false)
      if (!testUser) {
        const user = await createTestUser('resendverif@example.com');
        // Email verified'i false yap
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: false },
        });
        testUser = user;
      }
    });

    it('should return success response for existing unverified user', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'resendverif@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return success even for non-existent email (security)', async () => {
      // For security, we don't reveal if email exists
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('POST /api/auth/oauth', () => {
    it('should handle OAuth login', async () => {
      // Her test için benzersiz email kullan
      const uniqueEmail = `oauth${Date.now()}@example.com`;
      const oauthData = {
        provider: 'google',
        providerId: `google${Date.now()}`,
        email: uniqueEmail,
        name: 'OAuth User',
      };

      const response = await request(app)
        .post('/api/auth/oauth')
        .send(oauthData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/oauth')
        .send({
          provider: 'google',
          // Missing email, name, providerId
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});

