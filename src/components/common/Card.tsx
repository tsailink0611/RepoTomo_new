import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

export const Card = ({ children, className = '', padding = 'md' }: CardProps) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div className={`
      bg-white rounded-lg shadow-lg border border-gray-200
      ${paddingClasses[padding]}
      ${className}
    `}>
      {children}
    </div>
  )
}