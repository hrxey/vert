/*
      # Create Reception Templates Schema

      This migration adds the necessary tables to support saving and loading reusable reception position templates.

      1.  **New Tables**
          - `reception_templates`: Stores the header information for a template, such as its name, description, and original counterparty.
          - `reception_template_items`: Stores the individual line items associated with a template.

      2.  **Relationships**
          - A foreign key relationship is established between `reception_template_items` and `reception_templates` with `ON DELETE CASCADE` to ensure that when a template is deleted, all its associated items are also removed.

      3.  **Security**
          - Row Level Security (RLS) is enabled on both tables.
          - Policies are created to ensure that users can only view, create, update, and delete their own templates and template items. This isolates data between different users.

      4.  **Indexes**
          - Indexes are added to `user_id` and `template_id` columns to improve query performance when fetching templates for a specific user.
    */

    -- Create the reception_templates table
    CREATE TABLE IF NOT EXISTS reception_templates (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      description text,
      counterparty_name text NOT NULL,
      reception_date text NOT NULL,
      user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      is_active boolean NOT NULL DEFAULT true
    );

    -- Create the reception_template_items table
    CREATE TABLE IF NOT EXISTS reception_template_items (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      template_id uuid NOT NULL REFERENCES reception_templates(id) ON DELETE CASCADE,
      position_number integer NOT NULL,
      service_name text NOT NULL,
      subdivision_name text NOT NULL,
      item_name text NOT NULL,
      work_group text NOT NULL,
      transaction_type text NOT NULL,
      price numeric NOT NULL,
      quantity numeric NOT NULL,
      motor_inventory_number text,
      sort_order integer NOT NULL,
      user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    -- Add indexes for performance
    CREATE INDEX IF NOT EXISTS idx_reception_templates_user_id ON reception_templates(user_id);
    CREATE INDEX IF NOT EXISTS idx_reception_template_items_template_id ON reception_template_items(template_id);
    CREATE INDEX IF NOT EXISTS idx_reception_template_items_user_id ON reception_template_items(user_id);

    -- Enable Row Level Security
    ALTER TABLE reception_templates ENABLE ROW LEVEL SECURITY;
    ALTER TABLE reception_template_items ENABLE ROW LEVEL SECURITY;

    -- RLS Policies for reception_templates
    CREATE POLICY "Users can manage their own templates"
      ON reception_templates
      FOR ALL
      USING (auth.uid() = user_id);

    -- RLS Policies for reception_template_items
    CREATE POLICY "Users can manage their own template items"
      ON reception_template_items
      FOR ALL
      USING (auth.uid() = user_id);
