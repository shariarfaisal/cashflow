import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  TransactionResponse,
  TransactionStats,
  TransactionCategory,
  ListTransactionParams,
  CategorySummary,
  TableColumn,
  FilterVisibility,
  TagSuggestion,
  PaymentMethodResponse
} from '@/types/transactions';

interface FormFieldVisibility {
  category: boolean;
  customer_vendor: boolean;
  payment_method: boolean;
  payment_status: boolean;
  reference_number: boolean;
  invoice_number: boolean;
  tax_amount: boolean;
  discount_amount: boolean;
  tags: boolean;
  recurring: boolean;
  notes: boolean;
}

interface FormFieldConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

type FormFieldOrder = Record<string, number>;
import { startOfMonth, endOfMonth, format } from 'date-fns';

interface TransactionState {
  // Data
  transactions: TransactionResponse[];
  stats: TransactionStats | null;
  categories: TransactionCategory[];
  categorySummary: CategorySummary[];
  selectedTransaction: TransactionResponse | null;

  // UI State
  isLoading: boolean;
  error: string | null;
  viewMode: 'table' | 'grid' | 'calendar';
  showForm: boolean;
  formMode: 'create' | 'edit';

  // Filters
  filters: ListTransactionParams;

  // Pagination
  currentPage: number;
  pageSize: number;
  totalCount: number;

  // Column Configuration
  tableColumns: TableColumn[];

  // Form Field Visibility
  formFieldVisibility: FormFieldVisibility;

  // Form Field Order
  formFieldOrder: FormFieldOrder;

  // Filter Visibility
  filterVisibility: FilterVisibility;

  // Tag Suggestions
  tagSuggestions: TagSuggestion[];

  // Payment Methods
  paymentMethods: PaymentMethodResponse[];

