import React, { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { AvailableReceptionItem } from '../../services/updService'

interface ViewUPDHierarchyProps {
  items: AvailableReceptionItem[]
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
  }).format(amount)
}

interface PositionItemProps {
  item: AvailableReceptionItem
}

const PositionItem: React.FC<PositionItemProps> = ({ item }) => {
  const total = item.quantity * item.price
  const isIncome = item.transaction_type === 'Доходы'

  return (
    <div className="py-1.5 px-2 rounded transition-colors hover:bg-gray-50">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-gray-900 flex-1">
          {item.item_description}
        </p>
        <div className="text-right">
          <p className="text-xs text-gray-600 font-medium">
            {item.quantity}
          </p>
        </div>
      </div>
      <div className="mt-0.5 flex items-center gap-2">
        <span className={`text-xs font-medium ${isIncome ? 'text-green-700' : 'text-red-700'}`}>
          {isIncome ? '+' : '--'} {total.toLocaleString('ru-RU')} ₽
        </span>
        <span className="text-xs text-gray-400">•</span>
        <span className="text-xs text-gray-500">
          {isIncome ? '' : '-'}{item.price.toLocaleString('ru-RU')} ₽/шт
        </span>
      </div>
    </div>
  )
}

interface TransactionGroupProps {
  type: string
  items: AvailableReceptionItem[]
}

