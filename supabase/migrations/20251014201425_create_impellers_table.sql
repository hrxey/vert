/*
  # Create Impellers Reference Table

  1. New Tables
    - `impellers`
      - `id` (uuid, primary key) - Unique identifier
      - `name` (text) - Impeller name (e.g., "Вентилятор (крыльчатка охлаждения 62/355/86-9)")
      - `mounting_diameter` (integer) - Mounting diameter in mm (Посадочный диаметр)
      - `outer_diameter` (integer) - Outer diameter in mm (Наружный диаметр)
      - `height` (integer) - Impeller height in mm (Высота крыльчатки)
      - `blade_count` (integer) - Number of blades (Количество лопастей)
      - `user_id` (uuid) - User who created the record
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on `impellers` table
    - Add policies for authenticated users to:
      - View all impellers
      - Create new impellers
      - Update their own impellers
      - Delete their own impellers

  3. Indexes
    - Index on name for faster searching
    - Index on diameter fields for numeric searches
*/

CREATE TABLE IF NOT EXISTS impellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  mounting_diameter integer NOT NULL,
  outer_diameter integer NOT NULL,
  height integer NOT NULL,
  blade_count integer NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE impellers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all impellers"
  ON impellers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create impellers"
  ON impellers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own impellers"
  ON impellers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own impellers"
  ON impellers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_impellers_name ON impellers(name);
CREATE INDEX IF NOT EXISTS idx_impellers_mounting_diameter ON impellers(mounting_diameter);
CREATE INDEX IF NOT EXISTS idx_impellers_outer_diameter ON impellers(outer_diameter);

INSERT INTO impellers (name, mounting_diameter, outer_diameter, height, blade_count, user_id)
SELECT 
  'Вентилятор (крыльчатка охлаждения 62/355/86-9)', 62, 355, 86, 9, id
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO impellers (name, mounting_diameter, outer_diameter, height, blade_count, user_id)
SELECT 
  'Вентилятор (крыльчатка охлаждения 55/300/63-6)', 55, 300, 63, 6, id
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO impellers (name, mounting_diameter, outer_diameter, height, blade_count, user_id)
SELECT 
  'Вентилятор (крыльчатка охлаждения 42/210/48-6)', 42, 210, 48, 6, id
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO impellers (name, mounting_diameter, outer_diameter, height, blade_count, user_id)
SELECT 
  'Вентилятор (крыльчатка охлаждения 58/340/70-9)', 58, 340, 70, 9, id
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO impellers (name, mounting_diameter, outer_diameter, height, blade_count, user_id)
SELECT 
  'Вентилятор (крыльчатка охлаждения 52/296/62-8)', 52, 296, 62, 8, id
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO impellers (name, mounting_diameter, outer_diameter, height, blade_count, user_id)
SELECT 
  'Вентилятор (крыльчатка охлаждения 45/300/53-8)', 45, 300, 53, 8, id
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO impellers (name, mounting_diameter, outer_diameter, height, blade_count, user_id)
SELECT 
  'Вентилятор (крыльчатка охлаждения 65/365/62-8)', 65, 365, 62, 8, id
FROM auth.users
LIMIT 1
ON CONFLICT DO NOTHING;
