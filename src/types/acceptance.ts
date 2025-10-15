import { Motor } from './database'

    /**
     * Represents a single item (service, part, or motor) in the Acceptance/UPD document structure.
     * This structure supports hierarchical nesting.
     */
    export interface AcceptanceItem {
      // Unique ID for client-side management (can be temporary UUID)
      id: string
      // Description of the item (e.g., 'Ремонт двигателя стандарт')
      description: string
      // Type of item (e.g., 'service', 'part', 'motor')
      item_type: string
      // Nesting level (1 for top-level, 2 for sub-group, 3 for detail)
      level: number
      // Price per unit (can be income or expense)
      price: number
      // Quantity
      quantity: number
      // True if this item represents income (Доходы), False if expense (Расходы)
      is_income: boolean
      // Optional reference to a motor if this item is a motor repair
      motor_id?: string | null
      // Nested items
      children: AcceptanceItem[]
    }

    /**
     * Represents the state of a top-level repair group (e.g., Repair of Motor X).
     */
    export interface RepairGroup {
      id: string
      // The main item being repaired/accepted (Level 1)
      mainItem: AcceptanceItem
      // Total calculated income for this group
      totalIncome: number
      // Total calculated expense for this group
      totalExpense: number
      // Total profit (Income - Expense)
      totalProfit: number
    }

    /**
     * Represents a reception template header.
     */
    export interface ReceptionTemplate {
      id: string
      name: string
      description: string | null
      counterparty_name: string
      reception_date: string
      user_id: string
      created_at: string
      updated_at: string
      is_active: boolean
      reception_template_items_count?: number
    }

    /**
     * Represents a single line item within a reception template.
     */
    export interface ReceptionTemplateItem {
      id: string
      template_id: string
      position_number: number
      service_name: string
      subdivision_name: string
      item_name: string
      work_group: string
      transaction_type: string
      price: number
      quantity: number
      motor_inventory_number: string | null
      sort_order: number
      user_id: string
      created_at: string
    }

    /**
     * Represents a complete template with its header and all associated items.
     */
    export interface TemplateWithItems extends ReceptionTemplate {
      reception_template_items: ReceptionTemplateItem[]
    }
