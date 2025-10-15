import { supabase } from '../lib/supabase';

export interface SpecialDocument {
  id: string;
  document_date: string;
  document_number: string;
  counterparty: string;
  contract: string;
  amount_without_vat: number;
  amount_with_vat: number;
  created_at: string;
  updated_at: string;
}

export type NewSpecialDocument = Omit<SpecialDocument, 'id' | 'created_at' | 'updated_at'>;

export const specialDocumentService = {
  async getAll(): Promise<SpecialDocument[]> {
    const { data, error } = await supabase
      .from('special_documents')
      .select('*')
      .order('document_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async search(query: string): Promise<SpecialDocument[]> {
    const { data, error } = await supabase
      .from('special_documents')
      .select('*')
      .or(`document_number.ilike.%${query}%,counterparty.ilike.%${query}%`)
      .order('document_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(document: NewSpecialDocument): Promise<SpecialDocument> {
    const { data, error } = await supabase
      .from('special_documents')
      .insert([document])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, document: Partial<NewSpecialDocument>): Promise<SpecialDocument> {
    const { data, error } = await supabase
      .from('special_documents')
      .update({ ...document, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('special_documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
