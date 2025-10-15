/*
  # Resolve RPC Function Overloading

  1. Purpose
    - Resolves the PGRST203 error caused by function overloading on `create_upd_and_link_reception_items`.
    - Two functions existed, differing only by the type of `p_document_date` (text vs. timestamptz).
    - We drop the conflicting `timestamptz` version and ensure only the `text` version (which matches client usage) remains.

  2. Changes
    - **DROP Function**: Drops the function signature using `timestamp with time zone` for the date parameter.
    - **CREATE OR REPLACE Function**: Ensures the correct function signature using `text` for the date parameter is present.
*/

-- 1. Drop the conflicting function signature (using timestamp with time zone for date)
DROP FUNCTION IF EXISTS create_upd_and_link_reception_items(uuid, uuid, text, timestamp with time zone, uuid[]);

-- 2. Ensure the correct function signature (using text for date) is present
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
        p_document_date,
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
