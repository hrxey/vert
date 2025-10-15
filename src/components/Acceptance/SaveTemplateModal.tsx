import React, { useState } from 'react'
    import { Modal } from '../ui/Modal'
    import { Button } from '../ui/Button'
    import { Input } from '../ui/Input'
    import { Textarea } from '../ui/Textarea'
    import { Alert } from '../ui/Alert'
    import { ReceptionExcelRow } from '../../utils/parseReceptionExcel'
    import { Bookmark } from 'lucide-react'

    interface SaveTemplateModalProps {
      isOpen: boolean
      onClose: () => void
      onSave: (details: { name: string; description?: string }) => Promise<void>
      positionData: ReceptionExcelRow[] | null
    }

    export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
      isOpen,
      onClose,
      onSave,
      positionData,
    }) => {
      const [name, setName] = useState('')
      const [description, setDescription] = useState('')
      const [loading, setLoading] = useState(false)
      const [error, setError] = useState<string | null>(null)

      const handleSave = async () => {
        if (!name.trim()) {
          setError('Название шаблона обязательно для заполнения.')
          return
        }
        setError(null)
        setLoading(true)
        try {
          await onSave({ name, description })
          setName('')
          setDescription('')
          onClose()
        } catch (e: any) {
          setError(e.message || 'Не удалось сохранить шаблон.')
        } finally {
          setLoading(false)
        }
      }

      const positionInfo = positionData ? positionData[0] : null

      return (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          title="Сохранить позицию как шаблон"
          icon={<Bookmark className="w-5 h-5 text-blue-600" />}
        >
          <div className="space-y-4">
            {error && <Alert variant="error">{error}</Alert>}
            {positionInfo && (
              <div className="p-3 bg-gray-50 rounded-md border border-gray-200 text-sm">
                <p><strong>Позиция:</strong> {positionInfo.positionNumber}</p>
                <p><strong>Сервис:</strong> {positionInfo.serviceName}</p>
                <p><strong>Кол-во элементов:</strong> {positionData?.length}</p>
              </div>
            )}
            <div>
              <label htmlFor="template-name" className="block text-sm font-medium text-gray-700 mb-1">
                Название шаблона <span className="text-red-500">*</span>
              </label>
              <Input
                id="template-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например, 'Стандартный ремонт АОЛ-22'"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="template-description" className="block text-sm font-medium text-gray-700 mb-1">
                Описание (необязательно)
              </label>
              <Textarea
                id="template-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Краткое описание для чего этот шаблон"
                rows={3}
                disabled={loading}
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="secondary" onClick={onClose} disabled={loading}>
                Отмена
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={loading}>
                {loading ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </div>
        </Modal>
      )
    }
