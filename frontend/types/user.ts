// Kullanıcı ile ilgili tipler

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  credits: number
  createdAt: Date
  updatedAt: Date
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  phone?: string
}

export interface UserSettings {
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends'
    showEmail: boolean
    showPhone: boolean
  }
  preferences: {
    language: string
    timezone: string
    currency: string
  }
}

export interface UserProfile {
  id: string
  email: string
  name: string
  phone?: string
  address?: string
  avatar?: string
  preferences: {
    notifications: boolean
    emailUpdates: boolean
    smsUpdates: boolean
  }
}
