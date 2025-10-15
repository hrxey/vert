import React, { useState, useMemo } from 'react'
import { Modal } from '../ui/Modal'
import { Search } from 'lucide-react'

interface Subdivision {
  id: string
  name: string
  code: string
}

interface SubdivisionSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  subdivisions: Subdivision[]
  selectedSubdivisionId: string
  onSelect: (subdivisionId: string) => void
}

export const SubdivisionSelectionModal: React.FC<
  SubdivisionSelectionModalProps
> = ({ isOpen, onClose, subdivisions, selectedSubdivisionId, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredSubdivisions = useMemo(() => {
    if (!searchTerm) {
      return subdivisions
    }
    const lowercasedFilter = searchTerm.toLowerCase()
    return subdivisions.filter(
      sub =>
        sub.name.toLowerCase().includes(lowercasedFilter) ||
        sub.code.toLowerCase().includes(lowercasedFilter),
    )
  }, [subdivisions, searchTerm])

  const handleSelect = (subdivisionId: string) => {
    onSelect(subdivisionId)
  }

  const handleClearSelection = () => {
    onSelect('')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Выбор Подразделения" size="lg">
      <div className="space-y-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="w-5 h-5 text-gray-400" />
          </span>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Поиск по наименованию или коду..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <button
            onClick={handleClearSelection}
            className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
              selectedSubdivisionId === ''
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="font-medium text-sm">Все подразделения</div>
          </button>

          <div className="max-h-[50vh] overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
            {filteredSubdivisions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Подразделения не найдены
              </div>
            ) : (
              filteredSubdivisions.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => handleSelect(sub.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                    selectedSubdivisionId === sub.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-sm">{sub.name}</div>
                  <div className="text-xs text-gray-500 mt-1">Код: {sub.code}</div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
