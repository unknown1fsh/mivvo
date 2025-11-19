'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ChatBubbleLeftIcon,
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
  SparklesIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import { FadeInUp } from '@/components/motion'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'

export default function NewSupportTicketPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [screenshots, setScreenshots] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'GENERAL',
    priority: 'NORMAL',
    reportId: '',
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length + screenshots.length > 5) {
      toast.error('En fazla 5 ekran görüntüsü ekleyebilirsiniz')
      return
    }

    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length !== files.length) {
      toast.error('Sadece resim dosyaları seçebilirsiniz')
    }

    const newScreenshots = [...screenshots, ...imageFiles]
    setScreenshots(newScreenshots)

    // Preview oluştur
    imageFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviews(prev => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.subject || !formData.description) {
      toast.error('Konu ve açıklama zorunludur')
      return
    }

    try {
      setLoading(true)
      setUploading(true)
      
      const submitFormData = new FormData()
      submitFormData.append('subject', formData.subject)
      submitFormData.append('description', formData.description)
      submitFormData.append('category', formData.category)
      submitFormData.append('priority', formData.priority)
      if (formData.reportId) {
        submitFormData.append('reportId', formData.reportId)
      }

      // Ekran görüntülerini ekle
      screenshots.forEach((file, index) => {
        submitFormData.append('screenshots', file)
      })

      const response = await api.post('/api/support/tickets', submitFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        toast.success('🎉 Destek talebiniz oluşturuldu! En kısa sürede yanıtlayacağız.')
        router.push(`/dashboard/support/${response.data.data.ticket.id}`)
      }
    } catch (error: any) {
      console.error('Destek talebi oluşturma hatası:', error)
      const errorMessage = error.response?.data?.message || 'Destek talebi oluşturulurken hata oluştu'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/support" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <ChatBubbleLeftIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Yeni Destek Talebi</h1>
              <p className="text-blue-100 mt-1 flex items-center space-x-2 text-sm">
                <BoltIcon className="w-4 h-4" />
                <span>Sorununuzu detaylı açıklayın, hızlıca çözelim!</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FadeInUp>
          <div className="card p-8 bg-white rounded-2xl shadow-xl border border-gray-200">
            {/* Info Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <SparklesIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">💡 İpuçları</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Sorununuzu mümkün olduğunca detaylı açıklayın</li>
                    <li>• Ekran görüntüsü eklemek sorunun çözümünü hızlandırır</li>
                    <li>• Destek ekibimiz genellikle 2 saat içinde yanıt verir</li>
                  </ul>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Konu */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Konu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Örn: Ödeme işleminde sorun yaşıyorum"
                  required
                />
              </div>

              {/* Kategori ve Öncelik */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="GENERAL">Genel</option>
                    <option value="TECHNICAL">Teknik Sorun</option>
                    <option value="BILLING">Faturalama</option>
                    <option value="REPORT_ISSUE">Rapor Sorunu</option>
                    <option value="FEATURE_REQUEST">Özellik İsteği</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Öncelik <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rapor ID <span className="text-gray-400 text-xs">(Opsiyonel)</span>
                </label>
                <input
                  type="number"
                  value={formData.reportId}
                  onChange={(e) => setFormData({ ...formData, reportId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="İlgili rapor ID'si (varsa)"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Sorun bir analiz raporuyla ilgiliyse rapor ID'sini girin
                </p>
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Detaylı Açıklama <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  placeholder="Sorununuzu detaylı olarak açıklayın. Ne oldu, ne bekliyordunuz, ne gördünüz?"
                  required
                />
              </div>

              {/* Ekran Görüntüleri */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ekran Görüntüleri <span className="text-gray-400 text-xs">(Opsiyonel, max 5)</span>
                </label>
                <div className="space-y-4">
                  {/* File Input */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                  >
                    <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-1">
                      Ekran görüntüsü eklemek için tıklayın
                    </p>
                    <p className="text-xs text-gray-500">
                      JPG, PNG veya WebP formatında, maksimum 5MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Preview Grid */}
                  {previews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {previews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                            <Image
                              src={preview}
                              alt={`Screenshot ${index + 1}`}
                              width={200}
                              height={200}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeScreenshot(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {screenshots[index]?.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Butonlar */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <Link
                  href="/dashboard/support"
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  İptal
                </Link>
                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Yükleniyor...</span>
                    </>
                  ) : loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Gönderiliyor...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-5 h-5" />
                      <span>Gönder</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </FadeInUp>
      </div>
    </div>
  )
}
