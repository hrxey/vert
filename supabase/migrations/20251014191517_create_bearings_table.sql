/*
  # Создание таблицы подшипников

  1. Новые таблицы
    - `bearings` (подшипники)
      - `id` (uuid, первичный ключ)
      - `brand` (text) - Марка подшипника
      - `name` (text) - Полное название подшипника
      - `diameter` (integer) - Диаметр в мм
      - `number` (text) - Номер подшипника
      - `type` (text) - Вид подшипника
      - `created_at` (timestamptz) - Дата создания
      - `user_id` (uuid) - ID пользователя
  
  2. Безопасность
    - Включить RLS для таблицы `bearings`
    - Политики для аутентифицированных пользователей:
      - Просмотр своих подшипников
      - Создание новых подшипников
      - Обновление своих подшипников
      - Удаление своих подшипников
  
  3. Индексы
    - Индекс для быстрого поиска по названию, марке, номеру, виду
*/

CREATE TABLE IF NOT EXISTS bearings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL DEFAULT '',
  name text NOT NULL,
  diameter integer NOT NULL DEFAULT 0,
  number text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

ALTER TABLE bearings ENABLE ROW LEVEL SECURITY;

-- Политика для просмотра своих подшипников
CREATE POLICY "Users can view own bearings"
  ON bearings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Политика для создания подшипников
CREATE POLICY "Users can create own bearings"
  ON bearings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Политика для обновления своих подшипников
CREATE POLICY "Users can update own bearings"
  ON bearings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Политика для удаления своих подшипников
CREATE POLICY "Users can delete own bearings"
  ON bearings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_bearings_brand ON bearings(brand);
CREATE INDEX IF NOT EXISTS idx_bearings_name ON bearings(name);
CREATE INDEX IF NOT EXISTS idx_bearings_number ON bearings(number);
CREATE INDEX IF NOT EXISTS idx_bearings_type ON bearings(type);
CREATE INDEX IF NOT EXISTS idx_bearings_diameter ON bearings(diameter);
CREATE INDEX IF NOT EXISTS idx_bearings_user_id ON bearings(user_id);
