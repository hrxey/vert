import React, { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { HierarchicalPositionGroup } from '../../types/financialHierarchy'
import { formatCurrency } from './shared'
import { TransactionTypeGroup } from './TransactionTypeGroup'

interface PositionGroupProps {
  group: HierarchicalPositionGroup
  onItemQuantityChange: (itemId: string, newQuantity: number) => void
  onSelectMotor: (itemId: string) => void
}

export const PositionGroup: React.FC<PositionGroupProps> = ({
  group,
  onItemQuantityChange,
  onSelectMotor,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const itemCount = group.incomeGroup.items.length + group.expenseGroup.items.length

  return (
    <div>
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center cursor-pointer py-1.5 group hover:bg-slate-50 rounded px-2"
      >
        <div className="text-slate-500 group-hover:text-slate-900">
          {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </div>
        <h3 className="text-sm text-slate-800 ml-2 flex-grow min-w-0">
          {group.baseItemName}
        </h3>
        <div className="flex items-center space-x-3 text-xs ml-auto flex-shrink-0">
          <div className="flex items-center space-x-1">
            <span className="text-slate-600 font-medium">Д:</span>
            <span className="text-green-700 font-semibold">{formatCurrency(group.totalIncome)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-slate-600 font-medium">Р:</span>
            <span className="text-red-700 font-semibold">{formatCurrency(group.totalExpense)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-slate-600 font-medium">П:</span>
            <span className="text-blue-700 font-bold">{formatCurrency(group.totalProfit)}</span>
          </div>
        </div>
        <span className="text-sm text-slate-500 ml-2">({itemCount})</span>
      </div>

      {isExpanded && (
        <div className="mt-1 space-y-1 pl-6">
          <TransactionTypeGroup
            group={group.incomeGroup}
            onItemQuantityChange={onItemQuantityChange}
            onSelectMotor={onSelectMotor}
          />
          <TransactionTypeGroup
            group={group.expenseGroup}
            onItemQuantityChange={onItemQuantityChange}
            onSelectMotor={onSelectMotor}
          />
        </div>
      )}
    </div>
  )
}
