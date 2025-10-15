import { supabase } from '../lib/supabase';

export interface Wire {
  id: string;
  type: string;
  brand: string;
  name: string;
  heat_resistance: string | null;
  cross_section: string;
  shape: string;
  quantity: number;
  price: number;
  created_at: string;
  updated_at: string;
}

export const wireService = {
  async getAll(): Promise<Wire[]> {
    const { data, error } = await supabase
      .from('wires')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async search(query: string): Promise<Wire[]> {
    const lowerQuery = query.toLowerCase();

    const { data, error } = await supabase
      .from('wires')
      .select('*')
      .or(`name.ilike.%${query}%,brand.ilike.%${query}%,cross_section.ilike.%${query}%,shape.ilike.%${query}%`)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async create(wire: Omit<Wire, 'id' | 'created_at' | 'updated_at'>): Promise<Wire> {
    const { data, error } = await supabase
      .from('wires')
      .insert([wire])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, wire: Partial<Wire>): Promise<Wire> {
    const { data, error } = await supabase
      .from('wires')
      .update({ ...wire, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('wires')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
