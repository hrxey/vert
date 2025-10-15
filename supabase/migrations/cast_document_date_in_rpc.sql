/*
  # Fix RPC Date Casting

  1. Purpose
    - Resolves the 42804 error: "column "document_date" is of type timestamp with time zone but expression is of type text".
    - The RPC function `create_upd_and_link_reception_items` needs explicit casting for the `p_document_date` parameter (which is text) when inserting it into the `upd_documents.document_date` column (which is timestamptz).

  2. Changes
    - **CREATE OR REPLACE Function**: Updates the function to use `p_document_date::timestamptz` during the INSERT operation.
*/

CREATE OR REPLACE FUNCTION create_upd_and_link_reception_items(
    p_counterparty_id uuid,
    p_subdivision_id uuid,
    p_document_number text,
    p_document_date text,
    p_item_ids uuid[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_upd_id uuid;
    v_user_id uuid := auth.uid();
BEGIN
    -- Check if the user is authenticated
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    -- 1. Insert the new UPD document
    INSERT INTO public.upd_documents (
        counterparty_id,
        subdivision_id,
        document_number,
        document_date,
        user_id,
        status
    )
    VALUES (
        p_counterparty_id,
        p_subdivision_id,
        p_document_number,
        p_document_date::timestamptz, -- Явное приведение типа
        v_user_id,
        'draft' -- Assuming 'draft' is the initial status
    )
    RETURNING id INTO v_upd_id;

    -- 2. Link the reception items to the new UPD document
    -- We only update items that are currently unlinked (upd_document_id IS NULL)
    UPDATE public.reception_items
    SET upd_document_id = v_upd_id
    WHERE id = ANY(p_item_ids)
    AND upd_document_id IS NULL;

    -- 3. Return the ID of the newly created UPD document
    RETURN v_upd_id;
END;
$$;
