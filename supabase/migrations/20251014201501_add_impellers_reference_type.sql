/*
  # Add Impellers Reference Type

  1. Changes
    - Insert new reference type 'impellers' into reference_types table for each user
    - This enables impellers to be selected in the reference selection modal
*/

DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM auth.users LOOP
    INSERT INTO reference_types (user_id, name, type_key, icon_name, route, is_active)
    VALUES
      (user_record.id, 'Крыльчатки', 'impellers', 'Fan', '/app/reference/impellers', true)
    ON CONFLICT (user_id, type_key) DO NOTHING;
  END LOOP;
END $$;
