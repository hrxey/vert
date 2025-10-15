import { supabase } from '../lib/supabase'

export interface MotorDetailsItem {
  item_id: string
  item_description: string
  work_group: string | null
  price: number
  quantity: number
  document_number: string | null
  item_status: string
  transaction_type: string | null
  upd_document_id: string | null
}

export interface MotorDetails {
  motor_id: string
  motor_service_description: string
  position_in_reception: number
  reception_id: string
  reception_number: string | null
  reception_date: string
  counterparty_name: string
  subdivision_name: string | null
  subdivision_id: string | null
  motor_inventory_number: string | null
  items: MotorDetailsItem[]
}

export const getMotorDetails = async (motorId: string): Promise<MotorDetails | null> => {
  // Шаг 1: Загружаем основные данные без проблемного join
  const { data, error } = await supabase
    .from('accepted_motors')
    .select(`
      id,
      motor_service_description,
      position_in_reception,
      motor_inventory_number,
      reception_id,
      subdivision_id,
      receptions!inner (
        id,
        reception_number,
        reception_date,
        counterparties!inner (
          name
        )
      ),
      subdivisions (
        id,
        name
      ),
      reception_items (
        id,
        item_description,
        work_group,
        price,
        quantity,
        upd_document_id,
        transaction_type
      )
    `)
    .eq('id', motorId)
    .single()

  if (error) {
    console.error('Supabase query error (Phase 1):', error)
    throw new Error(`Ошибка загрузки данных о двигателе: ${error.message}`)
  }

  if (!data) {
    return null
  }

  // Шаг 2: Собираем ID документов из полученных работ
  const receptionItems = (Array.isArray(data.reception_items)
    ? data.reception_items
    : [data.reception_items].filter(Boolean)) as any[]

  const documentIds = receptionItems
    .map((item) => item.upd_document_id)
    .filter((id): id is string => id !== null)
  
  const uniqueDocumentIds = [...new Set(documentIds)]

  // Шаг 3: Загружаем данные по документам отдельным запросом
  const documentsMap = new Map<string, { document_number: string | null; status: string }>()
  if (uniqueDocumentIds.length > 0) {
    const { data: documentsData, error: documentsError } = await supabase
      .from('upd_documents')
      .select('id, document_number, status')
      .in('id', uniqueDocumentIds)

    if (documentsError) {
      console.error('Supabase query error (Phase 2):', documentsError)
      // Не блокируем выполнение, если не удалось загрузить доп. данные
    } else if (documentsData) {
      for (const doc of documentsData) {
        documentsMap.set(doc.id, { document_number: doc.document_number, status: doc.status })
      }
    }
  }

  // Шаг 4: Объединяем данные
  const items: MotorDetailsItem[] = receptionItems.map((item) => {
    const updDoc = item.upd_document_id ? documentsMap.get(item.upd_document_id) : null
    return {
      item_id: item.id,
      item_description: item.item_description,
      work_group: item.work_group,
      price: item.price,
      quantity: item.quantity,
      document_number: updDoc?.document_number || null,
      item_status: updDoc?.status || 'В работе',
      transaction_type: item.transaction_type,
      upd_document_id: item.upd_document_id,
    }
  })

  const reception = Array.isArray(data.receptions) ? data.receptions[0] : data.receptions
  const counterparty = Array.isArray(reception?.counterparties)
    ? reception.counterparties[0]
    : reception?.counterparties
  const subdivision = Array.isArray(data.subdivisions)
    ? data.subdivisions[0]
    : data.subdivisions

  return {
    motor_id: data.id,
    motor_service_description: data.motor_service_description,
    position_in_reception: data.position_in_reception,
    motor_inventory_number: data.motor_inventory_number,
    reception_id: data.reception_id,
    reception_number: reception?.reception_number || null,
    reception_date: reception?.reception_date || '',
    counterparty_name: counterparty?.name || '',
    subdivision_name: subdivision?.name || null,
    subdivision_id: data.subdivision_id || null,
    items,
  }
}

export const updateMotorItem = async (
  itemId: string,
  updates: {
    item_description?: string
    work_group?: string
    transaction_type?: string
    quantity?: number
    price?: number
  }
) => {
  const { data: item, error: checkError } = await supabase
    .from('reception_items')
    .select('upd_document_id')
    .eq('id', itemId)
    .single()

  if (checkError) {
    throw new Error(`Ошибка проверки элемента: ${checkError.message}`)
  }

  if (item?.upd_document_id) {
    throw new Error('Невозможно редактировать элемент, который находится в УПД')
  }

  const { error } = await supabase
    .from('reception_items')
    .update(updates)
    .eq('id', itemId)

  if (error) {
    throw new Error(`Ошибка обновления позиции: ${error.message}`)
  }
}

export const deleteMotorItem = async (itemId: string) => {
  const { data: item, error: checkError } = await supabase
    .from('reception_items')
    .select('upd_document_id')
    .eq('id', itemId)
    .single()

  if (checkError) {
    throw new Error(`Ошибка проверки элемента: ${checkError.message}`)
  }

  if (item?.upd_document_id) {
    throw new Error('Невозможно удалить элемент, который находится в УПД')
  }

  const { error } = await supabase
    .from('reception_items')
    .delete()
    .eq('id', itemId)

  if (error) {
    throw new Error(`Ошибка удаления позиции: ${error.message}`)
  }
}

export const addMotorItem = async (
  motorId: string,
  item: {
    item_description: string
    work_group: string
    transaction_type: string
    quantity: number
    price: number
  }
) => {
  const { data, error } = await supabase
    .from('reception_items')
    .insert({
      accepted_motor_id: motorId,
      ...item,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Ошибка добавления позиции: ${error.message}`)
  }

  return data
}

export const updateMotorServiceDescription = async (motorId: string, newServiceName: string) => {
  const { error } = await supabase
    .from('accepted_motors')
    .update({ motor_service_description: newServiceName })
    .eq('id', motorId)

  if (error) {
    throw new Error(`Ошибка обновления названия позиции: ${error.message}`)
  }
}

export const updateMotorSubdivision = async (motorId: string, newSubdivisionName: string) => {
  let { data: subdivision, error: subdivisionError } = await supabase
    .from('subdivisions')
    .select('id')
    .eq('name', newSubdivisionName)
    .maybeSingle()

  if (subdivisionError) {
    throw new Error(`Ошибка поиска подразделения: ${subdivisionError.message}`)
  }

  if (!subdivision) {
    const { data: newSubdivision, error: createError } = await supabase
      .from('subdivisions')
      .insert({
        name: newSubdivisionName,
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

  const { error: updateError } = await supabase
    .from('accepted_motors')
    .update({ subdivision_id: subdivision.id })
    .eq('id', motorId)

  if (updateError) {
    throw new Error(`Ошибка обновления подразделения: ${updateError.message}`)
  }
}
