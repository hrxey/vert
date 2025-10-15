/*
  # Создание таблицы "Оплата труда" (Labor Payments)

  1. Новые таблицы
    - `labor_payments`
      - `id` (uuid, primary key) - Уникальный идентификатор
      - `short_name` (text) - ФИО (краткое)
      - `full_name` (text) - Полное ФИО
      - `payment_name` (text) - Название оплаты
      - `position` (text) - Должность
      - `hourly_rate` (numeric) - Часовая ставка
      - `created_at` (timestamptz) - Дата создания
      - `updated_at` (timestamptz) - Дата обновления

  2. Безопасность
    - Включить RLS для таблицы `labor_payments`
    - Добавить политики для аутентифицированных пользователей
*/

CREATE TABLE IF NOT EXISTS labor_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  short_name text NOT NULL,
  full_name text NOT NULL,
  payment_name text NOT NULL,
  position text NOT NULL,
  hourly_rate numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Включаем RLS
ALTER TABLE labor_payments ENABLE ROW LEVEL SECURITY;

-- Политика для просмотра
CREATE POLICY "Authenticated users can view labor payments"
  ON labor_payments
  FOR SELECT
  TO authenticated
  USING (true);

-- Политика для вставки
CREATE POLICY "Authenticated users can insert labor payments"
  ON labor_payments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Политика для обновления
CREATE POLICY "Authenticated users can update labor payments"
  ON labor_payments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Политика для удаления
CREATE POLICY "Authenticated users can delete labor payments"
  ON labor_payments
  FOR DELETE
  TO authenticated
  USING (true);

-- Создаем индексы для оптимизации поиска
CREATE INDEX IF NOT EXISTS idx_labor_payments_payment_name ON labor_payments(payment_name);
CREATE INDEX IF NOT EXISTS idx_labor_payments_full_name ON labor_payments(full_name);
CREATE INDEX IF NOT EXISTS idx_labor_payments_short_name ON labor_payments(short_name);

-- Добавляем тестовые данные
INSERT INTO labor_payments (short_name, full_name, payment_name, position, hourly_rate)
VALUES 
  ('Григорьев А.В.', 'Григорьев Андрей Витальевич', 'Зарплата токаря Григорьев А.В.', 'Токарь', 500),
  ('Иванов И.И.', 'Иванов Иван Иванович', 'Зарплата слесаря Иванов И.И.', 'Слесарь', 300),
  ('Кузнецов А.М.', 'Кузнецов Алексей Михайлович', 'Зарплата обмотчика Кузнецов А.М.', 'Обмотчик', 400)
ON CONFLICT DO NOTHING;
