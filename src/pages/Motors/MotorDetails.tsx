import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppLayout } from '../../components/Layout/AppLayout'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { getMotorDetails, MotorDetails as MotorDetailsType } from '../../services/motorDetailsService'
import { ArrowLeft, QrCode, Download, Edit } from 'lucide-react'
import { MotorQRCode } from '../../components/Motors/MotorQRCode'
import { exportMotorDetailsToExcel } from '../../utils/exportMotorDetailsToExcel'

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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'в работе':
      return 'bg-yellow-100 text-yellow-800'
    case 'завершен':
    case 'закрыт':
      return 'bg-green-100 text-green-800'
    case 'отменен':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const MotorDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [motorData, setMotorData] = useState<MotorDetailsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showQRCode, setShowQRCode] = useState(false)

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

  const handleExportToExcel = () => {
    if (motorData && id) {
      exportMotorDetailsToExcel(motorData, id)
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

  if (error || !motorData) {
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

  const totalAmount = motorData.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const canEdit = motorData.items.some(item => !item.upd_document_id)

  return (
    <AppLayout
      title={`Двигатель: ${motorData.motor_service_description}`}
      breadcrumbs={[
        { label: 'Архив Приемок', path: '/app/archive' },
        { label: `Двигатель ${motorData.position_in_reception}`, path: `/app/motors/${id}` },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <div className="flex gap-2">
            {canEdit && (
              <Button onClick={() => navigate(`/app/motors/${id}/edit`)}>
                <Edit className="w-4 h-4 mr-2" />
                Редактировать
              </Button>
            )}
            <Button variant="outline" onClick={handleExportToExcel}>
              <Download className="w-4 h-4 mr-2" />
              Скачать в XLSX
            </Button>
            <Button onClick={() => setShowQRCode(!showQRCode)}>
              <QrCode className="w-4 h-4 mr-2" />
              {showQRCode ? 'Скрыть QR-код' : 'Показать QR-код'}
            </Button>
          </div>
        </div>

        {showQRCode && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <MotorQRCode motorId={id!} />
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Информация о двигателе
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Основная информация
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">Позиция в приемке:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {motorData.position_in_reception}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Описание:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {motorData.motor_service_description}
                  </span>
                </div>
                {motorData.motor_inventory_number && (
                  <div>
                    <span className="text-gray-600">Инвентарный номер:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {motorData.motor_inventory_number}
                    </span>
                  </div>
                )}
                {motorData.subdivision_name && (
                  <div>
                    <span className="text-gray-600">Подразделение:</span>
                    <span className="ml-2 font-semibold text-gray-900">
                      {motorData.subdivision_name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Приемка и контрагент
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-600">Номер приемки:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {motorData.reception_number || 'Не указан'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Дата приемки:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {formatDate(motorData.reception_date)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Контрагент:</span>
                  <span className="ml-2 font-semibold text-gray-900">
                    {motorData.counterparty_name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Список работ и услуг
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Описание
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Группа работ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Количество
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Цена
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Сумма
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Документ УПД
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {motorData.items.map((item) => (
                    <tr key={item.item_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.item_description}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.work_group || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">
                        {formatCurrency(item.price)} ₽
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                        {formatCurrency(item.price * item.quantity)} ₽
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.item_status)}`}>
                          {item.item_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.document_number || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                      Итого:
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                      {formatCurrency(totalAmount)} ₽
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
