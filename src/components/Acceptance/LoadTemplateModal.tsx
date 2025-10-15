import React, { useEffect, useState } from 'react'
    import { Modal } from '../ui/Modal'
    import { Button } from '../ui/Button'
    import { Input } from '../ui/Input'
    import { Alert } from '../ui/Alert'
    import { deleteTemplate, getUserTemplates } from '../../services/templateService'
    import { ReceptionTemplate } from '../../types/acceptance'
    import { Book, Download, Loader2, Search, Trash2, X } from 'lucide-react'

    interface LoadTemplateModalProps {
      isOpen: boolean
      onClose: () => void
      onLoad: (templateId: string) => void
    }

    export const LoadTemplateModal: React.FC<LoadTemplateModalProps> = ({
      isOpen,
      onClose,
      onLoad,
    }) => {
      const [templates, setTemplates] = useState<ReceptionTemplate[]>([])
      const [filteredTemplates, setFilteredTemplates] = useState<ReceptionTemplate[]>([])
      const [loading, setLoading] = useState(true)
      const [error, setError] = useState<string | null>(null)
      const [searchTerm, setSearchTerm] = useState('')

      const fetchTemplates = async () => {
        setLoading(true)
        setError(null)
        try {
          const data = await getUserTemplates()
          setTemplates(data || [])
          setFilteredTemplates(data || [])
        } catch (e: any) {
          setError(e.message || 'Не удалось загрузить шаблоны.')
        } finally {
          setLoading(false)
        }
      }

      useEffect(() => {
        if (isOpen) {
          fetchTemplates()
        }
      }, [isOpen])

      useEffect(() => {
        const lowercasedFilter = searchTerm.toLowerCase()
        const filtered = templates.filter(item =>
          item.name.toLowerCase().includes(lowercasedFilter) ||
          item.description?.toLowerCase().includes(lowercasedFilter)
        )
        setFilteredTemplates(filtered)
      }, [searchTerm, templates])

      const handleDelete = async (templateId: string) => {
        if (!confirm('Вы уверены, что хотите удалить этот шаблон? Это действие нельзя отменить.')) {
          return
        }
        try {
          await deleteTemplate(templateId)
          setTemplates(prev => prev.filter(t => t.id !== templateId))
        } catch (e: any) {
          setError(e.message || 'Ошибка удаления шаблона.')
        }
      }

      return (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          title="Загрузить позицию из шаблона"
          icon={<Download className="w-5 h-5 text-blue-600" />}
          className="max-w-2xl"
        >
          <div className="space-y-4">
            {error && <Alert variant="error">{error}</Alert>}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Поиск по названию или описанию..."
                className="pl-10"
              />
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-3">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : filteredTemplates.length > 0 ? (
                filteredTemplates.map(template => (
                  <div key={template.id} className="p-3 border border-gray-200 rounded-lg flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-semibold text-gray-800">{template.name}</p>
                      <p className="text-sm text-gray-500">{template.description}</p>
                      <div className="text-xs text-gray-400 mt-1 space-x-3">
                        <span>Контрагент: {template.counterparty_name}</span>
                        <span>Дата: {new Date(template.created_at).toLocaleDateString()}</span>
                        <span>Позиций: {template.reception_template_items_count || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => onLoad(template.id)}>
                        <Download className="w-4 h-4 mr-1" />
                        Загрузить
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-100" onClick={() => handleDelete(template.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <Book className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Нет шаблонов</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Сохраните позицию как шаблон, чтобы использовать ее в будущем.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )
    }
