/*
  # Создание таблицы "Справочник Документов спец" (Special Documents)

  1. Новые таблицы
    - `special_documents`
      - `id` (uuid, primary key) - Уникальный идентификатор
      - `document_date` (timestamptz) - Дата документа
      - `document_number` (text) - Номер УПД
      - `counterparty` (text) - Контрагент
      - `contract` (text) - Договор
      - `amount_without_vat` (numeric) - Сумма без НДС
      - `amount_with_vat` (numeric) - Сумма с НДС
      - `created_at` (timestamptz) - Дата создания
      - `updated_at` (timestamptz) - Дата обновления

  2. Безопасность
    - Включить RLS для таблицы `special_documents`
    - Добавить политики для аутентифицированных пользователей
*/

CREATE TABLE IF NOT EXISTS special_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_date timestamptz NOT NULL,
  document_number text NOT NULL,
  counterparty text NOT NULL,
  contract text NOT NULL DEFAULT '',
  amount_without_vat numeric NOT NULL DEFAULT 0,
  amount_with_vat numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Включаем RLS
ALTER TABLE special_documents ENABLE ROW LEVEL SECURITY;

-- Политика для просмотра
CREATE POLICY "Authenticated users can view special documents"
  ON special_documents
  FOR SELECT
  TO authenticated
  USING (true);

-- Политика для вставки
CREATE POLICY "Authenticated users can insert special documents"
  ON special_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Политика для обновления
CREATE POLICY "Authenticated users can update special documents"
  ON special_documents
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Политика для удаления
CREATE POLICY "Authenticated users can delete special documents"
  ON special_documents
  FOR DELETE
  TO authenticated
  USING (true);

-- Создаем индексы для оптимизации поиска
CREATE INDEX IF NOT EXISTS idx_special_documents_date ON special_documents(document_date);
CREATE INDEX IF NOT EXISTS idx_special_documents_number ON special_documents(document_number);
CREATE INDEX IF NOT EXISTS idx_special_documents_counterparty ON special_documents(counterparty);

-- Добавляем тестовые данные
INSERT INTO special_documents (document_date, document_number, counterparty, contract, amount_without_vat, amount_with_vat)
VALUES 
  ('2023-01-10 08:47:11', 'Реализация (акт, накладная, УПД) 00БП-000001 от 10.01.2023 8:47:11', 'Викинг кран технолоджи', 'Договор №289 от 26.04.2022', 15000, 18000),
  ('2024-01-10 09:55:40', 'Реализация (акт, накладная, УПД) 00БП-000001 от 10.01.2024 9:55:40', 'ТехПромМаш', 'Договор №307 от 29.09.2022', 74902.5, 89883),
  ('2022-01-11 09:16:58', 'Реализация (акт, накладная, УПД) 00БП-000001 от 11.01.2022 9:16:58', 'Пристенская зерновая компания', 'Договор №158 от 01.03.2019', 95560, 114672),
  ('2023-01-10 13:05:33', 'Реализация (акт, накладная, УПД) 00БП-000002 от 10.01.2023 13:05:33', 'РЫЛЬСКАЯ ЗАО АФ', 'Договор №213 от 15.09.2020', 99983.5, 119980.2),
  ('2024-01-11 12:32:06', 'Реализация (акт, накладная, УПД) 00БП-000002 от 11.01.2024 12:32:06', 'Пристенская зерновая компания', 'Договор №158 от 01.03.2019', 93040, 111648)
ON CONFLICT DO NOTHING;
