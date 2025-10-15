import React, { useState, useMemo } from 'react'
import { Modal } from '../ui/Modal'
import { Search } from 'lucide-react'

interface Reception {
  id: string
  reception_number: string
  reception_date: string
}

interface ReceptionSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  receptions: Reception[]
  selectedReceptionIds: string[]
  onSelect: (receptionIds: string[]) => void
}

export const ReceptionSelectionModal: React.FC<
  ReceptionSelectionModalProps
> = ({ isOpen, onClose, receptions, selectedReceptionIds, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [localSelection, setLocalSelection] = useState<string[]>([])

  React.useEffect(() => {
    if (isOpen) {
      setLocalSelection(selectedReceptionIds)
    }
  }, [isOpen, selectedReceptionIds])

  const filteredReceptions = useMemo(() => {
    if (!searchTerm) {
      return receptions
    }
    const lowercasedFilter = searchTerm.toLowerCase()
    return receptions.filter(rec =>
      rec.reception_number.toLowerCase().includes(lowercasedFilter),
    )
  }, [receptions, searchTerm])

  const handleToggleReception = (receptionId: string) => {
    setLocalSelection(prev => {
      if (prev.includes(receptionId)) {
        return prev.filter(id => id !== receptionId)
      } else {
        return [...prev, receptionId]
      }
    })
  }

  const handleClearSelection = () => {
    setLocalSelection([])
  }

  const handleApply = () => {
    onSelect(localSelection)
    onClose()
  }

  const handleSelectAll = () => {
    if (localSelection.length === filteredReceptions.length) {
      setLocalSelection([])
    } else {
      setLocalSelection(filteredReceptions.map(rec => rec.id))
    }
  }

  const allSelected = filteredReceptions.length > 0 && localSelection.length === filteredReceptions.length
  const someSelected = localSelection.length > 0 && localSelection.length < filteredReceptions.length

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Выбор Приемки" size="lg">
      <div className="space-y-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="w-5 h-5 text-gray-400" />
          </span>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Поиск по номеру приемки..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) input.indeterminate = someSelected
                }}
                onChange={handleSelectAll}
                className="rounded border-gray-400 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                {localSelection.length === 0 ? 'Выбрать все' : `Выбрано: ${localSelection.length}`}
              </span>
            </div>
            {localSelection.length > 0 && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Очистить
              </button>
            )}
          </div>

          <div className="max-h-[50vh] overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
            {filteredReceptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Приемки не найдены
              </div>
            ) : (
              filteredReceptions.map(rec => (
                <label
                  key={rec.id}
                  className={`flex items-start gap-3 px-4 py-3 rounded-lg border transition-colors cursor-pointer ${
                    localSelection.includes(rec.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={localSelection.includes(rec.id)}
                    onChange={() => handleToggleReception(rec.id)}
                    className="mt-0.5 rounded border-gray-400 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{rec.reception_number}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(rec.reception_date).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Применить
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            Отмена
          </button>
        </div>
      </div>
    </Modal>
  )
}
