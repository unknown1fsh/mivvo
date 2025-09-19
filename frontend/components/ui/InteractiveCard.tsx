'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { clsx } from 'clsx'

interface InteractiveCardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
  glow?: boolean
  gradient?: boolean
  delay?: number
}

export const InteractiveCard = ({
  children,
  className,
  onClick,
  hover = true,
  glow = false,
  gradient = false,
  delay = 0
}: InteractiveCardProps) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay,
        type: "spring",
        stiffness: 100
      }}
      whileHover={hover ? {
        scale: 1.03,
        y: -8,
        transition: { duration: 0.3 }
      } : {}}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={clsx(
        'relative overflow-hidden rounded-2xl cursor-pointer',
        'transition-all duration-300',
        gradient && 'bg-gradient-to-br from-white via-blue-50 to-purple-50',
        !gradient && 'bg-white',
        glow && isHovered && 'shadow-2xl shadow-blue-500/30',
        !glow && 'shadow-lg shadow-gray-200/50',
        'border border-gray-100/50',
        'backdrop-blur-sm',
        'group',
        className
      )}
    >
      {/* Animated background gradient */}
      {glow && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 0.1 : 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
        />
      )}
      
      {/* Shimmer effect */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isHovered ? '100%' : '-100%' }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
      
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}
