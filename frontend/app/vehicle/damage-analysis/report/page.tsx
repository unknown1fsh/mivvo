'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function DamageAnalysisReportRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const reportId = searchParams.get('reportId')
    
    if (reportId) {
      // Yeni birleşik rapor sayfasına yönlendir
      router.replace(`/reports/${reportId}?type=damage`)
    } else {
      // ReportId yoksa dashboard'a yönlendir
      router.replace('/dashboard')
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Yönlendiriliyor...</h3>
        <p className="text-gray-500">Rapor sayfasına yönlendiriliyorsunuz.</p>
      </div>
    </div>
  )
}