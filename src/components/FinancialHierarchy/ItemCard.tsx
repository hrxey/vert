import React from 'react'
import { HierarchicalItem } from '../../types/financialHierarchy'
import { formatCurrency } from './shared'
import { Repeat } from 'lucide-react'

interface ItemCardProps {
  item: HierarchicalItem
  onQuantityChange: (itemId: string, newQuantity: number) => void
  onSelectMotor: (itemId: string) => void
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onQuantityChange,
  onSelectMotor,
}) => {
  const handleIncrement = () => {
    onQuantityChange(item.id, item.quantity + 1)
  }

  const handleDecrement = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.id, item.quantity - 1)
    }
  }

  return (
    <div className="py-1.5 hover:bg-slate-50 rounded transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-grow flex items-center gap-2 min-w-0">
          <button
            onClick={() => onSelectMotor(item.id)}
            className="text-slate-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-blue-50 flex-shrink-0 mt-0.5"
            title="Заменить позицию из справочника"
          >
            <Repeat size={14} />
          </button>
          <div className="min-w-0 flex-grow">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-slate-900">{item.itemName}</p>
              <span className="text-sm text-slate-600 font-medium flex-shrink-0">{item.quantity}</span>
            </div>
            <div className="mt-1">
              <span className="text-xs text-green-700 font-medium">
                {item.totalAmount >= 0 ? '+' : ''} {formatCurrency(item.totalAmount)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-4 flex-shrink-0">
          <button
            onClick={handleDecrement}
            disabled={item.quantity <= 1}
            className="w-6 h-6 flex items-center justify-center rounded border border-slate-300 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-sm">−</span>
          </button>
          <button
            onClick={handleIncrement}
            className="w-6 h-6 flex items-center justify-center rounded border border-slate-300 hover:bg-slate-100"
          >
            <span className="text-sm">+</span>
          </button>
        </div>
      </div>
    </div>
  )
}
