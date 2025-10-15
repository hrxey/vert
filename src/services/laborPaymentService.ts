import { supabase } from '../lib/supabase';

export interface LaborPayment {
  id: string;
  short_name: string;
  full_name: string;
  payment_name: string;
  position: string;
  hourly_rate: number;
  created_at: string;
  updated_at: string;
}

export type NewLaborPayment = Omit<LaborPayment, 'id' | 'created_at' | 'updated_at'>;

export const laborPaymentService = {
  async getAll(): Promise<LaborPayment[]> {
    const { data, error } = await supabase
      .from('labor_payments')
      .select('*')
      .order('short_name');

    if (error) throw error;
    return data || [];
  },

  async search(query: string): Promise<LaborPayment[]> {
    const { data, error } = await supabase
      .from('labor_payments')
      .select('*')
      .or(`payment_name.ilike.%${query}%,full_name.ilike.%${query}%`)
      .order('short_name');

    if (error) throw error;
    return data || [];
  },

  async create(payment: NewLaborPayment): Promise<LaborPayment> {
    const { data, error } = await supabase
      .from('labor_payments')
      .insert([payment])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, payment: Partial<NewLaborPayment>): Promise<LaborPayment> {
    const { data, error } = await supabase
      .from('labor_payments')
      .update({ ...payment, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('labor_payments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
