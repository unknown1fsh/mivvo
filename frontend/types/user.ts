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
