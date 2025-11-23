'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface DamageArea {
  x?: number
  y?: number
  genişlik?: number
  yükseklik?: number
  width?: number
  height?: number
  tür?: string
  type?: string
  şiddet?: 'minimal' | 'düşük' | 'orta' | 'yüksek' | 'kritik'
  severity?: 'low' | 'medium' | 'high' | 'critical'
  açıklama?: string
  description?: string
  güven?: number
  confidence?: number
  bölge?: string
  location?: string
}

interface DamageImageAnnotationProps {
  imageUrl: string
  damageAreas: DamageArea[]
  className?: string
}

export function DamageImageAnnotation({ 
  imageUrl, 
  damageAreas = [], 
  className = '' 
}: DamageImageAnnotationProps) {
  const [selectedDamage, setSelectedDamage] = useState<DamageArea | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })

  const getSeverityColor = (severity?: string) => {
    const sev = severity?.toLowerCase() || ''
    if (sev === 'kritik' || sev === 'critical' || sev === 'yüksek' || sev === 'high') {
      return 'border-red-500 bg-red-500/20'
    }
    if (sev === 'orta' || sev === 'medium') {
      return 'border-orange-500 bg-orange-500/20'
    }
    if (sev === 'düşük' || sev === 'low' || sev === 'minimal') {
      return 'border-yellow-500 bg-yellow-500/20'
    }
    return 'border-gray-500 bg-gray-500/20'
  }

  const getSeverityLabel = (damage: DamageArea) => {
    const sev = damage.şiddet || damage.severity || ''
    const labels: Record<string, string> = {
      'kritik': 'Kritik',
      'critical': 'Kritik',
      'yüksek': 'Yüksek',
      'high': 'Yüksek',
      'orta': 'Orta',
      'medium': 'Orta',
      'düşük': 'Düşük',
      'low': 'Düşük',
      'minimal': 'Minimal'
    }
    return labels[sev] || 'Bilinmiyor'
  }

  const getDamageTypeLabel = (damage: DamageArea) => {
    const type = damage.tür || damage.type || ''
    const labels: Record<string, string> = {
      'çizik': 'Çizik',
      'scratch': 'Çizik',
      'göçük': 'Göçük',
      'dent': 'Göçük',
      'pas': 'Paslanma',
      'rust': 'Paslanma',
      'oksidasyon': 'Oksidasyon',
      'oxidation': 'Oksidasyon',
      'çatlak': 'Çatlak',
      'crack': 'Çatlak',
      'kırılma': 'Kırılma',
      'break': 'Kırılma',
      'boya_hasarı': 'Boya Hasarı',
      'paint_damage': 'Boya Hasarı',
      'yapısal_hasar': 'Yapısal Hasar',
      'structural': 'Yapısal Hasar'
    }
    return labels[type] || type || 'Hasar'
  }

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setImageSize({ width: img.naturalWidth, height: img.naturalHeight })
    setImageLoaded(true)
  }

  // Koordinatları normalize et (0-100 arası yüzde olarak gelebilir veya piksel olarak)
  const normalizeCoordinates = (damage: DamageArea, containerWidth: number, containerHeight: number) => {
    // Eğer koordinatlar yüzde olarak geliyorsa (0-100 arası)
    const x = damage.x || 0
    const y = damage.y || 0
    const width = damage.genişlik || damage.width || 50
    const height = damage.yükseklik || damage.height || 50

    // Eğer koordinatlar 0-100 arasındaysa yüzde olarak kabul et
    const isPercentage = x <= 100 && y <= 100 && width <= 100 && height <= 100

    if (isPercentage) {
      return {
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: `${height}%`
      }
    }

    // Piksel olarak geliyorsa, container boyutuna göre normalize et
    const scaleX = containerWidth / (imageSize.width || 1)
    const scaleY = containerHeight / (imageSize.height || 1)

    return {
      left: `${x * scaleX}px`,
      top: `${y * scaleY}px`,
      width: `${width * scaleX}px`,
      height: `${height * scaleY}px`
    }
  }

  if (!imageUrl) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ minHeight: '300px' }}>
        <p className="text-gray-500">Resim yüklenemedi</p>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={imageUrl}
          alt="Araç hasar analizi"
          className="w-full h-auto"
          onLoad={handleImageLoad}
        />
        
        {/* Hasar alanları overlay */}
        {imageLoaded && damageAreas.length > 0 && (
          <div className="absolute inset-0">
            {damageAreas.map((damage, index) => {
              const coords = normalizeCoordinates(damage, 800, 600) // Varsayılan container boyutu
              const severityColor = getSeverityColor(damage.şiddet || damage.severity)
              
              return (
                <motion.div
                  key={index}
                  className={`absolute border-2 ${severityColor} cursor-pointer group`}
                  style={{
                    left: coords.left,
                    top: coords.top,
                    width: coords.width,
                    height: coords.height
                  }}
                  initial={{ opacity: 0.7 }}
                  whileHover={{ opacity: 1, scale: 1.05 }}
                  onClick={() => setSelectedDamage(selectedDamage === damage ? null : damage)}
                >
                  {/* Hasar numarası badge */}
                  <div className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  
                  {/* Hover tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                      <div className="font-semibold">{getDamageTypeLabel(damage)}</div>
                      <div className="text-gray-300">{getSeverityLabel(damage)}</div>
                      {(damage.güven || damage.confidence) && (
                        <div className="text-gray-400">Güven: %{damage.güven || damage.confidence}</div>
                      )}
                    </div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Seçili hasar detayları */}
      {selectedDamage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-start">
            <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">
                {getDamageTypeLabel(selectedDamage)} - {getSeverityLabel(selectedDamage)}
              </h4>
              {(selectedDamage.açıklama || selectedDamage.description) && (
                <p className="text-sm text-gray-700 mb-2">
                  {selectedDamage.açıklama || selectedDamage.description}
                </p>
              )}
              <div className="flex items-center space-x-4 text-xs text-gray-600">
                {(selectedDamage.güven || selectedDamage.confidence) && (
                  <span>Güven: %{selectedDamage.güven || selectedDamage.confidence}</span>
                )}
                {(selectedDamage.bölge || selectedDamage.location) && (
                  <span>Bölge: {selectedDamage.bölge || selectedDamage.location}</span>
                )}
              </div>
            </div>
            <button
              onClick={() => setSelectedDamage(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Hasar listesi */}
      {damageAreas.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Tespit Edilen Hasar Alanları ({damageAreas.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {damageAreas.map((damage, index) => {
              const severityColor = getSeverityColor(damage.şiddet || damage.severity)
              return (
                <div
                  key={index}
                  className={`p-2 rounded border-2 ${severityColor} cursor-pointer hover:shadow-md transition-shadow ${
                    selectedDamage === damage ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedDamage(selectedDamage === damage ? null : damage)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm">#{index + 1}</span>
                      <span className="text-sm font-medium">{getDamageTypeLabel(damage)}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${severityColor}`}>
                      {getSeverityLabel(damage)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

