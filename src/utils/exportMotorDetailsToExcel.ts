import * as XLSX from 'xlsx'
import { MotorDetails } from '../services/motorDetailsService'

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`
}

export const exportMotorDetailsToExcel = (motorData: MotorDetails, motorId: string, fileName?: string): void => {
  const wb = XLSX.utils.book_new()

  const qrCodeUrl = `${window.location.origin}/app/motors/${motorId}`

  const flatData = motorData.items.map((item) => ({
    'ID двигателя': motorId,
    'Номер приемки': motorData.reception_number || '',
    'Дата приемки': formatDateTime(motorData.reception_date),
    'ID приемки': motorData.reception_id || '',
    'Позиция в приемке': motorData.position_in_reception,
    'Контрагент': motorData.counterparty_name,
    'Подразделение': motorData.subdivision_name || '',
    'qr_code': qrCodeUrl,
    'Номер позиции': motorData.position_in_reception,
    'Наименование услуги': motorData.motor_service_description,
    'Наименование позиции': item.item_description,
    'Группа работ': item.work_group || '',
    'Тип транзакции': item.transaction_type || 'Расход',
    'Сумма': item.price,
    'Количество': item.quantity,
    'Статус': item.item_status,
    'Документ УПД': item.document_number || ''
  }))

  const ws = XLSX.utils.json_to_sheet(flatData)

  ws['!cols'] = [
    { wch: 38 },
    { wch: 30 },
    { wch: 20 },
    { wch: 38 },
    { wch: 15 },
    { wch: 30 },
    { wch: 20 },
    { wch: 50 },
    { wch: 15 },
    { wch: 50 },
    { wch: 50 },
    { wch: 30 },
    { wch: 18 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 20 }
  ]

  XLSX.utils.book_append_sheet(wb, ws, 'Детализация двигателя')

  const defaultFileName = `Двигатель_${motorData.position_in_reception}_${motorData.motor_service_description.substring(0, 20)}`
  XLSX.writeFile(wb, `${fileName || defaultFileName}.xlsx`)
}
