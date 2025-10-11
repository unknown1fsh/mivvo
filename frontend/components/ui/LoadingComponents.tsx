'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { clsx } from 'clsx'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'white'
  className?: string
}

export const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary',
  className 
}: LoadingSpinnerProps) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const colors = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white'
  }

  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <motion.div
        className={clsx(
          'border-4 border-gray-200 rounded-full',
          sizes[size],
          colors[color]
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          borderTopColor: 'currentColor',
          borderRightColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: 'transparent'
        }}
      />
    </div>
  )
}

interface LoadingDotsProps {
  className?: string
}

export const LoadingDots = ({ className }: LoadingDotsProps) => {
  return (
    <div className={clsx('flex space-x-1', className)}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 bg-blue-600 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.2
          }}
        />
      ))}
    </div>
  )
}

interface LoadingPulseProps {
  className?: string
}

export const LoadingPulse = ({ className }: LoadingPulseProps) => {
  return (
    <motion.div
      className={clsx(
        'w-8 h-8 bg-blue-600 rounded-full',
        className
      )}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.7, 1]
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  )
}

interface ProgressBarProps {
  value: number
  className?: string
  showPercentage?: boolean
}

export const ProgressBar = ({ value, className, showPercentage = false }: ProgressBarProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {showPercentage && (
          <span className="text-sm font-medium text-gray-700">
            {Math.round(value)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <motion.div
          className={clsx('h-full rounded-full', className || 'bg-blue-600')}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export const Skeleton = ({ 
  className, 
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) => {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md'
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  }

  return (
    <div
      className={clsx(
        'bg-gray-200',
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height
      }}
    />
  )
}