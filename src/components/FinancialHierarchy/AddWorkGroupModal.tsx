import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface AddWorkGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onNext: (groupName: string) => void
}

export const AddWorkGroupModal: React.FC<AddWorkGroupModalProps> = ({
  isOpen,
  onClose,
  onNext,
}) => {
  const [groupName, setGroupName] = useState('')

  const handleNext = () => {
    if (groupName.trim()) {
      onNext(groupName.trim())
      setGroupName('')
    }
  }

  const handleClose = () => {
    setGroupName('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Создать новую группу работ"
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Название группы
          </label>
          <Input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Замена масла"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleNext()
              }
            }}
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={handleClose}>
            Отмена
          </Button>
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!groupName.trim()}
          >
            Далее
          </Button>
        </div>
      </div>
    </Modal>
  )
}
