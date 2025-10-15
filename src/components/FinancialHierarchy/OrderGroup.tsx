import React, { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { HierarchicalOrderGroup } from '../../types/financialHierarchy'
import { FinancialTotals } from './shared'
import { WorkGroup } from './WorkGroup'

interface OrderGroupProps {
  order: HierarchicalOrderGroup
  onItemQuantityChange: (itemId: string, newQuantity: number) => void
  onSelectMotor: (itemId: string) => void
}

export const OrderGroup: React.FC<OrderGroupProps> = ({
  order,
  onItemQuantityChange,
  onSelectMotor,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="bg-white rounded-lg shadow border border-slate-200 mb-4">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center p-4 hover:bg-slate-50 rounded-t-lg cursor-pointer"
      >
        <span className="flex items-center justify-center w-7 h-7 bg-blue-600 text-white rounded-full text-sm font-bold flex-shrink-0">
          {order.orderNumber || '#'}
        </span>
        <h2 className="text-base font-semibold text-slate-900 flex-grow min-w-0 ml-3">
          {order.orderName || 'Заказ без названия'}
        </h2>
        <FinancialTotals
          income={order.totalIncome}
          expense={order.totalExpense}
          profit={order.totalProfit}
          compact={true}
        />
        <div className="text-slate-500 ml-4">
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {order.workGroups.map((wg) => (
            <WorkGroup
              key={wg.id}
              group={wg}
              onItemQuantityChange={onItemQuantityChange}
              onSelectMotor={onSelectMotor}
            />
          ))}
        </div>
      )}
    </div>
  )
}
