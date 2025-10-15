import React, { useState } from 'react'
import { ChevronDown, ChevronRight, CreditCard as Edit2, Copy, Trash2, Plus, X, Bookmark, Search, QrCode } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { CounterpartySelectionModal } from '../Acceptance/CounterpartySelectionModal'
import { ReferenceSelectionModal } from '../Acceptance/ReferenceSelectionModal'
import { ReferenceItemSelectionModal } from '../Acceptance/ReferenceItemSelectionModal'
import { Counterparty } from '../../services/counterpartyService'
import { useNavigate } from 'react-router-dom'

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ]
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year} г.`
}

export interface ReceptionItem {
  id: string
  item_description: string
  work_group: string
  transaction_type: string
  quantity: number
  price: number
  upd_document_id: string | null
}

export interface AcceptedMotor {
  id: string
  position_in_reception: number
  motor_service_description: string
  motor_inventory_number: string
  subdivision_id: string
  subdivisions: {
    id: string
    name: string
  }
  items: ReceptionItem[]
}

export interface Reception {
  id: string
  reception_number: string
  reception_date: string
  counterparty_id: string
  counterparties: {
    id: string
    name: string
  }
  motors: AcceptedMotor[]
}

interface EditableReceptionPreviewProps {
  reception: Reception
  onUpdateItem: (itemId: string, updates: Partial<ReceptionItem>) => Promise<void>
  onDeleteItem: (itemId: string) => Promise<void>
  onAddItem: (motorId: string, item: Omit<ReceptionItem, 'id' | 'upd_document_id'>) => Promise<void>
  onReceptionNumberUpdate?: (newReceptionNumber: string) => void
  onReceptionDateUpdate?: (newReceptionDate: string) => void
  onCounterpartyUpdate?: (counterpartyId: string) => void
  onServiceNameUpdate?: (motorId: string, newServiceName: string) => void
  onSubdivisionNameUpdate?: (motorId: string, newSubdivisionName: string) => void
  onAddGroupClick?: (motorId: string) => void
  onDuplicatePosition?: (motorId: string) => void
  onDeletePosition?: (motorId: string) => void
  onAddItemToGroup?: (motorId: string, workGroup: string) => void
  onSaveAsTemplate?: (motorId: string) => void
}

interface PositionItemProps {
  item: ReceptionItem
  onUpdate?: (updates: Partial<ReceptionItem>) => void
  onNameUpdate?: (newName: string) => void
  onDelete?: () => void
}

const PositionItem: React.FC<PositionItemProps> = ({ item, onUpdate, onNameUpdate, onDelete }) => {
  const [isEditingQuantity, setIsEditingQuantity] = useState(false)
  const [isEditingPrice, setIsEditingPrice] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editQuantity, setEditQuantity] = useState(item.quantity)
  const [editPrice, setEditPrice] = useState(item.price)
  const [editName, setEditName] = useState(item.item_description)
  const [showCopyFeedback, setShowCopyFeedback] = useState(false)
  const [showReferenceModal, setShowReferenceModal] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [selectedReferenceType, setSelectedReferenceType] = useState<'motors' | 'counterparties' | 'subdivisions'>('motors')

  const isLinked = !!item.upd_document_id
  const total = item.quantity * item.price
  const isIncome = item.transaction_type === 'Доходы'

  const handleQuantitySave = () => {
    if (onUpdate && editQuantity !== item.quantity) {
      onUpdate({ quantity: editQuantity })
    }
    setIsEditingQuantity(false)
  }

  const handlePriceSave = () => {
    if (onUpdate && editPrice !== item.price) {
      onUpdate({ price: editPrice })
    }
    setIsEditingPrice(false)
  }

  const handleNameSave = () => {
    if (onNameUpdate && editName !== item.item_description && editName.trim()) {
      onNameUpdate(editName.trim())
    }
    setIsEditingName(false)
  }

  const handleQuantityKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleQuantitySave()
    } else if (e.key === 'Escape') {
      setEditQuantity(item.quantity)
      setIsEditingQuantity(false)
    }
  }

  const handlePriceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePriceSave()
    } else if (e.key === 'Escape') {
      setEditPrice(item.price)
      setIsEditingPrice(false)
    }
  }

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave()
    } else if (e.key === 'Escape') {
      setEditName(item.item_description)
      setIsEditingName(false)
    }
  }

  const handleCopyName = async () => {
    try {
      await navigator.clipboard.writeText(item.item_description)
      setShowCopyFeedback(true)
      setTimeout(() => setShowCopyFeedback(false), 1500)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleSelectReference = (referenceType: 'motors' | 'counterparties' | 'subdivisions') => {
    setSelectedReferenceType(referenceType)
    setShowReferenceModal(false)
    setShowItemModal(true)
  }

  const handleSelectItem = (selectedItem: { name: string; price?: number }) => {
    setEditName(selectedItem.name)
    if (selectedItem.price !== undefined && selectedItem.price > 0) {
      setEditPrice(selectedItem.price)
    }
    setShowItemModal(false)
  }

  return (
    <>
      <div className={`py-2 px-3 rounded transition-colors ${
        isLinked ? 'bg-gray-100 border border-gray-300' : 'hover:bg-gray-50'
      }`}>
        <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0 flex items-center gap-2">
          {!isLinked && isEditingName && onNameUpdate ? (
            <div className="flex-1 relative">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={handleNameKeyDown}
                autoFocus
                className="w-full pr-9 px-2 py-1 text-sm text-gray-900 border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowReferenceModal(true)}
                onMouseDown={(e) => e.preventDefault()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Выбрать из справочника"
              >
                <Search size={16} />
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-900">
                {item.item_description}
              </p>
              <div className="flex items-center gap-1">
                {!isLinked && onUpdate && (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-gray-400 hover:text-blue-600 transition flex-shrink-0"
                    title="Редактировать"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
                <button
                  onClick={handleCopyName}
                  className={`text-gray-400 hover:text-blue-600 transition flex-shrink-0 ${showCopyFeedback ? 'text-green-500' : ''}`}
                  title={showCopyFeedback ? 'Скопировано!' : 'Копировать название'}
                >
                  <Copy size={14} />
                </button>
              </div>
            </>
          )}
          {isLinked && (
            <span className="text-xs text-gray-500 italic">В УПД</span>
          )}
        </div>
        <div className="text-right flex items-center gap-1 justify-end">
          {!isLinked && isEditingQuantity && onUpdate ? (
            <input
              type="number"
              value={editQuantity}
              onChange={(e) => setEditQuantity(parseFloat(e.target.value) || 0)}
              onBlur={handleQuantitySave}
              onKeyDown={handleQuantityKeyDown}
              autoFocus
              className="w-16 px-2 py-1 text-sm text-right border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          ) : (
            <>
              <p className="text-sm text-gray-600 font-medium">
                {item.quantity}
              </p>
              {!isLinked && onUpdate && (
                <button
                  onClick={() => setIsEditingQuantity(true)}
                  className="text-gray-400 hover:text-blue-600 transition flex-shrink-0"
                  title="Редактировать количество"
                >
                  <Edit2 size={14} />
                </button>
              )}
              {!isLinked && onDelete && (
                <button
                  onClick={onDelete}
                  className="text-gray-400 hover:text-red-600 transition flex-shrink-0"
                  title="Удалить позицию"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <span className={`text-xs font-medium ${isIncome ? 'text-green-700' : 'text-red-700'}`}>
          {isIncome ? '+' : ''} {total.toLocaleString('ru-RU')} ₽
        </span>
        {!isLinked && onUpdate && (
          <>
            <span className="text-xs text-gray-400">•</span>
            {isEditingPrice ? (
              <input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                onBlur={handlePriceSave}
                onKeyDown={handlePriceKeyDown}
                autoFocus
                className="w-24 px-2 py-1 text-xs text-right border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">
                  {item.price.toLocaleString('ru-RU')} ₽/шт
                </span>
                <button
                  onClick={() => setIsEditingPrice(true)}
                  className="text-gray-400 hover:text-blue-600 transition flex-shrink-0"
                  title="Редактировать цену"
                >
                  <Edit2 size={12} />
                </button>
              </div>
            )}
          </>
        )}
        </div>
      </div>

      <ReferenceSelectionModal
        isOpen={showReferenceModal}
        onClose={() => setShowReferenceModal(false)}
        onSelectReference={handleSelectReference}
      />

      <ReferenceItemSelectionModal
        isOpen={showItemModal}
        onClose={() => setShowItemModal(false)}
        referenceType={selectedReferenceType}
        onSelectItem={handleSelectItem}
      />
    </>
  )
}

interface TransactionGroupProps {
  type: string
  items: ReceptionItem[]
  onItemUpdate?: (itemIndex: number, updates: Partial<ReceptionItem>) => void
  onItemNameUpdate?: (itemIndex: number, newName: string) => void
  onItemDelete?: (itemIndex: number) => void
}

const TransactionGroup: React.FC<TransactionGroupProps> = ({ type, items, onItemUpdate, onItemNameUpdate, onItemDelete }) => {
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
          <span className="text-sm text-gray-600">{isIncome ? '↗' : '↘'}</span>
          <h4 className={`text-sm font-medium ${textColor}`}>{type}</h4>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold ${textColor}`}>
            {isIncome ? '+' : '-'} {Math.abs(total).toLocaleString('ru-RU')} ₽
          </span>
          <button className="text-gray-600">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-1 space-y-1 pl-4">
          {items.map((item, idx) => (
            <PositionItem
              key={item.id}
              item={item}
              onUpdate={onItemUpdate && !item.upd_document_id ? (updates) => onItemUpdate(idx, updates) : undefined}
              onNameUpdate={onItemNameUpdate && !item.upd_document_id ? (newName) => onItemNameUpdate(idx, newName) : undefined}
              onDelete={onItemDelete && !item.upd_document_id ? () => onItemDelete(idx) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface BaseItemGroupProps {
  baseItemName: string
  items: ReceptionItem[]
  onItemUpdate?: (itemIndex: number, updates: Partial<ReceptionItem>) => void
  onItemNameUpdate?: (itemIndex: number, newName: string) => void
  onItemDelete?: (itemIndex: number) => void
}

const BaseItemGroup: React.FC<BaseItemGroupProps> = ({ baseItemName, items, onItemUpdate, onItemNameUpdate, onItemDelete }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const incomeItems = items.filter(item => item.transaction_type === 'Доходы')
  const expenseItems = items.filter(item => item.transaction_type === 'Расходы')

  const incomeTotal = incomeItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const expenseTotal = expenseItems.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const profit = incomeTotal + expenseTotal

  return (
    <div className="bg-blue-50 rounded-lg px-3 py-2">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer"
      >
        <h3 className="text-sm font-medium text-gray-800 flex-1">{baseItemName}</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-green-600 font-medium">↗ {incomeTotal.toLocaleString('ru-RU')} ₽</span>
          <span className="text-xs text-red-600 font-medium">↘ {Math.abs(expenseTotal).toLocaleString('ru-RU')} ₽</span>
          <span className="text-xs text-blue-600 font-semibold">₽ {profit.toLocaleString('ru-RU')} ₽</span>
          <button className="text-gray-600">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-2 space-y-2 pl-3">
          <TransactionGroup
            type="Доходы"
            items={incomeItems}
            onItemUpdate={onItemUpdate ? (idx, updates) => {
              const globalIdx = items.indexOf(incomeItems[idx])
              onItemUpdate(globalIdx, updates)
            } : undefined}
            onItemNameUpdate={onItemNameUpdate ? (idx, newName) => {
              const globalIdx = items.indexOf(incomeItems[idx])
              onItemNameUpdate(globalIdx, newName)
            } : undefined}
            onItemDelete={onItemDelete ? (idx) => {
              const globalIdx = items.indexOf(incomeItems[idx])
              onItemDelete(globalIdx)
            } : undefined}
          />
          <TransactionGroup
            type="Расходы"
            items={expenseItems}
            onItemUpdate={onItemUpdate ? (idx, updates) => {
              const globalIdx = items.indexOf(expenseItems[idx])
              onItemUpdate(globalIdx, updates)
            } : undefined}
            onItemNameUpdate={onItemNameUpdate ? (idx, newName) => {
              const globalIdx = items.indexOf(expenseItems[idx])
              onItemNameUpdate(globalIdx, newName)
            } : undefined}
            onItemDelete={onItemDelete ? (idx) => {
              const globalIdx = items.indexOf(expenseItems[idx])
              onItemDelete(globalIdx)
            } : undefined}
          />
        </div>
      )}
    </div>
  )
}

interface WorkGroupProps {
  workGroup: string
  items: ReceptionItem[]
  onItemUpdate?: (itemIndex: number, updates: Partial<ReceptionItem>) => void
  onItemNameUpdate?: (itemIndex: number, newName: string) => void
  onItemDelete?: (itemIndex: number) => void
  onAddItemToGroup?: (workGroup: string) => void
}

const WorkGroup: React.FC<WorkGroupProps> = ({ workGroup, items, onItemUpdate, onItemNameUpdate, onItemDelete, onAddItemToGroup }) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const baseItemMap = new Map<string, ReceptionItem[]>()
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
  const profit = incomeTotal + expenseTotal

  return (
    <div className="border-l-4 border-blue-400 pl-3">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer py-2 px-3 hover:bg-blue-50 rounded"
      >
        <h2 className="text-sm font-medium text-gray-800 flex-1">{workGroup}</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-green-600 font-medium">↗ {incomeTotal.toLocaleString('ru-RU')} ₽</span>
          <span className="text-xs text-red-600 font-medium">↘ {Math.abs(expenseTotal).toLocaleString('ru-RU')} ₽</span>
          <span className="text-xs text-blue-600 font-semibold">₽ {profit.toLocaleString('ru-RU')} ₽</span>
          <button className="text-gray-600">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-2 space-y-2 pl-2">
          {Array.from(baseItemMap.entries()).map(([baseName, baseItems]) => (
            <BaseItemGroup
              key={baseName}
              baseItemName={baseName}
              items={baseItems}
              onItemUpdate={onItemUpdate ? (idx, updates) => {
                const globalIdx = items.indexOf(baseItems[idx])
                onItemUpdate(globalIdx, updates)
              } : undefined}
              onItemNameUpdate={onItemNameUpdate ? (idx, newName) => {
                const globalIdx = items.indexOf(baseItems[idx])
                onItemNameUpdate(globalIdx, newName)
              } : undefined}
              onItemDelete={onItemDelete ? (idx) => {
                const globalIdx = items.indexOf(baseItems[idx])
                onItemDelete(globalIdx)
              } : undefined}
            />
          ))}
          {onAddItemToGroup && (
            <div className="mt-2">
              <button
                onClick={() => onAddItemToGroup(workGroup)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors py-2"
              >
                <Plus size={16} />
                Добавить позицию в текущей группе
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface MotorGroupProps {
  motor: AcceptedMotor
  onItemUpdate?: (itemIndex: number, updates: Partial<ReceptionItem>) => void
  onItemNameUpdate?: (itemIndex: number, newName: string) => void
  onItemDelete?: (itemIndex: number) => void
  onServiceNameUpdate?: (newServiceName: string) => void
  onSubdivisionNameUpdate?: (newSubdivisionName: string) => void
  onAddGroupClick?: () => void
  onDuplicatePosition?: () => void
  onDeletePosition?: () => void
  onAddItemToGroup?: (workGroup: string) => void
  onSaveAsTemplate?: () => void
}

const MotorGroup: React.FC<MotorGroupProps> = ({
  motor,
  onItemUpdate,
  onItemNameUpdate,
  onItemDelete,
  onServiceNameUpdate,
  onSubdivisionNameUpdate,
  onAddGroupClick,
  onDuplicatePosition,
  onDeletePosition,
  onAddItemToGroup,
  onSaveAsTemplate,
}) => {
  const navigate = useNavigate()
  const [isExpanded, setIsExpanded] = useState(true)
  const [isEditingServiceName, setIsEditingServiceName] = useState(false)
  const [isEditingSubdivisionName, setIsEditingSubdivisionName] = useState(false)
  const [editServiceName, setEditServiceName] = useState(motor.motor_service_description)
  const [editSubdivisionName, setEditSubdivisionName] = useState(motor.subdivisions.name)

  const workGroupMap = new Map<string, ReceptionItem[]>()
  for (const item of motor.items) {
    if (!workGroupMap.has(item.work_group)) {
      workGroupMap.set(item.work_group, [])
    }
    workGroupMap.get(item.work_group)!.push(item)
  }

  const incomeTotal = motor.items
    .filter(item => item.transaction_type === 'Доходы')
    .reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const expenseTotal = motor.items
    .filter(item => item.transaction_type === 'Расходы')
    .reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const profit = incomeTotal + expenseTotal

  const handleServiceNameSave = () => {
    if (onServiceNameUpdate && editServiceName.trim() && editServiceName !== motor.motor_service_description) {
      onServiceNameUpdate(editServiceName.trim())
    }
    setIsEditingServiceName(false)
  }

  const handleServiceNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleServiceNameSave()
    } else if (e.key === 'Escape') {
      setEditServiceName(motor.motor_service_description)
      setIsEditingServiceName(false)
    }
  }

  const handleSubdivisionNameSave = () => {
    if (onSubdivisionNameUpdate && editSubdivisionName.trim() && editSubdivisionName !== motor.subdivisions.name) {
      onSubdivisionNameUpdate(editSubdivisionName.trim())
    }
    setIsEditingSubdivisionName(false)
  }

  const handleSubdivisionNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubdivisionNameSave()
    } else if (e.key === 'Escape') {
      setEditSubdivisionName(motor.subdivisions.name)
      setIsEditingSubdivisionName(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
      <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-3 flex-1">
          <span className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full text-sm font-bold">
            {motor.position_in_reception}
          </span>
          <div className="flex-1">
            {isEditingServiceName && onServiceNameUpdate ? (
              <input
                type="text"
                value={editServiceName}
                onChange={(e) => setEditServiceName(e.target.value)}
                onBlur={handleServiceNameSave}
                onKeyDown={handleServiceNameKeyDown}
                onClick={(e) => e.stopPropagation()}
                autoFocus
                className="w-full px-2 py-1 text-sm font-semibold text-gray-900 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="flex items-center gap-2">
                <h2
                  className={`text-sm font-semibold text-gray-900 ${onServiceNameUpdate ? 'cursor-pointer hover:text-blue-600' : ''}`}
                  onClick={(e) => {
                    if (onServiceNameUpdate) {
                      e.stopPropagation()
                      setIsEditingServiceName(true)
                    }
                  }}
                >
                  {motor.motor_service_description}
                </h2>
                {onServiceNameUpdate && !isEditingServiceName && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsEditingServiceName(true)
                    }}
                    className="text-gray-400 hover:text-blue-600"
                    title="Редактировать название позиции"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>
            )}
            {isEditingSubdivisionName && onSubdivisionNameUpdate ? (
              <input
                type="text"
                value={editSubdivisionName}
                onChange={(e) => setEditSubdivisionName(e.target.value)}
                onBlur={handleSubdivisionNameSave}
                onKeyDown={handleSubdivisionNameKeyDown}
                onClick={(e) => e.stopPropagation()}
                autoFocus
                className="w-full px-2 py-0.5 text-xs text-gray-600 border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 mt-0.5"
              />
            ) : (
              <div className="flex items-center gap-1 mt-0.5">
                <p
                  className={`text-xs text-gray-600 ${onSubdivisionNameUpdate ? 'cursor-pointer hover:text-blue-600' : ''}`}
                  onClick={(e) => {
                    if (onSubdivisionNameUpdate) {
                      e.stopPropagation()
                      setIsEditingSubdivisionName(true)
                    }
                  }}
                >
                  {motor.subdivisions.name}
                </p>
                {onSubdivisionNameUpdate && !isEditingSubdivisionName && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsEditingSubdivisionName(true)
                    }}
                    className="text-gray-400 hover:text-blue-600"
                    title="Редактировать подразделение"
                  >
                    <Edit2 size={12} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-green-600 font-medium">↗ {incomeTotal.toLocaleString('ru-RU')} ₽</span>
          <span className="text-sm text-red-600 font-medium">↘ {Math.abs(expenseTotal).toLocaleString('ru-RU')} ₽</span>
          <span className="text-sm text-blue-600 font-semibold">₽ {profit.toLocaleString('ru-RU')} ₽</span>
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-600">
            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {Array.from(workGroupMap.entries()).map(([workGroup, workItems]) => (
            <WorkGroup
              key={workGroup}
              workGroup={workGroup}
              items={workItems}
              onItemUpdate={onItemUpdate ? (idx, updates) => {
                const globalIdx = motor.items.indexOf(workItems[idx])
                onItemUpdate(globalIdx, updates)
              } : undefined}
              onItemNameUpdate={onItemNameUpdate ? (idx, newName) => {
                const globalIdx = motor.items.indexOf(workItems[idx])
                onItemNameUpdate(globalIdx, newName)
              } : undefined}
              onItemDelete={onItemDelete ? (idx) => {
                const globalIdx = motor.items.indexOf(workItems[idx])
                onItemDelete(globalIdx)
              } : undefined}
              onAddItemToGroup={onAddItemToGroup}
            />
          ))}
          {(onAddGroupClick || onDuplicatePosition || onDeletePosition || onSaveAsTemplate) && (
            <div className="mt-4 pl-3 flex items-center gap-4 flex-wrap">
              {onAddGroupClick && (
                <button
                  onClick={onAddGroupClick}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors py-2"
                >
                  <Plus size={16} />
                  Создать группу работ
                </button>
              )}
              {onDuplicatePosition && (
                <button
                  onClick={onDuplicatePosition}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors py-2"
                  title="Продублировать позицию"
                >
                  <Copy size={16} />
                  Продублировать позицию
                </button>
              )}
              {onDeletePosition && (
                <button
                  onClick={onDeletePosition}
                  className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium transition-colors py-2"
                  title="Удалить позицию"
                >
                  <X size={16} />
                  Удалить позицию
                </button>
              )}
              {onSaveAsTemplate && (
                <button
                  onClick={onSaveAsTemplate}
                  className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors py-2"
                  title="Сохранить как шаблон"
                >
                  <Bookmark size={16} />
                  Сохранить как шаблон
                </button>
              )}
              <button
                onClick={() => navigate(`/app/motors/${motor.id}`)}
                className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors py-2"
                title="Просмотр и QR-код"
              >
                <QrCode size={16} />
                Просмотр и QR-код
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export const EditableReceptionPreview: React.FC<EditableReceptionPreviewProps> = ({
  reception,
  onUpdateItem,
  onDeleteItem,
  onAddItem,
  onReceptionNumberUpdate,
  onReceptionDateUpdate,
  onCounterpartyUpdate,
  onServiceNameUpdate,
  onSubdivisionNameUpdate,
  onAddGroupClick,
  onDuplicatePosition,
  onDeletePosition,
  onAddItemToGroup,
  onSaveAsTemplate,
}) => {
  const [isEditingReceptionNumber, setIsEditingReceptionNumber] = useState(false)
  const [editReceptionNumber, setEditReceptionNumber] = useState('')
  const [isEditingReceptionDate, setIsEditingReceptionDate] = useState(false)
  const [editReceptionDate, setEditReceptionDate] = useState('')
  const [isCounterpartyModalOpen, setIsCounterpartyModalOpen] = useState(false)

  const handleItemUpdate = async (motorId: string, itemIndex: number, updates: Partial<ReceptionItem>) => {
    const motor = reception.motors.find((m) => m.id === motorId)
    if (!motor) return

    const item = motor.items[itemIndex]
    if (!item) return

    await onUpdateItem(item.id, updates)
  }

  const handleItemNameUpdate = async (motorId: string, itemIndex: number, newName: string) => {
    const motor = reception.motors.find((m) => m.id === motorId)
    if (!motor) return

    const item = motor.items[itemIndex]
    if (!item) return

    const oldBaseName = item.item_description.split('_ID_')[0].trim()

    for (const motorItem of motor.items) {
      const currentBaseName = motorItem.item_description.split('_ID_')[0].trim()
      if (currentBaseName === oldBaseName) {
        const idPart = motorItem.item_description.includes('_ID_') ? motorItem.item_description.split('_ID_')[1] : ''
        const newItemName = idPart ? `${newName}_ID_${idPart}` : newName
        await onUpdateItem(motorItem.id, { item_description: newItemName })
      }
    }
  }

  const handleItemDelete = async (motorId: string, itemIndex: number) => {
    const motor = reception.motors.find((m) => m.id === motorId)
    if (!motor) return

    const item = motor.items[itemIndex]
    if (!item) return

    await onDeleteItem(item.id)
  }

  const handleReceptionNumberSave = () => {
    if (onReceptionNumberUpdate && editReceptionNumber.trim() && editReceptionNumber !== reception.reception_number) {
      onReceptionNumberUpdate(editReceptionNumber.trim())
    }
    setIsEditingReceptionNumber(false)
  }

  const handleReceptionNumberKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleReceptionNumberSave()
    } else if (e.key === 'Escape') {
      setEditReceptionNumber(reception.reception_number)
      setIsEditingReceptionNumber(false)
    }
  }

  const handleReceptionDateSave = () => {
    if (onReceptionDateUpdate && editReceptionDate.trim() && editReceptionDate !== reception.reception_date) {
      onReceptionDateUpdate(editReceptionDate.trim())
    }
    setIsEditingReceptionDate(false)
  }

  const handleReceptionDateKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleReceptionDateSave()
    } else if (e.key === 'Escape') {
      setEditReceptionDate(reception.reception_date)
      setIsEditingReceptionDate(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-2">Информация о приемке</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Номер приемки:</span>
            {isEditingReceptionNumber && onReceptionNumberUpdate ? (
              <input
                type="text"
                value={editReceptionNumber}
                onChange={(e) => setEditReceptionNumber(e.target.value)}
                onBlur={handleReceptionNumberSave}
                onKeyDown={handleReceptionNumberKeyDown}
                autoFocus
                className="w-full px-2 py-1 text-sm font-medium border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
              />
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <p className="font-medium">{reception.reception_number}</p>
                {onReceptionNumberUpdate && (
                  <button
                    onClick={() => {
                      setEditReceptionNumber(reception.reception_number)
                      setIsEditingReceptionNumber(true)
                    }}
                    className="text-gray-400 hover:text-blue-600 transition"
                    title="Редактировать номер приемки"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
          <div>
            <span className="text-gray-500">Дата приемки:</span>
            {isEditingReceptionDate && onReceptionDateUpdate ? (
              <input
                type="date"
                value={editReceptionDate}
                onChange={(e) => setEditReceptionDate(e.target.value)}
                onBlur={handleReceptionDateSave}
                onKeyDown={handleReceptionDateKeyDown}
                autoFocus
                className="w-full px-2 py-1 text-sm font-medium border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
              />
            ) : (
              <div className="flex items-center gap-2 mt-1">
                <p className="font-medium">{formatDate(reception.reception_date)}</p>
                {onReceptionDateUpdate && (
                  <button
                    onClick={() => {
                      setEditReceptionDate(reception.reception_date)
                      setIsEditingReceptionDate(true)
                    }}
                    className="text-gray-400 hover:text-blue-600 transition"
                    title="Редактировать дату приемки"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
          <div>
            <span className="text-gray-500">Контрагент:</span>
            <div className="flex items-center gap-2 mt-1">
              <p className="font-medium">{reception.counterparties.name}</p>
              {onCounterpartyUpdate && (
                <button
                  onClick={() => setIsCounterpartyModalOpen(true)}
                  className="text-gray-400 hover:text-blue-600 transition"
                  title="Выбрать контрагента"
                >
                  <Search size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-700">
          Двигатели ({reception.motors.length})
        </h3>
        {reception.motors.map((motor) => (
          <MotorGroup
            key={motor.id}
            motor={motor}
            onItemUpdate={(idx, updates) => handleItemUpdate(motor.id, idx, updates)}
            onItemNameUpdate={(idx, newName) => handleItemNameUpdate(motor.id, idx, newName)}
            onItemDelete={(idx) => handleItemDelete(motor.id, idx)}
            onServiceNameUpdate={onServiceNameUpdate ? (newServiceName) => onServiceNameUpdate(motor.id, newServiceName) : undefined}
            onSubdivisionNameUpdate={onSubdivisionNameUpdate ? (newSubdivisionName) => onSubdivisionNameUpdate(motor.id, newSubdivisionName) : undefined}
            onAddGroupClick={onAddGroupClick ? () => onAddGroupClick(motor.id) : undefined}
            onDuplicatePosition={onDuplicatePosition ? () => onDuplicatePosition(motor.id) : undefined}
            onDeletePosition={onDeletePosition ? () => onDeletePosition(motor.id) : undefined}
            onAddItemToGroup={onAddItemToGroup ? (workGroup) => onAddItemToGroup(motor.id, workGroup) : undefined}
            onSaveAsTemplate={onSaveAsTemplate ? () => onSaveAsTemplate(motor.id) : undefined}
          />
        ))}
      </div>

      <CounterpartySelectionModal
        isOpen={isCounterpartyModalOpen}
        onClose={() => setIsCounterpartyModalOpen(false)}
        onSelect={(counterparty: Counterparty) => {
          if (onCounterpartyUpdate) {
            onCounterpartyUpdate(counterparty.id)
          }
          setIsCounterpartyModalOpen(false)
        }}
      />
    </div>
  )
}
