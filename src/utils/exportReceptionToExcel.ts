import * as XLSX from 'xlsx'

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

interface ReceptionItem {
  item_description: string
  work_group: string | null
  transaction_type: string | null
  quantity: number
  price: number
  upd_document_id: string | null
  document_number?: string | null
  item_status?: string
}

interface Motor {
  id: string
  position_in_reception: number
  motor_service_description: string
  motor_inventory_number: string | null
  subdivisions: { name: string } | null
  items: ReceptionItem[]
}

interface ReceptionData {
  id: string
  reception_number: string
  reception_date: string
  counterparties: { name: string }
  motors: Motor[]
}

export const exportReceptionToExcel = async (receptionData: ReceptionData, fileName?: string): Promise<void> => {
  const wb = XLSX.utils.book_new()

  const flatData: any[] = []

  for (const motor of receptionData.motors) {
    for (const item of motor.items) {
      const qrCodeUrl = `${window.location.origin}/app/motors/${motor.id}`

      flatData.push({
        'ID двигателя': motor.id,
        'Номер приемки': receptionData.reception_number || '',
        'Дата приемки': formatDateTime(receptionData.reception_date),
        'ID приемки': receptionData.id,
        'Позиция в приемке': motor.position_in_reception,
        'Контрагент': receptionData.counterparties.name,
        'Подразделение': motor.subdivisions?.name || '',
        'qr_code': qrCodeUrl,
        'Номер позиции': motor.position_in_reception,
        'Наименование услуги': motor.motor_service_description,
        'Наименование позиции': item.item_description,
        'Группа работ': item.work_group || '',
        'Тип транзакции': item.transaction_type || 'Расход',
        'Сумма': item.price,
        'Количество': item.quantity,
        'Статус': item.item_status || 'В работе',
        'Документ УПД': item.document_number || ''
      })
    }
  }

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

  XLSX.utils.book_append_sheet(wb, ws, 'Приемка')

  const defaultFileName = `Приемка_${receptionData.reception_number}_${formatDateTime(receptionData.reception_date).split(' ')[0].replace(/\./g, '-')}`
  XLSX.writeFile(wb, `${fileName || defaultFileName}.xlsx`)
}
