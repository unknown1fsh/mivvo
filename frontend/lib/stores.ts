import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: 'user' | 'admin'
  isEmailVerified: boolean
  createdAt: string
}

interface UserCredits {
  balance: number
  totalPurchased: number
  totalUsed: number
}

interface AuthState {
  user: User | null
  credits: UserCredits | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthActions {
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  updateCredits: (credits: UserCredits) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      credits: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      login: (token: string, user: User) => {
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        })
      },

      logout: () => {
        set({
          user: null,
          credits: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          })
        }
      },

      updateCredits: (credits: UserCredits) => {
        set({ credits })
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        credits: state.credits,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Vehicle Report Store
interface VehicleReport {
  id: string
  vehiclePlate: string
  vehicleBrand: string
  vehicleModel: string
  reportType: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
  totalCost: number
  images?: string[]
  results?: any
}

interface VehicleState {
  reports: VehicleReport[]
  currentReport: VehicleReport | null
  isLoading: boolean
}

interface VehicleActions {
  setReports: (reports: VehicleReport[]) => void
  addReport: (report: VehicleReport) => void
  updateReport: (id: string, report: Partial<VehicleReport>) => void
  setCurrentReport: (report: VehicleReport | null) => void
  setLoading: (loading: boolean) => void
}

export const useVehicleStore = create<VehicleState & VehicleActions>((set) => ({
  // State
  reports: [],
  currentReport: null,
  isLoading: false,

  // Actions
  setReports: (reports: VehicleReport[]) => {
    set({ reports })
  },

  addReport: (report: VehicleReport) => {
    set((state) => ({
      reports: [report, ...state.reports],
    }))
  },

  updateReport: (id: string, reportData: Partial<VehicleReport>) => {
    set((state) => ({
      reports: state.reports.map((report) =>
        report.id === id ? { ...report, ...reportData } : report
      ),
    }))
  },

  setCurrentReport: (report: VehicleReport | null) => {
    set({ currentReport: report })
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },
}))

// UI Store
interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  notifications: Notification[]
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

interface UIActions {
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useUIStore = create<UIState & UIActions>()(
  persist(
    (set, get) => ({
      // State
      sidebarOpen: false,
      theme: 'light',
      notifications: [],

      // Actions
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }))
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open })
      },

      setTheme: (theme: 'light' | 'dark') => {
        set({ theme })
      },

      addNotification: (notification: Omit<Notification, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9)
        const newNotification = { ...notification, id }
        
        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }))

        // Auto remove after duration
        if (notification.duration !== 0) {
          setTimeout(() => {
            get().removeNotification(id)
          }, notification.duration || 5000)
        }
      },

      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      },

      clearNotifications: () => {
        set({ notifications: [] })
      },
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        theme: state.theme,
      }),
    }
  )
)

// Admin Store
interface AdminState {
  users: any[]
  reports: any[]
  payments: any[]
  stats: any
  isLoading: boolean
}

interface AdminActions {
  setUsers: (users: any[]) => void
  setReports: (reports: any[]) => void
  setPayments: (payments: any[]) => void
  setStats: (stats: any) => void
  setLoading: (loading: boolean) => void
}

export const useAdminStore = create<AdminState & AdminActions>((set) => ({
  // State
  users: [],
  reports: [],
  payments: [],
  stats: null,
  isLoading: false,

  // Actions
  setUsers: (users: any[]) => {
    set({ users })
  },

  setReports: (reports: any[]) => {
    set({ reports })
  },

  setPayments: (payments: any[]) => {
    set({ payments })
  },

  setStats: (stats: any) => {
    set({ stats })
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },
}))
