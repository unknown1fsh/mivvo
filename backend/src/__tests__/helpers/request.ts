/**
 * Request Test Helpers
 * 
 * SuperTest için request helper'ları
 */

// @ts-ignore - Test dosyası, build'den exclude edilmiş
import request from 'supertest';

/**
 * Express app instance'ını test için alır
 * Test ortamında server başlatılmaz
 */
let appInstance: any = null;

/**
 * Test için Express app instance'ını set eder
 * Bu fonksiyon test dosyalarında çağrılmalıdır
 */
export function setTestApp(app: any) {
  appInstance = app;
}

/**
 * Test için SuperTest request instance'ı döndürür
 */
export function getTestRequest() {
  if (!appInstance) {
    // Lazy import - sadece gerektiğinde yükle
    const app = require('../../index').default;
    appInstance = app;
  }
  return request(appInstance);
}

/**
 * Authenticated request helper
 * 
 * @param userId - Kullanıcı ID'si
 * @param role - Kullanıcı rolü
 * @returns SuperTest request instance with auth header
 */
export function getAuthenticatedRequest(userId: number, role: string = 'USER') {
  const { getAuthHeaderForUser } = require('./auth');
  const req = getTestRequest();
  
  // Auth header'ı set etmek için bir wrapper
  return {
    get: (url: string) => req.get(url).set(getAuthHeaderForUser(userId, role)),
    post: (url: string) => req.post(url).set(getAuthHeaderForUser(userId, role)),
    put: (url: string) => req.put(url).set(getAuthHeaderForUser(userId, role)),
    patch: (url: string) => req.patch(url).set(getAuthHeaderForUser(userId, role)),
    delete: (url: string) => req.delete(url).set(getAuthHeaderForUser(userId, role)),
  };
}

/**
 * Admin authenticated request helper
 * 
 * @param userId - Admin kullanıcı ID'si
 * @returns SuperTest request instance with admin auth header
 */
export function getAdminRequest(userId: number) {
  return getAuthenticatedRequest(userId, 'ADMIN');
}

