'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { clsx } from 'clsx'

interface FloatingActionButtonProps {
  onClick: () => void
  icon: React.ReactNode
  label: string
  variant?: 'primary' | 'secondary' | 'success' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const FloatingActionButton = ({
  onClick,
  icon,
  label,
  variant = 'primary',
  size = 'md',
  className
}: FloatingActionButtonProps) => {
  const [isPressed, setIsPressed] = useState(false)

  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25',
    secondary: 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg shadow-gray-500/25',
    success: 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25',
    danger: 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg shadow-red-500/25'
  }

  const sizes = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-base',
    lg: 'w-20 h-20 text-lg'
  }

  return (
    <motion.button
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      whileHover={{ 
        scale: 1.05,
        rotate: 5,
        transition: { duration: 0.2 }
      }}
      whileTap={{ 
        scale: 0.95,
        rotate: -5,
        transition: { duration: 0.1 }
      }}
      animate={{
        scale: isPressed ? 0.95 : 1,
        rotate: isPressed ? -5 : 0
      }}
      className={clsx(
        'fixed bottom-8 right-8 z-50 rounded-full',
        'flex flex-col items-center justify-center',
        'transition-all duration-300',
        'group cursor-pointer',
        'border-2 border-white/20',
        'backdrop-blur-sm',
        variants[variant],
        sizes[size],
        className
      )}
      title={label}
    >
      <motion.div
        animate={{ 
          rotate: isPressed ? 180 : 0,
          scale: isPressed ? 0.8 : 1
        }}
        transition={{ duration: 0.2 }}
      >
        {icon}
      </motion.div>
      
      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.8 }}
        whileHover={{ 
          opacity: 1, 
          y: -5, 
          scale: 1,
          transition: { duration: 0.2 }
        }}
        className="absolute bottom-full mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        {label}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
      </motion.div>
    </motion.button>
  )
}
