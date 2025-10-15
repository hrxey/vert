import { supabase } from '../lib/supabase'
import { ReceptionExcelRow } from '../utils/parseReceptionExcel'

interface GroupedMotor {
  positionNumber: number
  subdivisionName: string
  serviceName: string
  inventoryNumber: string
  items: ReceptionExcelRow[]
}

export const saveReceptionData = async (rows: ReceptionExcelRow[]) => {
  if (rows.length === 0) {
    throw new Error('Нет данных для сохранения')
  }

  const firstRow = rows[0]
  const receptionNumber = firstRow.receptionNumber
  const counterpartyName = firstRow.counterpartyName
  const receptionDate = firstRow.receptionDate

  let { data: counterparty, error: counterpartyError } = await supabase
    .from('counterparties')
    .select('id')
    .eq('name', counterpartyName)
    .maybeSingle()

  if (counterpartyError) {
    throw new Error(`Ошибка поиска контрагента: ${counterpartyError.message}`)
  }

  if (!counterparty) {
    const { data: newCounterparty, error: createError } = await supabase
      .from('counterparties')
      .insert({
        name: counterpartyName,
        code: '',
        contact_info: '',
      })
      .select()
      .single()

    if (createError) {
      throw new Error(`Ошибка создания контрагента: ${createError.message}`)
    }

    counterparty = newCounterparty
  }

  const { data: reception, error: receptionError } = await supabase
    .from('receptions')
    .insert({
      reception_date: receptionDate,
      reception_number: receptionNumber,
      counterparty_id: counterparty.id,
    })
    .select()
    .single()

  if (receptionError) {
    throw new Error(`Ошибка создания приемки: ${receptionError.message}`)
  }

  const motorGroups = new Map<number, GroupedMotor>()
  for (const row of rows) {
    if (!motorGroups.has(row.positionNumber)) {
      motorGroups.set(row.positionNumber, {
        positionNumber: row.positionNumber,
        subdivisionName: row.subdivisionName,
        serviceName: row.serviceName,
        inventoryNumber: row.motorInventoryNumber,
        items: [],
      })
    }
    motorGroups.get(row.positionNumber)!.items.push(row)
  }

  const motorGroupsArray = Array.from(motorGroups.values()).sort(
    (a, b) => a.positionNumber - b.positionNumber
  )

  for (const group of motorGroupsArray) {
    let { data: subdivision, error: subdivisionError } = await supabase
      .from('subdivisions')
      .select('id')
      .eq('name', group.subdivisionName)
      .maybeSingle()

    if (subdivisionError) {
      throw new Error(
        `Ошибка поиска подразделения: ${subdivisionError.message}`
      )
    }

    if (!subdivision) {
      const { data: newSubdivision, error: createError } = await supabase
        .from('subdivisions')
        .insert({
          name: group.subdivisionName,
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

    const { data: acceptedMotor, error: motorError } = await supabase
      .from('accepted_motors')
      .insert({
        reception_id: reception.id,
        subdivision_id: subdivision.id,
        position_in_reception: group.positionNumber,
        motor_service_description: group.serviceName,
        motor_inventory_number: group.inventoryNumber,
      })
      .select()
      .single()

    if (motorError) {
      throw new Error(`Ошибка создания двигателя: ${motorError.message}`)
    }

    const itemsToInsert = group.items.map((item) => ({
      accepted_motor_id: acceptedMotor.id,
      item_description: item.itemName,
      work_group: item.workGroup,
      transaction_type: item.transactionType,
      quantity: item.quantity,
      price: item.price,
    }))

    const { error: itemsError } = await supabase
      .from('reception_items')
      .insert(itemsToInsert)

    if (itemsError) {
      throw new Error(`Ошибка создания позиций: ${itemsError.message}`)
    }
  }

  return reception
}

export const getReceptions = async () => {
  const { data, error } = await supabase
    .from('receptions')
    .select(`
      id,
      reception_number,
      reception_date,
      counterparty_id,
      counterparties (
        id,
        name
      )
    `)
    .order('reception_date', { ascending: false })

  if (error) {
    throw new Error(`Ошибка загрузки приемок: ${error.message}`)
  }

  return data
}

export const getReceptionById = async (receptionId: string) => {
  const { data: reception, error: receptionError } = await supabase
    .from('receptions')
    .select(`
      id,
      reception_number,
      reception_date,
      counterparty_id,
      counterparties (
        id,
        name
      )
    `)
    .eq('id', receptionId)
    .single()

  if (receptionError) {
    throw new Error(`Ошибка загрузки приемки: ${receptionError.message}`)
  }

  const { data: motors, error: motorsError } = await supabase
    .from('accepted_motors')
    .select(`
      id,
      position_in_reception,
      motor_service_description,
      motor_inventory_number,
      subdivision_id,
      subdivisions (
        id,
        name
      )
    `)
    .eq('reception_id', receptionId)
    .order('position_in_reception')

  if (motorsError) {
    throw new Error(`Ошибка загрузки двигателей: ${motorsError.message}`)
  }

  const motorsWithItems = await Promise.all(
    motors.map(async (motor) => {
      const { data: items, error: itemsError } = await supabase
        .from('reception_items')
        .select('id, item_description, work_group, transaction_type, quantity, price, upd_document_id')
        .eq('accepted_motor_id', motor.id)

      if (itemsError) {
        throw new Error(`Ошибка загрузки позиций: ${itemsError.message}`)
      }

      return {
        ...motor,
        items: items || [],
      }
    })
  )

  return {
    ...reception,
    motors: motorsWithItems,
  }
}

export const updateReceptionItem = async (
  itemId: string,
  updates: {
    item_description?: string
    work_group?: string
    transaction_type?: string
    quantity?: number
    price?: number
  }
) => {
  const { error } = await supabase
    .from('reception_items')
    .update(updates)
    .eq('id', itemId)

  if (error) {
    throw new Error(`Ошибка обновления позиции: ${error.message}`)
  }
}

export const deleteReceptionItem = async (itemId: string) => {
  const { error } = await supabase
    .from('reception_items')
    .delete()
    .eq('id', itemId)

  if (error) {
    throw new Error(`Ошибка удаления позиции: ${error.message}`)
  }
}

export const addReceptionItem = async (
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

export const updateReceptionHeader = async (
  receptionId: string,
  updates: {
    reception_number?: string
    reception_date?: string
    counterparty_id?: string
  }
) => {
  const { error } = await supabase
    .from('receptions')
    .update(updates)
    .eq('id', receptionId)

  if (error) {
    throw new Error(`Ошибка обновления приемки: ${error.message}`)
  }
}

export const duplicateMotor = async (motorId: string) => {
  const { data: motor, error: motorError } = await supabase
    .from('accepted_motors')
    .select('reception_id, subdivision_id, motor_service_description, motor_inventory_number')
    .eq('id', motorId)
    .single()

  if (motorError) {
    throw new Error(`Ошибка загрузки двигателя: ${motorError.message}`)
  }

  const { data: maxPosition, error: maxPosError } = await supabase
    .from('accepted_motors')
    .select('position_in_reception')
    .eq('reception_id', motor.reception_id)
    .order('position_in_reception', { ascending: false })
    .limit(1)
    .single()

  if (maxPosError && maxPosError.code !== 'PGRST116') {
    throw new Error(`Ошибка получения максимальной позиции: ${maxPosError.message}`)
  }

  const newPosition = (maxPosition?.position_in_reception || 0) + 1

  const { data: newMotor, error: newMotorError } = await supabase
    .from('accepted_motors')
    .insert({
      reception_id: motor.reception_id,
      subdivision_id: motor.subdivision_id,
      position_in_reception: newPosition,
      motor_service_description: motor.motor_service_description,
      motor_inventory_number: motor.motor_inventory_number,
    })
    .select()
    .single()

  if (newMotorError) {
    throw new Error(`Ошибка создания дубликата двигателя: ${newMotorError.message}`)
  }

  const { data: items, error: itemsError } = await supabase
    .from('reception_items')
    .select('item_description, work_group, transaction_type, quantity, price')
    .eq('accepted_motor_id', motorId)

  if (itemsError) {
    throw new Error(`Ошибка загрузки позиций: ${itemsError.message}`)
  }

  if (items && items.length > 0) {
    const newItems = items.map((item) => ({
      accepted_motor_id: newMotor.id,
      ...item,
    }))

    const { error: insertItemsError } = await supabase
      .from('reception_items')
      .insert(newItems)

    if (insertItemsError) {
      throw new Error(`Ошибка копирования позиций: ${insertItemsError.message}`)
    }
  }

  return newMotor
}

export const deleteMotor = async (motorId: string) => {
  const { data: items, error: itemsCheckError } = await supabase
    .from('reception_items')
    .select('id, upd_document_id')
    .eq('accepted_motor_id', motorId)

  if (itemsCheckError) {
    throw new Error(`Ошибка проверки позиций: ${itemsCheckError.message}`)
  }

  const hasLinkedItems = items?.some((item) => item.upd_document_id !== null)
  if (hasLinkedItems) {
    throw new Error('Невозможно удалить позицию, содержащую элементы связанные с УПД')
  }

  const { error: deleteItemsError } = await supabase
    .from('reception_items')
    .delete()
    .eq('accepted_motor_id', motorId)

  if (deleteItemsError) {
    throw new Error(`Ошибка удаления позиций: ${deleteItemsError.message}`)
  }

  const { error: deleteMotorError } = await supabase
    .from('accepted_motors')
    .delete()
    .eq('id', motorId)

  if (deleteMotorError) {
    throw new Error(`Ошибка удаления двигателя: ${deleteMotorError.message}`)
  }
}

export const updateMotorServiceName = async (motorId: string, newServiceName: string) => {
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

export const getReceptionForExport = async (receptionId: string) => {
  const { data: reception, error: receptionError } = await supabase
    .from('receptions')
    .select(`
      id,
      reception_number,
      reception_date,
      counterparty_id,
      counterparties (
        id,
        name
      )
    `)
    .eq('id', receptionId)
    .single()

  if (receptionError) {
    throw new Error(`Ошибка загрузки приемки: ${receptionError.message}`)
  }

  const { data: motors, error: motorsError } = await supabase
    .from('accepted_motors')
    .select(`
      id,
      position_in_reception,
      motor_service_description,
      motor_inventory_number,
      subdivision_id,
      subdivisions (
        id,
        name
      )
    `)
    .eq('reception_id', receptionId)
    .order('position_in_reception')

  if (motorsError) {
    throw new Error(`Ошибка загрузки двигателей: ${motorsError.message}`)
  }

  const motorsWithItems = await Promise.all(
    motors.map(async (motor) => {
      const { data: items, error: itemsError } = await supabase
        .from('reception_items')
        .select('id, item_description, work_group, transaction_type, quantity, price, upd_document_id')
        .eq('accepted_motor_id', motor.id)

      if (itemsError) {
        throw new Error(`Ошибка загрузки позиций: ${itemsError.message}`)
      }

      const documentIds = items
        ?.map((item) => item.upd_document_id)
        .filter((id): id is string => id !== null) || []

      const uniqueDocumentIds = [...new Set(documentIds)]

      const documentsMap = new Map<string, { document_number: string | null; status: string }>()
      if (uniqueDocumentIds.length > 0) {
        const { data: documentsData, error: documentsError } = await supabase
          .from('upd_documents')
          .select('id, document_number, status')
          .in('id', uniqueDocumentIds)

        if (!documentsError && documentsData) {
          for (const doc of documentsData) {
            documentsMap.set(doc.id, { document_number: doc.document_number, status: doc.status })
          }
        }
      }

      const itemsWithDocuments = items?.map((item) => {
        const updDoc = item.upd_document_id ? documentsMap.get(item.upd_document_id) : null
        return {
          ...item,
          document_number: updDoc?.document_number || null,
          item_status: updDoc?.status || 'В работе',
        }
      }) || []

      return {
        ...motor,
        items: itemsWithDocuments,
      }
    })
  )

  return {
    ...reception,
    motors: motorsWithItems,
  }
}
