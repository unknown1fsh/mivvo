// Adım göstergesi bileşeni

import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { Step } from '@/types/common'

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export const StepIndicator = ({ steps, currentStep }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
            currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
          }`}>
            {currentStep > step.id ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <span className="text-sm font-medium">{step.id}</span>
            )}
          </div>
          <div className="ml-3">
            <p className={`text-sm font-medium ${
              currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
            }`}>
              {step.name}
            </p>
            <p className="text-xs text-gray-500">{step.description}</p>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-16 h-0.5 ml-4 ${
              currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  )
}
