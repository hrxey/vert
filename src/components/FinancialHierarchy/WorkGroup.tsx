import React from 'react'
import { HierarchicalWorkGroup } from '../../types/financialHierarchy'
import { UnifiedWorkGroup } from '../common/UnifiedHierarchyComponents'

interface WorkGroupProps {
  group: HierarchicalWorkGroup
  onItemQuantityChange: (itemId: string, newQuantity: number) => void
  onSelectMotor: (itemId: string) => void
}

export const WorkGroup: React.FC<WorkGroupProps> = ({
  group,
  onItemQuantityChange,
  onSelectMotor,
}) => {
  const positions = group.positions.map(pos => ({
    id: pos.id,
    baseItemName: pos.baseItemName,
    incomeItems: pos.incomeGroup.items.map(item => ({
      id: item.id,
      itemName: item.itemName,
      quantity: item.quantity,
      price: item.unitPrice,
      totalAmount: item.totalAmount,
    })),
    expenseItems: pos.expenseGroup.items.map(item => ({
      id: item.id,
      itemName: item.itemName,
      quantity: item.quantity,
      price: item.unitPrice,
      totalAmount: item.totalAmount,
    })),
  }))

  return (
    <div className="border-l-4 border-blue-400 pl-4">
      <UnifiedWorkGroup
        workGroup={group.workGroup}
        positions={positions}
        mode="edit"
        onQuantityChange={onItemQuantityChange}
        onSelectMotor={onSelectMotor}
      />
    </div>
  )
}
