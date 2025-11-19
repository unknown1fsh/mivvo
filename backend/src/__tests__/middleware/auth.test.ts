/**
 * Authentication Middleware Tests
 */

import { Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import jwt from 'jsonwebtoken';
import { getPrismaClient } from '../../utils/prisma';

const prisma = getPrismaClient();

// Mock Prisma
jest.mock('../../utils/prisma', () => ({
  getPrismaClient: jest.fn(() => ({
    user: {
      findUnique: jest.fn(),
    },
  })),
}));

describe('Authentication Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      header: jest.fn(),
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-characters-long';
  });

  it('should return 401 if token is missing', async () => {
    (mockRequest.header as jest.Mock).mockReturnValue(undefined);

    await authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', async () => {
    (mockRequest.header as jest.Mock).mockReturnValue('Bearer invalid-token');

    await authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should call next if token is valid', async () => {
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET!);
    (mockRequest.header as jest.Mock).mockReturnValue(`Bearer ${token}`);

    const mockPrisma = getPrismaClient() as any;
    mockPrisma.user.findUnique = jest.fn().mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      role: 'USER',
      isActive: true,
    });

    await authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
  });

  it('should authorize admin role', () => {
    mockRequest.user = {
      id: 1,
      email: 'admin@example.com',
      role: 'ADMIN',
    };

    const adminAuth = authorize('ADMIN');
    adminAuth(mockRequest as any, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
  });

  it('should return 403 if user role is not authorized', () => {
    mockRequest.user = {
      id: 1,
      email: 'user@example.com',
      role: 'USER',
    };

    const adminAuth = authorize('ADMIN');
    adminAuth(mockRequest as any, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(nextFunction).not.toHaveBeenCalled();
  });
});

