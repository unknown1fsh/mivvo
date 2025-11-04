/**
 * Auth Test Helpers
 * 
 * JWT token oluşturma ve authentication test helper'ları
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only';

/**
 * Test kullanıcısı için JWT token oluşturur
 * 
 * @param userId - Kullanıcı ID'si
 * @param role - Kullanıcı rolü (default: 'USER')
 * @param expiresIn - Token geçerlilik süresi (default: '7d')
 * @returns JWT token string
 */
export function generateTestToken(
  userId: number,
  role: string = 'USER',
  expiresIn: string = '7d'
): string {
  return jwt.sign(
    { id: userId, role },
    JWT_SECRET,
    { expiresIn } as jwt.SignOptions
  );
}

/**
 * Admin kullanıcısı için JWT token oluşturur
 * 
 * @param userId - Admin kullanıcı ID'si
 * @returns JWT token string
 */
export function generateAdminToken(userId: number): string {
  return generateTestToken(userId, 'ADMIN', '7d');
}

/**
 * Authorization header'ı oluşturur
 * 
 * @param token - JWT token
 * @returns Authorization header objesi
 */
export function getAuthHeader(token: string): { Authorization: string } {
  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * User ID ve role için authorization header oluşturur
 * 
 * @param userId - Kullanıcı ID'si
 * @param role - Kullanıcı rolü
 * @returns Authorization header objesi
 */
export function getAuthHeaderForUser(userId: number, role: string = 'USER'): { Authorization: string } {
  const token = generateTestToken(userId, role);
  return getAuthHeader(token);
}

