export interface TransactionResponse {
  id: string;
  type: 'income' | 'expense' | 'sale' | 'purchase';
  description: string;
  amount: number;
  transaction_date: string;
  category: string;
  category_id: string;
  tags: string[];
  customer_vendor: string;
  payment_method: string; // Now dynamic from payment_methods table
  payment_method_id: string;
  payment_status: 'pending' | 'completed' | 'partial' | 'cancelled';
  reference_number: string;
  invoice_number: string;
  notes: string;
  attachments: string[];
  tax_amount: number;
  discount_amount: number;
  net_amount: number;
  currency: string;
  exchange_rate: number;
  is_recurring: boolean;
  recurring_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | '';
  recurring_end_date: string;
  parent_transaction_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionParams {
  type: 'income' | 'expense' | 'sale' | 'purchase';
  description: string;
  amount: number;
  transaction_date: string;
  category?: string;
  tags?: string[];
  customer_vendor?: string;
  payment_method?: string;
  payment_status?: string;
  reference_number?: string;
  invoice_number?: string;
  notes?: string;
  attachments?: string[];
  tax_amount?: number;
  discount_amount?: number;
  currency?: string;
  exchange_rate?: number;
  is_recurring?: boolean;
  recurring_frequency?: string;
  recurring_end_date?: string;
  parent_transaction_id?: string;
  created_by?: string;
}

export interface UpdateTransactionParams {
  type: 'income' | 'expense' | 'sale' | 'purchase';
  description: string;
  amount: number;
  transaction_date: string;
  category?: string;
  tags?: string[];
  customer_vendor?: string;
  payment_method?: string;
  payment_status?: string;
  reference_number?: string;
  invoice_number?: string;
  notes?: string;
  attachments?: string[];
  tax_amount?: number;
  discount_amount?: number;
  currency?: string;
  exchange_rate?: number;
  is_recurring?: boolean;
  recurring_frequency?: string;
  recurring_end_date?: string;
}

export interface ListTransactionParams {
  created_by?: string;
  from_date?: string;
  to_date?: string;
  type?: string | string[];
  category?: string | string[];
  payment_status?: string | string[];
  payment_method?: string | string[];
  customer_vendor?: string;
  search?: string;
  tags?: string[];
  reference_number?: string;
  invoice_number?: string;
  min_amount?: number;
  max_amount?: number;
  has_tax?: boolean;
  has_discount?: boolean;
  is_recurring?: boolean;
  limit?: number;
  offset?: number;
}

export interface TransactionStats {
  total_income: number;
  total_expenses: number;
  net_profit: number;
  total_transactions: number;
  total_income_count: number;
  total_expense_count: number;
  average_transaction: number;
  pending_income: number;
  pending_expenses: number;
}

export interface CategorySummary {
  category: string;
  type: string;
  count: number;
  total_amount: number;
}

// Category types
export interface CategoryResponse {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  color: string;
  icon: string;
  parent_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryParams {
  name: string;
  type: 'income' | 'expense' | 'both';
  color: string;
  icon: string;
  parent_id?: string;
  is_active?: boolean;
}

export interface UpdateCategoryParams {
  name: string;
  type: 'income' | 'expense' | 'both';
  color: string;
  icon: string;
  parent_id?: string;
  is_active?: boolean;
}

// Payment Method types
export interface PaymentMethodResponse {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TableColumn {
  id: string;
  label: string;
  visible: boolean;
  order: number;
  width?: string;
  accessor?: (transaction: TransactionResponse) => any;
}

export interface ColumnConfig {
  [key: string]: TableColumn;
}

export interface CreatePaymentMethodParams {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdatePaymentMethodParams {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface StatsParams {
  created_by?: string;
  from_date?: string;
  to_date?: string;
}

// Keep TransactionCategory for backward compatibility
export type TransactionCategory = CategoryResponse;

export interface FilterVisibility {
  search: boolean;
  type: boolean;
  category: boolean;
  payment_status: boolean;
  payment_method: boolean;
  customer_vendor: boolean;
  tags: boolean;
  reference_number: boolean;
  invoice_number: boolean;
  amount_range: boolean;
  tax_filter: boolean;
  discount_filter: boolean;
  recurring_filter: boolean;
  date_range: boolean;
}

export interface TagSuggestion {
  value: string;
  count: number;
  lastUsed: string;
}