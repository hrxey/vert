import React, { useState } from 'react'
import { ChevronDown, ChevronRight, CreditCard as Edit2, Copy, Trash2, Plus, Search } from 'lucide-react'
import { MotorDetailsItem } from '../../services/motorDetailsService'
import { ReferenceSelectionModal } from '../Acceptance/ReferenceSelectionModal'
import { ReferenceItemSelectionModal } from '../Acceptance/ReferenceItemSelectionModal'

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

interface PositionItemProps {
  item: MotorDetailsItem
  onUpdate?: (updates: Partial<MotorDetailsItem>) => void
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
          {isIncome ? '+' : ''} {formatCurrency(total)} ₽
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
                  {formatCurrency(item.price)} ₽/шт
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
  items: MotorDetailsItem[]
  onItemUpdate?: (itemIndex: number, updates: Partial<MotorDetailsItem>) => void
  onItemNameUpdate?: (itemIndex: number, newName: string) => void
  onItemDelete?: (itemIndex: number) => void
  canEdit: boolean
}

const TransactionGroup: React.FC<TransactionGroupProps> = ({
  type,
  items,
  onItemUpdate,
  onItemNameUpdate,
  onItemDelete,
  canEdit
}) => {
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
              key={item.item_id}
              item={item}
              onUpdate={canEdit && onItemUpdate && !item.upd_document_id ? (updates) => onItemUpdate(idx, updates) : undefined}
              onNameUpdate={canEdit && onItemNameUpdate && !item.upd_document_id ? (newName) => onItemNameUpdate(idx, newName) : undefined}
              onDelete={canEdit && onItemDelete && !item.upd_document_id ? () => onItemDelete(idx) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface BaseItemGroupProps {
  baseItemName: string
  items: MotorDetailsItem[]
  onItemUpdate?: (itemIndex: number, updates: Partial<MotorDetailsItem>) => void
  onItemNameUpdate?: (itemIndex: number, newName: string) => void
  onItemDelete?: (itemIndex: number) => void
  canEdit: boolean
}

const BaseItemGroup: React.FC<BaseItemGroupProps> = ({
  baseItemName,
  items,
  onItemUpdate,
  onItemNameUpdate,
  onItemDelete,
  canEdit
}) => {
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
          <span className="text-xs text-green-600 font-medium">↗ {formatCurrency(incomeTotal)} ₽</span>
          <span className="text-xs text-red-600 font-medium">↘ {Math.abs(expenseTotal).toLocaleString('ru-RU')} ₽</span>
          <span className="text-xs text-blue-600 font-semibold">₽ {formatCurrency(profit)} ₽</span>
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
            canEdit={canEdit}
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
            canEdit={canEdit}
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
  items: MotorDetailsItem[]
  onItemUpdate?: (itemIndex: number, updates: Partial<MotorDetailsItem>) => void
  onItemNameUpdate?: (itemIndex: number, newName: string) => void
  onItemDelete?: (itemIndex: number) => void
  onAddItemToGroup?: (workGroup: string) => void
  canEdit: boolean
}

const WorkGroup: React.FC<WorkGroupProps> = ({
  workGroup,
  items,
  onItemUpdate,
  onItemNameUpdate,
  onItemDelete,
  onAddItemToGroup,
  canEdit
}) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const baseItemMap = new Map<string, MotorDetailsItem[]>()
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
          <span className="text-xs text-green-600 font-medium">↗ {formatCurrency(incomeTotal)} ₽</span>
          <span className="text-xs text-red-600 font-medium">↘ {Math.abs(expenseTotal).toLocaleString('ru-RU')} ₽</span>
          <span className="text-xs text-blue-600 font-semibold">₽ {formatCurrency(profit)} ₽</span>
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
              canEdit={canEdit}
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
          {canEdit && onAddItemToGroup && (
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

interface EditableMotorDetailsProps {
  motorId: string
  motorServiceDescription: string
  subdivisionName: string | null
  items: MotorDetailsItem[]
  onItemUpdate?: (itemIndex: number, updates: Partial<MotorDetailsItem>) => void
  onItemNameUpdate?: (itemIndex: number, newName: string) => void
  onItemDelete?: (itemIndex: number) => void
  onServiceNameUpdate?: (newServiceName: string) => void
  onSubdivisionNameUpdate?: (newSubdivisionName: string) => void
  onAddGroupClick?: () => void
  onAddItemToGroup?: (workGroup: string) => void
  canEdit: boolean
}

export const EditableMotorDetails: React.FC<EditableMotorDetailsProps> = ({
  motorServiceDescription,
  subdivisionName,
  items,
  onItemUpdate,
  onItemNameUpdate,
  onItemDelete,
  onServiceNameUpdate,
  onSubdivisionNameUpdate,
  onAddGroupClick,
  onAddItemToGroup,
  canEdit,
}) => {
  const [isEditingServiceName, setIsEditingServiceName] = useState(false)
  const [isEditingSubdivisionName, setIsEditingSubdivisionName] = useState(false)
  const [editServiceName, setEditServiceName] = useState(motorServiceDescription)
  const [editSubdivisionName, setEditSubdivisionName] = useState(subdivisionName || '')

  const workGroupMap = new Map<string, MotorDetailsItem[]>()
  for (const item of items) {
    if (!workGroupMap.has(item.work_group || '')) {
      workGroupMap.set(item.work_group || '', [])
    }
    workGroupMap.get(item.work_group || '')!.push(item)
  }

  const incomeTotal = items
    .filter(item => item.transaction_type === 'Доходы')
    .reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const expenseTotal = items
    .filter(item => item.transaction_type === 'Расходы')
    .reduce((sum, item) => sum + (item.quantity * item.price), 0)
  const profit = incomeTotal + expenseTotal

  const handleServiceNameSave = () => {
    if (onServiceNameUpdate && editServiceName.trim() && editServiceName !== motorServiceDescription) {
      onServiceNameUpdate(editServiceName.trim())
    }
    setIsEditingServiceName(false)
  }

  const handleServiceNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleServiceNameSave()
    } else if (e.key === 'Escape') {
      setEditServiceName(motorServiceDescription)
      setIsEditingServiceName(false)
    }
  }

  const handleSubdivisionNameSave = () => {
    if (onSubdivisionNameUpdate && editSubdivisionName.trim() && editSubdivisionName !== subdivisionName) {
      onSubdivisionNameUpdate(editSubdivisionName.trim())
    }
    setIsEditingSubdivisionName(false)
  }

  const handleSubdivisionNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubdivisionNameSave()
    } else if (e.key === 'Escape') {
      setEditSubdivisionName(subdivisionName || '')
      setIsEditingSubdivisionName(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex-1">
          {canEdit && isEditingServiceName && onServiceNameUpdate ? (
            <input
              type="text"
              value={editServiceName}
              onChange={(e) => setEditServiceName(e.target.value)}
              onBlur={handleServiceNameSave}
              onKeyDown={handleServiceNameKeyDown}
              autoFocus
              className="w-full px-2 py-1 text-lg font-semibold text-gray-900 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <div className="flex items-center gap-2">
              <h2
                className={`text-lg font-semibold text-gray-900 ${canEdit && onServiceNameUpdate ? 'cursor-pointer hover:text-blue-600' : ''}`}
                onClick={() => {
                  if (canEdit && onServiceNameUpdate) {
                    setIsEditingServiceName(true)
                  }
                }}
              >
                {motorServiceDescription}
              </h2>
              {canEdit && onServiceNameUpdate && !isEditingServiceName && (
                <button
                  onClick={() => setIsEditingServiceName(true)}
                  className="text-gray-400 hover:text-blue-600"
                  title="Редактировать название позиции"
                >
                  <Edit2 size={16} />
                </button>
              )}
            </div>
          )}
          {canEdit && isEditingSubdivisionName && onSubdivisionNameUpdate ? (
            <input
              type="text"
              value={editSubdivisionName}
              onChange={(e) => setEditSubdivisionName(e.target.value)}
              onBlur={handleSubdivisionNameSave}
              onKeyDown={handleSubdivisionNameKeyDown}
              autoFocus
              className="w-full px-2 py-0.5 text-sm text-gray-600 border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 mt-1"
            />
          ) : (
            <div className="flex items-center gap-1 mt-1">
              <p
                className={`text-sm text-gray-600 ${canEdit && onSubdivisionNameUpdate ? 'cursor-pointer hover:text-blue-600' : ''}`}
                onClick={() => {
                  if (canEdit && onSubdivisionNameUpdate) {
                    setIsEditingSubdivisionName(true)
                  }
                }}
              >
                {subdivisionName || 'Не указано'}
              </p>
              {canEdit && onSubdivisionNameUpdate && !isEditingSubdivisionName && (
                <button
                  onClick={() => setIsEditingSubdivisionName(true)}
                  className="text-gray-400 hover:text-blue-600"
                  title="Редактировать подразделение"
                >
                  <Edit2 size={14} />
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-green-600 font-medium">↗ {formatCurrency(incomeTotal)} ₽</span>
          <span className="text-sm text-red-600 font-medium">↘ {Math.abs(expenseTotal).toLocaleString('ru-RU')} ₽</span>
          <span className="text-sm text-blue-600 font-semibold">₽ {formatCurrency(profit)} ₽</span>
        </div>
      </div>

      <div className="px-4 pb-4 pt-3 space-y-3">
        {Array.from(workGroupMap.entries()).map(([workGroup, workItems]) => (
          <WorkGroup
            key={workGroup}
            workGroup={workGroup || 'Без группы'}
            items={workItems}
            canEdit={canEdit}
            onItemUpdate={onItemUpdate ? (idx, updates) => {
              const globalIdx = items.indexOf(workItems[idx])
              onItemUpdate(globalIdx, updates)
            } : undefined}
            onItemNameUpdate={onItemNameUpdate ? (idx, newName) => {
              const globalIdx = items.indexOf(workItems[idx])
              onItemNameUpdate(globalIdx, newName)
            } : undefined}
            onItemDelete={onItemDelete ? (idx) => {
              const globalIdx = items.indexOf(workItems[idx])
              onItemDelete(globalIdx)
            } : undefined}
            onAddItemToGroup={onAddItemToGroup}
          />
        ))}
        {canEdit && onAddGroupClick && (
          <div className="mt-4 pl-3">
            <button
              onClick={onAddGroupClick}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors py-2"
            >
              <Plus size={16} />
              Создать группу работ
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
