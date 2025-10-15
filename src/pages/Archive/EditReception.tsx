import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/Layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import {
  getReceptionById,
  updateReceptionItem,
  deleteReceptionItem,
  addReceptionItem,
  updateReceptionHeader,
  duplicateMotor,
  deleteMotor,
  updateMotorServiceName,
  updateMotorSubdivision,
} from '../../services/receptionService'
import { ArrowLeft, Download } from 'lucide-react'
import {
  EditableReceptionPreview,
  Reception,
  ReceptionItem,
} from '../../components/FinancialHierarchy/EditableReceptionPreview'
import { AddWorkGroupModal } from '../../components/FinancialHierarchy/AddWorkGroupModal'
import { AddServiceModal } from '../../components/FinancialHierarchy/AddServiceModal'
import { SaveTemplateModal } from '../../components/Acceptance/SaveTemplateModal'
import { LoadTemplateModal } from '../../components/Acceptance/LoadTemplateModal'
import { getTemplateById, savePositionAsTemplate } from '../../services/templateService'
import { ReceptionExcelRow } from '../../utils/parseReceptionExcel'
import { supabase } from '../../lib/supabase'

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

export const EditReception: React.FC = () => {
  const { receptionId } = useParams<{ receptionId: string }>()
  const navigate = useNavigate()
  const [reception, setReception] = useState<Reception | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [showAddGroupModal, setShowAddGroupModal] = useState(false)
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
  const [currentGroupName, setCurrentGroupName] = useState('')
  const [currentMotorId, setCurrentMotorId] = useState<string | null>(null)
  const [currentWorkGroup, setCurrentWorkGroup] = useState<string | null>(null)

  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false)
  const [showLoadTemplateModal, setShowLoadTemplateModal] = useState(false)
  const [selectedMotorForTemplate, setSelectedMotorForTemplate] = useState<string | null>(null)

  useEffect(() => {
    loadReception()
  }, [receptionId])

  const loadReception = async () => {
    if (!receptionId) return

    try {
      setLoading(true)
      setError(null)
      const data = await getReceptionById(receptionId)
      setReception(data as Reception)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки приемки')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateItem = async (itemId: string, updates: Partial<ReceptionItem>) => {
    try {
      await updateReceptionItem(itemId, updates)
      await loadReception()
      setSuccessMessage('Позиция успешно обновлена')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления позиции')
      throw err
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      if (!confirm('Вы уверены, что хотите удалить эту позицию?')) return
      await deleteReceptionItem(itemId)
      await loadReception()
      setSuccessMessage('Позиция успешно удалена')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления позиции')
      throw err
    }
  }

  const handleAddItem = async (
    motorId: string,
    item: Omit<ReceptionItem, 'id' | 'upd_document_id'>
  ) => {
    try {
      await addReceptionItem(motorId, item)
      await loadReception()
      setSuccessMessage('Позиция успешно добавлена')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка добавления позиции')
      throw err
    }
  }

  const handleReceptionNumberUpdate = async (newReceptionNumber: string) => {
    if (!receptionId) return
    try {
      await updateReceptionHeader(receptionId, { reception_number: newReceptionNumber })
      await loadReception()
      setSuccessMessage(`Номер приемки изменен на "${newReceptionNumber}"`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления номера приемки')
    }
  }

  const handleReceptionDateUpdate = async (newReceptionDate: string) => {
    if (!receptionId) return
    try {
      await updateReceptionHeader(receptionId, { reception_date: newReceptionDate })
      await loadReception()
      setSuccessMessage(`Дата приемки изменена на "${formatDate(newReceptionDate)}"`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления даты приемки')
    }
  }

  const handleCounterpartyUpdate = async (counterpartyId: string) => {
    if (!receptionId) return
    try {
      await updateReceptionHeader(receptionId, { counterparty_id: counterpartyId })
      await loadReception()
      setSuccessMessage('Контрагент успешно изменен')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления контрагента')
    }
  }

  const handleAddGroupClick = (motorId: string) => {
    setCurrentMotorId(motorId)
    setCurrentWorkGroup(null)
    setShowAddGroupModal(true)
  }

  const handleAddItemToGroup = (motorId: string, workGroup: string) => {
    setCurrentMotorId(motorId)
    setCurrentWorkGroup(workGroup)
    setCurrentGroupName(workGroup)
    setShowAddServiceModal(true)
  }

  const handleGroupNext = (groupName: string) => {
    setCurrentGroupName(groupName)
    setShowAddGroupModal(false)
    setShowAddServiceModal(true)
  }

  const handleServiceSave = async (services: Array<{
    name: string
    pricePerUnit: number
    quantity: number
    transactionType: 'Доходы' | 'Расходы'
  }>) => {
    if (!currentMotorId) {
      setError('Не выбран двигатель для добавления позиции')
      return
    }

    const workGroup = currentWorkGroup || currentGroupName

    try {
      for (const service of services) {
        await addReceptionItem(currentMotorId, {
          item_description: service.name,
          work_group: workGroup,
          transaction_type: service.transactionType,
          quantity: service.quantity,
          price: service.pricePerUnit,
        })
      }
      await loadReception()
      setShowAddServiceModal(false)
      setCurrentGroupName('')
      setCurrentMotorId(null)
      setCurrentWorkGroup(null)
      const itemCount = services.length
      setSuccessMessage(`Добавлено ${itemCount} ${itemCount === 1 ? 'позиция' : itemCount < 5 ? 'позиции' : 'позиций'} в группу "${workGroup}"`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка добавления позиции')
    }
  }

  const handleDuplicatePosition = async (motorId: string) => {
    try {
      const duplicatedMotor = await duplicateMotor(motorId)
      await loadReception()
      setSuccessMessage(`Позиция продублирована как позиция ${duplicatedMotor.position_in_reception}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка дублирования позиции')
    }
  }

  const handleDeletePosition = async (motorId: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту позицию? Это действие нельзя отменить.')) {
      return
    }

    try {
      await deleteMotor(motorId)
      await loadReception()
      setSuccessMessage('Позиция успешно удалена')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления позиции')
    }
  }

  const handleServiceNameUpdate = async (motorId: string, newServiceName: string) => {
    try {
      await updateMotorServiceName(motorId, newServiceName)
      await loadReception()
      setSuccessMessage(`Название позиции изменено на "${newServiceName}"`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления названия позиции')
    }
  }

  const handleSubdivisionNameUpdate = async (motorId: string, newSubdivisionName: string) => {
    try {
      await updateMotorSubdivision(motorId, newSubdivisionName)
      await loadReception()
      setSuccessMessage(`Подразделение изменено на "${newSubdivisionName}"`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления подразделения')
    }
  }

  const handleOpenSaveTemplateModal = (motorId: string) => {
    setSelectedMotorForTemplate(motorId)
    setShowSaveTemplateModal(true)
  }

  const handleSaveTemplate = async ({ name, description }: { name: string; description?: string }) => {
    if (!selectedMotorForTemplate || !reception) {
      throw new Error('Позиция для сохранения не выбрана.')
    }

    const motor = reception.motors.find((m) => m.id === selectedMotorForTemplate)
    if (!motor) {
      throw new Error('Двигатель не найден.')
    }

    const positionData: ReceptionExcelRow[] = motor.items.map((item) => ({
      receptionId: crypto.randomUUID(),
      receptionDate: reception.reception_date,
      receptionNumber: reception.reception_number,
      counterpartyName: reception.counterparties.name,
      subdivisionName: motor.subdivisions.name,
      positionNumber: motor.position_in_reception,
      serviceName: motor.motor_service_description,
      itemName: item.item_description,
      workGroup: item.work_group,
      transactionType: item.transaction_type,
      price: item.price,
      quantity: item.quantity,
      motorInventoryNumber: motor.motor_inventory_number,
    }))

    await savePositionAsTemplate(positionData, name, description)
    setSuccessMessage(`Позиция ${motor.position_in_reception} успешно сохранена как шаблон "${name}".`)
    setSelectedMotorForTemplate(null)
  }

  const handleLoadTemplate = async (templateId: string) => {
    if (!reception || !receptionId) return

    try {
      setLoading(true)
      const template = await getTemplateById(templateId)

      const subdivisionName = template.reception_template_items[0]?.subdivision_name
      const serviceName = template.reception_template_items[0]?.service_name
      const motorInventoryNumber = template.reception_template_items[0]?.motor_inventory_number || ''

      const maxPosition = Math.max(0, ...reception.motors.map((m) => m.position_in_reception))
      const newPosition = maxPosition + 1

      let { data: subdivision, error: subdivisionError } = await supabase
        .from('subdivisions')
        .select('id')
        .eq('name', subdivisionName)
        .maybeSingle()

      if (subdivisionError) {
        throw new Error(`Ошибка поиска подразделения: ${subdivisionError.message}`)
      }

      if (!subdivision) {
        const { data: newSubdivision, error: createError } = await supabase
          .from('subdivisions')
          .insert({
            name: subdivisionName,
            code: '',
            description: '',
          })
          .select()
          .single()

        if (createError) {
          throw new Error(`Ошибка создания подразделения: ${createError.message}`)
        }

        subdivision = newSubdivision
      }

      const { data: newMotor, error: motorError } = await supabase
        .from('accepted_motors')
        .insert({
          reception_id: receptionId,
          subdivision_id: subdivision.id,
          position_in_reception: newPosition,
          motor_service_description: serviceName,
          motor_inventory_number: motorInventoryNumber,
        })
        .select()
        .single()

      if (motorError) {
        throw new Error(`Ошибка создания двигателя: ${motorError.message}`)
      }

      const itemsToInsert = template.reception_template_items.map((item) => ({
        accepted_motor_id: newMotor.id,
        item_description: item.item_name,
        work_group: item.work_group,
        transaction_type: item.transaction_type,
        quantity: item.quantity,
        price: item.price,
      }))

      const { error: itemsError } = await supabase
        .from('reception_items')
        .insert(itemsToInsert)

      if (itemsError) {
        throw new Error(`Ошибка добавления позиций: ${itemsError.message}`)
      }

      await loadReception()
      setSuccessMessage(`Шаблон "${template.name}" загружен как позиция ${newPosition}.`)
      setShowLoadTemplateModal(false)
    } catch (error: any) {
      setError(error.message || 'Ошибка загрузки шаблона.')
    } finally {
      setLoading(false)
    }
  }

  const selectedMotorData = selectedMotorForTemplate && reception
    ? reception.motors.find((m) => m.id === selectedMotorForTemplate)
    : null

  const selectedPositionData = selectedMotorData
    ? selectedMotorData.items.map((item) => ({
        receptionId: crypto.randomUUID(),
        receptionDate: reception!.reception_date,
        receptionNumber: reception!.reception_number,
        counterpartyName: reception!.counterparties.name,
        subdivisionName: selectedMotorData.subdivisions.name,
        positionNumber: selectedMotorData.position_in_reception,
        serviceName: selectedMotorData.motor_service_description,
        itemName: item.item_description,
        workGroup: item.work_group,
        transactionType: item.transaction_type,
        price: item.price,
        quantity: item.quantity,
        motorInventoryNumber: selectedMotorData.motor_inventory_number,
      }))
    : null

  if (loading && !reception) {
    return (
      <AppLayout title="Загрузка...">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Загрузка приемки...</div>
        </div>
      </AppLayout>
    )
  }

  if (!reception) {
    return (
      <AppLayout title="Ошибка">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Приемка не найдена</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title={`Редактирование приемки ${reception.reception_number}`}
      breadcrumbs={[
        { label: 'Архив Приемок', path: '/app/archive' },
        {
          label: `Приемка ${reception.reception_number}`,
          path: `/app/archive/${reception.id}`,
        },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/app/archive')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к списку
          </Button>
          <Button variant="outline" onClick={() => setShowLoadTemplateModal(true)}>
            <Download className="w-4 h-4 mr-2" />
            Загрузить из шаблона
          </Button>
        </div>

        {successMessage && (
          <Alert variant="success" onClose={() => setSuccessMessage(null)}>
            {successMessage}
          </Alert>
        )}

        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <EditableReceptionPreview
          reception={reception}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onAddItem={handleAddItem}
          onReceptionNumberUpdate={handleReceptionNumberUpdate}
          onReceptionDateUpdate={handleReceptionDateUpdate}
          onCounterpartyUpdate={handleCounterpartyUpdate}
          onServiceNameUpdate={handleServiceNameUpdate}
          onSubdivisionNameUpdate={handleSubdivisionNameUpdate}
          onAddGroupClick={handleAddGroupClick}
          onDuplicatePosition={handleDuplicatePosition}
          onDeletePosition={handleDeletePosition}
          onAddItemToGroup={handleAddItemToGroup}
          onSaveAsTemplate={handleOpenSaveTemplateModal}
        />

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
            setCurrentMotorId(null)
            setCurrentWorkGroup(null)
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
