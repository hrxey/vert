import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/Layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import {
  getMotorDetails,
  MotorDetails,
  MotorDetailsItem,
  updateMotorItem,
  deleteMotorItem,
  addMotorItem,
  updateMotorServiceDescription,
  updateMotorSubdivision,
} from '../../services/motorDetailsService'
import { ArrowLeft } from 'lucide-react'
import { EditableMotorDetails } from '../../components/Motors/EditableMotorDetails'
import { AddWorkGroupModal } from '../../components/FinancialHierarchy/AddWorkGroupModal'
import { AddServiceModal } from '../../components/FinancialHierarchy/AddServiceModal'

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

export const EditMotorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [motorData, setMotorData] = useState<MotorDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [showAddGroupModal, setShowAddGroupModal] = useState(false)
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)
  const [currentGroupName, setCurrentGroupName] = useState('')
  const [currentWorkGroup, setCurrentWorkGroup] = useState<string | null>(null)

  useEffect(() => {
    loadMotorDetails()
  }, [id])

  const loadMotorDetails = async () => {
    if (!id) {
      setError('ID двигателя не указан')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await getMotorDetails(id)

      if (!data) {
        setError('Двигатель не найден')
      } else {
        setMotorData(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных о двигателе')
    } finally {
      setLoading(false)
    }
  }

  const canEdit = motorData?.items.some(item => !item.upd_document_id) ?? false

  const handleUpdateItem = async (itemIndex: number, updates: Partial<MotorDetailsItem>) => {
    if (!motorData) return

    const item = motorData.items[itemIndex]
    if (!item) return

    try {
      await updateMotorItem(item.item_id, updates)
      await loadMotorDetails()
      setSuccessMessage('Позиция успешно обновлена')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления позиции')
      setTimeout(() => setError(null), 5000)
    }
  }

  const handleItemNameUpdate = async (itemIndex: number, newName: string) => {
    if (!motorData) return

    const item = motorData.items[itemIndex]
    if (!item) return

    const oldBaseName = item.item_description.split('_ID_')[0].trim()

    try {
      for (const motorItem of motorData.items) {
        const currentBaseName = motorItem.item_description.split('_ID_')[0].trim()
        if (currentBaseName === oldBaseName) {
          const idPart = motorItem.item_description.includes('_ID_')
            ? motorItem.item_description.split('_ID_')[1]
            : ''
          const newItemName = idPart ? `${newName}_ID_${idPart}` : newName
          await updateMotorItem(motorItem.item_id, { item_description: newItemName })
        }
      }
      await loadMotorDetails()
      setSuccessMessage('Название позиции успешно обновлено')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления названия')
      setTimeout(() => setError(null), 5000)
    }
  }

  const handleDeleteItem = async (itemIndex: number) => {
    if (!motorData) return

    const item = motorData.items[itemIndex]
    if (!item) return

    if (!confirm('Вы уверены, что хотите удалить эту позицию?')) return

    try {
      await deleteMotorItem(item.item_id)
      await loadMotorDetails()
      setSuccessMessage('Позиция успешно удалена')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка удаления позиции')
      setTimeout(() => setError(null), 5000)
    }
  }

  const handleServiceNameUpdate = async (newServiceName: string) => {
    if (!id || !motorData) return

    try {
      await updateMotorServiceDescription(id, newServiceName)
      await loadMotorDetails()
      setSuccessMessage(`Название позиции изменено на "${newServiceName}"`)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления названия позиции')
      setTimeout(() => setError(null), 5000)
    }
  }

  const handleSubdivisionNameUpdate = async (newSubdivisionName: string) => {
    if (!id || !motorData) return

    try {
      await updateMotorSubdivision(id, newSubdivisionName)
      await loadMotorDetails()
      setSuccessMessage(`Подразделение изменено на "${newSubdivisionName}"`)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка обновления подразделения')
      setTimeout(() => setError(null), 5000)
    }
  }

  const handleAddGroupClick = () => {
    setCurrentWorkGroup(null)
    setShowAddGroupModal(true)
  }

  const handleAddItemToGroup = (workGroup: string) => {
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
    if (!id) {
      setError('Не выбран двигатель для добавления позиции')
      setTimeout(() => setError(null), 5000)
      return
    }

    const workGroup = currentWorkGroup || currentGroupName

    try {
      for (const service of services) {
        await addMotorItem(id, {
          item_description: service.name,
          work_group: workGroup,
          transaction_type: service.transactionType,
          quantity: service.quantity,
          price: service.pricePerUnit,
        })
      }
      await loadMotorDetails()
      setShowAddServiceModal(false)
      setCurrentGroupName('')
      setCurrentWorkGroup(null)
      const itemCount = services.length
      setSuccessMessage(`Добавлено ${itemCount} ${itemCount === 1 ? 'позиция' : itemCount < 5 ? 'позиции' : 'позиций'} в группу "${workGroup}"`)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка добавления позиции')
      setTimeout(() => setError(null), 5000)
    }
  }

  if (loading) {
    return (
      <AppLayout title="Загрузка...">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Загрузка информации о двигателе...</div>
        </div>
      </AppLayout>
    )
  }

  if (error && !motorData) {
    return (
      <AppLayout title="Ошибка">
        <div className="space-y-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <Alert variant="error">
            {error || 'Двигатель не найден'}
          </Alert>
        </div>
      </AppLayout>
    )
  }

  if (!motorData) {
    return (
      <AppLayout title="Ошибка">
        <div className="space-y-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <Alert variant="error">
            Двигатель не найден
          </Alert>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title={canEdit ? `Редактирование: ${motorData.motor_service_description}` : `Просмотр: ${motorData.motor_service_description}`}
      breadcrumbs={[
        { label: 'Архив Приемок', path: '/app/archive' },
        { label: `Двигатель ${motorData.position_in_reception}`, path: `/app/motors/${id}` },
        { label: canEdit ? 'Редактирование' : 'Просмотр', path: `/app/motors/${id}/edit` },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate(`/app/motors/${id}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к просмотру
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

        {!canEdit && (
          <Alert variant="info">
            Все элементы данного двигателя находятся в УПД. Редактирование невозможно.
          </Alert>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Информация о приемке</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Номер приемки:</span>
              <p className="font-medium mt-1">{motorData.reception_number || 'Не указан'}</p>
            </div>
            <div>
              <span className="text-gray-500">Дата приемки:</span>
              <p className="font-medium mt-1">{formatDate(motorData.reception_date)}</p>
            </div>
            <div>
              <span className="text-gray-500">Контрагент:</span>
              <p className="font-medium mt-1">{motorData.counterparty_name}</p>
            </div>
          </div>
        </div>

        <EditableMotorDetails
          motorId={id!}
          motorServiceDescription={motorData.motor_service_description}
          subdivisionName={motorData.subdivision_name}
          items={motorData.items}
          canEdit={canEdit}
          onItemUpdate={canEdit ? handleUpdateItem : undefined}
          onItemNameUpdate={canEdit ? handleItemNameUpdate : undefined}
          onItemDelete={canEdit ? handleDeleteItem : undefined}
          onServiceNameUpdate={canEdit ? handleServiceNameUpdate : undefined}
          onSubdivisionNameUpdate={canEdit ? handleSubdivisionNameUpdate : undefined}
          onAddGroupClick={canEdit ? handleAddGroupClick : undefined}
          onAddItemToGroup={canEdit ? handleAddItemToGroup : undefined}
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
            setCurrentWorkGroup(null)
          }}
          groupName={currentGroupName}
          onSave={handleServiceSave}
        />
      </div>
    </AppLayout>
  )
}
