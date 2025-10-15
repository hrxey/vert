/*
  # Add Disband UPD Document Function

  1. Purpose
    - Creates a PostgreSQL function to safely disband (delete) a UPD document
    - Restores reception items back to the archive by clearing their upd_document_id
    - Ensures atomic transaction for data integrity

  2. Function Details
    - Name: `disband_upd_document`
    - Parameters:
      - `p_upd_document_id` (UUID): ID of the UPD document to disband
    - Returns: VOID (no return value)

  3. Transaction Flow
    - Step 1: Verify user owns the UPD document (security check)
    - Step 2: Update all reception_items linked to this UPD, setting upd_document_id to NULL
    - Step 3: Delete the UPD document from upd_documents table
    - All operations are atomic (transaction rolls back if any step fails)

  4. Security
    - Function is SECURITY DEFINER to ensure proper permissions
    - Only accessible to authenticated users
    - Verifies ownership before allowing operation
*/

-- Create the disband UPD function
CREATE OR REPLACE FUNCTION disband_upd_document(
    p_upd_document_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_document_user_id uuid;
BEGIN
    -- Check if the user is authenticated
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    -- Verify the user owns this UPD document
    SELECT user_id INTO v_document_user_id
    FROM public.upd_documents
    WHERE id = p_upd_document_id;

    IF v_document_user_id IS NULL THEN
        RAISE EXCEPTION 'УПД документ не найден.';
    END IF;

    IF v_document_user_id != v_user_id THEN
        RAISE EXCEPTION 'У вас нет прав для расформирования этого УПД.';
    END IF;

    -- Step 1: Restore reception items back to the archive (set upd_document_id to NULL)
    UPDATE public.reception_items
    SET upd_document_id = NULL
    WHERE upd_document_id = p_upd_document_id;

    -- Step 2: Delete the UPD document
    DELETE FROM public.upd_documents
    WHERE id = p_upd_document_id
    AND user_id = v_user_id;

END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION disband_upd_document(uuid) TO authenticated;
