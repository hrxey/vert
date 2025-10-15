import { supabase } from '../lib/supabase';

export interface Bearing {
  id: string;
  brand: string;
  name: string;
  diameter: number;
  number: string;
  type: string;
  created_at: string;
  user_id: string;
}

export type NewBearing = Omit<Bearing, 'id' | 'created_at' | 'user_id'>;

export const bearingService = {
  async getAll(): Promise<Bearing[]> {
    const { data, error } = await supabase
      .from('bearings')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async search(query: string): Promise<Bearing[]> {
    if (!query.trim()) {
      return this.getAll();
    }

    const { data, error } = await supabase
      .from('bearings')
      .select('*')
      .or(`name.ilike.%${query}%,brand.ilike.%${query}%,number.ilike.%${query}%,type.ilike.%${query}%,diameter.eq.${parseInt(query) || -1}`)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async create(bearing: NewBearing): Promise<Bearing> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('bearings')
      .insert([{ ...bearing, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, bearing: Partial<NewBearing>): Promise<Bearing> {
    const { data, error } = await supabase
      .from('bearings')
      .update(bearing)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('bearings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
