/*
  # Add bearings reference type to default reference types

  1. Changes
    - Update the initialize_default_reference_types function to include 'bearings' reference type
    - This will add "Подшипники" as a new reference type option for all users

  2. Notes
    - This migration updates an existing function
    - Existing users will need to call initialize_default_reference_types to get the new reference type
*/

-- Update function to initialize default reference types including bearings
CREATE OR REPLACE FUNCTION initialize_default_reference_types(p_user_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO reference_types (user_id, name, type_key, icon_name, route, is_active)
  VALUES
    (p_user_id, 'Справочник Двигателей', 'motors', 'Gauge', '/app/reference/motors', true),
    (p_user_id, 'Контрагенты', 'counterparties', 'Users', '/app/reference/counterparties', true),
    (p_user_id, 'Подразделения', 'subdivisions', 'Warehouse', '/app/reference/subdivisions', true),
    (p_user_id, 'Провод', 'wires', 'Cable', '/app/reference/wires', true),
    (p_user_id, 'Подшипники', 'bearings', 'Circle', '/app/reference/bearings', true)
  ON CONFLICT (user_id, type_key) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
