import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Search } from 'lucide-react'
import { ReferenceSelectionModal } from '../Acceptance/ReferenceSelectionModal'
import { ReferenceItemSelectionModal } from '../Acceptance/ReferenceItemSelectionModal'

interface AddServiceModalProps {
  isOpen: boolean
  onClose: () => void
  groupName: string
  onSave: (services: Array<{
    name: string
    pricePerUnit: number
    quantity: number
    transactionType: 'Доходы' | 'Расходы'
  }>) => void
}

export const AddServiceModal: React.FC<AddServiceModalProps> = ({
  isOpen,
  onClose,
  groupName,
  onSave,
}) => {
  const [serviceName, setServiceName] = useState('')
  const [quantity, setQuantity] = useState<number>(1)
  const [isIncomeSelected, setIsIncomeSelected] = useState(false)
  const [isExpenseSelected, setIsExpenseSelected] = useState(true)
  const [incomePrice, setIncomePrice] = useState<number>(0)
  const [expensePrice, setExpensePrice] = useState<number>(0)
  const [showReferenceModal, setShowReferenceModal] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [selectedReferenceType, setSelectedReferenceType] = useState<'motors' | 'counterparties' | 'subdivisions' | 'wires' | 'bearings'>('motors')

  const handleSave = () => {
    if (!serviceName.trim() || quantity <= 0 || (!isIncomeSelected && !isExpenseSelected)) {
      return
    }

    if (isIncomeSelected && incomePrice <= 0) {
      return
    }

    if (isExpenseSelected && expensePrice <= 0) {
      return
    }

    const services = []

    if (isIncomeSelected) {
      services.push({
        name: serviceName.trim(),
        pricePerUnit: Math.abs(incomePrice),
        quantity,
        transactionType: 'Доходы' as const,
      })
    }

    if (isExpenseSelected) {
      services.push({
        name: serviceName.trim(),
        pricePerUnit: -Math.abs(expensePrice),
        quantity,
        transactionType: 'Расходы' as const,
      })
    }

    onSave(services)
    handleReset()
  }

  const handleReset = () => {
    setServiceName('')
    setQuantity(1)
    setIsIncomeSelected(false)
    setIsExpenseSelected(true)
    setIncomePrice(0)
    setExpensePrice(0)
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const handleSelectReference = (referenceType: 'motors' | 'counterparties' | 'subdivisions' | 'wires' | 'bearings') => {
    setSelectedReferenceType(referenceType)
    setShowReferenceModal(false)
    setShowItemModal(true)
  }

  const handleSelectItem = (item: { name: string; price?: number }) => {
    setServiceName(item.name)
    if (item.price !== undefined && item.price > 0) {
      if (isIncomeSelected) {
        setIncomePrice(item.price)
      }
      if (isExpenseSelected) {
        setExpensePrice(item.price)
      }
    }
    setShowItemModal(false)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Новая позиция в группе "${groupName}"`}
      size="lg"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Название услуги/материала
          </label>
          <div className="relative">
            <Input
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="Замена масла1"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowReferenceModal(true)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Выбрать из справочника"
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Количество
          </label>
          <Input
            type="number"
            value={quantity || ''}
            onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
            placeholder="1"
            min="0"
            step="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Тип операции
          </label>
          <div className="space-y-3">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={isIncomeSelected}
                onChange={(e) => setIsIncomeSelected(e.target.checked)}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700">Доход</span>
                {isIncomeSelected && (
                  <div className="mt-2">
                    <Input
                      type="number"
                      value={incomePrice || ''}
                      onChange={(e) => setIncomePrice(parseFloat(e.target.value) || 0)}
                      placeholder="Цена дохода (в рублях)"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
              </div>
            </label>
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={isExpenseSelected}
                onChange={(e) => setIsExpenseSelected(e.target.checked)}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700">Расход</span>
                {isExpenseSelected && (
                  <div className="mt-2">
                    <Input
                      type="number"
                      value={expensePrice || ''}
                      onChange={(e) => setExpensePrice(parseFloat(e.target.value) || 0)}
                      placeholder="Цена расхода (в рублях)"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">
            Дополнительная информация (необязательно)
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={handleClose}>
            Отмена
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={
              !serviceName.trim() ||
              quantity <= 0 ||
              (!isIncomeSelected && !isExpenseSelected) ||
              (isIncomeSelected && incomePrice <= 0) ||
              (isExpenseSelected && expensePrice <= 0)
            }
          >
            Сохранить
          </Button>
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
    </Modal>
  )
}
