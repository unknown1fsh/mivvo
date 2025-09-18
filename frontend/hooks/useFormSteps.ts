// Form adımları custom hook'u

import { useState, useCallback } from 'react'
import { Step } from '@/types/common'

export const useFormSteps = (steps: Step[]) => {
  const [currentStep, setCurrentStep] = useState(1)

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length))
  }, [steps.length])

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }, [])

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(1, Math.min(step, steps.length)))
  }, [steps.length])

  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === steps.length
  const progress = (currentStep / steps.length) * 100

  return {
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    isFirstStep,
    isLastStep,
    progress
  }
}
