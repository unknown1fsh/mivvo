'use client'

import Link from 'next/link'
import { ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <DocumentTextIcon className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Rapor Bulunamadı</h1>
        <p className="text-gray-600 mb-6">
          Aradığınız expertiz raporu bulunamadı. Lütfen rapor ID'sini kontrol edin veya dashboard'dan tekrar deneyin.
        </p>
        
        <div className="space-y-3">
          <Link 
            href="/dashboard" 
            className="w-full btn btn-primary flex items-center justify-center space-x-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Dashboard'a Dön</span>
          </Link>
          
          <Link 
            href="/dashboard" 
            className="w-full btn btn-secondary flex items-center justify-center space-x-2"
          >
            <DocumentTextIcon className="w-4 h-4" />
            <span>Raporları Görüntüle</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
