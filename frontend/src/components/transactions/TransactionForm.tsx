import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar, X, Plus, Upload, Settings, TrendingUp, TrendingDown, ShoppingCart, Package, FileText, DollarSign, Tag, User, CreditCard, CheckCircle, Hash, Receipt, Percent, Minus, Tags, StickyNote, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { TransactionResponse, CreateTransactionParams, UpdateTransactionParams, CategoryResponse, PaymentMethodResponse, CreateCategoryParams } from '@/types/transactions';
import { useTransactionStore } from '@/stores/transactionStore';
import * as App from '../../../wailsjs/go/main/App';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense', 'sale', 'purchase']),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  transaction_date: z.string(),
  category: z.string().optional(),
  customer_vendor: z.string().optional(),
  payment_method: z.string().optional(),
  payment_status: z.enum(['pending', 'completed', 'partial', 'cancelled']).optional(),
  reference_number: z.string().optional(),
  invoice_number: z.string().optional(),
  notes: z.string().optional(),
  tax_amount: z.number().min(0).optional(),
  discount_amount: z.number().min(0).optional(),
  tags: z.array(z.string()).optional(),
  is_recurring: z.boolean().optional(),
  recurring_frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', '']).optional(),
  recurring_end_date: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  transaction?: TransactionResponse | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTransactionParams | UpdateTransactionParams) => Promise<void>;
  mode?: 'create' | 'edit';
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  open,
  onClose,
  onSubmit,
  mode = 'create',
}) => {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(transaction ? new Date(transaction.transaction_date) : new Date());
  const [tags, setTags] = useState<string[]>(transaction?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [paymentMethodsList, setPaymentMethodsList] = useState<PaymentMethodResponse[]>([]);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [paymentMethodSearch, setPaymentMethodSearch] = useState('');
  const [showFieldSettings, setShowFieldSettings] = useState(false);
  const [newCategoryForm, setNewCategoryForm] = useState<CreateCategoryParams>({
    name: '',
    type: 'expense',
    color: '#000000',
    icon: '',
    is_active: true
  });
  const [descriptionSuggestions, setDescriptionSuggestions] = useState<Array<{value: string, frequency: number}>>([]);
  const [showDescriptionSuggestions, setShowDescriptionSuggestions] = useState(false);
  const [descriptionInputValue, setDescriptionInputValue] = useState('');
  const [customerVendorSuggestions, setCustomerVendorSuggestions] = useState<Array<{value: string, frequency: number}>>([]);
  const [showCustomerVendorSuggestions, setShowCustomerVendorSuggestions] = useState(false);
  const [customerVendorInputValue, setCustomerVendorInputValue] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction?.type || 'expense',
      description: transaction?.description || '',
      amount: transaction?.amount || 0,
      transaction_date: transaction?.transaction_date || format(new Date(), 'yyyy-MM-dd'),
      category: transaction?.category_id || transaction?.category || '',
      customer_vendor: transaction?.customer_vendor || '',
      payment_method: transaction?.payment_method_id || transaction?.payment_method || '',
      payment_status: transaction?.payment_status || 'pending',
      reference_number: transaction?.reference_number || '',
      invoice_number: transaction?.invoice_number || '',
      notes: transaction?.notes || '',
      tax_amount: transaction?.tax_amount || 0,
      discount_amount: transaction?.discount_amount || 0,
      is_recurring: transaction?.is_recurring || false,
      recurring_frequency: transaction?.recurring_frequency || '',
      recurring_end_date: transaction?.recurring_end_date || '',
    },
  });

  const { formFieldVisibility, setFormFieldVisibility, resetFormFieldVisibility } = useTransactionStore();
  const transactionType = watch('type');
  const isRecurring = watch('is_recurring');
  const amount = watch('amount');
  const taxAmount = watch('tax_amount');
  const discountAmount = watch('discount_amount');

  const netAmount = amount + (taxAmount || 0) - (discountAmount || 0);

  // Load categories and payment methods
  useEffect(() => {
    loadCategories();
    loadPaymentMethods();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await App.ListActiveCategories();
      // Map the data to match our types properly
      const mappedCategories = data.map(cat => ({
        ...cat,
        type: cat.type as 'income' | 'expense' | 'both',
        created_at: cat.created_at || '',
        updated_at: cat.updated_at || ''
      }));
      setCategories(mappedCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const data = await App.ListActivePaymentMethods();
      // Map the data to match our types properly
      const mappedMethods = data.map(pm => ({
        ...pm,
        created_at: pm.created_at || '',
        updated_at: pm.updated_at || ''
      }));
      setPaymentMethodsList(mappedMethods);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    }
  };

  const loadDescriptionSuggestions = async (search: string) => {
    try {
      let suggestions: Array<{ value: string; frequency: number }> = [];

      if (search.length < 2) {
        // Show last 5 transaction descriptions when no search
        const recentTransactions = await App.ListTransactions({
          created_by: '',
          from_date: '',
          to_date: '',
          type: '',
          category: '',
          payment_status: '',
          customer_vendor: '',
          search: '',
          limit: 5,
          offset: 0,
        });

        if (recentTransactions && Array.isArray(recentTransactions)) {
          // Convert to suggestion format and remove duplicates
          const uniqueDescriptions = [...new Set(recentTransactions.map(t => t.description))];
          suggestions = uniqueDescriptions.slice(0, 5).map(desc => ({ value: desc, frequency: 1 }));
        }
      } else {
        // Search for matching descriptions
        suggestions = await App.GetDescriptionSuggestions(transactionType, search);
      }

      setDescriptionSuggestions(suggestions || []);
      setShowDescriptionSuggestions(suggestions && suggestions.length > 0);
    } catch (error) {
      console.error('Failed to load description suggestions:', error);
      setDescriptionSuggestions([]);
      setShowDescriptionSuggestions(false);
    }
  };

  const loadCustomerVendorSuggestions = async (search: string) => {
    try {
      let suggestions: Array<{ value: string; frequency: number }> = [];

      if (search.length < 2) {
        // Show last 5 customer/vendor entries when no search
        const recentTransactions = await App.ListTransactions({
          created_by: '',
          from_date: '',
          to_date: '',
          type: '',
          category: '',
          payment_status: '',
          customer_vendor: '',
          search: '',
          limit: 10,
          offset: 0,
        });

        if (recentTransactions && Array.isArray(recentTransactions)) {
          // Convert to suggestion format and remove duplicates, filter out empty values
          const uniqueVendors = [...new Set(
            recentTransactions
              .map(t => t.customer_vendor)
              .filter(cv => cv && cv.trim() !== '')
          )];
          suggestions = uniqueVendors.slice(0, 5).map(vendor => ({ value: vendor, frequency: 1 }));
        }
      } else {
        // Search for matching customer/vendors
        suggestions = await App.GetCustomerVendorSuggestions(transactionType, search);
      }

      setCustomerVendorSuggestions(suggestions || []);
      setShowCustomerVendorSuggestions(suggestions && suggestions.length > 0);
    } catch (error) {
      console.error('Failed to load customer/vendor suggestions:', error);
      setCustomerVendorSuggestions([]);
      setShowCustomerVendorSuggestions(false);
    }
  };

  const handleCreateCategory = async () => {
    try {
      const createdCategory = await App.CreateCategory({
        Name: newCategoryForm.name,
        Type: transactionType === 'income' || transactionType === 'sale' ? 'income' : 'expense',
        Color: newCategoryForm.color,
        Icon: newCategoryForm.icon,
        ParentID: '',
        IsActive: true
      });
      await loadCategories();
      setShowCategoryDialog(false);
      // Set the newly created category ID as selected
      if (createdCategory && createdCategory.id) {
        setValue('category', createdCategory.id);
      }
      setNewCategoryForm({
        name: '',
        type: 'expense',
        color: '#000000',
        icon: '',
        is_active: true
      });
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  useEffect(() => {
    if (transaction) {
      reset({
        type: transaction.type,
        description: transaction.description,
        amount: transaction.amount,
        transaction_date: transaction.transaction_date,
        category: transaction.category || '',
        customer_vendor: transaction.customer_vendor || '',
        payment_method: transaction.payment_method || '',
        payment_status: transaction.payment_status,
        reference_number: transaction.reference_number || '',
        invoice_number: transaction.invoice_number || '',
        notes: transaction.notes || '',
        tax_amount: transaction.tax_amount || 0,
        discount_amount: transaction.discount_amount || 0,
        is_recurring: transaction.is_recurring,
        recurring_frequency: transaction.recurring_frequency || '',
        recurring_end_date: transaction.recurring_end_date || '',
      });
      setDate(new Date(transaction.transaction_date));
      setTags(transaction.tags || []);
      setDescriptionInputValue(transaction.description || '');
      setCustomerVendorInputValue(transaction.customer_vendor || '');
    }
  }, [transaction, reset]);

  // Initialize input values on first load
  useEffect(() => {
    const currentDescription = watch('description');
    setDescriptionInputValue(currentDescription || '');
  }, [watch('description')]);

  useEffect(() => {
    const currentCustomerVendor = watch('customer_vendor');
    setCustomerVendorInputValue(currentCustomerVendor || '');
  }, [watch('customer_vendor')]);

  // Reset suggestions when transaction type changes
  useEffect(() => {
    setDescriptionSuggestions([]);
    setShowDescriptionSuggestions(false);
    setCustomerVendorSuggestions([]);
    setShowCustomerVendorSuggestions(false);
  }, [transactionType]);

  const handleFormSubmit = async (data: TransactionFormData) => {
    setLoading(true);
    try {
      await onSubmit({
        ...data,
        tags,
        transaction_date: format(date || new Date(), 'yyyy-MM-dd'),
      });
      // Reset form to initial values after successful submission
      reset({
        type: 'expense',
        description: '',
        amount: 0,
        transaction_date: format(new Date(), 'yyyy-MM-dd'),
        category: '',
        customer_vendor: '',
        payment_method: '',
        payment_status: 'pending',
        reference_number: '',
        invoice_number: '',
        notes: '',
        tax_amount: 0,
        discount_amount: 0,
        is_recurring: false,
        recurring_frequency: '',
        recurring_end_date: '',
      });
      setTags([]);
      setDate(new Date());
      setTagInput('');
      setDescriptionInputValue('');
      setDescriptionSuggestions([]);
      setShowDescriptionSuggestions(false);
      setCustomerVendorInputValue('');
      setCustomerVendorSuggestions([]);
      setShowCustomerVendorSuggestions(false);
      onClose();
    } catch (error) {
      console.error('Error submitting transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleDescriptionChange = (value: string) => {
    setDescriptionInputValue(value);
    setValue('description', value);
    loadDescriptionSuggestions(value);
  };

  const selectDescriptionSuggestion = (suggestion: string) => {
    setDescriptionInputValue(suggestion);
    setValue('description', suggestion);
    setShowDescriptionSuggestions(false);
    setDescriptionSuggestions([]);
  };

  const handleCustomerVendorChange = (value: string) => {
    setCustomerVendorInputValue(value);
    setValue('customer_vendor', value);
    loadCustomerVendorSuggestions(value);
  };

  const selectCustomerVendorSuggestion = (suggestion: string) => {
    setCustomerVendorInputValue(suggestion);
    setValue('customer_vendor', suggestion);
    setShowCustomerVendorSuggestions(false);
    setCustomerVendorSuggestions([]);
  };

  const typeOptions = [
    {
      value: 'income',
      label: 'Income',
      icon: TrendingUp,
      color: 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100',
      activeColor: 'text-white bg-green-600 border-green-600'
    },
    {
      value: 'expense',
      label: 'Expense',
      icon: TrendingDown,
      color: 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100',
      activeColor: 'text-white bg-red-600 border-red-600'
    },
    {
      value: 'sale',
      label: 'Sale',
      icon: ShoppingCart,
      color: 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100',
      activeColor: 'text-white bg-blue-600 border-blue-600'
    },
    {
      value: 'purchase',
      label: 'Purchase',
      icon: Package,
      color: 'text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100',
      activeColor: 'text-white bg-orange-600 border-orange-600'
    },
  ];

  // Removed static payment methods - now loaded dynamically

  const paymentStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'partial', label: 'Partial' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const recurringFrequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{mode === 'create' ? 'Add New Transaction' : 'Edit Transaction'}</DialogTitle>
              <DialogDescription>
                {mode === 'create'
                  ? 'Fill in the details to create a new transaction.'
                  : 'Update the transaction details.'}
              </DialogDescription>
            </div>
            <Popover open={showFieldSettings} onOpenChange={setShowFieldSettings}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" title="Field Settings">
                  <Settings className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Field Visibility</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetFormFieldVisibility}
                      className="text-xs"
                    >
                      Reset
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Choose which optional fields to show in the form
                  </p>
                  <div className="space-y-3">
                    {[
                      { key: 'category', label: 'Category' },
                      { key: 'customer_vendor', label: 'Customer/Vendor' },
                      { key: 'payment_method', label: 'Payment Method' },
                      { key: 'payment_status', label: 'Payment Status' },
                      { key: 'reference_number', label: 'Reference Number' },
                      { key: 'invoice_number', label: 'Invoice Number' },
                      { key: 'tax_amount', label: 'Tax Amount' },
                      { key: 'discount_amount', label: 'Discount Amount' },
                      { key: 'tags', label: 'Tags' },
                      { key: 'recurring', label: 'Recurring Settings' },
                      { key: 'notes', label: 'Notes' },
                    ].map((field) => (
                      <div key={field.key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={field.key}
                          checked={formFieldVisibility[field.key as keyof typeof formFieldVisibility]}
                          onChange={(e) =>
                            setFormFieldVisibility({
                              [field.key]: e.target.checked
                            })
                          }
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={field.key} className="text-sm">
                          {field.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Transaction Type Selection */}
          <div className="space-y-3">
            <Label>Transaction Type</Label>
            <div className="flex items-center bg-muted rounded-md p-1">
              {typeOptions.map((option) => {
                const IconComponent = option.icon;
                const isActive = transactionType === option.value;

                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setValue('type', option.value as 'income' | 'expense' | 'sale' | 'purchase')}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-sm transition-all flex-1 border',
                      isActive
                        ? option.color.split(' ')[0] + ' bg-background shadow-md border-border hover:shadow-lg'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/30 border-muted'
                    )}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </Button>
                );
              })}
            </div>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="transaction_date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description
            </Label>
            <div className="relative">
              <Input
                id="description"
                value={descriptionInputValue}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                onFocus={() => loadDescriptionSuggestions(descriptionInputValue)}
                onBlur={() => {
                  // Delay hiding to allow clicking on suggestions
                  setTimeout(() => setShowDescriptionSuggestions(false), 150);
                }}
                placeholder="Enter transaction description"
                autoComplete="off"
              />
              {showDescriptionSuggestions && descriptionSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-lg shadow-2xl max-h-64 overflow-hidden mt-1">
                  {/* Header */}
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{descriptionInputValue.length < 2 ? 'Recent descriptions' : 'Suggested descriptions'}</span>
                    </div>
                  </div>
                  {/* Suggestions */}
                  <div className="max-h-52 overflow-y-auto">
                    {descriptionSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between group transition-all duration-150 border-b border-gray-100 last:border-b-0"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectDescriptionSuggestion(suggestion.value)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="text-blue-500 flex-shrink-0 group-hover:text-blue-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-800 truncate flex-1 group-hover:text-blue-800">
                            {suggestion.value}
                          </span>
                        </div>
                        {suggestion.frequency > 1 && (
                          <span className="text-xs text-gray-400 ml-2 bg-gray-100 px-2 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600">
                            {suggestion.frequency}x
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {formFieldVisibility.tags && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tags className="h-4 w-4" />
                Tags
              </Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add a tag"
                />
                <Button type="button" onClick={addTag} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-primary/10 text-primary rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {formFieldVisibility.category && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="category" className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Category (Optional)
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCategoryDialog(true)}
                  className="h-7"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              <Select
                value={watch('category') || 'none'}
                onValueChange={(value: string) => setValue('category', value === 'none' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category (optional)" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  <div className="sticky top-0 px-2 py-2 bg-popover z-10 border-b">
                    <div className="relative">
                      <Input
                        placeholder="Search categories..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="h-8 pr-8"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {categorySearch && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCategorySearch('');
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <SelectItem value="none">None</SelectItem>
                  {categories && categories.length > 0 ? (
                    categories
                      .filter((cat) =>
                        (cat.type === 'both' ||
                        cat.type === (transactionType === 'income' || transactionType === 'sale' ? 'income' : 'expense')) &&
                        (categorySearch === '' || cat.name.toLowerCase().includes(categorySearch.toLowerCase()))
                      )
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                  ) : null}
                </SelectContent>
              </Select>
            </div>
          )}

          {(formFieldVisibility.customer_vendor || formFieldVisibility.payment_method) && (
            <div className={`grid gap-4 ${formFieldVisibility.customer_vendor && formFieldVisibility.payment_method ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {formFieldVisibility.customer_vendor && (
                <div className="space-y-2 relative">
                  <Label htmlFor="customer_vendor" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {transactionType === 'expense' || transactionType === 'purchase' ? 'Vendor' : 'Customer'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="customer_vendor"
                      value={customerVendorInputValue}
                      onChange={(e) => handleCustomerVendorChange(e.target.value)}
                      onFocus={() => loadCustomerVendorSuggestions(customerVendorInputValue)}
                      onBlur={() => {
                        // Delay hiding to allow clicking on suggestions
                        setTimeout(() => setShowCustomerVendorSuggestions(false), 150);
                      }}
                      placeholder={`Enter ${transactionType === 'expense' || transactionType === 'purchase' ? 'vendor' : 'customer'} name`}
                      autoComplete="off"
                    />
                    {showCustomerVendorSuggestions && customerVendorSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-lg shadow-2xl max-h-64 overflow-hidden mt-1">
                        {/* Header */}
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>
                              {customerVendorInputValue.length < 2 ?
                                `Recent ${transactionType === 'expense' || transactionType === 'purchase' ? 'vendors' : 'customers'}` :
                                `Suggested ${transactionType === 'expense' || transactionType === 'purchase' ? 'vendors' : 'customers'}`
                              }
                            </span>
                          </div>
                        </div>
                        {/* Suggestions */}
                        <div className="max-h-52 overflow-y-auto">
                          {customerVendorSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between group transition-all duration-150 border-b border-gray-100 last:border-b-0"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => selectCustomerVendorSuggestion(suggestion.value)}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="text-blue-500 flex-shrink-0 group-hover:text-blue-600">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </div>
                                <span className="text-sm text-gray-800 truncate flex-1 group-hover:text-blue-800">
                                  {suggestion.value}
                                </span>
                              </div>
                              {suggestion.frequency > 1 && (
                                <span className="text-xs text-gray-400 ml-2 bg-gray-100 px-2 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600">
                                  {suggestion.frequency}x
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {formFieldVisibility.payment_method && (
                <div className="space-y-2">
                  <Label htmlFor="payment_method" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Method
                  </Label>
                  <Select
                    value={watch('payment_method') || 'none'}
                    onValueChange={(value: string) => setValue('payment_method', value === 'none' ? '' : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] overflow-y-auto">
                      <div className="sticky top-0 px-2 py-2 bg-popover z-10 border-b">
                        <div className="relative">
                          <Input
                            placeholder="Search payment methods..."
                            value={paymentMethodSearch}
                            onChange={(e) => setPaymentMethodSearch(e.target.value)}
                            className="h-8 pr-8"
                            onClick={(e) => e.stopPropagation()}
                          />
                          {paymentMethodSearch && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPaymentMethodSearch('');
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <SelectItem value="none">None</SelectItem>
                      {paymentMethodsList && paymentMethodsList.length > 0 ? (
                        paymentMethodsList
                          .filter(method =>
                            paymentMethodSearch === '' ||
                            method.name.toLowerCase().includes(paymentMethodSearch.toLowerCase())
                          )
                          .map((method) => (
                            <SelectItem key={method.id} value={method.id}>
                              {method.name}
                            </SelectItem>
                          ))
                      ) : null}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {(formFieldVisibility.payment_status || formFieldVisibility.reference_number) && (
            <div className={`grid gap-4 ${formFieldVisibility.payment_status && formFieldVisibility.reference_number ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {formFieldVisibility.payment_status && (
                <div className="space-y-2">
                  <Label htmlFor="payment_status" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Payment Status
                  </Label>
                  <Select
                    value={watch('payment_status')}
                    onValueChange={(value: string) => setValue('payment_status', value as 'pending' | 'completed' | 'partial' | 'cancelled')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentStatuses.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formFieldVisibility.reference_number && (
                <div className="space-y-2">
                  <Label htmlFor="reference_number" className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    Reference Number
                  </Label>
                  <Input
                    id="reference_number"
                    {...register('reference_number')}
                    placeholder="Enter reference number"
                  />
                </div>
              )}
            </div>
          )}

          {(formFieldVisibility.tax_amount || formFieldVisibility.discount_amount) && (
            <div className={`grid gap-4 ${formFieldVisibility.tax_amount && formFieldVisibility.discount_amount ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {formFieldVisibility.tax_amount && (
                <div className="space-y-2">
                  <Label htmlFor="tax_amount" className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Tax Amount
                  </Label>
                  <Input
                    id="tax_amount"
                    type="number"
                    step="0.01"
                    {...register('tax_amount', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
              )}

              {formFieldVisibility.discount_amount && (
                <div className="space-y-2">
                  <Label htmlFor="discount_amount" className="flex items-center gap-2">
                    <Minus className="h-4 w-4" />
                    Discount Amount
                  </Label>
                  <Input
                    id="discount_amount"
                    type="number"
                    step="0.01"
                    {...register('discount_amount', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
              )}
            </div>
          )}

          {((taxAmount || 0) > 0 || (discountAmount || 0) > 0) && (
            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Net Amount</span>
                <span className="text-lg font-semibold">
                  ${netAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {formFieldVisibility.invoice_number && (
            <div className="space-y-2">
              <Label htmlFor="invoice_number" className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Invoice Number
              </Label>
              <Input
                id="invoice_number"
                {...register('invoice_number')}
                placeholder="Enter invoice number"
              />
            </div>
          )}


          {formFieldVisibility.recurring && (
            <>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_recurring"
                    {...register('is_recurring')}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="is_recurring" className="flex items-center gap-2">
                    Recurring Transaction
                    <Repeat className="h-4 w-4" />
                  </Label>
                </div>
              </div>

              {isRecurring && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recurring_frequency" className="flex items-center gap-2">
                      <Repeat className="h-4 w-4" />
                      Recurring Frequency
                    </Label>
                    <Select
                      value={watch('recurring_frequency')}
                      onValueChange={(value: string) => setValue('recurring_frequency', value as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | '')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {recurringFrequencies.map((freq) => (
                          <SelectItem key={freq.value} value={freq.value}>
                            {freq.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recurring_end_date">End Date</Label>
                    <Input
                      id="recurring_end_date"
                      type="date"
                      {...register('recurring_end_date')}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {formFieldVisibility.notes && (
            <div className="space-y-2">
              <Label htmlFor="notes" className="flex items-center gap-2">
                <StickyNote className="h-4 w-4" />
                Notes
              </Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Add any additional notes"
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex items-center gap-2">
              {(() => {
                if (loading) return 'Saving...';

                const selectedOption = typeOptions.find(opt => opt.value === transactionType);
                const Icon = selectedOption?.icon;
                const actionText = mode === 'create' ? 'Add' : 'Update';

                return (
                  <>
                    {Icon && <Icon className="h-4 w-4" />}
                    {actionText} {selectedOption?.label || 'Transaction'}
                  </>
                );
              })()}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Quick Category Creation Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category for {transactionType === 'income' || transactionType === 'sale' ? 'income' : 'expense'} transactions
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-cat-name">Name</Label>
              <Input
                id="new-cat-name"
                value={newCategoryForm.name}
                onChange={(e) => setNewCategoryForm({ ...newCategoryForm, name: e.target.value })}
                placeholder="Enter category name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-cat-color">Color</Label>
              <Input
                id="new-cat-color"
                type="color"
                value={newCategoryForm.color}
                onChange={(e) => setNewCategoryForm({ ...newCategoryForm, color: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-cat-icon">Icon (optional)</Label>
              <Input
                id="new-cat-icon"
                value={newCategoryForm.icon}
                onChange={(e) => setNewCategoryForm({ ...newCategoryForm, icon: e.target.value })}
                placeholder="Icon name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCategory}>
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};