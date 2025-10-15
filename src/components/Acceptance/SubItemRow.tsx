import React, { useState } from 'react'
import { AcceptanceItem } from '../../types/acceptance'
import { Minus, Plus, Trash2, Edit, Save, X, Search } from 'lucide-react'
import { NumberInput } from '../ui/NumberInput'
import { ReferenceSelectionModal } from './ReferenceSelectionModal'
import { ReferenceItemSelectionModal } from './ReferenceItemSelectionModal'

interface SubItemRowProps {
  item: AcceptanceItem
  onQuantityChange: (id: string, delta: number) => void
  onDelete: (id: string) => void
  onUpdateItem: (id: string, updates: Partial<AcceptanceItem>) => void
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(amount)

export const SubItemRow: React.FC<SubItemRowProps> = ({
  item,
  onQuantityChange,
  onDelete,
  onUpdateItem,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [tempDescription, setTempDescription] = useState(item.description)
  const [tempPrice, setTempPrice] = useState<number | null>(item.price)
  const [showReferenceModal, setShowReferenceModal] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [selectedReferenceType, setSelectedReferenceType] = useState<'motors' | 'counterparties' | 'subdivisions' | 'wires'>('motors')

  const isIncome = item.is_income
  const total = item.price * item.quantity

  const levelPadding = item.level === 3 ? 'pl-8' : 'pl-4'

  const handleSave = () => {
    if (tempDescription.trim() && tempPrice !== null && tempPrice >= 0) {
      onUpdateItem(item.id, {
        description: tempDescription.trim(),
        price: tempPrice,
      })
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setTempDescription(item.description)
    setTempPrice(item.price)
    setIsEditing(false)
  }

  const handleSelectReference = (referenceType: 'motors' | 'counterparties' | 'subdivisions' | 'wires') => {
    setSelectedReferenceType(referenceType)
    setShowReferenceModal(false)
    setShowItemModal(true)
  }

  const handleSelectItem = (selectedItem: { name: string; price?: number }) => {
    setTempDescription(selectedItem.name)
    if (selectedItem.price !== undefined && selectedItem.price > 0) {
      setTempPrice(selectedItem.price)
    }
    setShowItemModal(false)
  }

  if (isEditing) {
    return (
      <>
        <div className={`bg-indigo-50 p-3 rounded-lg border border-indigo-200 text-sm ${levelPadding}`}>
          <div className="flex space-x-4 mb-2">
            <div className="flex-1">
              <label htmlFor={`desc-${item.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                Описание
              </label>
              <div className="relative">
                <input
                  id={`desc-${item.id}`}
                  type="text"
                  value={tempDescription}
                  onChange={(e) => setTempDescription(e.target.value)}
                  placeholder="Введите описание позиции"
                  className="w-full pr-10 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                />
                <button
                  type="button"
                  onClick={() => setShowReferenceModal(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Выбрать из справочника"
                >
                  <Search size={18} />
                </button>
              </div>
            </div>
            <div className="w-32">
              <NumberInput
                id={`price-${item.id}`}
                label="Цена (₽)"
                value={tempPrice}
                onChange={setTempPrice}
                step={1}
                min={0}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="flex items-center text-gray-500 hover:text-gray-700 transition"
            >
              <X size={16} className="mr-1" /> Отмена
            </button>
            <button
              onClick={handleSave}
              className="flex items-center text-indigo-600 hover:text-indigo-800 font-semibold transition"
              disabled={!tempDescription.trim() || tempPrice === null || tempPrice < 0}
            >
              <Save size={16} className="mr-1" /> Сохранить
            </button>
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

  return (
    <div
      className={`flex items-center justify-between py-2 border-b border-gray-100 text-sm ${levelPadding}`}
    >
      <div className="flex-1 pr-4">
        <p
          className={`font-medium ${
            isIncome ? 'text-green-700' : 'text-red-700'
          }`}
        >
          {isIncome ? 'Доходы' : 'Расходы'}
        </p>
        <p className="text-gray-600 text-xs">{item.description}</p>
      </div>

      <div className="flex items-center space-x-4">
        {/* Price */}
        <span className="w-20 text-right text-gray-700">
          {formatCurrency(item.price)}
        </span>

        {/* Quantity Control */}
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            onClick={() => onQuantityChange(item.id, -1)}
            className="p-1 text-gray-500 hover:bg-gray-100 rounded-l-md disabled:opacity-50"
            disabled={item.quantity <= 1}
          >
            <Minus size={16} />
          </button>
          <span className="px-2 w-8 text-center text-gray-800">
            {item.quantity}
          </span>
          <button
            onClick={() => onQuantityChange(item.id, 1)}
            className="p-1 text-gray-500 hover:bg-gray-100 rounded-r-md"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Total */}
        <span
          className={`w-24 text-right font-semibold ${
            isIncome ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {formatCurrency(total)}
        </span>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-indigo-500 transition"
            title="Редактировать позицию"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="text-gray-400 hover:text-red-500 transition"
            title="Удалить позицию"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
