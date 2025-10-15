import React, { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Plus } from 'lucide-react'
import * as Icons from 'lucide-react'
import { referenceTypeService } from '../../services/referenceTypeService'
import { ReferenceType as DBReferenceType } from '../../types/database'
import { ReferenceTypeForm } from './ReferenceTypeForm'

interface ReferenceSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectReference: (referenceType: 'motors' | 'counterparties' | 'subdivisions' | 'wires' | 'bearings' | 'impellers' | 'labor_payments') => void
}

export const ReferenceSelectionModal: React.FC<ReferenceSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectReference,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [references, setReferences] = useState<DBReferenceType[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadReferences()
    }
  }, [isOpen])

  const loadReferences = async () => {
    setLoading(true)
    try {
      await referenceTypeService.initializeDefaultReferenceTypes()
      const data = await referenceTypeService.fetchReferenceTypes()
      setReferences(data)
    } catch (error) {
      console.error('Error loading reference types:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReferences = references.filter((ref) =>
    ref.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (referenceType: string) => {
    onSelectReference(referenceType as 'motors' | 'counterparties' | 'subdivisions' | 'wires' | 'bearings' | 'impellers' | 'labor_payments')
  }

  const handleSaveNewReference = async (
    newReference: Omit<DBReferenceType, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => {
    await referenceTypeService.createReferenceType(newReference)
    await loadReferences()
    setShowAddForm(false)
  }

  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName]
    return IconComponent ? <IconComponent size={24} /> : <Icons.FileText size={24} />
  }

  if (showAddForm) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Добавить справочник" size="md">
        <ReferenceTypeForm
          onSave={handleSaveNewReference}
          onCancel={() => setShowAddForm(false)}
        />
      </Modal>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Выбор справочника"
      size="md"
    >
      <div className="space-y-4">
        <div>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск"
            autoFocus
            disabled={loading}
          />
        </div>

        {loading ? (
          <div className="py-8 text-center text-gray-500">
            <p>Загрузка справочников...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredReferences.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <p>Справочники не найдены</p>
              </div>
            ) : (
              filteredReferences.map((reference) => (
                <button
                  key={reference.id}
                  onClick={() => handleSelect(reference.type_key)}
                  className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-left"
                >
                  <div className="text-gray-600">{getIcon(reference.icon_name)}</div>
                  <span className="text-sm font-medium text-gray-800">
                    {reference.name}
                  </span>
                </button>
              ))
            )}
          </div>
        )}

        <div className="flex justify-between gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить справочник
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
        </div>
      </div>
    </Modal>
  )
}
