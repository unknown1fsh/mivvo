'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ChatBubbleLeftIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { FadeInUp } from '@/components/motion'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function NewSupportTicketPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'GENERAL',
    priority: 'NORMAL',
    reportId: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.subject || !formData.description) {
      toast.error('Konu ve açıklama zorunludur')
      return
    }

    try {
      setLoading(true)
      
      const response = await api.post('/api/support/tickets', {
        subject: formData.subject,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        reportId: formData.reportId || undefined,
      })

      if (response.data.success) {
        toast.success('Destek talebiniz oluşturuldu')
        router.push(`/dashboard/support/${response.data.data.ticket.id}`)
      }
    } catch (error) {
      console.error('Ticket oluşturma hatası:', error)
      toast.error('Ticket oluşturulurken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/support" className="flex items-center space-x-2">
                <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
                <ChatBubbleLeftIcon className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold">Yeni Destek Talebi</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FadeInUp>
          <div className="card p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Konu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konu *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Sorununuzun kısa özeti"
                  required
                />
              </div>

              {/* Kategori */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="GENERAL">Genel</option>
                    <option value="TECHNICAL">Teknik Sorun</option>
                    <option value="BILLING">Faturalama</option>
                    <option value="REPORT_ISSUE">Rapor Sorunu</option>
                    <option value="FEATURE_REQUEST">Özellik İsteği</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Öncelik *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="LOW">Düşük</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">Yüksek</option>
                    <option value="URGENT">Acil</option>
                  </select>
                </div>
              </div>

              {/* Rapor ID (Opsiyonel) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rapor ID (Opsiyonel)
                </label>
                <input
                  type="number"
                  value={formData.reportId}
                  onChange={(e) => setFormData({ ...formData, reportId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="İlgili rapor ID'si (varsa)"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Sorun bir analiz raporuyla ilgiliyse rapor ID'sini girin
                </p>
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detaylı Açıklama *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Sorununuzu detaylı olarak açıklayın..."
                  required
                />
              </div>

              {/* Butonlar */}
              <div className="flex items-center justify-end space-x-4">
                <Link
                  href="/dashboard/support"
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  İptal
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary px-6 py-2"
                >
                  {loading ? 'Gönderiliyor...' : 'Gönder'}
                </button>
              </div>
            </form>
          </div>
        </FadeInUp>
      </div>
    </div>
  )
}

