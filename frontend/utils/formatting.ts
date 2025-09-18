// Formatting yardımcı fonksiyonları

export const formatCurrency = (amount: number, currency: string = '₺'): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('TRY', currency)
}

export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('tr-TR').format(number)
}

export const formatPercentage = (value: number): string => {
  return `${value}%`
}

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
