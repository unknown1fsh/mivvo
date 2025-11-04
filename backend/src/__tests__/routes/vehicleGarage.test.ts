/**
 * Vehicle Garage Routes Tests
 * 
 * Vehicle garage endpoint testleri
 */

import request from 'supertest';
import app from '../../index';
import { getTestPrisma, createTestUser, cleanDatabase, createTestVehicle } from '../helpers/database';
import { generateTestToken, getAuthHeader } from '../helpers/auth';
import bcrypt from 'bcryptjs';

const prisma = getTestPrisma();

describe('Vehicle Garage Routes', () => {
  let testUser: any;
  let testUserToken: string;

  beforeAll(async () => {
    await cleanDatabase();
  });

  beforeEach(async () => {
    // Her test için yeni kullanıcı oluştur
    const passwordHash = await bcrypt.hash('password123', 12);
    testUser = await createTestUser(`garage${Date.now()}@example.com`, passwordHash, 'USER', 100);
    testUserToken = generateTestToken(testUser.id);
  });

  afterAll(async () => {
    await cleanDatabase();
  });

  describe('GET /api/vehicle-garage', () => {
    beforeEach(async () => {
      // Test için benzersiz plaka ile araç oluştur
      const uniquePlate = `34LIST${Date.now()}`;
      await createTestVehicle(testUser.id, uniquePlate);
    });

    it('should get vehicle garage successfully', async () => {
      const response = await request(app)
        .get('/api/vehicle-garage')
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/vehicle-garage')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/vehicle-garage/:id', () => {
    let vehicleId: number;

    beforeEach(async () => {
      const uniquePlate = `34GET${Date.now()}`;
      const vehicle = await createTestVehicle(testUser.id, uniquePlate);
      vehicleId = vehicle.id;
    });

    it('should get vehicle by id successfully', async () => {
      const response = await request(app)
        .get(`/api/vehicle-garage/${vehicleId}`)
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBe(vehicleId);
    });

    it('should return 404 for non-existent vehicle', async () => {
      const response = await request(app)
        .get('/api/vehicle-garage/99999')
        .set(getAuthHeader(testUserToken))
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get(`/api/vehicle-garage/${vehicleId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/vehicle-garage', () => {
    it('should create vehicle successfully', async () => {
      const vehicleData = {
        plate: `34TEST${Date.now()}`,
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        color: 'White',
        mileage: 50000,
      };

      const response = await request(app)
        .post('/api/vehicle-garage')
        .set(getAuthHeader(testUserToken))
        .send(vehicleData)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('plate');
      expect(response.body.data.plate).toBe(vehicleData.plate);
    });

    it('should return 400 if plate is missing', async () => {
      const vehicleData = {
        brand: 'Toyota',
        model: 'Corolla',
      };

      const response = await request(app)
        .post('/api/vehicle-garage')
        .set(getAuthHeader(testUserToken))
        .send(vehicleData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 if plate already exists', async () => {
      const plate = `34DUP${Date.now()}`;
      await createTestVehicle(testUser.id, plate);

      const vehicleData = {
        plate,
        brand: 'Toyota',
        model: 'Corolla',
      };

      const response = await request(app)
        .post('/api/vehicle-garage')
        .set(getAuthHeader(testUserToken))
        .send(vehicleData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/vehicle-garage')
        .send({ plate: '34ABC123' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/vehicle-garage/:id', () => {
    let vehicleId: number;

    beforeEach(async () => {
      const uniquePlate = `34PUT${Date.now()}`;
      const vehicle = await createTestVehicle(testUser.id, uniquePlate);
      vehicleId = vehicle.id;
    });

    it('should update vehicle successfully', async () => {
      const updateData = {
        color: 'Black',
        mileage: 60000,
      };

      const response = await request(app)
        .put(`/api/vehicle-garage/${vehicleId}`)
        .set(getAuthHeader(testUserToken))
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });

    it('should return 404 for non-existent vehicle', async () => {
      const response = await request(app)
        .put('/api/vehicle-garage/99999')
        .set(getAuthHeader(testUserToken))
        .send({ color: 'Red' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .put(`/api/vehicle-garage/${vehicleId}`)
        .send({ color: 'Red' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/vehicle-garage/:id', () => {
    let vehicleId: number;

    beforeEach(async () => {
      const uniquePlate = `34DEL${Date.now()}`;
      const vehicle = await createTestVehicle(testUser.id, uniquePlate);
      vehicleId = vehicle.id;
    });

    it('should delete vehicle successfully', async () => {
      const response = await request(app)
        .delete(`/api/vehicle-garage/${vehicleId}`)
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 404 for non-existent vehicle', async () => {
      const response = await request(app)
        .delete('/api/vehicle-garage/99999')
        .set(getAuthHeader(testUserToken))
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .delete(`/api/vehicle-garage/${vehicleId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/vehicle-garage/:id/set-default', () => {
    let vehicleId: number;

    beforeEach(async () => {
      const uniquePlate = `34PATCH${Date.now()}`;
      const vehicle = await createTestVehicle(testUser.id, uniquePlate);
      vehicleId = vehicle.id;
    });

    it('should set default vehicle successfully', async () => {
      const response = await request(app)
        .patch(`/api/vehicle-garage/${vehicleId}/set-default`)
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
    });

    it('should return 404 for non-existent vehicle', async () => {
      const response = await request(app)
        .patch('/api/vehicle-garage/99999/set-default')
        .set(getAuthHeader(testUserToken))
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .patch(`/api/vehicle-garage/${vehicleId}/set-default`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/vehicle-garage/:id/reports', () => {
    let vehicleId: number;

    beforeEach(async () => {
      const uniquePlate = `34RPT${Date.now()}`;
      const vehicle = await createTestVehicle(testUser.id, uniquePlate);
      vehicleId = vehicle.id;
    });

    it('should get vehicle reports successfully', async () => {
      const response = await request(app)
        .get(`/api/vehicle-garage/${vehicleId}/reports`)
        .set(getAuthHeader(testUserToken))
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 404 for non-existent vehicle', async () => {
      const response = await request(app)
        .get('/api/vehicle-garage/99999/reports')
        .set(getAuthHeader(testUserToken))
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get(`/api/vehicle-garage/${vehicleId}/reports`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

