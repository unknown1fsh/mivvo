// Validation yardımcı fonksiyonları

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+90|0)?[5][0-9]{9}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export const validatePlate = (plate: string): boolean => {
  const plateRegex = /^[0-9]{2}\s[A-Z]{1,3}\s[0-9]{2,4}$/
  return plateRegex.test(plate)
}

export const validateYear = (year: number): boolean => {
  const currentYear = new Date().getFullYear()
  return year >= 1900 && year <= currentYear + 1
}

export const validateMileage = (mileage: number): boolean => {
  return mileage >= 0 && mileage <= 999999
}
