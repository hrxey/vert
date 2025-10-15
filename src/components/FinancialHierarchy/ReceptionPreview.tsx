import React, { useState } from 'react'
    import { ReceptionExcelRow } from '../../utils/parseReceptionExcel'
    import { ChevronDown, ChevronRight, CreditCard as Edit2, Copy, Trash2, Plus, X, Bookmark, Search } from 'lucide-react'
    import { CounterpartySelectionModal } from '../Acceptance/CounterpartySelectionModal'
    import { ReferenceSelectionModal } from '../Acceptance/ReferenceSelectionModal'
    import { ReferenceItemSelectionModal } from '../Acceptance/ReferenceItemSelectionModal'
    import { Counterparty } from '../../services/counterpartyService'

    interface ReceptionPreviewProps {
      data: ReceptionExcelRow[]
      onDataChange?: (data: ReceptionExcelRow[]) => void
      onAddGroupClick?: () => void
      onDuplicatePosition?: (positionNumber: number) => void
      onDeletePosition?: (positionNumber: number) => void
      onAddItemToGroup?: (positionNumber: number, workGroup: string) => void
      onSaveAsTemplate?: (positionNumber: number) => void
      onReceptionNumberUpdate?: (newReceptionNumber: string) => void
      onReceptionDateUpdate?: (newReceptionDate: string) => void
      onCounterpartyUpdate?: (counterpartyName: string) => void
    }

    interface PositionItemProps {
      item: ReceptionExcelRow
      onUpdate?: (updates: Partial<ReceptionExcelRow>) => void
      onNameUpdate?: (newName: string) => void
      onDelete?: () => void
    }

    const PositionItem: React.FC<PositionItemProps> = ({ item, onUpdate, onNameUpdate, onDelete }) => {
      const [isEditingQuantity, setIsEditingQuantity] = useState(false)
      const [isEditingPrice, setIsEditingPrice] = useState(false)
      const [isEditingName, setIsEditingName] = useState(false)
      const [editQuantity, setEditQuantity] = useState(item.quantity)
      const [editPrice, setEditPrice] = useState(item.price)
      const [editName, setEditName] = useState(item.itemName)
      const [showCopyFeedback, setShowCopyFeedback] = useState(false)
      const [showReferenceModal, setShowReferenceModal] = useState(false)
      const [showItemModal, setShowItemModal] = useState(false)
      const [selectedReferenceType, setSelectedReferenceType] = useState<'motors' | 'counterparties' | 'subdivisions'>('motors')

      const total = item.quantity * item.price
      const isIncome = item.transactionType === 'Доходы'

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
        if (onNameUpdate && editName !== item.itemName && editName.trim()) {
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
          setEditName(item.itemName)
          setIsEditingName(false)
        }
      }

      const handleCopyName = async () => {
        try {
          await navigator.clipboard.writeText(item.itemName)
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
        if (selectedItem.price !== undefined && selectedItem.price > 0 && onUpdate) {
          onUpdate({ price: selectedItem.price })
        }
        setShowItemModal(false)
        if (onNameUpdate) {
          onNameUpdate(selectedItem.name)
        }
      }

      return (
        <div className="py-2 px-3 rounded hover:bg-gray-50 transition-colors">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0 flex items-center gap-2">
              {isEditingName && onNameUpdate ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleNameSave}
                  onKeyDown={handleNameKeyDown}
                  autoFocus
                  className="flex-1 px-2 py-1 text-sm text-gray-900 border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              ) : (
                <>
                  <p className="text-sm text-gray-900">
                    {item.itemName}
                  </p>
                  <div className="flex items-center gap-1">
                    {onUpdate && (
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
                    {onNameUpdate && (
                      <button
                        onClick={() => setShowReferenceModal(true)}
                        className="text-gray-400 hover:text-blue-600 transition flex-shrink-0"
                        title="Выбрать из справочника"
                      >
                        <Search size={14} />
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="text-right flex items-center gap-1 justify-end">
              {isEditingQuantity && onUpdate ? (
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
                  {onUpdate && (
                    <button
                      onClick={() => setIsEditingQuantity(true)}
                      className="text-gray-400 hover:text-blue-600 transition flex-shrink-0"
                      title="Редактировать количество"
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                  {onDelete && (
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
            {onUpdate && (
              <span className="text-xs text-gray-400">•</span>
            )}
            {isEditingPrice && onUpdate ? (
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
              onUpdate && (
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
              )
            )}
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
        </div>
      )
    }

    interface TransactionGroupProps {
      type: string
      items: ReceptionExcelRow[]
      onItemUpdate?: (itemIndex: number, updates: Partial<ReceptionExcelRow>) => void
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
                  key={idx}
                  item={item}
                  onUpdate={onItemUpdate ? (updates) => onItemUpdate(idx, updates) : undefined}
                  onNameUpdate={onItemNameUpdate ? (newName) => onItemNameUpdate(idx, newName) : undefined}
                  onDelete={onItemDelete ? () => onItemDelete(idx) : undefined}
                />
              ))}
            </div>
          )}
        </div>
      )
    }

    interface BaseItemGroupProps {
      baseItemName: string
      items: ReceptionExcelRow[]
      onItemUpdate?: (itemIndex: number, updates: Partial<ReceptionExcelRow>) => void
      onItemNameUpdate?: (itemIndex: number, newName: string) => void
      onItemDelete?: (itemIndex: number) => void
    }

    const BaseItemGroup: React.FC<BaseItemGroupProps> = ({ baseItemName, items, onItemUpdate, onItemNameUpdate, onItemDelete }) => {
      const [isExpanded, setIsExpanded] = useState(true)

      const incomeItems = items.filter(item => item.transactionType === 'Доходы')
      const expenseItems = items.filter(item => item.transactionType === 'Расходы')

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
      items: ReceptionExcelRow[]
      onItemUpdate?: (itemIndex: number, updates: Partial<ReceptionExcelRow>) => void
      onItemNameUpdate?: (itemIndex: number, newName: string) => void
      onItemDelete?: (itemIndex: number) => void
      onAddItemToGroup?: (workGroup: string) => void
    }

    const WorkGroup: React.FC<WorkGroupProps> = ({ workGroup, items, onItemUpdate, onItemNameUpdate, onItemDelete, onAddItemToGroup }) => {
      const [isExpanded, setIsExpanded] = useState(true)

      const baseItemMap = new Map<string, ReceptionExcelRow[]>()
      for (const item of items) {
        const baseName = item.itemName.split('_ID_')[0].trim()
        if (!baseItemMap.has(baseName)) {
          baseItemMap.set(baseName, [])
        }
        baseItemMap.get(baseName)!.push(item)
      }

      const incomeTotal = items
        .filter(item => item.transactionType === 'Доходы')
        .reduce((sum, item) => sum + (item.quantity * item.price), 0)
      const expenseTotal = items
        .filter(item => item.transactionType === 'Расходы')
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

    interface PositionGroupProps {
      positionNumber: number
      items: ReceptionExcelRow[]
      onItemUpdate?: (itemIndex: number, updates: Partial<ReceptionExcelRow>) => void
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

    const PositionGroup: React.FC<PositionGroupProps> = ({ positionNumber, items, onItemUpdate, onItemNameUpdate, onItemDelete, onServiceNameUpdate, onSubdivisionNameUpdate, onAddGroupClick, onDuplicatePosition, onDeletePosition, onAddItemToGroup, onSaveAsTemplate }) => {
      const [isExpanded, setIsExpanded] = useState(true)
      const [isEditingServiceName, setIsEditingServiceName] = useState(false)
      const [isEditingSubdivisionName, setIsEditingSubdivisionName] = useState(false)
      const [editServiceName, setEditServiceName] = useState(items[0].serviceName)
      const [editSubdivisionName, setEditSubdivisionName] = useState(items[0].subdivisionName)
      const firstItem = items[0]

      const workGroupMap = new Map<string, ReceptionExcelRow[]>()
      for (const item of items) {
        if (!workGroupMap.has(item.workGroup)) {
          workGroupMap.set(item.workGroup, [])
        }
        workGroupMap.get(item.workGroup)!.push(item)
      }

      const incomeTotal = items
        .filter(item => item.transactionType === 'Доходы')
        .reduce((sum, item) => sum + (item.quantity * item.price), 0)
      const expenseTotal = items
        .filter(item => item.transactionType === 'Расходы')
        .reduce((sum, item) => sum + (item.quantity * item.price), 0)
      const profit = incomeTotal + expenseTotal

      const handleServiceNameSave = () => {
        if (onServiceNameUpdate && editServiceName.trim() && editServiceName !== firstItem.serviceName) {
          onServiceNameUpdate(editServiceName.trim())
        }
        setIsEditingServiceName(false)
      }

      const handleServiceNameKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
          handleServiceNameSave()
        } else if (e.key === 'Escape') {
          setEditServiceName(firstItem.serviceName)
          setIsEditingServiceName(false)
        }
      }

      const handleSubdivisionNameSave = () => {
        if (onSubdivisionNameUpdate && editSubdivisionName.trim() && editSubdivisionName !== firstItem.subdivisionName) {
          onSubdivisionNameUpdate(editSubdivisionName.trim())
        }
        setIsEditingSubdivisionName(false)
      }

      const handleSubdivisionNameKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
          handleSubdivisionNameSave()
        } else if (e.key === 'Escape') {
          setEditSubdivisionName(firstItem.subdivisionName)
          setIsEditingSubdivisionName(false)
        }
      }

      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
          <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-t-lg">
            <div className="flex items-center gap-3 flex-1">
              <span className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full text-sm font-bold">
                {positionNumber}
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
                      {firstItem.serviceName}
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
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
                      {firstItem.subdivisionName}
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
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
              {(onAddGroupClick || onDuplicatePosition || onDeletePosition || onSaveAsTemplate) && (
                <div className="mt-4 pl-3 flex items-center gap-4">
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
                </div>
              )}
            </div>
          )}
        </div>
      )
    }

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

    export const ReceptionPreview: React.FC<ReceptionPreviewProps> = ({ data, onDataChange, onAddGroupClick, onDuplicatePosition, onDeletePosition, onAddItemToGroup, onSaveAsTemplate, onReceptionNumberUpdate, onReceptionDateUpdate, onCounterpartyUpdate }) => {
      const [isEditingReceptionNumber, setIsEditingReceptionNumber] = useState(false)
      const [editReceptionNumber, setEditReceptionNumber] = useState('')
      const [isEditingReceptionDate, setIsEditingReceptionDate] = useState(false)
      const [editReceptionDate, setEditReceptionDate] = useState('')
      const [isCounterpartyModalOpen, setIsCounterpartyModalOpen] = useState(false)
      if (data.length === 0) {
        return (
          <div className="text-center py-12 text-gray-500">
            Нет данных для отображения. Загрузите Excel файл.
          </div>
        )
      }

      const firstRow = data[0]

      const motorGroups = new Map<number, ReceptionExcelRow[]>()
      for (const row of data) {
        if (!motorGroups.has(row.positionNumber)) {
          motorGroups.set(row.positionNumber, [])
        }
        motorGroups.get(row.positionNumber)!.push(row)
      }

      const sortedGroups = Array.from(motorGroups.entries()).sort(
        ([a], [b]) => a - b
      )

      const handleItemUpdate = (positionNumber: number, itemIndex: number, updates: Partial<ReceptionExcelRow>) => {
        if (!onDataChange) return

        const newData = [...data]
        const positionItems = motorGroups.get(positionNumber)!
        const item = positionItems[itemIndex]
        const globalIndex = newData.indexOf(item)

        if (globalIndex !== -1) {
          newData[globalIndex] = { ...newData[globalIndex], ...updates }
          onDataChange(newData)
        }
      }

      const handleItemNameUpdate = (positionNumber: number, itemIndex: number, newName: string) => {
        if (!onDataChange) return

        const positionItems = motorGroups.get(positionNumber)!
        const item = positionItems[itemIndex]
        const oldBaseName = item.itemName.split('_ID_')[0].trim()

        const newData = data.map((row) => {
          if (row.positionNumber === positionNumber) {
            const currentBaseName = row.itemName.split('_ID_')[0].trim()
            if (currentBaseName === oldBaseName) {
              const idPart = row.itemName.includes('_ID_') ? row.itemName.split('_ID_')[1] : ''
              const newItemName = idPart ? `${newName}_ID_${idPart}` : newName
              return { ...row, itemName: newItemName }
            }
          }
          return row
        })
        onDataChange(newData)
      }

      const handleServiceNameUpdate = (positionNumber: number, newServiceName: string) => {
        if (!onDataChange) return

        const newData = data.map((row) => {
          if (row.positionNumber === positionNumber) {
            return { ...row, serviceName: newServiceName }
          }
          return row
        })
        onDataChange(newData)
      }

      const handleSubdivisionNameUpdate = (positionNumber: number, newSubdivisionName: string) => {
        if (!onDataChange) return

        const newData = data.map((row) => {
          if (row.positionNumber === positionNumber) {
            return { ...row, subdivisionName: newSubdivisionName }
          }
          return row
        })
        onDataChange(newData)
      }

      const handleItemDelete = (positionNumber: number, itemIndex: number) => {
        if (!onDataChange) return

        const positionItems = motorGroups.get(positionNumber)!
        const item = positionItems[itemIndex]

        const newData = data.filter(row => row !== item)
        onDataChange(newData)
      }

      const handleReceptionNumberSave = () => {
        if (onReceptionNumberUpdate && editReceptionNumber.trim() && editReceptionNumber !== firstRow.receptionNumber) {
          onReceptionNumberUpdate(editReceptionNumber.trim())
        }
        setIsEditingReceptionNumber(false)
      }

      const handleReceptionNumberKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
          handleReceptionNumberSave()
        } else if (e.key === 'Escape') {
          setEditReceptionNumber(firstRow.receptionNumber)
          setIsEditingReceptionNumber(false)
        }
      }

      const handleReceptionDateSave = () => {
        if (onReceptionDateUpdate && editReceptionDate.trim() && editReceptionDate !== firstRow.receptionDate) {
          onReceptionDateUpdate(editReceptionDate.trim())
        }
        setIsEditingReceptionDate(false)
      }

      const handleReceptionDateKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
          handleReceptionDateSave()
        } else if (e.key === 'Escape') {
          setEditReceptionDate(firstRow.receptionDate)
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
                    <p className="font-medium">{firstRow.receptionNumber}</p>
                    {onReceptionNumberUpdate && (
                      <button
                        onClick={() => {
                          setEditReceptionNumber(firstRow.receptionNumber)
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
                    <p className="font-medium">{formatDate(firstRow.receptionDate)}</p>
                    {onReceptionDateUpdate && (
                      <button
                        onClick={() => {
                          setEditReceptionDate(firstRow.receptionDate)
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
                  <p className="font-medium">{firstRow.counterpartyName}</p>
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
              Двигатели ({sortedGroups.length})
            </h3>
            {sortedGroups.map(([positionNumber, items]) => (
              <PositionGroup
                key={positionNumber}
                positionNumber={positionNumber}
                items={items}
                onItemUpdate={onDataChange ? (idx, updates) => handleItemUpdate(positionNumber, idx, updates) : undefined}
                onItemNameUpdate={onDataChange ? (idx, newName) => handleItemNameUpdate(positionNumber, idx, newName) : undefined}
                onItemDelete={onDataChange ? (idx) => handleItemDelete(positionNumber, idx) : undefined}
                onServiceNameUpdate={onDataChange ? (newServiceName) => handleServiceNameUpdate(positionNumber, newServiceName) : undefined}
                onSubdivisionNameUpdate={onDataChange ? (newSubdivisionName) => handleSubdivisionNameUpdate(positionNumber, newSubdivisionName) : undefined}
                onAddGroupClick={onAddGroupClick}
                onDuplicatePosition={onDuplicatePosition ? () => onDuplicatePosition(positionNumber) : undefined}
                onDeletePosition={onDeletePosition ? () => onDeletePosition(positionNumber) : undefined}
                onAddItemToGroup={onAddItemToGroup ? (workGroup) => onAddItemToGroup(positionNumber, workGroup) : undefined}
                onSaveAsTemplate={onSaveAsTemplate ? () => onSaveAsTemplate(positionNumber) : undefined}
              />
            ))}
          </div>

          <CounterpartySelectionModal
            isOpen={isCounterpartyModalOpen}
            onClose={() => setIsCounterpartyModalOpen(false)}
            onSelect={(counterparty: Counterparty) => {
              if (onCounterpartyUpdate) {
                onCounterpartyUpdate(counterparty.name)
              }
              setIsCounterpartyModalOpen(false)
            }}
          />
        </div>
      )
    }
