// Araç ile ilgili tipler

export interface Vehicle {
  id: string
  plate: string
  brand: string
  model: string
  year: number
  color: string
  mileage?: number
  vin?: string
  createdAt: Date
  updatedAt: Date
}

export interface UploadedImage {
  id: string
  file: File
  preview: string
  name: string
  size: number
  status: 'uploading' | 'uploaded' | 'error'
  type?: 'exterior' | 'interior' | 'engine' | 'damage' | 'paint'
  analysis?: {
    paintCondition: string
    damageDetected: boolean
    confidence: number
  }
}
