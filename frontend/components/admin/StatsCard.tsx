/**
 * Stats Card Component
 * 
 * Animasyonlu istatistik kartları.
 */

'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface StatsCardProps {
  title: string
  value: number | string
  change?: number
  changeLabel?: string
  icon: React.ComponentType<{ className?: string }>
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'indigo'
  format?: 'number' | 'currency' | 'percentage'
  delay?: number
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-100',
    icon: 'text-blue-600',
    text: 'text-blue-600',
  },
  green: {
    bg: 'bg-green-100',
    icon: 'text-green-600',
    text: 'text-green-600',
  },
  purple: {
    bg: 'bg-purple-100',
    icon: 'text-purple-600',
    text: 'text-purple-600',
  },
  yellow: {
    bg: 'bg-yellow-100',
    icon: 'text-yellow-600',
    text: 'text-yellow-600',
  },
  red: {
    bg: 'bg-red-100',
    icon: 'text-red-600',
    text: 'text-red-600',
  },
  indigo: {
    bg: 'bg-indigo-100',
    icon: 'text-indigo-600',
    text: 'text-indigo-600',
  },
}

export function StatsCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  color,
  format = 'number',
  delay = 0,
}: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const colors = colorClasses[color]

  useEffect(() => {
    if (typeof value === 'number') {
      let start = 0
      const end = value
      const duration = 1000
      const increment = end / (duration / 16)

      const timer = setInterval(() => {
        start += increment
        if (start >= end) {
          setDisplayValue(end)
          clearInterval(timer)
        } else {
          setDisplayValue(Math.floor(start))
        }
      }, 16)

      return () => clearInterval(timer)
    }
  }, [value])

  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val

    if (format === 'currency') {
      return `₺${val.toLocaleString('tr-TR')}`
    } else if (format === 'percentage') {
      return `%${val.toFixed(1)}`
    }
    return val.toLocaleString('tr-TR')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="card p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatValue(typeof value === 'number' ? displayValue : value)}
          </p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <span
                className={`text-sm font-medium ${
                  change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {change >= 0 ? '+' : ''}
                {change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-gray-500 ml-2">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${colors.icon}`} />
        </div>
      </div>
    </motion.div>
  )
}

