'use client'

import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface CardProps {
  children: React.ReactNode
  title?: string
  icon?: React.ComponentType<{ className?: string }>
  action?: React.ReactNode
  className?: string
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, title, icon: Icon, action, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'card rounded-xl border border-border bg-surface-elevated shadow-xs transition-shadow duration-200 hover:shadow-sm',
          className
        )}
        {...props}
      >
        {(title || Icon || action) && (
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              {Icon && <Icon className="w-5 h-5 text-content-tertiary" aria-hidden="true" />}
              {title && <h3 className="text-heading-sm font-semibold text-content-primary">{title}</h3>}
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    )
  }
)

Card.displayName = 'Card'

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: 'primary' | 'success' | 'warning' | 'info' | 'purple'
  trend?: string
  trendLabel?: string
}

export function StatCard({ title, value, subtitle, icon: Icon, iconColor, trend, trendLabel }: StatCardProps) {
  const iconColors = {
    primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  }

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-body-sm font-medium text-content-secondary">{title}</p>
          <p className="text-heading-lg font-semibold text-content-primary mt-1">{value}</p>
          {subtitle && <p className="text-body-sm text-content-tertiary mt-1">{subtitle}</p>}
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconColors[iconColor])}>
          <Icon className="w-6 h-6" aria-hidden="true" />
        </div>
      </div>
      {trend && trendLabel && (
        <div className="mt-4 flex items-center gap-1.5 text-body-xs font-medium text-success-600 dark:text-success-400">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success-500" aria-hidden="true" />
            {trend}
          </span>
          <span className="text-content-tertiary">{trendLabel}</span>
        </div>
      )}
    </div>
  )
}

interface ResourceBarProps {
  label: string
  value: number
  max: number
  unit: string
  color: 'primary' | 'success' | 'warning' | 'info' | 'purple'
  showMax?: boolean
}

const barColors = {
  primary: 'bg-primary-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
  purple: 'bg-purple-500',
}

const barBgColors = {
  primary: 'bg-primary-100 dark:bg-primary-900/30',
  success: 'bg-green-100 dark:bg-green-900/30',
  warning: 'bg-amber-100 dark:bg-amber-900/30',
  info: 'bg-blue-100 dark:bg-blue-900/30',
  purple: 'bg-purple-100 dark:bg-purple-900/30',
}

export function ResourceBar({ label, value, max, unit, color, showMax }: ResourceBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-body-sm font-medium text-content-primary">{label}</span>
        <span className="text-body-sm font-mono text-content-secondary">
          {value}{unit} {showMax && <span className="text-content-tertiary">/ {max}{unit}</span>}
        </span>
      </div>
      <div className={cn('h-2 rounded-full overflow-hidden', barBgColors[color])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', barColors[color])}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`${label} usage`}
        />
      </div>
    </div>
  )
}

interface QuickActionButtonProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
}

export function QuickActionButton({ icon: Icon, label, href }: QuickActionButtonProps) {
  return (
    <Link
      href={href}
      className="card-interactive p-4 flex flex-col items-center gap-2 text-center"
    >
      <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
      </div>
      <span className="text-body-sm font-medium text-content-primary">{label}</span>
    </Link>
  )
}