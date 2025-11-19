'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ChatBubbleLeftIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PhotoIcon,
  XMarkIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import { FadeInUp } from '@/components/motion'
import { LoadingSpinner } from '@/components/ui'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'

interface TicketMessage {
  id: number
  message: string
  isAdmin: boolean
  createdAt: string
  attachments?: string
}

interface SupportTicket {
  id: number
  subject: string
  description: string
  category: string
  priority: string
  status: string
  createdAt: string
  attachments?: string
  messages: TicketMessage[]
}

export default function SupportTicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [screenshots, setScreenshots] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const ticketId = params?.id as string

  useEffect(() => {
    fetchTicket()
  }, [ticketId])

  const fetchTicket = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/api/support/tickets/${ticketId}`)
      
      if (response.data.success) {
        setTicket(response.data.data.ticket)
      }
    } catch (error) {
      console.error('Destek talebi yüklenemedi:', error)
      toast.error('Destek talebi yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim() && screenshots.length === 0) {
      toast.error('Mesaj veya ekran görüntüsü eklemelisiniz')
      return
    }

    try {
      setSendingMessage(true)
      setUploading(true)
      
      const formData = new FormData()
      formData.append('message', newMessage || 'Ekran görüntüsü eklendi')

      // Ekran görüntülerini ekle
      screenshots.forEach((file) => {
        formData.append('screenshots', file)
      })

      const response = await api.post(`/api/support/tickets/${ticketId}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        toast.success('✅ Mesajınız gönderildi!')
        setNewMessage('')
        setScreenshots([])
        setPreviews([])
        fetchTicket() // Destek talebini yenile
      }
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error)
      toast.error('Mesaj gönderilemedi')
    } finally {
      setSendingMessage(false)
      setUploading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <ExclamationCircleIcon className="w-6 h-6 text-yellow-500" />
      case 'IN_PROGRESS':
        return <ClockIcon className="w-6 h-6 text-blue-500" />
      case 'RESOLVED':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />
      case 'CLOSED':
        return <XCircleIcon className="w-6 h-6 text-gray-500" />
      default:
        return <ClockIcon className="w-6 h-6 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'Açık'
      case 'IN_PROGRESS':
        return 'İşlemde'
      case 'RESOLVED':
        return 'Çözüldü'
      case 'CLOSED':
        return 'Kapalı'
      default:
        return status
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'Acil'
      case 'HIGH':
        return 'Yüksek'
      case 'NORMAL':
        return 'Normal'
      case 'LOW':
        return 'Düşük'
      default:
        return priority
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'HIGH':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'NORMAL':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'LOW':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const parseAttachments = (attachments?: string): string[] => {
    if (!attachments) return []
    try {
      return JSON.parse(attachments)
    } catch {
      return []
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Destek talebi bulunamadı</h2>
          <Link href="/dashboard/support" className="btn btn-primary">
            Geri Dön
          </Link>
        </div>
      </div>
    )
  }

  const ticketAttachments = parseAttachments(ticket.attachments)
  const isResolved = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Çözümlenmiş Ticket Bildirimi */}
      {isResolved && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center space-x-3">
              <CheckCircleIcon className="w-6 h-6" />
              <div className="text-center">
                <p className="font-bold text-lg">🎉 Talep Çözüme Kavuştu!</p>
                <p className="text-sm text-green-50">
                  Bu talep çözüldü ve arşive taşındı. Detayları aşağıda görebilirsiniz.
                </p>
              </div>
              <Link
                href="/dashboard/support?tab=resolved"
                className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-all text-sm"
              >
                Arşive Git →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={`text-white shadow-lg ${isResolved ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/support" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <ArrowLeftIcon className="w-6 h-6" />
              </Link>
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <ChatBubbleLeftIcon className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{ticket.subject}</h1>
                <p className="text-blue-100 mt-1 flex items-center space-x-2 text-sm">
                  <BoltIcon className="w-4 h-4" />
                  <span>Destek ekibimiz size yardımcı olmak için burada!</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {getStatusIcon(ticket.status)}
              <span className="text-sm font-medium">
                {getStatusText(ticket.status)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Ticket Detayı - Sadece Görüntüleme */}
        <FadeInUp>
          <div className="card p-6 mb-6 bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  {ticket.subject}
                </h2>
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(ticket.priority)}`}>
                    {getPriorityText(ticket.priority)}
                  </div>
                  <div className="text-sm text-gray-500">
                    📅 {new Date(ticket.createdAt).toLocaleString('tr-TR')}
                  </div>
                </div>
              </div>
              
              {/* Read-only badge */}
              <div className="inline-flex items-center space-x-2 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                <span>📋</span>
                <span>Sadece görüntüleme - Bu bilgiler değiştirilemez</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-500 mb-1 block">Açıklama:</label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                </div>
              </div>
              
              {/* Ticket Attachments */}
              {ticketAttachments.length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-gray-500 mb-2 block">Ekran Görüntüleri:</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {ticketAttachments.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors group"
                      >
                        <Image
                          src={url}
                          alt={`Screenshot ${index + 1}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </FadeInUp>

        {/* Mesajlar - Destek Ekibi Cevapları */}
        <FadeInUp delay={0.1}>
          <div className="card p-6 mb-6 bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">💬 Mesajlaşma</h3>
              {ticket.messages.filter(m => m.isAdmin).length > 0 && (
                <span className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full border border-green-200">
                  ✓ {ticket.messages.filter(m => m.isAdmin).length} Destek Ekibi Cevabı
                </span>
              )}
            </div>
            
            {ticket.messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ChatBubbleLeftIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="font-medium">Henüz mesaj yok</p>
                <p className="text-sm mt-1">İlk mesajınızı göndererek başlayın!</p>
                <p className="text-xs mt-2 text-gray-400">
                  Destek ekibimiz mesajınızı aldıktan sonra burada cevap verecek
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {ticket.messages.map((message, index) => {
                  const messageAttachments = parseAttachments(message.attachments)
                  const isAdmin = message.isAdmin
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, x: isAdmin ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-5 rounded-xl ${
                        isAdmin
                          ? 'bg-gradient-to-br from-blue-50 via-blue-100 to-purple-50 border-2 border-blue-300 shadow-md'
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          {isAdmin ? (
                            <>
                              <div className="bg-blue-600 text-white rounded-full p-2">
                                <ChatBubbleLeftIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-bold text-blue-700">👨‍💼 Destek Ekibi</span>
                                <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
                                  RESMİ CEVAP
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="bg-gray-400 text-white rounded-full p-2">
                                <ChatBubbleLeftIcon className="w-4 h-4" />
                              </div>
                              <span className="font-semibold text-gray-700">👤 Sizin Mesajınız</span>
                            </>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleString('tr-TR')}
                        </span>
                      </div>
                      
                      <div className={`rounded-lg p-3 ${isAdmin ? 'bg-white/80' : 'bg-white'}`}>
                        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                          {message.message}
                        </p>
                      </div>
                      
                      {/* Message Attachments */}
                      {messageAttachments.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 mb-2">Ekran Görüntüleri:</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {messageAttachments.map((url, index) => (
                              <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors group"
                              >
                                <Image
                                  src={url}
                                  alt={`Screenshot ${index + 1}`}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </FadeInUp>

        {/* Çözümlenmiş Ticket Bilgisi */}
        {isResolved && (
          <FadeInUp delay={0.3}>
            <div className="card p-6 mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="bg-green-500 text-white rounded-full p-3">
                  <CheckCircleIcon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-green-800 text-lg mb-2">
                    ✅ Talep Başarıyla Çözüldü
                  </h3>
                  <p className="text-green-700 mb-3">
                    Bu destek talebi çözüme kavuştu ve arşive taşındı. 
                    Gelecekte referans olarak buradan görüntüleyebilirsiniz.
                  </p>
                  <div className="flex items-center space-x-4">
                    <Link
                      href="/dashboard/support?tab=resolved"
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all text-sm"
                    >
                      📁 Tüm Çözümlenen Talepleri Görüntüle
                    </Link>
                    <Link
                      href="/dashboard/support"
                      className="bg-white text-green-600 border border-green-300 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-all text-sm"
                    >
                      ← Destek Merkezi
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </FadeInUp>
        )}

        {/* Yeni Mesaj Formu - Sadece Mesaj Ekleme (Sadece açık/işlemde ticket'lar için) */}
        {!isResolved && (
          <FadeInUp delay={0.2}>
            <div className="card p-6 bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Yeni Mesaj Gönder</h3>
                <p className="text-sm text-gray-500">
                  Destek ekibine mesaj gönderebilir veya ekran görüntüsü ekleyebilirsiniz
                </p>
              </div>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  placeholder="Mesajınızı yazın..."
                />
                
                {/* Screenshot Upload */}
                <div>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                  >
                    <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Ekran görüntüsü ekle (Opsiyonel)
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
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      {previews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                            <Image
                              src={preview}
                              alt={`Screenshot ${index + 1}`}
                              width={150}
                              height={150}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeScreenshot(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={sendingMessage || uploading || (!newMessage.trim() && screenshots.length === 0)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Yükleniyor...</span>
                    </>
                  ) : sendingMessage ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Gönderiliyor...</span>
                    </>
                  ) : (
                    <>
                      <ChatBubbleLeftIcon className="w-5 h-5" />
                      <span>Gönder</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </FadeInUp>
        )}
      </div>
    </div>
  )
}
