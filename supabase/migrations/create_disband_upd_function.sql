/*
  # Create RPC function to disband UPD documents

  This migration creates a new RPC function `disband_upd_document` that allows for the safe deletion of a UPD document and the unlinking of its associated reception items.

  1. New Functions
    - `disband_upd_document(p_upd_document_id uuid)`
      - Unlinks all `reception_items` from the specified UPD document by setting their `upd_document_id` to NULL.
      - Deletes the UPD document from the `upd_documents` table.

  2. Security
    - The function is created with `SECURITY DEFINER` to ensure it has the necessary permissions to modify the tables, bypassing RLS for this specific, controlled operation.
    - Grants execute permission to the `authenticated` role.
*/

CREATE OR REPLACE FUNCTION public.disband_upd_document(p_upd_document_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Unlink reception items from the UPD document
  UPDATE public.reception_items
  SET upd_document_id = NULL
  WHERE upd_document_id = p_upd_document_id;

  -- Delete the UPD document itself
  DELETE FROM public.upd_documents
  WHERE id = p_upd_document_id;
END;
$$;

-- Grant execution rights to authenticated users
GRANT EXECUTE ON FUNCTION public.disband_upd_document(uuid) TO authenticated;
