/**
 * Support Ticket Detail Modal Component
 * 
 * Destek talebi detaylarını gösteren ve yönetim işlemlerini yapan modal.
 */

'use client'

import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { motion } from 'framer-motion'
import {
  XMarkIcon,
  ChatBubbleLeftIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline'
import { formatDate } from '@/utils/dateUtils'
import toast from 'react-hot-toast'
import adminService from '@/services/adminService'

interface TicketMessage {
  id: number
  message: string
  isAdmin: boolean
  createdAt: string
  sender?: {
    firstName: string
    lastName: string
  }
}

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
  messages?: TicketMessage[]
}

interface SupportTicketDetailModalProps {
  ticket: SupportTicket | null
  isOpen: boolean
  onClose: () => void
  onRefresh: () => void
}

export function SupportTicketDetailModal({
  ticket,
  isOpen,
  onClose,
  onRefresh,
}: SupportTicketDetailModalProps) {
  const [ticketData, setTicketData] = useState<SupportTicket | null>(ticket)
  const [isLoading, setIsLoading] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [updatingPriority, setUpdatingPriority] = useState(false)

  useEffect(() => {
    if (isOpen && ticket) {
      setTicketData(ticket)
      fetchTicketDetails()
    }
  }, [isOpen, ticket])

  const fetchTicketDetails = async () => {
    if (!ticket) return

    try {
      setIsLoading(true)
      const response = await adminService.getSupportTicketById(ticket.id)
      if (response && response.success) {
        setTicketData(response.data.ticket)
      }
    } catch (error) {
      console.error('Destek talebi detayları yüklenemedi:', error)
      toast.error('Destek talebi detayları yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !ticketData) {
      toast.error('Mesaj boş olamaz')
      return
    }

    try {
      setSendingMessage(true)
      await adminService.addMessageToTicket(ticketData.id, newMessage)
      toast.success('Mesajınız gönderildi')
      setNewMessage('')
      await fetchTicketDetails()
      onRefresh()
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error)
      toast.error('Mesaj gönderilemedi')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!ticketData) return

    try {
      setUpdatingStatus(true)
      await adminService.updateSupportTicketStatus(ticketData.id, newStatus)
      toast.success('Durum güncellendi')
      await fetchTicketDetails()
      onRefresh()
    } catch (error) {
      console.error('Durum güncelleme hatası:', error)
      toast.error('Durum güncellenemedi')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handlePriorityUpdate = async (newPriority: string) => {
    if (!ticketData) return

    try {
      setUpdatingPriority(true)
      await adminService.updateSupportTicketPriority(ticketData.id, newPriority)
      toast.success('Öncelik güncellendi')
      await fetchTicketDetails()
      onRefresh()
    } catch (error) {
      console.error('Öncelik güncelleme hatası:', error)
      toast.error('Öncelik güncellenemedi')
    } finally {
      setUpdatingPriority(false)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-yellow-100 text-yellow-700'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700'
      case 'RESOLVED':
        return 'bg-green-100 text-green-700'
      case 'CLOSED':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
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

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'GENERAL':
        return 'Genel'
      case 'TECHNICAL':
        return 'Teknik'
      case 'BILLING':
        return 'Faturalama'
      case 'REPORT_ISSUE':
        return 'Rapor Sorunu'
      case 'FEATURE_REQUEST':
        return 'Özellik İsteği'
      default:
        return category
    }
  }

  if (!ticketData) return null

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-6">
                  <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900">
                    Destek Talebi Detayı
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Ticket Info */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Konu</h4>
                          <p className="text-lg font-semibold text-gray-900">{ticketData.subject}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Kategori</h4>
                          <p className="text-gray-900">{getCategoryText(ticketData.category)}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Kullanıcı</h4>
                          <p className="text-gray-900">
                            {ticketData.user.firstName} {ticketData.user.lastName}
                          </p>
                          <p className="text-sm text-gray-600">{ticketData.user.email}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Oluşturulma Tarihi</h4>
                          <p className="text-gray-900">{formatDate(ticketData.createdAt)}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Durum</h4>
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticketData.status)}`}>
                              {getStatusText(ticketData.status)}
                            </span>
                            <select
                              value={ticketData.status}
                              onChange={(e) => handleStatusUpdate(e.target.value)}
                              disabled={updatingStatus}
                              className="text-sm border border-gray-300 rounded-md px-2 py-1"
                            >
                              <option value="OPEN">Açık</option>
                              <option value="IN_PROGRESS">İşlemde</option>
                              <option value="RESOLVED">Çözüldü</option>
                              <option value="CLOSED">Kapalı</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Öncelik</h4>
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(ticketData.priority)}`}>
                              {getPriorityText(ticketData.priority)}
                            </span>
                            <select
                              value={ticketData.priority}
                              onChange={(e) => handlePriorityUpdate(e.target.value)}
                              disabled={updatingPriority}
                              className="text-sm border border-gray-300 rounded-md px-2 py-1"
                            >
                              <option value="LOW">Düşük</option>
                              <option value="NORMAL">Normal</option>
                              <option value="HIGH">Yüksek</option>
                              <option value="URGENT">Acil</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Açıklama</h4>
                        <p className="text-gray-900 whitespace-pre-wrap">{ticketData.description}</p>
                      </div>
                    </div>

                    {/* Messages */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <ChatBubbleLeftIcon className="w-5 h-5 mr-2" />
                        Mesajlar
                      </h4>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {ticketData.messages && ticketData.messages.length > 0 ? (
                          ticketData.messages.map((message) => (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`p-4 rounded-lg ${
                                message.isAdmin
                                  ? 'bg-blue-50 border border-blue-200 ml-8'
                                  : 'bg-gray-50 border border-gray-200 mr-8'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {message.isAdmin ? 'Admin' : `${ticketData.user.firstName} ${ticketData.user.lastName}`}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(message.createdAt)}
                                </span>
                              </div>
                              <p className="text-gray-900 whitespace-pre-wrap">{message.message}</p>
                            </motion.div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-8">Henüz mesaj yok</p>
                        )}
                      </div>
                    </div>

                    {/* Reply Form */}
                    <form onSubmit={handleSendMessage} className="border-t pt-4">
                      <div className="flex space-x-2">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Mesajınızı yazın..."
                          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                        />
                        <button
                          type="submit"
                          disabled={sendingMessage || !newMessage.trim()}
                          className="btn btn-primary self-end disabled:opacity-50"
                        >
                          <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

