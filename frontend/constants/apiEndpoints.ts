// API endpoints sabitleri

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh'
  },
  USER: {
    PROFILE: '/api/user/profile',
    CREDITS: '/api/user/credits',
    NOTIFICATIONS: '/api/user/notifications'
  },
  VEHICLE: {
    CREATE: '/api/vehicle',
    LIST: '/api/vehicle',
    DETAIL: '/api/vehicle/:id',
    UPDATE: '/api/vehicle/:id'
  },
  REPORT: {
    CREATE: '/api/report',
    LIST: '/api/report',
    DETAIL: '/api/report/:id',
    PDF: '/api/report/:id/pdf'
  },
  PAINT_ANALYSIS: {
    ANALYZE: '/api/paint-analysis/analyze',
    HISTORY: '/api/paint-analysis/history/:vehicleId',
    REPORT: '/api/paint-analysis/report/:analysisId'
  },
  VIN: {
    LOOKUP: '/api/vin/lookup'
  }
}
