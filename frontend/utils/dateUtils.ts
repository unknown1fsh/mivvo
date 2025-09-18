// Tarih yardımcı fonksiyonları

export const formatDate = (date: Date | string, locale: string = 'tr-TR'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString(locale)
}

export const formatDateTime = (date: Date | string, locale: string = 'tr-TR'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleString(locale)
}

export const getRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Az önce'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dakika önce`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat önce`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} gün önce`
  
  return formatDate(dateObj)
}

export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  return dateObj.toDateString() === today.toDateString()
}
