'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { clsx } from 'clsx'

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  hover?: boolean
  glow?: boolean
  gradient?: boolean
}

export const AnimatedCard = ({ 
  children, 
  className, 
  delay = 0, 
  duration = 0.6,
  hover = true,
  glow = false,
  gradient = false
}: AnimatedCardProps) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0, 
        scale: 1 
      } : { opacity: 0, y: 50, scale: 0.95 }}
      transition={{ 
        duration, 
        delay,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={hover ? {
        scale: 1.02,
        y: -5,
        transition: { duration: 0.2 }
      } : {}}
      className={clsx(
        'relative overflow-hidden rounded-2xl',
        gradient && 'bg-gradient-to-br from-white via-blue-50 to-purple-50',
        !gradient && 'bg-white',
        glow && 'shadow-2xl shadow-blue-500/20',
        !glow && 'shadow-lg shadow-gray-200/50',
        'border border-gray-100/50',
        'backdrop-blur-sm',
        className
      )}
    >
      {glow && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}
