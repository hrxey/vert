/*
  # Add transaction_type column to upd_document_items

  1. Changes
    - Table `upd_document_items`: Add `transaction_type` column (text) to store the type of transaction copied from `reception_items`. This column is required by the `create_upd_and_link_reception_items` RPC function.
*/

DO $$
BEGIN
  -- Check if the column exists before adding it
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'upd_document_items'
    AND column_name = 'transaction_type'
  ) THEN
    ALTER TABLE public.upd_document_items
    ADD COLUMN transaction_type text;
  END IF;
END
$$;
