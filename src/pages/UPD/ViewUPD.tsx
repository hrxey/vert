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
import { ViewUPDHierarchy } from '../../components/UPD/ViewUPDHierarchy'

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

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Информация о документе</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start">
                <FileText className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">Номер УПД</div>
                  <div className="text-sm font-medium text-gray-900">
                    {updDocument.document_number}
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <Calendar className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">Дата УПД</div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(updDocument.document_date)}
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <Building2 className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500">Контрагент</div>
                  <div className="text-sm font-medium text-gray-900">
                    {updDocument.counterparties.name}
                  </div>
                  {updDocument.counterparties.inn && (
                    <div className="text-xs text-gray-500">
                      ИНН: {updDocument.counterparties.inn}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {updDocument.subdivisions && (
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <div className="text-xs text-gray-500">Подразделение</div>
                    <div className="text-sm font-medium text-gray-900">
                      {updDocument.subdivisions.name}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-2">Суммы по документу</div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Доходы:</span>
                    <span className="text-sm font-semibold text-green-600">
                      {formatCurrency(updDocument.total_income || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Расходы:</span>
                    <span className="text-sm font-semibold text-red-600">
                      {formatCurrency(updDocument.total_expense || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-900">Итого:</span>
                    <span className="text-base font-bold text-gray-900">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Позиции документа ({items.length})
          </h2>

          <ViewUPDHierarchy items={items} />
        </div>
      </div>
    </AppLayout>
  )
}
