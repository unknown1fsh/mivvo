'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ChatBubbleLeftIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { FadeInUp } from '@/components/motion'
import { LoadingSpinner } from '@/components/ui'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface TicketMessage {
  id: number
  message: string
  isAdmin: boolean
  createdAt: string
}

interface SupportTicket {
  id: number
  subject: string
  description: string
  category: string
  priority: string
  status: string
  createdAt: string
  messages: TicketMessage[]
}

export default function SupportTicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [newMessage, setNewMessage] = useState('')

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
      console.error('Ticket yüklenemedi:', error)
      toast.error('Ticket yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim()) {
      toast.error('Mesaj boş olamaz')
      return
    }

    try {
      setSendingMessage(true)
      
      const response = await api.post(`/api/support/tickets/${ticketId}/messages`, {
        message: newMessage,
      })

      if (response.data.success) {
        toast.success('Mesajınız gönderildi')
        setNewMessage('')
        fetchTicket() // Refresh ticket
      }
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error)
      toast.error('Mesaj gönderilemedi')
    } finally {
      setSendingMessage(false)
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket bulunamadı</h2>
          <Link href="/dashboard/support" className="btn btn-primary">
            Geri Dön
          </Link>
        </div>
      </div>
    )
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
                <span className="text-xl font-bold">{ticket.subject}</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {getStatusIcon(ticket.status)}
              <span className="text-sm font-medium text-gray-700">
                {getStatusText(ticket.status)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Ticket Detayı */}
        <FadeInUp>
          <div className="card p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {ticket.subject}
                </h2>
                <p className="text-gray-600">{ticket.description}</p>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-2">
                  {new Date(ticket.createdAt).toLocaleString('tr-TR')}
                </div>
                <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {ticket.priority}
                </div>
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* Mesajlar */}
        <FadeInUp delay={0.1}>
          <div className="card p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mesajlar</h3>
            
            {ticket.messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Henüz mesaj yok
              </div>
            ) : (
              <div className="space-y-4">
                {ticket.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg ${
                      message.isAdmin
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-900">
                        {message.isAdmin ? '👨‍💼 Destek Ekibi' : '👤 Siz'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleString('tr-TR')}
                      </span>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {message.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FadeInUp>

        {/* Yeni Mesaj Formu */}
        {ticket.status !== 'CLOSED' && (
          <FadeInUp delay={0.2}>
            <div className="card p-6">
              <form onSubmit={handleSendMessage}>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                  placeholder="Mesajınızı yazın..."
                />
                <button
                  type="submit"
                  disabled={sendingMessage}
                  className="btn btn-primary w-full"
                >
                  {sendingMessage ? 'Gönderiliyor...' : 'Gönder'}
                </button>
              </form>
            </div>
          </FadeInUp>
        )}
      </div>
    </div>
  )
}

