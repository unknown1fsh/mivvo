/**
 * Admin Types
 * 
 * Admin paneli için TypeScript type tanımlamaları.
 */

// ===== USER TYPES =====

export interface AdminUser {
  id: number
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: 'USER' | 'ADMIN' | 'EXPERT'
  isActive: boolean
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  userCredits?: {
    balance: number
    totalPurchased: number
    totalUsed: number
  }
}

export interface AdminUserDetail extends AdminUser {
  creditTransactions: CreditTransaction[]
  vehicleReports: VehicleReport[]
  payments: Payment[]
}

// ===== CREDIT TYPES =====

export interface CreditTransaction {
  id: number
  userId: number
  transactionType: 'PURCHASE' | 'USAGE' | 'REFUND'
  amount: number
  description?: string
  referenceId?: string
  createdAt: string
}

// ===== REPORT TYPES =====

export interface VehicleReport {
  id: number
  userId: number
  vehiclePlate?: string
  vehicleBrand?: string
  vehicleModel?: string
  vehicleYear?: number
  reportType: 'FULL_REPORT' | 'PAINT_ANALYSIS' | 'DAMAGE_ANALYSIS' | 'VALUE_ESTIMATION' | 'ENGINE_SOUND_ANALYSIS' | 'COMPREHENSIVE_EXPERTISE'
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  totalCost: number
  createdAt: string
  updatedAt: string
  user?: {
    id: number
    email: string
    firstName: string
    lastName: string
  }
}

// ===== PAYMENT TYPES =====

export interface Payment {
  id: number
  userId: number
  amount: number
  currency: string
  paymentMethod: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET'
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  transactionId?: string
  createdAt: string
  updatedAt: string
}

// ===== STATS TYPES =====

export interface AdminStats {
  users: {
    total: number
    active: number
    inactive: number
  }
  reports: {
    total: number
    completed: number
    pending: number
  }
  revenue: {
    total: number
  }
  credits: {
    totalInCirculation: number
  }
}

export interface DetailedStats {
  users: {
    total: number
    active: number
    inactive: number
    newToday: number
    newThisMonth: number
  }
  reports: {
    total: number
    today: number
    thisMonth: number
    completed: number
    pending: number
    failed: number
    processing: number
  }
  revenue: {
    total: number
    thisMonth: number
  }
  credits: {
    totalBalance: number
    totalPurchased: number
    totalUsed: number
  }
}

export interface TimelineData {
  date: string
  reports: number
  users: number
  revenue: number
}

export interface ReportBreakdown {
  type: string
  count: number
  totalRevenue: number
}

// ===== PAGINATION TYPES =====

export interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

// ===== API RESPONSE TYPES =====

export interface AdminUsersResponse {
  success: boolean
  data: {
    users: AdminUser[]
    pagination: PaginationData
  }
}

export interface AdminUserDetailResponse {
  success: boolean
  data: {
    user: AdminUserDetail
  }
}

export interface AdminReportsResponse {
  success: boolean
  data: {
    reports: VehicleReport[]
    pagination: PaginationData
  }
}

export interface AdminStatsResponse {
  success: boolean
  data: AdminStats
}

export interface DetailedStatsResponse {
  success: boolean
  data: DetailedStats
}

export interface TimelineStatsResponse {
  success: boolean
  data: {
    timeline: TimelineData[]
  }
}

export interface ReportsBreakdownResponse {
  success: boolean
  data: {
    breakdown: ReportBreakdown[]
  }
}

// ===== ACTION TYPES =====

export interface AddCreditsPayload {
  amount: number
  description?: string
}

export interface ResetCreditsPayload {
  reason?: string
}

export interface RefundCreditsPayload {
  amount: number
  reason?: string
}

export interface SuspendUserPayload {
  reason?: string
}

export interface HardDeleteUserPayload {
  confirm: boolean
}

export interface UpdateUserPayload {
  firstName?: string
  lastName?: string
  role?: 'USER' | 'ADMIN' | 'EXPERT'
  isActive?: boolean
  emailVerified?: boolean
}

