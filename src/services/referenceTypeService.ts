import { supabase } from '../lib/supabase'
import { ReferenceType } from '../types/database'

export const referenceTypeService = {
  async fetchReferenceTypes(): Promise<ReferenceType[]> {
    const { data, error } = await supabase
      .from('reference_types')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Ошибка загрузки типов справочников: ${error.message}`)
    }

    return data || []
  },

  async createReferenceType(
    referenceType: Omit<ReferenceType, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<ReferenceType> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Пользователь не авторизован')
    }

    const { data, error } = await supabase
      .from('reference_types')
      .insert({
        ...referenceType,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new Error('Справочник с таким ключом уже существует')
      }
      throw new Error(`Ошибка создания типа справочника: ${error.message}`)
    }

    return data
  },

  async updateReferenceType(
    id: string,
    updates: Partial<Omit<ReferenceType, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<ReferenceType> {
    const { data, error } = await supabase
      .from('reference_types')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Ошибка обновления типа справочника: ${error.message}`)
    }

    return data
  },

  async deleteReferenceType(id: string): Promise<void> {
    const { error } = await supabase
      .from('reference_types')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Ошибка удаления типа справочника: ${error.message}`)
    }
  },

  async initializeDefaultReferenceTypes(): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Пользователь не авторизован')
    }

    const { error } = await supabase.rpc('initialize_default_reference_types', {
      p_user_id: user.id,
    })

    if (error) {
      console.error('Error initializing default reference types:', error)
    }
  },
}
