import { supabase } from '../lib/supabase';
import { UPDDocument } from '../types/database';

export interface AvailableReceptionItem {
  id: string;
  item_description: string;
  work_group: string;
  price: number;
  quantity: number;
  transaction_type: string;
  motor_service_description: string;
  motor_inventory_number: string;
  subdivision_name: string | null;
  reception_number: string;
  reception_date: string;
  position_number: number;
}

export interface CreateUpdParams {
  counterpartyId: string;
  subdivisionId?: string;
  documentNumber: string;
  documentDate: string;
  itemIds: string[];
}

export async function getAvailableReceptionItems(
  counterpartyId: string,
  subdivisionId?: string,
  receptionIds?: string[]
): Promise<AvailableReceptionItem[]> {
  let query = supabase
    .from('reception_items')
    .select(`
      id,
      item_description,
      work_group,
      price,
      quantity,
      transaction_type,
      accepted_motors!inner (
        position_in_reception,
        motor_service_description,
        motor_inventory_number,
        subdivision_id,
        subdivisions (
          name
        ),
        receptions!inner (
          id,
          reception_number,
          reception_date,
          counterparty_id
        )
      )
    `)
    .is('upd_document_id', null)
    .eq('accepted_motors.receptions.counterparty_id', counterpartyId);

  if (subdivisionId) {
    query = query.eq('accepted_motors.subdivision_id', subdivisionId);
  }

  if (receptionIds && receptionIds.length > 0) {
    query = query.in('accepted_motors.receptions.id', receptionIds);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    item_description: item.item_description,
    work_group: item.work_group,
    price: item.price,
    quantity: item.quantity,
    transaction_type: item.transaction_type,
    motor_service_description: item.accepted_motors.motor_service_description,
    motor_inventory_number: item.accepted_motors.motor_inventory_number,
    subdivision_name: item.accepted_motors.subdivisions?.name || null,
    reception_number: item.accepted_motors.receptions.reception_number,
    reception_date: item.accepted_motors.receptions.reception_date,
    position_number: item.accepted_motors.position_in_reception,
  }));
}

// RENAMED AND UPDATED to call the correct RPC function
export async function createUpdAndLinkReceptionItems(
  params: CreateUpdParams
): Promise<string> {
  const { data, error } = await supabase.rpc('create_upd_and_link_reception_items', {
    p_counterparty_id: params.counterpartyId,
    p_subdivision_id: params.subdivisionId || null,
    p_document_number: params.documentNumber,
    p_document_date: params.documentDate,
    p_item_ids: params.itemIds,
  });

  if (error) {
    throw error;
  }

  // The RPC returns the newly created UPD ID (UUID string)
  return data;
}

export async function getCounterparties() {
  const { data, error } = await supabase
    .from('counterparties')
    .select('id, name, inn')
    .order('name');

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getSubdivisions(counterpartyId?: string) {
  if (counterpartyId) {
    const { data, error } = await supabase
      .from('accepted_motors')
      .select(`
        subdivisions!inner (
          id,
          name,
          code
        ),
        receptions!inner (
          counterparty_id
        )
      `)
      .eq('receptions.counterparty_id', counterpartyId);

    if (error) {
      throw error;
    }

    const uniqueSubdivisions = new Map();
    (data || []).forEach((item: any) => {
      const sub = item.subdivisions;
      if (sub && !uniqueSubdivisions.has(sub.id)) {
        uniqueSubdivisions.set(sub.id, sub);
      }
    });

    return Array.from(uniqueSubdivisions.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  const { data, error } = await supabase
    .from('subdivisions')
    .select('id, name, code')
    .order('name');

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getReceptionsByCounterparty(counterpartyId: string) {
  const { data, error } = await supabase
    .from('receptions')
    .select('id, reception_number, reception_date')
    .eq('counterparty_id', counterpartyId)
    .order('reception_date', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export interface UPDDocumentWithCounterparty {
  id: string;
  document_number: string;
  document_date: string;
  total_income: number;
  total_expense: number;
  status: string;
  counterparty_id: string;
  subdivision_id: string | null;
  created_at: string;
  counterparties: {
    id: string;
    name: string;
    inn?: string;
  };
  subdivisions?: {
    id: string;
    name: string;
  } | null;
}

export async function getUpdDocuments(): Promise<UPDDocumentWithCounterparty[]> {
  const { data, error } = await supabase
    .from('upd_documents')
    .select(`
      id,
      document_number,
      document_date,
      total_income,
      total_expense,
      status,
      counterparty_id,
      subdivision_id,
      created_at,
      counterparties (
        id,
        name,
        inn
      ),
      subdivisions (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

export async function getUpdDocumentById(updId: string): Promise<UPDDocumentWithCounterparty | null> {
  const { data, error } = await supabase
    .from('upd_documents')
    .select(`
      id,
      document_number,
      document_date,
      total_income,
      total_expense,
      status,
      counterparty_id,
      subdivision_id,
      created_at,
      counterparties (
        id,
        name,
        inn
      ),
      subdivisions (
        id,
        name
      )
    `)
    .eq('id', updId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getUpdLinkedReceptionItems(updId: string) {
  const { data, error } = await supabase
    .from('reception_items')
    .select(`
      id,
      item_description,
      work_group,
      price,
      quantity,
      transaction_type,
      accepted_motors (
        position_in_reception,
        motor_service_description,
        motor_inventory_number,
        subdivision_id,
        subdivisions (
          name
        ),
        receptions (
          id,
          reception_number,
          reception_date,
          counterparty_id
        )
      )
    `)
    .eq('upd_document_id', updId);

  if (error) {
    throw error;
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    item_description: item.item_description,
    work_group: item.work_group,
    price: item.price,
    quantity: item.quantity,
    transaction_type: item.transaction_type,
    motor_service_description: item.accepted_motors?.motor_service_description || '',
    motor_inventory_number: item.accepted_motors?.motor_inventory_number || '',
    subdivision_name: item.accepted_motors?.subdivisions?.name || null,
    reception_number: item.accepted_motors?.receptions?.reception_number || '',
    reception_date: item.accepted_motors?.receptions?.reception_date || '',
    position_number: item.accepted_motors?.position_in_reception || 0,
  }));
}

export async function disbandUpdDocument(updId: string): Promise<void> {
  const { error } = await supabase.rpc('disband_upd_document', {
    p_upd_document_id: updId,
  });

  if (error) {
    throw error;
  }
}