  // Actions
  setTransactions: (transactions: TransactionResponse[]) => void;
  setStats: (stats: TransactionStats) => void;
  setCategories: (categories: TransactionCategory[]) => void;
  setCategorySummary: (summary: CategorySummary[]) => void;
  setSelectedTransaction: (transaction: TransactionResponse | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setViewMode: (mode: 'table' | 'grid' | 'calendar') => void;
  setShowForm: (show: boolean) => void;
  setFormMode: (mode: 'create' | 'edit') => void;
  setFilters: (filters: Partial<ListTransactionParams>) => void;
  resetFilters: () => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotalCount: (count: number) => void;
  setTableColumns: (columns: TableColumn[]) => void;
  resetTableColumns: () => void;
  setFormFieldVisibility: (visibility: Partial<FormFieldVisibility>) => void;
  resetFormFieldVisibility: () => void;
  setFormFieldOrder: (order: Partial<FormFieldOrder>) => void;
  resetFormFieldOrder: () => void;
  setFilterVisibility: (visibility: Partial<FilterVisibility>) => void;
  resetFilterVisibility: () => void;
  setPaymentMethods: (methods: PaymentMethodResponse[]) => void;
  addTagSuggestion: (tag: string) => void;
  removeTagSuggestion: (tag: string) => void;
  clearTagSuggestions: () => void;

  // Array filter helpers
  addToFilter: (filterKey: keyof ListTransactionParams, value: string) => void;
  removeFromFilter: (filterKey: keyof ListTransactionParams, value: string) => void;
  toggleFilter: (filterKey: keyof ListTransactionParams, value: string) => void;

  // Computed
  getFilteredTransactions: () => TransactionResponse[];
  getTotalPages: () => number;
}

const defaultFilters: ListTransactionParams = {
  from_date: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
  to_date: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  type: [],
  category: [],
  payment_status: [],
  payment_method: [],
  customer_vendor: '',
  search: '',
  limit: 50,
  offset: 0,
};

const defaultTableColumns: TableColumn[] = [
  { id: 'date', label: 'Date & Time', visible: true, order: 0 },
  { id: 'description', label: 'Description', visible: true, order: 1 },
  { id: 'type', label: 'Type', visible: true, order: 2 },
  { id: 'category', label: 'Category', visible: true, order: 3 },
  { id: 'amount', label: 'Amount', visible: true, order: 4 },
  { id: 'status', label: 'Payment Status', visible: true, order: 5 },
  { id: 'customer_vendor', label: 'Customer/Vendor', visible: false, order: 6 },
  { id: 'payment_method', label: 'Payment Method', visible: false, order: 7 },
  { id: 'reference_number', label: 'Reference #', visible: false, order: 8 },
  { id: 'invoice_number', label: 'Invoice #', visible: false, order: 9 },
  { id: 'notes', label: 'Notes', visible: false, order: 10 },
  { id: 'tags', label: 'Tags', visible: false, order: 11 },
  { id: 'tax_amount', label: 'Tax', visible: false, order: 12 },
  { id: 'discount_amount', label: 'Discount', visible: false, order: 13 },
  { id: 'net_amount', label: 'Net Amount', visible: false, order: 14 },
  { id: 'currency', label: 'Currency', visible: false, order: 15 },
  { id: 'recurring', label: 'Recurring', visible: false, order: 16 },
  { id: 'actions', label: 'Actions', visible: true, order: 17 },
];

const defaultFormFieldVisibility: FormFieldVisibility = {
  category: true,
  customer_vendor: true,
  payment_method: true,
  payment_status: true,
  reference_number: false,
  invoice_number: false,
  tax_amount: false,
  discount_amount: false,
  tags: false,
  recurring: false,
  notes: true,
};

const defaultFormFieldOrder: FormFieldOrder = {
  category: 0,
  tags: 1,
  customer_vendor: 2,
  payment_method: 3,
  payment_status: 4,
  reference_number: 5,
  invoice_number: 6,
  tax_amount: 7,
  discount_amount: 8,
  recurring: 9,
  notes: 10,
};

const defaultFilterVisibility: FilterVisibility = {
  search: true,
  type: true,
  category: true,
  payment_status: true,
  payment_method: false,
  customer_vendor: true,
  tags: false,
  reference_number: false,
  invoice_number: false,
  amount_range: false,
  tax_filter: false,
  discount_filter: false,
  recurring_filter: false,
  date_range: true,
};

export const useTransactionStore = create<TransactionState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        transactions: [],
        stats: null,
        categories: [],
        categorySummary: [],
        selectedTransaction: null,
        isLoading: false,
        error: null,
        viewMode: 'table',
        showForm: false,
        formMode: 'create',
        filters: defaultFilters,
        currentPage: 1,
        pageSize: 50,
        totalCount: 0,
        tableColumns: defaultTableColumns,
        formFieldVisibility: defaultFormFieldVisibility,
        formFieldOrder: defaultFormFieldOrder,
        filterVisibility: defaultFilterVisibility,
        tagSuggestions: [],
        paymentMethods: [],

