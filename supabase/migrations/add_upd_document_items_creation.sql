/*
  # Implement full UPD creation logic

  1. Purpose
    - Extends the `create_upd_and_link_reception_items` RPC function to correctly implement the business logic:
      a. Create the main UPD document.
      b. Create corresponding line items in `upd_document_items` by copying data from selected `reception_items`.
      c. Link the original `reception_items` to the new UPD document ID.
    - Preserves the explicit date casting fix (`p_document_date::timestamptz`).

  2. Changes
    - **CREATE OR REPLACE Function**: Updates the function to include an `INSERT INTO upd_document_items ... SELECT` statement.
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
        p_document_date::timestamptz, -- Explicit type casting (Fix 42804)
        v_user_id,
        'draft'
    )
    RETURNING id INTO v_upd_id;

    -- 2. Insert corresponding line items into upd_document_items
    -- We copy the necessary data from the selected reception_items
    INSERT INTO public.upd_document_items (
        upd_document_id,
        source_reception_item_id,
        item_description,
        quantity,
        price,
        work_group,
        transaction_type
    )
    SELECT
        v_upd_id,
        ri.id,
        ri.item_description,
        ri.quantity,
        ri.price,
        ri.work_group,
        ri.transaction_type
    FROM
        public.reception_items ri
    WHERE
        ri.id = ANY(p_item_ids)
        AND ri.upd_document_id IS NULL; -- Only process items not yet linked

    -- 3. Link the original reception items to the new UPD document (update status)
    UPDATE public.reception_items
    SET upd_document_id = v_upd_id
    WHERE id = ANY(p_item_ids)
    AND upd_document_id IS NULL;

    -- 4. Return the ID of the newly created UPD document
    RETURN v_upd_id;
END;
$$;
