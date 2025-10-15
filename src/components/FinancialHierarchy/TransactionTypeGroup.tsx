import React, { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { HierarchicalTransactionGroup } from '../../types/financialHierarchy'
import { formatCurrency } from './shared'
import { ItemCard } from './ItemCard'

interface TransactionTypeGroupProps {
  group: HierarchicalTransactionGroup
  onItemQuantityChange: (itemId: string, newQuantity: number) => void
  onSelectMotor: (itemId: string) => void
}

export const TransactionTypeGroup: React.FC<TransactionTypeGroupProps> = ({
  group,
  onItemQuantityChange,
  onSelectMotor,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  if (group.items.length === 0) {
    return null
  }

  const isIncome = group.type === 'income'
  const textColor = isIncome ? 'text-green-700' : 'text-red-700'

  return (
    <div>
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center cursor-pointer py-1 group hover:bg-slate-50 rounded px-2"
      >
        <div className="text-slate-400 group-hover:text-slate-800">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
        <h4 className={`text-sm font-medium ml-1 flex-grow ${textColor}`}>
          {isIncome ? 'Доходы' : 'Расходы'}
        </h4>
        <span className={`text-sm font-semibold ${textColor}`}>
          {formatCurrency(group.totalAmount)}
        </span>
        {group.items.length > 0 && (
          <span className="text-sm text-slate-500 ml-2">({group.items.length})</span>
        )}
      </div>

      {isExpanded && (
        <div className="mt-1 space-y-1 pl-4 border-l-2 border-slate-200">
          {group.items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onQuantityChange={onItemQuantityChange}
              onSelectMotor={onSelectMotor}
            />
          ))}
        </div>
      )}
    </div>
  )
}