        // Actions
        setTransactions: (transactions) => set({ transactions }),
        setStats: (stats) => set({ stats }),
        setCategories: (categories) => set({ categories }),
        setCategorySummary: (categorySummary) => set({ categorySummary }),
        setSelectedTransaction: (selectedTransaction) => set({ selectedTransaction }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        setViewMode: (viewMode) => set({ viewMode }),
        setShowForm: (showForm) => set({ showForm }),
        setFormMode: (formMode) => set({ formMode }),
        setFilters: (filters) => set((state) => ({
          filters: { ...state.filters, ...filters },
          currentPage: 1, // Reset to first page when filters change
        })),
        resetFilters: () => set({ filters: defaultFilters, currentPage: 1 }),
        setCurrentPage: (currentPage) => set({ currentPage }),
        setPageSize: (pageSize) => set({ pageSize, currentPage: 1 }),
        setTotalCount: (totalCount) => set({ totalCount }),
        setTableColumns: (tableColumns) => set({ tableColumns }),
        resetTableColumns: () => set({ tableColumns: defaultTableColumns }),
        setFormFieldVisibility: (visibility) => set((state) => ({
          formFieldVisibility: { ...state.formFieldVisibility, ...visibility }
        })),
        resetFormFieldVisibility: () => set({ formFieldVisibility: defaultFormFieldVisibility }),
        setFormFieldOrder: (order) => set((state) => ({
          formFieldOrder: { ...state.formFieldOrder, ...order } as FormFieldOrder
        })),
        resetFormFieldOrder: () => set({ formFieldOrder: defaultFormFieldOrder }),
        setFilterVisibility: (visibility) => set((state) => ({
          filterVisibility: { ...state.filterVisibility, ...visibility }
        })),
        resetFilterVisibility: () => set({ filterVisibility: defaultFilterVisibility }),
        setPaymentMethods: (paymentMethods) => set({ paymentMethods }),
        addTagSuggestion: (tag) => set((state) => {
          const existingIndex = state.tagSuggestions.findIndex(t => t.value === tag);
          if (existingIndex >= 0) {
            const updated = [...state.tagSuggestions];
            updated[existingIndex] = {
              ...updated[existingIndex],
              count: updated[existingIndex].count + 1,
              lastUsed: new Date().toISOString()
            };
            return { tagSuggestions: updated };
          } else {
            return {
              tagSuggestions: [...state.tagSuggestions, {
                value: tag,
                count: 1,
                lastUsed: new Date().toISOString()
              }]
            };
          }
        }),
        removeTagSuggestion: (tag) => set((state) => ({
          tagSuggestions: state.tagSuggestions.filter(t => t.value !== tag)
        })),
        clearTagSuggestions: () => set({ tagSuggestions: [] }),

        // Helper functions for array filters
        addToFilter: (filterKey: keyof ListTransactionParams, value: string) => set((state) => {
          const currentFilter = state.filters[filterKey];
          if (Array.isArray(currentFilter)) {
            if (!currentFilter.includes(value)) {
              return {
                filters: {
                  ...state.filters,
                  [filterKey]: [...currentFilter, value]
                },
                currentPage: 1
              };
            }
          }
          return state;
        }),

        removeFromFilter: (filterKey: keyof ListTransactionParams, value: string) => set((state) => {
          const currentFilter = state.filters[filterKey];
          if (Array.isArray(currentFilter)) {
            return {
              filters: {
                ...state.filters,
                [filterKey]: currentFilter.filter(item => item !== value)
              },
              currentPage: 1
            };
          }
          return state;
        }),

        toggleFilter: (filterKey: keyof ListTransactionParams, value: string) => set((state) => {
          const currentFilter = state.filters[filterKey];
          if (Array.isArray(currentFilter)) {
            const isSelected = currentFilter.includes(value);
            return {
              filters: {
                ...state.filters,
                [filterKey]: isSelected
                  ? currentFilter.filter(item => item !== value)
                  : [...currentFilter, value]
              },
              currentPage: 1
            };
          }
          return state;
        }),

        // Computed
        getFilteredTransactions: () => {
          const state = get();
          let filtered = [...state.transactions];

          // Apply client-side filtering if needed
          if (state.filters.search) {
            const search = state.filters.search.toLowerCase();
            filtered = filtered.filter(t =>
              t.description.toLowerCase().includes(search) ||
              t.customer_vendor?.toLowerCase().includes(search) ||
              t.reference_number?.toLowerCase().includes(search) ||
              t.invoice_number?.toLowerCase().includes(search)
            );
          }

          // Apply type filter
          if (Array.isArray(state.filters.type) && state.filters.type.length > 0) {
            filtered = filtered.filter(t => state.filters.type!.includes(t.type));
          }

          // Apply category filter
          if (Array.isArray(state.filters.category) && state.filters.category.length > 0) {
            filtered = filtered.filter(t => state.filters.category!.includes(t.category));
          }

          // Apply payment status filter
          if (Array.isArray(state.filters.payment_status) && state.filters.payment_status.length > 0) {
            filtered = filtered.filter(t => state.filters.payment_status!.includes(t.payment_status));
          }

          // Apply payment method filter
          if (Array.isArray(state.filters.payment_method) && state.filters.payment_method.length > 0) {
            filtered = filtered.filter(t => state.filters.payment_method!.includes(t.payment_method));
          }

          return filtered;
        },

        getTotalPages: () => {
          const state = get();
          return Math.ceil(state.totalCount / state.pageSize);
        },
      }),
      {
        name: 'transaction-storage',
        partialize: (state) => ({
          viewMode: state.viewMode,
          pageSize: state.pageSize,
          filters: state.filters,
          tableColumns: state.tableColumns,
          formFieldVisibility: state.formFieldVisibility,
          formFieldOrder: state.formFieldOrder,
          filterVisibility: state.filterVisibility,
          tagSuggestions: state.tagSuggestions,
        }),
      }
    )
  )
);