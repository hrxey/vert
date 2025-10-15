import React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(amount)

interface CollapsibleHeaderProps {
  isExpanded: boolean
  toggle: () => void
  children: React.ReactNode
  className?: string
}

export const CollapsibleHeader: React.FC<CollapsibleHeaderProps> = ({
  isExpanded,
  toggle,
  children,
  className = '',
}) => (
  <div
    onClick={toggle}
    className={`flex items-center justify-between cursor-pointer transition-all duration-150 ${className}`}
  >
    {children}
    <button className="text-slate-500 hover:text-slate-900 flex-shrink-0 transition-colors ml-2">
      {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
    </button>
  </div>
)

interface FinancialTotalsProps {
  income: number
  expense: number
  profit: number
  compact?: boolean
}

export const FinancialTotals: React.FC<FinancialTotalsProps> = ({
  income,
  expense,
  profit,
  compact = false,
}) => {
  if (compact) {
    return (
      <div className="flex items-center space-x-3 text-sm ml-auto flex-shrink-0">
        <div className="flex items-center space-x-1">
          <span className="text-xs text-slate-600 font-medium">Д:</span>
          <span className="text-green-700 font-semibold">{formatCurrency(income)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-xs text-slate-600 font-medium">Р:</span>
          <span className="text-red-700 font-semibold">{formatCurrency(expense)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-xs text-slate-600 font-medium">П:</span>
          <span className="text-blue-700 font-bold">{formatCurrency(profit)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 text-sm flex-shrink-0">
      <div className="flex items-center">
        <div className="w-2 h-2 bg-green-600 rounded-full mr-1.5"></div>
        <span className="text-green-700 font-semibold">{formatCurrency(income)}</span>
      </div>
      <div className="flex items-center">
        <div className="w-2 h-2 bg-red-600 rounded-full mr-1.5"></div>
        <span className="text-red-700 font-semibold">{formatCurrency(expense)}</span>
      </div>
      <div className="flex items-center">
        <div className="w-2 h-2 bg-blue-600 rounded-full mr-1.5"></div>
        <span className="text-blue-700 font-bold">{formatCurrency(profit)}</span>
      </div>
    </div>
  )
}

interface TransactionBadgeProps {
  type: 'income' | 'expense' | 'Доходы' | 'Расходы' | 'Приход'
  children: React.ReactNode
  className?: string
}

export const TransactionBadge: React.FC<TransactionBadgeProps> = ({ type, children, className = '' }) => {
  const isIncome = type === 'income' || type === 'Доходы' || type === 'Приход'
  const colorClass = isIncome ? 'text-green-700' : 'text-red-700'

  return (
    <span className={`${colorClass} ${className}`}>
      {children}
    </span>
  )
}

interface ItemDetailRowProps {
  label: string
  value: string | number
  className?: string
}

export const ItemDetailRow: React.FC<ItemDetailRowProps> = ({ label, value, className = '' }) => (
  <span className={`text-xs text-slate-500 ${className}`}>
    {label}: {value}
  </span>
)
