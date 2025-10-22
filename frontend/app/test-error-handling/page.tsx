'use client'

import { useState } from 'react'
import { ReportError } from '@/components/ui/ReportError'
import { ReportLoading } from '@/components/ui/ReportLoading'

export default function TestErrorHandlingPage() {
  const [showError, setShowError] = useState(false)
  const [showLoading, setShowLoading] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Error Handling Test Page
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Error Components</h2>
            <div className="space-y-3">
              <button
                onClick={() => setShowError(!showError)}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                {showError ? 'Hide' : 'Show'} Error Component
              </button>
              <button
                onClick={() => setShowLoading(!showLoading)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {showLoading ? 'Hide' : 'Show'} Loading Component
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Report Types</h2>
            <div className="space-y-3">
              <a
                href="/reports/999?type=damage"
                className="block w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-center"
              >
                Test Damage Report (404)
              </a>
              <a
                href="/reports/999?type=paint"
                className="block w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-center"
              >
                Test Paint Report (404)
              </a>
              <a
                href="/reports/999?type=engine"
                className="block w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-center"
              >
                Test Engine Report (404)
              </a>
            </div>
          </div>
        </div>

        {showError && (
          <div className="mb-6">
            <ReportError
              type="not_found"
              message="Test error message - Rapor bulunamadı"
              onRetry={() => console.log('Retry clicked')}
              showDashboardLink={true}
            />
          </div>
        )}

        {showLoading && (
          <div className="mb-6">
            <ReportLoading
              type="damage"
              progress={75}
              estimatedTime="2-3 dakika"
            />
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <p>✅ Error components should display without crashing</p>
            <p>✅ Loading components should display without crashing</p>
            <p>✅ 404 errors should stop polling and show error message</p>
            <p>✅ No infinite loops should occur</p>
          </div>
        </div>
      </div>
    </div>
  )
}
