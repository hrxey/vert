/*
  # Create wires reference table

  1. New Tables
    - `wires`
      - `id` (uuid, primary key) - Unique identifier
      - `type` (text) - Вид провода (e.g., "Обмоточный провод", "Шина")
      - `brand` (text) - Марка (e.g., "ПСДТ", "ПЭТ-155")
      - `name` (text) - Название (полное наименование)
      - `heat_resistance` (text, nullable) - Нагревостойкость (e.g., "155°C", "200°C")
      - `cross_section` (text) - Сечение (e.g., "2,5х4", "1,32", "4х30")
      - `shape` (text) - Форма ("Круглый", "Прямоугольный")
      - `quantity` (numeric) - Количество (default 1)
      - `price` (numeric) - Цена (default 0)
      - `created_at` (timestamptz) - Timestamp when created
      - `updated_at` (timestamptz) - Timestamp when updated

  2. Security
    - Enable RLS on `wires` table
    - Add policies for authenticated users to:
      - Read all wires
      - Create new wires
      - Update existing wires
      - Delete wires

  3. Indexes
    - Index on `name` for fast search
    - Index on `brand` for filtering
    - Index on `type` for filtering
*/

CREATE TABLE IF NOT EXISTS wires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  brand text NOT NULL,
  name text NOT NULL,
  heat_resistance text,
  cross_section text NOT NULL,
  shape text NOT NULL,
  quantity numeric DEFAULT 1,
  price numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE wires ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Authenticated users can view all wires"
  ON wires
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create wires"
  ON wires
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update wires"
  ON wires
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete wires"
  ON wires
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for faster search
CREATE INDEX IF NOT EXISTS idx_wires_name ON wires (name);
CREATE INDEX IF NOT EXISTS idx_wires_brand ON wires (brand);
CREATE INDEX IF NOT EXISTS idx_wires_type ON wires (type);
CREATE INDEX IF NOT EXISTS idx_wires_cross_section ON wires (cross_section);
CREATE INDEX IF NOT EXISTS idx_wires_shape ON wires (shape);

-- Insert sample data
INSERT INTO wires (type, brand, name, heat_resistance, cross_section, shape, quantity, price) VALUES
  ('Обмоточный провод', 'ПСДТ', 'Кабель Провод ПСДТ 2,5*4', '155°C', '2,5х4', 'Прямоугольный', 1, 0),
  ('Обмоточный провод', 'ПЭТ-155', 'ПЭТ-155 1,32', '155°C', '1,32', 'Круглый', 1, 0),
  ('Шина', 'Шина алюминиевая', 'Шина алюминиевая 4*30, 1800м', NULL, '4х30', 'Прямоугольный', 1, 0),
  ('Обмоточный провод', 'ПЭЭИД-2', 'Эмальпровод ПЭЭИД-2-200 0,900', '200°C', '0,9', 'Круглый', 1, 0),
  ('Обмоточный провод', 'ПЭТВ-2', 'ПЭТВ-2 0,125', '130°C', '0,125', 'Круглый', 1, 0)
ON CONFLICT DO NOTHING;
