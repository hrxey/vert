import React, { useState } from 'react'
    import { AppLayout } from '../../components/Layout/AppLayout'
    import { Button } from '../../components/ui/Button'
    import { Bookmark, Download, Save } from 'lucide-react'
    import { ReceptionExcelUploader } from '../../components/FinancialHierarchy/ReceptionExcelUploader'
    import { ReceptionPreview } from '../../components/FinancialHierarchy/ReceptionPreview'
    import { ReceptionExcelRow } from '../../utils/parseReceptionExcel'
    import { saveReceptionData } from '../../services/receptionService'
    import { Alert } from '../../components/ui/Alert'
    import { AddWorkGroupModal } from '../../components/FinancialHierarchy/AddWorkGroupModal'
    import { AddServiceModal } from '../../components/FinancialHierarchy/AddServiceModal'
    import { SaveTemplateModal } from '../../components/Acceptance/SaveTemplateModal'
    import { LoadTemplateModal } from '../../components/Acceptance/LoadTemplateModal'
    import { getTemplateById, savePositionAsTemplate } from '../../services/templateService'

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

    export const NewAcceptance: React.FC = () => {
      const [receptionData, setReceptionData] = useState<ReceptionExcelRow[]>([])
      const [loading, setLoading] = useState(false)
      const [saving, setSaving] = useState(false)
      const [successMessage, setSuccessMessage] = useState<string | null>(null)
      const [errorMessage, setErrorMessage] = useState<string | null>(null)
      const [showAddGroupModal, setShowAddGroupModal] = useState(false)
      const [showAddServiceModal, setShowAddServiceModal] = useState(false)
      const [currentGroupName, setCurrentGroupName] = useState('')
      const [currentPositionNumber, setCurrentPositionNumber] = useState<number | null>(null)

      // State for template functionality
      const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false)
      const [showLoadTemplateModal, setShowLoadTemplateModal] = useState(false)
      const [selectedPositionForTemplate, setSelectedPositionForTemplate] = useState<number | null>(null)

      const handleDataUpload = (data: ReceptionExcelRow[]) => {
        setReceptionData(data)
        setSuccessMessage(null)
        setErrorMessage(null)
      }

      const handleSave = async () => {
        if (receptionData.length === 0) {
          setErrorMessage('Нет данных для сохранения')
          return
        }

        setSaving(true)
        setErrorMessage(null)
        setSuccessMessage(null)

        try {
          await saveReceptionData(receptionData)
          setSuccessMessage('Данные успешно сохранены в базу данных')
          setReceptionData([])
        } catch (error: any) {
          setErrorMessage(error.message || 'Ошибка сохранения данных')
        } finally {
          setSaving(false)
        }
      }

      const handleAddGroupClick = () => {
        setCurrentPositionNumber(null)
        setShowAddGroupModal(true)
      }

      const handleAddItemToGroup = (positionNumber: number, workGroup: string) => {
        setCurrentPositionNumber(positionNumber)
        setCurrentGroupName(workGroup)
        setShowAddServiceModal(true)
      }

      const handleGroupNext = (groupName: string) => {
        setCurrentGroupName(groupName)
        setShowAddGroupModal(false)
        setShowAddServiceModal(true)
      }

      const handleServiceSave = (services: Array<{
        name: string
        pricePerUnit: number
        quantity: number
        transactionType: 'Доходы' | 'Расходы'
      }>) => {
        if (receptionData.length === 0) {
          setErrorMessage('Невозможно добавить группу работ. Сначала загрузите данные о приемке.')
          setShowAddServiceModal(false)
          setCurrentGroupName('')
          setCurrentPositionNumber(null)
          return
        }

        const targetPositionNumber = currentPositionNumber !== null
          ? currentPositionNumber
          : receptionData[0].positionNumber

        const positionItems = receptionData.filter(item => item.positionNumber === targetPositionNumber)
        if (positionItems.length === 0) {
          setErrorMessage('Не найдена позиция для добавления')
          setShowAddServiceModal(false)
          setCurrentGroupName('')
          setCurrentPositionNumber(null)
          return
        }

        const firstItem = positionItems[0]

        const newRows: ReceptionExcelRow[] = services.map(service => ({
          receptionId: crypto.randomUUID(),
          receptionDate: firstItem.receptionDate,
          receptionNumber: firstItem.receptionNumber,
          counterpartyName: firstItem.counterpartyName,
          subdivisionName: firstItem.subdivisionName,
          positionNumber: targetPositionNumber,
          serviceName: firstItem.serviceName,
          itemName: service.name,
          workGroup: currentGroupName,
          transactionType: service.transactionType,
          price: service.pricePerUnit,
          quantity: service.quantity,
          motorInventoryNumber: firstItem.motorInventoryNumber,
        }))

        setReceptionData([...receptionData, ...newRows])
        setShowAddServiceModal(false)
        setCurrentGroupName('')
        setCurrentPositionNumber(null)
        const itemCount = services.length
        setSuccessMessage(`Добавлено ${itemCount} ${itemCount === 1 ? 'позиция' : itemCount < 5 ? 'позиции' : 'позиций'} в группу "${currentGroupName}"`)
      }

      const handleDuplicatePosition = (positionNumber: number) => {
        const positionItems = receptionData.filter(item => item.positionNumber === positionNumber)

        if (positionItems.length === 0) return

        const maxPositionNumber = Math.max(0, ...receptionData.map(item => item.positionNumber))
        const newPositionNumber = maxPositionNumber + 1

        const duplicatedItems = positionItems.map(item => ({
          ...item,
          receptionId: crypto.randomUUID(),
          positionNumber: newPositionNumber,
        }))

        setReceptionData([...receptionData, ...duplicatedItems])
        setSuccessMessage(`Позиция ${positionNumber} продублирована как позиция ${newPositionNumber}`)
      }

      const handleDeletePosition = (positionNumber: number) => {
        if (!confirm(`Вы уверены, что хотите удалить позицию ${positionNumber}? Это действие нельзя отменить.`)) {
          return
        }

        const newData = receptionData.filter(item => item.positionNumber !== positionNumber)
        setReceptionData(newData)
        setSuccessMessage(`Позиция ${positionNumber} успешно удалена`)
      }

      const handleReceptionNumberUpdate = (newReceptionNumber: string) => {
        const newData = receptionData.map(item => ({
          ...item,
          receptionNumber: newReceptionNumber
        }))
        setReceptionData(newData)
        setSuccessMessage(`Номер приемки изменен на "${newReceptionNumber}"`)
      }

      const handleReceptionDateUpdate = (newReceptionDate: string) => {
        const newData = receptionData.map(item => ({
          ...item,
          receptionDate: newReceptionDate
        }))
        setReceptionData(newData)
        setSuccessMessage(`Дата приемки изменена на "${formatDate(newReceptionDate)}"`)
      }

      const handleCounterpartyUpdate = (newCounterpartyName: string) => {
        const newData = receptionData.map(item => ({
          ...item,
          counterpartyName: newCounterpartyName
        }))
        setReceptionData(newData)
        setSuccessMessage(`Контрагент изменен на "${newCounterpartyName}"`)
      }

      // --- Template Handlers ---

      const handleOpenSaveTemplateModal = (positionNumber: number) => {
        setSelectedPositionForTemplate(positionNumber)
        setShowSaveTemplateModal(true)
      }

      const handleSaveTemplate = async ({ name, description }: { name: string; description?: string }) => {
        if (selectedPositionForTemplate === null) {
          throw new Error('Позиция для сохранения не выбрана.')
        }
        const positionData = receptionData.filter(item => item.positionNumber === selectedPositionForTemplate)
        await savePositionAsTemplate(positionData, name, description)
        setSuccessMessage(`Позиция ${selectedPositionForTemplate} успешно сохранена как шаблон "${name}".`)
        setSelectedPositionForTemplate(null)
      }

      const handleLoadTemplate = async (templateId: string) => {
        try {
          setLoading(true)
          const template = await getTemplateById(templateId)

          const maxPositionNumber = Math.max(0, ...receptionData.map(item => item.positionNumber))
          const newPositionNumber = maxPositionNumber + 1

          const firstCurrentRow = receptionData.length > 0 ? receptionData[0] : null
          const currentDate = new Date().toISOString().split('T')[0]

          const newRows: ReceptionExcelRow[] = template.reception_template_items.map(item => ({
            receptionId: crypto.randomUUID(),
            receptionDate: firstCurrentRow?.receptionDate || currentDate,
            receptionNumber: firstCurrentRow?.receptionNumber || 'Необходимо заполнить значение',
            counterpartyName: firstCurrentRow?.counterpartyName || 'Необходимо заполнить контрагента',
            subdivisionName: item.subdivision_name,
            positionNumber: newPositionNumber,
            serviceName: item.service_name,
            itemName: item.item_name,
            workGroup: item.work_group,
            transactionType: item.transaction_type as 'Доходы' | 'Расходы',
            price: item.price,
            quantity: item.quantity,
            motorInventoryNumber: item.motor_inventory_number || '',
          }))

          setReceptionData(prev => [...prev, ...newRows])
          setSuccessMessage(`Шаблон "${template.name}" загружен как позиция ${newPositionNumber}.`)
          setShowLoadTemplateModal(false)
        } catch (error: any) {
          setErrorMessage(error.message || 'Ошибка загрузки шаблона.')
        } finally {
          setLoading(false)
        }
      }

      const selectedPositionData = selectedPositionForTemplate !== null
        ? receptionData.filter(item => item.positionNumber === selectedPositionForTemplate)
        : null

      return (
        <AppLayout
          title="Новая Приемка"
          breadcrumbs={[
            { label: 'Создать приемку', path: '/app/acceptance' },
            { label: 'Новый Заказ', path: '/app/acceptance/new' },
          ]}
        >
          <div className="space-y-6">
            {successMessage && (
              <Alert variant="success" onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>
            )}
            {errorMessage && <Alert variant="error" onClose={() => setErrorMessage(null)}>{errorMessage}</Alert>}

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Собранные Позиции
                </h2>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={() => setShowLoadTemplateModal(true)}>
                    <Download className="w-4 h-4 mr-2" />
                    Загрузить из шаблона
                  </Button>
                  <ReceptionExcelUploader
                    onDataUpload={handleDataUpload}
                    setLoading={setLoading}
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Загрузка данных...</p>
                </div>
              ) : (
                <ReceptionPreview
                  data={receptionData}
                  onDataChange={setReceptionData}
                  onAddGroupClick={receptionData.length > 0 ? handleAddGroupClick : undefined}
                  onDuplicatePosition={receptionData.length > 0 ? handleDuplicatePosition : undefined}
                  onDeletePosition={receptionData.length > 0 ? handleDeletePosition : undefined}
                  onAddItemToGroup={receptionData.length > 0 ? handleAddItemToGroup : undefined}
                  onSaveAsTemplate={receptionData.length > 0 ? handleOpenSaveTemplateModal : undefined}
                  onReceptionNumberUpdate={receptionData.length > 0 ? handleReceptionNumberUpdate : undefined}
                  onReceptionDateUpdate={receptionData.length > 0 ? handleReceptionDateUpdate : undefined}
                  onCounterpartyUpdate={receptionData.length > 0 ? handleCounterpartyUpdate : undefined}
                />
              )}
            </div>

            {receptionData.length > 0 && (
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <Button
                  variant="secondary"
                  onClick={() => setReceptionData([])}
                  disabled={saving}
                >
                  Отмена
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1" />
                      Сохранить позиции
                    </>
                  )}
                </Button>
              </div>
            )}

            <AddWorkGroupModal
              isOpen={showAddGroupModal}
              onClose={() => setShowAddGroupModal(false)}
              onNext={handleGroupNext}
            />

            <AddServiceModal
              isOpen={showAddServiceModal}
              onClose={() => {
                setShowAddServiceModal(false)
                setCurrentGroupName('')
                setCurrentPositionNumber(null)
              }}
              groupName={currentGroupName}
              onSave={handleServiceSave}
            />

            <SaveTemplateModal
              isOpen={showSaveTemplateModal}
              onClose={() => setShowSaveTemplateModal(false)}
              onSave={handleSaveTemplate}
              positionData={selectedPositionData}
            />

            <LoadTemplateModal
              isOpen={showLoadTemplateModal}
              onClose={() => setShowLoadTemplateModal(false)}
              onLoad={handleLoadTemplate}
            />
          </div>
        </AppLayout>
      )
    }
