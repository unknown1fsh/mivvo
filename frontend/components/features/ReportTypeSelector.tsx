// Rapor türü seçici bileşeni

import { motion } from 'framer-motion'
import { ReportType } from '@/types/report'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { StaggerContainer, StaggerItem } from '@/components/motion'

interface ReportTypeSelectorProps {
  reportTypes: ReportType[]
  onSelect: (reportType: ReportType) => void
}

export const ReportTypeSelector = ({ reportTypes, onSelect }: ReportTypeSelectorProps) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Rapor Türü Seçin</h1>
        <p className="text-gray-600">İhtiyacınıza uygun analiz türünü seçin</p>
      </div>

      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((reportType) => (
          <StaggerItem key={reportType.id}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="cursor-pointer"
              onClick={() => onSelect(reportType)}
            >
              <Card 
                variant={reportType.popular ? 'elevated' : 'default'}
                className={`relative overflow-visible ${
                  reportType.popular ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {reportType.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                      En Popüler
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <div className="text-4xl mb-4">{reportType.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{reportType.name}</h3>
                  <p className="text-gray-600 mb-4">{reportType.description}</p>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-4">
                    {reportType.price}₺
                  </div>
                  
                  <ul className="text-sm text-gray-600 space-y-1 mb-6">
                    {reportType.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center justify-center">
                        <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Button className="w-full">
                    Seç
                  </Button>
                </div>
              </Card>
            </motion.div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </div>
  )
}
