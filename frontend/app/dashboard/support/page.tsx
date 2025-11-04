'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ChatBubbleLeftIcon,
  PlusIcon,
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

interface SupportTicket {
  id: number
  subject: string
  description: string
  category: string
  priority: string
  status: string
  createdAt: string
  user: {
    id: number
    firstName: string
    lastName: string
    email: string
  }
}

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const response = await api.get('/api/support/tickets')
      
      if (response.data.success) {
        setTickets(response.data.data.tickets)
      }
    } catch (error) {
      console.error('Destek talepleri yüklenemedi:', error)
      toast.error('Destek talepleri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />
      case 'IN_PROGRESS':
        return <ClockIcon className="w-5 h-5 text-blue-500" />
      case 'RESOLVED':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'CLOSED':
        return <XCircleIcon className="w-5 h-5 text-gray-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-400" />
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
        return 'bg-red-100 text-red-700'
      case 'HIGH':
        return 'bg-orange-100 text-orange-700'
      case 'NORMAL':
        return 'bg-blue-100 text-blue-700'
      case 'LOW':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <ChatBubbleLeftIcon className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold">Destek Taleplerim</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/support/new"
                className="btn btn-primary flex items-center"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Yeni Talep
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : tickets.length === 0 ? (
          <FadeInUp>
            <div className="card p-12 text-center">
              <ChatBubbleLeftIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Henüz destek talebiniz yok
              </h3>
              <p className="text-gray-600 mb-4">
                Sorununuz varsa bizimle iletişime geçin.
              </p>
              <Link href="/dashboard/support/new" className="btn btn-primary">
                Yeni Talep Oluştur
              </Link>
            </div>
          </FadeInUp>
        ) : (
          <FadeInUp>
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Link href={`/dashboard/support/${ticket.id}`}>
                    <div className="card p-6 hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(ticket.status)}
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {ticket.subject}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {ticket.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(ticket.createdAt).toLocaleString('tr-TR')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                            {getPriorityText(ticket.priority)}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {getStatusText(ticket.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </FadeInUp>
        )}
      </div>
    </div>
  )
}