const TransactionGroup: React.FC<TransactionGroupProps> = ({ type, items }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  if (items.length === 0) return null

  const isIncome = type === 'Доходы'
  const textColor = isIncome ? 'text-green-600' : 'text-red-600'
  const total = items.reduce((sum, item) => sum + (item.quantity * item.price), 0)

  return (
    <div>
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer py-1.5 px-2 hover:bg-gray-50 rounded"
      >
        <div className="flex items-center gap-2 flex-1">
          <button className="text-gray-600">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <span className="text-xs text-gray-600">{isIncome ? '↗' : '↘'}</span>
          <h4 className={`text-xs font-medium ${textColor}`}>{type}</h4>
        </div>
        <span className={`text-xs font-semibold ${textColor}`}>
          {isIncome ? '+' : '--'} {Math.abs(total).toLocaleString('ru-RU')} ₽
        </span>
      </div>

      {isExpanded && (
        <div className="mt-1 space-y-1 pl-6">
          {items.map((item) => (
            <PositionItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

interface BaseItemGroupProps {
  baseItemName: string
  items: AvailableReceptionItem[]
}

const BaseItemGroup: React.FC<BaseItemGroupProps> = ({ baseItemName, items }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const incomeItems = items.filter(item => item.transaction_type === 'Доходы')
  const expenseItems = items.filter(item => item.transaction_type === 'Расходы')

  const incomeTotal = incomeItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const expenseTotal = expenseItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const profit = incomeTotal - expenseTotal

  return (
    <div className="bg-blue-50 rounded-lg px-2 py-1.5">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button className="text-gray-600 flex-shrink-0">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <h3 className="text-xs font-medium text-gray-800 truncate">{baseItemName}</h3>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className="text-xs text-green-600 font-medium">↗ {incomeTotal.toLocaleString('ru-RU')} ₽</span>
          <span className="text-xs text-red-600 font-medium">↘ {Math.abs(expenseTotal).toLocaleString('ru-RU')} ₽</span>
          <span className="text-xs text-blue-600 font-semibold">₽ {profit.toLocaleString('ru-RU')} ₽</span>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-1.5 space-y-1.5 pl-4">
          <TransactionGroup type="Доходы" items={incomeItems} />
          <TransactionGroup type="Расходы" items={expenseItems} />
        </div>
      )}
    </div>
  )
}

interface WorkGroupProps {
  workGroup: string
  items: AvailableReceptionItem[]
}

const WorkGroup: React.FC<WorkGroupProps> = ({ workGroup, items }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const baseItemMap = new Map<string, AvailableReceptionItem[]>()
  for (const item of items) {
    const baseName = item.item_description.split('_ID_')[0].trim()
    if (!baseItemMap.has(baseName)) {
      baseItemMap.set(baseName, [])
    }
    baseItemMap.get(baseName)!.push(item)
  }

  const incomeTotal = items
    .filter(item => item.transaction_type === 'Доходы')
    .reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const expenseTotal = items
    .filter(item => item.transaction_type === 'Расходы')
    .reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const profit = incomeTotal - expenseTotal

  return (
    <div className="border-l-4 border-blue-400 pl-2">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer py-1.5 px-2 hover:bg-blue-50 rounded"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button className="text-gray-600 flex-shrink-0">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          <h2 className="text-xs font-medium text-gray-800 truncate">{workGroup}</h2>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className="text-xs text-green-600 font-medium">↗ {incomeTotal.toLocaleString('ru-RU')} ₽</span>
          <span className="text-xs text-red-600 font-medium">↘ {Math.abs(expenseTotal).toLocaleString('ru-RU')} ₽</span>
          <span className="text-xs text-blue-600 font-semibold">₽ {profit.toLocaleString('ru-RU')} ₽</span>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-1.5 space-y-1.5 pl-2">
          {Array.from(baseItemMap.entries()).map(([baseName, baseItems]) => (
            <BaseItemGroup key={baseName} baseItemName={baseName} items={baseItems} />
          ))}
        </div>
      )}
    </div>
  )
}

interface MotorGroupProps {
  positionNumber: number
  motorDescription: string
  inventoryNumber: string | null
  subdivisionName: string | null
  items: AvailableReceptionItem[]
}

const MotorGroup: React.FC<MotorGroupProps> = ({
  positionNumber,
  motorDescription,
  inventoryNumber,
  subdivisionName,
  items,
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const workGroupMap = new Map<string, AvailableReceptionItem[]>()
  for (const item of items) {
    if (!workGroupMap.has(item.work_group)) {
      workGroupMap.set(item.work_group, [])
    }
    workGroupMap.get(item.work_group)!.push(item)
  }

  const incomeTotal = items
    .filter(item => item.transaction_type === 'Доходы')
    .reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const expenseTotal = items
    .filter(item => item.transaction_type === 'Расходы')
    .reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const profit = incomeTotal - expenseTotal

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-3">
      <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 flex-shrink-0"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          <span className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-xs font-bold flex-shrink-0">
            {positionNumber}
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="text-xs font-semibold text-gray-900 truncate">
              {motorDescription}
            </h2>
            <p className="text-xs text-gray-600 truncate">
              Инв. №: {inventoryNumber || 'Не указан'} | {subdivisionName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          <span className="text-xs text-green-600 font-medium">↗ {incomeTotal.toLocaleString('ru-RU')} ₽</span>
          <span className="text-xs text-red-600 font-medium">↘ {Math.abs(expenseTotal).toLocaleString('ru-RU')} ₽</span>
          <span className="text-xs text-blue-600 font-semibold">₽ {profit.toLocaleString('ru-RU')} ₽</span>
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          {Array.from(workGroupMap.entries()).map(([workGroup, workItems]) => (
            <WorkGroup key={workGroup} workGroup={workGroup} items={workItems} />
          ))}
        </div>
      )}
    </div>
  )
}

interface ReceptionGroupProps {
  receptionNumber: string
  positions: Map<number, AvailableReceptionItem[]>
}

const ReceptionGroup: React.FC<ReceptionGroupProps> = ({ receptionNumber, positions }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex items-center gap-2 cursor-pointer hover:bg-gray-100"
      >
        <button className="text-gray-600">
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <h3 className="text-xs font-semibold text-gray-700">
          Приемка: {receptionNumber}
        </h3>
      </div>

      {isExpanded && (
        <div className="p-3 space-y-2">
          {Array.from(positions.entries())
            .sort(([a], [b]) => a - b)
            .map(([positionNumber, positionItems]) => {
              const firstItem = positionItems[0]
              return (
                <MotorGroup
                  key={positionNumber}
                  positionNumber={positionNumber}
                  motorDescription={firstItem.motor_service_description}
                  inventoryNumber={firstItem.motor_inventory_number}
                  subdivisionName={firstItem.subdivision_name}
                  items={positionItems}
                />
              )
            })}
        </div>
      )}
    </div>
  )
}

export const ViewUPDHierarchy: React.FC<ViewUPDHierarchyProps> = ({ items }) => {
  const receptionMap = new Map<string, Map<number, AvailableReceptionItem[]>>()

  items.forEach((item) => {
    if (!receptionMap.has(item.reception_number)) {
      receptionMap.set(item.reception_number, new Map())
    }
    const positions = receptionMap.get(item.reception_number)!
    if (!positions.has(item.position_number)) {
      positions.set(item.position_number, [])
    }
    positions.get(item.position_number)!.push(item)
  })

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-gray-500">
        Нет позиций в данном УПД
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {Array.from(receptionMap.entries()).map(([receptionNumber, positions]) => (
        <ReceptionGroup key={receptionNumber} receptionNumber={receptionNumber} positions={positions} />
      ))}
    </div>
  )
}
