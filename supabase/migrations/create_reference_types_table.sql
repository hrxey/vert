/*
  # Create reference_types table for managing dynamic reference catalogs

  1. New Tables
    - `reference_types`
      - `id` (uuid, primary key) - Unique identifier
      - `name` (text) - Display name of the reference type (e.g., "Справочник Двигателей")
      - `type_key` (text) - System key for reference type (e.g., "motors", "counterparties")
      - `icon_name` (text) - Name of the Lucide icon to display
      - `route` (text) - URL route to the reference page
      - `is_active` (boolean) - Whether the reference type is active
      - `user_id` (uuid) - Owner of the reference type
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `reference_types` table
    - Add policy for users to read their own reference types
    - Add policy for users to create their own reference types
    - Add policy for users to update their own reference types
    - Add policy for users to delete their own reference types

  3. Initial Data
    - Insert default reference types for motors, counterparties, and subdivisions
*/

-- Create reference_types table
CREATE TABLE IF NOT EXISTS reference_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type_key text NOT NULL,
  icon_name text NOT NULL DEFAULT 'FileText',
  route text NOT NULL,
  is_active boolean DEFAULT true,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, type_key)
);

-- Enable RLS
ALTER TABLE reference_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can read own reference types" ON reference_types;
CREATE POLICY "Users can read own reference types"
  ON reference_types FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own reference types" ON reference_types;
CREATE POLICY "Users can create own reference types"
  ON reference_types FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reference types" ON reference_types;
CREATE POLICY "Users can update own reference types"
  ON reference_types FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reference types" ON reference_types;
CREATE POLICY "Users can delete own reference types"
  ON reference_types FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_reference_types_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reference_types_updated_at ON reference_types;
CREATE TRIGGER reference_types_updated_at
  BEFORE UPDATE ON reference_types
  FOR EACH ROW
  EXECUTE FUNCTION update_reference_types_updated_at();

-- Create function to initialize default reference types for a user
CREATE OR REPLACE FUNCTION initialize_default_reference_types(p_user_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO reference_types (user_id, name, type_key, icon_name, route, is_active)
  VALUES
    (p_user_id, 'Справочник Двигателей', 'motors', 'Gauge', '/app/reference/motors', true),
    (p_user_id, 'Контрагенты', 'counterparties', 'Users', '/app/reference/counterparties', true),
    (p_user_id, 'Подразделения', 'subdivisions', 'Warehouse', '/app/reference/subdivisions', true)
  ON CONFLICT (user_id, type_key) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
