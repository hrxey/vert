import { supabase } from '../lib/supabase'
    import { ReceptionExcelRow } from '../utils/parseReceptionExcel'
    import { TemplateWithItems } from '../types/acceptance'

    /**
     * Saves a single reception position as a new template.
     */
    export const savePositionAsTemplate = async (
      positionData: ReceptionExcelRow[],
      templateName: string,
      description?: string
    ) => {
      if (!positionData || positionData.length === 0) {
        throw new Error('Нет данных для сохранения в шаблон.')
      }

      const firstRow = positionData[0]

      // 1. Create the template header
      const { data: template, error: templateError } = await supabase
        .from('reception_templates')
        .insert({
          name: templateName,
          description: description,
          counterparty_name: firstRow.counterpartyName,
          reception_date: firstRow.receptionDate,
        })
        .select()
        .single()

      if (templateError) {
        throw new Error(`Ошибка создания шаблона: ${templateError.message}`)
      }

      // 2. Prepare and insert the template items
      const templateItems = positionData.map((row, index) => ({
        template_id: template.id,
        position_number: 1, // Always 1 for single position templates
        service_name: row.serviceName,
        subdivision_name: row.subdivisionName,
        item_name: row.itemName,
        work_group: row.workGroup,
        transaction_type: row.transactionType,
        price: row.price,
        quantity: row.quantity,
        motor_inventory_number: row.motorInventoryNumber,
        sort_order: index,
      }))

      const { error: itemsError } = await supabase
        .from('reception_template_items')
        .insert(templateItems)

      if (itemsError) {
        // Attempt to clean up the created template header if items fail
        await supabase.from('reception_templates').delete().eq('id', template.id)
        throw new Error(`Ошибка сохранения позиций шаблона: ${itemsError.message}`)
      }

      return template
    }

    /**
     * Fetches all templates for the current user, including a count of items in each.
     */
    export const getUserTemplates = async () => {
      const { data, error } = await supabase.rpc('get_user_templates_with_item_count')

      if (error) {
        // Fallback if RPC doesn't exist or fails
        console.warn('RPC failed, falling back to client-side join for templates.')
        const { data: templates, error: templatesError } = await supabase
          .from('reception_templates')
          .select('*, reception_template_items(count)')
          .order('created_at', { ascending: false })

        if (templatesError) {
          throw new Error(`Ошибка загрузки шаблонов: ${templatesError.message}`)
        }
        return templates.map(t => ({...t, reception_template_items_count: t.reception_template_items[0]?.count || 0}))
      }

      return data
    }

    /**
     * Fetches a single template by its ID, including all its items.
     */
    export const getTemplateById = async (templateId: string): Promise<TemplateWithItems> => {
      const { data, error } = await supabase
        .from('reception_templates')
        .select(`
          *,
          reception_template_items (
            *
          )
        `)
        .eq('id', templateId)
        .single()

      if (error) {
        throw new Error(`Ошибка загрузки шаблона: ${error.message}`)
      }

      return data as TemplateWithItems
    }

    /**
     * Deletes a template and its associated items (via CASCADE).
     */
    export const deleteTemplate = async (templateId: string) => {
      const { error } = await supabase
        .from('reception_templates')
        .delete()
        .eq('id', templateId)

      if (error) {
        throw new Error(`Ошибка удаления шаблона: ${error.message}`)
      }
    }
