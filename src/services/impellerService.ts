import { supabase } from '../lib/supabase';

export interface Impeller {
  id: string;
  name: string;
  mounting_diameter: number;
  outer_diameter: number;
  height: number;
  blade_count: number;
  created_at: string;
  user_id: string;
}

export type NewImpeller = Omit<Impeller, 'id' | 'created_at' | 'user_id'>;

export const impellerService = {
  async getAll(): Promise<Impeller[]> {
    const { data, error } = await supabase
      .from('impellers')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async search(query: string): Promise<Impeller[]> {
    if (!query.trim()) {
      return this.getAll();
    }

    const numericQuery = parseInt(query);
    const isNumeric = !isNaN(numericQuery);

    let queryBuilder = supabase
      .from('impellers')
      .select('*');

    if (isNumeric) {
      queryBuilder = queryBuilder.or(
        `name.ilike.%${query}%,mounting_diameter.eq.${numericQuery},outer_diameter.eq.${numericQuery},height.eq.${numericQuery},blade_count.eq.${numericQuery}`
      );
    } else {
      queryBuilder = queryBuilder.ilike('name', `%${query}%`);
    }

    const { data, error } = await queryBuilder.order('name');

    if (error) throw error;
    return data || [];
  },

  async create(impeller: NewImpeller): Promise<Impeller> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('impellers')
      .insert([{ ...impeller, user_id: user.id }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, impeller: Partial<NewImpeller>): Promise<Impeller> {
    const { data, error } = await supabase
      .from('impellers')
      .update(impeller)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('impellers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
