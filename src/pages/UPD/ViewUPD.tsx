import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppLayout } from '../../components/Layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import {
  getUpdDocumentById,
  getUpdLinkedReceptionItems,
  UPDDocumentWithCounterparty,
  AvailableReceptionItem,
} from '../../services/updService'
import { ArrowLeft, FileText, Calendar, Building2, MapPin } from 'lucide-react'

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

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
  }).format(amount)
}

interface GroupedItems {
  [receptionNumber: string]: {
    [positionNumber: number]: {
      [workGroup: string]: AvailableReceptionItem[]
    }
  }
}

export const ViewUPD: React.FC = () => {
  const navigate = useNavigate()
  const { updId } = useParams<{ updId: string }>()
  const [updDocument, setUpdDocument] = useState<UPDDocumentWithCounterparty | null>(null)
  const [items, setItems] = useState<AvailableReceptionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (updId) {
      loadUpdData()
    }
  }, [updId])

  const loadUpdData = async () => {
    if (!updId) return

    try {
      setLoading(true)
      setError(null)

      const [docData, itemsData] = await Promise.all([
        getUpdDocumentById(updId),
        getUpdLinkedReceptionItems(updId),
      ])

      setUpdDocument(docData)
      setItems(itemsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных УПД')
    } finally {
      setLoading(false)
    }
  }

  const groupItems = (items: AvailableReceptionItem[]): GroupedItems => {
    const grouped: GroupedItems = {}

    items.forEach((item) => {
      const receptionKey = item.reception_number
      const positionKey = item.position_number
      const workGroupKey = item.work_group || 'Без группы'

      if (!grouped[receptionKey]) {
        grouped[receptionKey] = {}
      }
      if (!grouped[receptionKey][positionKey]) {
        grouped[receptionKey][positionKey] = {}
      }
      if (!grouped[receptionKey][positionKey][workGroupKey]) {
        grouped[receptionKey][positionKey][workGroupKey] = []
      }

      grouped[receptionKey][positionKey][workGroupKey].push(item)
    })

    return grouped
  }

  const calculateTotal = (items: AvailableReceptionItem[]): number => {
    return items.reduce((sum, item) => {
      const itemTotal = (item.quantity || 1) * (item.price || 0)
      return item.transaction_type === 'Доходы' ? sum + itemTotal : sum - itemTotal
    }, 0)
  }

  if (loading) {
    return (
      <AppLayout title="Просмотр УПД">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Загрузка...</div>
        </div>
      </AppLayout>
    )
  }

  if (!updDocument) {
    return (
      <AppLayout title="Просмотр УПД">
        <div className="space-y-6">
          <Alert variant="error">
            УПД не найден
          </Alert>
          <Button variant="outline" onClick={() => navigate('/app/upd-archive')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться к архиву
          </Button>
        </div>
      </AppLayout>
    )
  }

  const groupedItems = groupItems(items)
  const totalAmount = calculateTotal(items)

  return (
    <AppLayout
      title={`УПД ${updDocument.document_number}`}
      breadcrumbs={[
        { label: 'Архив УПД', path: '/app/upd-archive' },
        { label: updDocument.document_number, path: `/app/upd-archive/${updId}` },
      ]}
    >
      <div className="space-y-6">
        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate('/app/upd-archive')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться к архиву
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Информация о документе</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <FileText className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Номер УПД</div>
                  <div className="text-base font-medium text-gray-900">
                    {updDocument.document_number}
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Дата УПД</div>
                  <div className="text-base font-medium text-gray-900">
                    {formatDate(updDocument.document_date)}
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <Building2 className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <div className="text-sm text-gray-500">Контрагент</div>
                  <div className="text-base font-medium text-gray-900">
                    {updDocument.counterparties.name}
                  </div>
                  {updDocument.counterparties.inn && (
                    <div className="text-sm text-gray-500">
                      ИНН: {updDocument.counterparties.inn}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {updDocument.subdivisions && (
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-500">Подразделение</div>
                    <div className="text-base font-medium text-gray-900">
                      {updDocument.subdivisions.name}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500 mb-2">Суммы по документу</div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Доходы:</span>
                    <span className="text-base font-semibold text-green-600">
                      {formatCurrency(updDocument.total_income || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Расходы:</span>
                    <span className="text-base font-semibold text-red-600">
                      {formatCurrency(updDocument.total_expense || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-base font-medium text-gray-900">Итого:</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-500 mb-1">Статус</div>
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    updDocument.status === 'Draft'
                      ? 'bg-yellow-100 text-yellow-800'
                      : updDocument.status === 'Completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {updDocument.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Позиции документа ({items.length})
          </h2>

          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Нет позиций в данном УПД
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([receptionNumber, positions]) => (
                <div key={receptionNumber} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Приемка: {receptionNumber}
                    </h3>
                  </div>

                  {Object.entries(positions).map(([positionNumber, workGroups]) => {
                    const firstItem = Object.values(workGroups)[0][0]
                    return (
                      <div key={positionNumber} className="border-b border-gray-200 last:border-b-0">
                        <div className="bg-blue-50 px-4 py-2">
                          <div className="text-sm font-medium text-gray-900">
                            Позиция {positionNumber}: {firstItem.motor_service_description}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            Инв. №: {firstItem.motor_inventory_number || 'Не указан'}
                            {firstItem.subdivision_name && ` | ${firstItem.subdivision_name}`}
                          </div>
                        </div>

                        {Object.entries(workGroups).map(([workGroup, groupItems]) => (
                          <div key={workGroup} className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-700 mb-2">
                              {workGroup}
                            </div>
                            <div className="space-y-2">
                              {groupItems.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded"
                                >
                                  <div className="flex-1">
                                    <div className="text-sm text-gray-900">
                                      {item.item_description}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {item.quantity} × {formatCurrency(item.price)}
                                    </div>
                                  </div>
                                  <div className="text-right ml-4">
                                    <div
                                      className={`text-sm font-semibold ${
                                        item.transaction_type === 'Доходы'
                                          ? 'text-green-600'
                                          : 'text-red-600'
                                      }`}
                                    >
                                      {item.transaction_type === 'Доходы' ? '+' : '-'}
                                      {formatCurrency((item.quantity || 1) * (item.price || 0))}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {item.transaction_type}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
