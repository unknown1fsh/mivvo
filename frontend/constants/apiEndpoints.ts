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
  ENGINE_SOUND_ANALYSIS: {
    ANALYZE: '/api/engine-sound-analysis/analyze',
    HISTORY: '/api/engine-sound-analysis/history',
    REPORT: '/api/engine-sound-analysis/:reportId',
    DOWNLOAD: '/api/engine-sound-analysis/:reportId/download',
    STATUS: '/api/engine-sound-analysis/:reportId/status'
  },
  VEHICLE_GARAGE: {
    LIST: '/api/vehicle-garage',
    GET: '/api/vehicle-garage/:id',
    CREATE: '/api/vehicle-garage',
    UPDATE: '/api/vehicle-garage/:id',
    DELETE: '/api/vehicle-garage/:id',
    UPLOAD_IMAGES: '/api/vehicle-garage/:vehicleId/images',
    DELETE_IMAGE: '/api/vehicle-garage/:vehicleId/images/:imageId',
    SET_DEFAULT: '/api/vehicle-garage/:id/set-default',
    REPORTS: '/api/vehicle-garage/:id/reports'
  },
  VIN: {
    LOOKUP: '/api/vin/lookup'
  }
}
