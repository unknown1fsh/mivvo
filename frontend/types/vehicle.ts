// Araç ile ilgili tipler

export interface VehicleInfo {
  make: string
  model: string
  year: number | string
  vin: string
  plate: string
}

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

export interface VehicleGarage {
  id: number
  userId: number
  plate: string
  brand: string
  model: string
  year: number
  color?: string
  mileage?: number
  vin?: string
  fuelType?: string
  transmission?: string
  engineSize?: string
  bodyType?: string
  doors?: number
  seats?: number
  notes?: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
  vehicleImages: VehicleGarageImage[]
  _count?: {
    reports: number
  }
}

export interface VehicleGarageImage {
  id: number
  vehicleGarageId: number
  imagePath: string
  imageName: string
  imageType: 'EXTERIOR' | 'INTERIOR' | 'ENGINE' | 'DAMAGE' | 'PAINT'
  fileSize?: number
  uploadDate: string
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

export interface UploadedAudio {
  id: string
  file: File
  duration: number
  name: string
  size: number
  status: 'uploading' | 'uploaded' | 'error'
  type: 'engine_sound' | 'exhaust_sound' | 'mechanical_sound'
  analysis?: {
    engineHealth: string
    issuesDetected: string[]
    confidence: number
  }
}

export interface PaintAnalysisResult {
  id: string
  vehicleInfo: VehicleInfo
  overallScore: number
  paintCondition: string
  colorMatching: number
  paintThickness: number
  scratchCount: number
  dentCount: number
  rustDetected: boolean
  oxidationLevel: number
  glossLevel: number
  recommendations: string[]
  createdAt: Date
}

export interface EngineSoundAnalysisResult {
  id: string
  vehicleInfo: VehicleInfo
  overallScore: number
  engineHealth: string
  rpmAnalysis: {
    idleRpm: number
    maxRpm: number
    rpmStability: number
  }
  frequencyAnalysis: {
    dominantFrequencies: number[]
    harmonicDistortion: number
    noiseLevel: number
  }
  detectedIssues: {
    issue: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    confidence: number
    description: string
    recommendation: string
  }[]
  performanceMetrics: {
    engineEfficiency: number
    vibrationLevel: number
    acousticQuality: number
  }
  recommendations: string[]
  createdAt: Date
}

export interface VINLookupResult {
  vin: string
  make: string
  model: string
  year: number
  engine: string
  fuelType: string
  transmission: string
  driveType: string
  bodyStyle: string
  doors: number
  cylinders: number
  displacement: string
  manufacturer: string
  plantCountry: string
  plantCity: string
  plantState: string
  plantCompanyName: string
  errorCode?: string
  errorText?: string
  cached?: boolean
}
