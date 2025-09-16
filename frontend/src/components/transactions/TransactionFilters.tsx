import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Search,
  Calendar,
  Filter,
  X,
  Download,
  Upload,
  Grid3x3,
  List,
  CalendarDays,
  Plus,
  Tags,
  Settings,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useTransactionStore } from '@/stores/transactionStore';
import { ListTransactionParams } from '@/types/transactions';

interface TransactionFiltersProps {
  onExport?: () => void;
  onImport?: () => void;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  onExport,
  onImport,
}) => {
  const {
    filters,
    setFilters,
    resetFilters,
    viewMode,
    setViewMode,
    paymentMethods,
    setPaymentMethods,
    tagSuggestions,
    addTagSuggestion,
    removeTagSuggestion,
    clearTagSuggestions,
    filterVisibility,
    setFilterVisibility,
    resetFilterVisibility,
    toggleFilter,
  } = useTransactionStore();

  const [fromDate, setFromDate] = useState<Date | undefined>(
    filters.from_date ? new Date(filters.from_date) : undefined
  );
  const [toDate, setToDate] = useState<Date | undefined>(
    filters.to_date ? new Date(filters.to_date) : undefined
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [categoryFilterSearch, setCategoryFilterSearch] = useState('');
  const [paymentMethodFilterSearch, setPaymentMethodFilterSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(filters.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [tagInputFocused, setTagInputFocused] = useState(false);
  const [showFilterSettings, setShowFilterSettings] = useState(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showPaymentStatusFilter, setShowPaymentStatusFilter] = useState(false);
  const [showPaymentMethodFilter, setShowPaymentMethodFilter] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);

  const handleSearch = (value: string) => {
    setFilters({ search: value });
  };

  const handleTypeToggle = (value: string) => {
    if (value === 'all') {
      setFilters({ type: [] });
    } else {
      toggleFilter('type', value);
    }
  };

  const handleStatusToggle = (value: string) => {
    if (value === 'all') {
      setFilters({ payment_status: [] });
    } else {
      toggleFilter('payment_status', value);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    if (categoryId === 'all') {
      setFilters({ category: [] });
    } else {
      toggleFilter('category', categoryId);
    }
  };

  const handlePaymentMethodToggle = (value: string) => {
    if (value === 'all') {
      setFilters({ payment_method: [] });
    } else {
      toggleFilter('payment_method', value);
    }
  };

  const handleFromDateChange = (date: Date | undefined) => {
    setFromDate(date);
    setFilters({ from_date: date ? format(date, 'yyyy-MM-dd') : '' });
  };

  const handleToDateChange = (date: Date | undefined) => {
    setToDate(date);
    setFilters({ to_date: date ? format(date, 'yyyy-MM-dd') : '' });
  };

  const handleReset = () => {
    resetFilters();
    setFromDate(undefined);
    setToDate(undefined);
    setSelectedTags([]);
  };

  const addTag = (tag?: string) => {
    const tagToAdd = tag || tagInput.trim();
    if (tagToAdd && !selectedTags.includes(tagToAdd)) {
      const newTags = [...selectedTags, tagToAdd];
      setSelectedTags(newTags);
      setFilters({ tags: newTags });
      addTagSuggestion(tagToAdd);
      setTagInput('');
      setShowTagSuggestions(false);
    }
  };

  const removeTag = (tag: string) => {
    const newTags = selectedTags.filter(t => t !== tag);
    setSelectedTags(newTags);
    setFilters({ tags: newTags.length > 0 ? newTags : undefined });
  };

  const clearAllTags = () => {
    setSelectedTags([]);
    setFilters({ tags: undefined });
  };

  const getFilteredTagSuggestions = () => {
    return tagSuggestions
      .filter(suggestion =>
        suggestion.value.toLowerCase().includes(tagInput.toLowerCase()) &&
        !selectedTags.includes(suggestion.value)
      )
      .sort((a, b) => {
        // Sort by count first (higher first), then by lastUsed (more recent first)
        if (a.count !== b.count) {
          return b.count - a.count;
        }
        return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
      })
      .slice(0, 10); // Limit to 10 suggestions
  };

  const categories = useTransactionStore((state) => state.categories);

  const typeOptions = [
    {
      value: 'all',
      label: 'All Types',
      icon: null,
      color: 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100',
      activeColor: 'text-white bg-gray-600 border-gray-600'
    },
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

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'partial', label: 'Partial' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const quickDateFilters = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Quarter', value: 'quarter' },
    { label: 'This Year', value: 'year' },
  ];

  const applyQuickDateFilter = (filter: string) => {
    const today = new Date();
    let from = new Date();
    let to = new Date();

    switch (filter) {
      case 'today':
        from = today;
        to = today;
        break;
      case 'week':
        from = new Date(today.setDate(today.getDate() - today.getDay()));
        to = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        break;
      case 'month':
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'quarter':
        const quarter = Math.floor(today.getMonth() / 3);
        from = new Date(today.getFullYear(), quarter * 3, 1);
        to = new Date(today.getFullYear(), quarter * 3 + 3, 0);
        break;
      case 'year':
        from = new Date(today.getFullYear(), 0, 1);
        to = new Date(today.getFullYear(), 11, 31);
        break;
    }

    handleFromDateChange(from);
    handleToDateChange(to);
  };

  return (
    <div className="space-y-4">
      {/* Main Filter Bar */}
      <div className="flex flex-nowrap overflow-x-auto items-center gap-4">
        {/* Search Input - Compact size in filter bar */}
        {filterVisibility.search && (
          <div className="w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search transactions..."
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
          </div>
        )}

        {/* Transaction Type Multi-Select Dropdown */}
        {filterVisibility.type && (
          <div className="w-48">
            <Popover open={showTypeFilter} onOpenChange={setShowTypeFilter}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-[120px] justify-start text-left font-normal',
                    (!Array.isArray(filters.type) || filters.type.length === 0) && 'text-muted-foreground'
                  )}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {Array.isArray(filters.type) && filters.type.length > 0
                    ? `${filters.type.length} type${filters.type.length > 1 ? 's' : ''}`
                    : 'All Types'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64" align="start">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Filter by Types</h4>
                    {Array.isArray(filters.type) && filters.type.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setFilters({ type: [] })}
                        className="text-xs"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="all-types"
                        checked={!Array.isArray(filters.type) || filters.type.length === 0}
                        onCheckedChange={() => handleTypeToggle('all')}
                      />
                      <label htmlFor="all-types" className="text-sm font-medium">
                        All Types
                      </label>
                    </div>

                    {typeOptions.filter(option => option.value !== 'all').map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${option.value}`}
                            checked={Array.isArray(filters.type) && filters.type.includes(option.value)}
                            onCheckedChange={() => handleTypeToggle(option.value)}
                          />
                          <label htmlFor={`type-${option.value}`} className="text-sm flex items-center gap-2">
                            {IconComponent && <IconComponent className="h-4 w-4" style={{color: option.color.split(' ')[0].replace('text-', '')}} />}
                            {option.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Spacer to push controls to the right */}
        <div className="flex-1"></div>

        <div className="flex items-center gap-2">
          <Popover open={showFilterSettings} onOpenChange={setShowFilterSettings}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={cn(showFilterSettings && 'bg-accent')}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Filter Visibility Settings</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resetFilterVisibility()}
                    className="text-xs"
                  >
                    Reset All
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Choose which filters to show in the filter bar
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'search', label: 'Search' },
                    { key: 'type', label: 'Type Select' },
                    { key: 'category', label: 'Category' },
                    { key: 'payment_status', label: 'Payment Status' },
                    { key: 'payment_method', label: 'Payment Method' },
                    { key: 'customer_vendor', label: 'Customer/Vendor' },
                    { key: 'tags', label: 'Tags' },
                    { key: 'date_range', label: 'Date Range' },
                    { key: 'amount_range', label: 'Amount Range' },
                    { key: 'reference_number', label: 'Reference #' },
                    { key: 'invoice_number', label: 'Invoice #' },
                    { key: 'tax_filter', label: 'Tax Filter' },
                    { key: 'discount_filter', label: 'Discount Filter' },
                    { key: 'recurring_filter', label: 'Recurring Filter' },
                  ].map((field) => (
                    <div key={field.key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={field.key}
                        checked={filterVisibility[field.key as keyof typeof filterVisibility]}
                        onChange={(e) =>
                          setFilterVisibility({
                            ...filterVisibility,
                            [field.key]: e.target.checked
                          })
                        }
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={field.key} className="text-sm">
                        {field.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={cn(
              'flex items-center gap-2',
              showAdvanced && 'bg-accent'
            )}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Advanced Filters</span>
          </Button>

          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-none rounded-l-md h-9 w-9 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-none h-9 w-9 p-0 border-x"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="rounded-none rounded-r-md h-9 w-9 p-0"
            >
              <CalendarDays className="h-4 w-4" />
            </Button>
          </div>

          {onExport && (
            <Button variant="outline" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}

          {onImport && (
            <Button variant="outline" onClick={onImport}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          )}
        </div>
      </div>

      {showAdvanced && (
        <div className="border rounded-lg p-6 space-y-6 bg-card">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Advanced Filters & Settings</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Main Filters Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Basic Filters</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterVisibility.category && (
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Popover open={showCategoryFilter} onOpenChange={setShowCategoryFilter}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          (!Array.isArray(filters.category) || filters.category.length === 0) && 'text-muted-foreground'
                        )}
                      >
                        <Filter className="mr-2 h-4 w-4" />
                        {Array.isArray(filters.category) && filters.category.length > 0
                          ? `${filters.category.length} categor${filters.category.length > 1 ? 'ies' : 'y'}`
                          : 'All Categories'
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="start">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">Filter by Categories</h4>
                          {Array.isArray(filters.category) && filters.category.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setFilters({ category: [] })}
                              className="text-xs"
                            >
                              Clear All
                            </Button>
                          )}
                        </div>

                        <div className="relative">
                          <Input
                            placeholder="Search categories..."
                            value={categoryFilterSearch}
                            onChange={(e) => setCategoryFilterSearch(e.target.value)}
                            className="pr-8"
                          />
                          {categoryFilterSearch && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full w-8 p-0"
                              onClick={() => setCategoryFilterSearch('')}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>

                        <div className="max-h-[300px] overflow-y-auto space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="all-categories"
                              checked={!Array.isArray(filters.category) || filters.category.length === 0}
                              onCheckedChange={() => handleCategoryToggle('all')}
                            />
                            <label htmlFor="all-categories" className="text-sm font-medium">
                              All Categories
                            </label>
                          </div>

                          {categories
                            .filter(category =>
                              categoryFilterSearch === '' ||
                              category.name.toLowerCase().includes(categoryFilterSearch.toLowerCase())
                            )
                            .map((category) => (
                              <div key={category.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`category-${category.id}`}
                                  checked={Array.isArray(filters.category) && filters.category.includes(category.id)}
                                  onCheckedChange={() => handleCategoryToggle(category.id)}
                                />
                                <label htmlFor={`category-${category.id}`} className="text-sm">
                                  {category.name}
                                </label>
                              </div>
                            ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {filterVisibility.payment_status && (
                <div className="space-y-2">
                  <Label>Payment Status</Label>
                  <Popover open={showPaymentStatusFilter} onOpenChange={setShowPaymentStatusFilter}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          (!Array.isArray(filters.payment_status) || filters.payment_status.length === 0) && 'text-muted-foreground'
                        )}
                      >
                        <Filter className="mr-2 h-4 w-4" />
                        {Array.isArray(filters.payment_status) && filters.payment_status.length > 0
                          ? `${filters.payment_status.length} status${filters.payment_status.length > 1 ? 'es' : ''}`
                          : 'All Statuses'
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64" align="start">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">Filter by Status</h4>
                          {Array.isArray(filters.payment_status) && filters.payment_status.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setFilters({ payment_status: [] })}
                              className="text-xs"
                            >
                              Clear All
                            </Button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="all-statuses"
                              checked={!Array.isArray(filters.payment_status) || filters.payment_status.length === 0}
                              onCheckedChange={() => handleStatusToggle('all')}
                            />
                            <label htmlFor="all-statuses" className="text-sm font-medium">
                              All Statuses
                            </label>
                          </div>

                          {statusOptions.filter(option => option.value !== 'all').map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`status-${option.value}`}
                                checked={Array.isArray(filters.payment_status) && filters.payment_status.includes(option.value)}
                                onCheckedChange={() => handleStatusToggle(option.value)}
                              />
                              <label htmlFor={`status-${option.value}`} className="text-sm">
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {filterVisibility.payment_method && (
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Popover open={showPaymentMethodFilter} onOpenChange={setShowPaymentMethodFilter}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          (!Array.isArray(filters.payment_method) || filters.payment_method.length === 0) && 'text-muted-foreground'
                        )}
                      >
                        <Filter className="mr-2 h-4 w-4" />
                        {Array.isArray(filters.payment_method) && filters.payment_method.length > 0
                          ? `${filters.payment_method.length} method${filters.payment_method.length > 1 ? 's' : ''}`
                          : 'All Methods'
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="start">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">Filter by Payment Methods</h4>
                          {Array.isArray(filters.payment_method) && filters.payment_method.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setFilters({ payment_method: [] })}
                              className="text-xs"
                            >
                              Clear All
                            </Button>
                          )}
                        </div>

                        <div className="relative">
                          <Input
                            placeholder="Search payment methods..."
                            value={paymentMethodFilterSearch}
                            onChange={(e) => setPaymentMethodFilterSearch(e.target.value)}
                            className="pr-8"
                          />
                          {paymentMethodFilterSearch && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full w-8 p-0"
                              onClick={() => setPaymentMethodFilterSearch('')}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>

                        <div className="max-h-[300px] overflow-y-auto space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="all-methods"
                              checked={!Array.isArray(filters.payment_method) || filters.payment_method.length === 0}
                              onCheckedChange={() => handlePaymentMethodToggle('all')}
                            />
                            <label htmlFor="all-methods" className="text-sm font-medium">
                              All Methods
                            </label>
                          </div>

                          {paymentMethods
                            .filter(method =>
                              paymentMethodFilterSearch === '' ||
                              method.name.toLowerCase().includes(paymentMethodFilterSearch.toLowerCase())
                            )
                            .map((method) => (
                              <div key={method.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`method-${method.id}`}
                                  checked={Array.isArray(filters.payment_method) && filters.payment_method.includes(method.id)}
                                  onCheckedChange={() => handlePaymentMethodToggle(method.id)}
                                />
                                <label htmlFor={`method-${method.id}`} className="text-sm">
                                  {method.name}
                                </label>
                              </div>
                            ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {filterVisibility.customer_vendor && (
                <div className="space-y-2">
                  <Label>Customer/Vendor</Label>
                  <Input
                    placeholder="Customer/Vendor..."
                    value={filters.customer_vendor || ''}
                    onChange={(e) => setFilters({ customer_vendor: e.target.value })}
                  />
                </div>
              )}

              {filterVisibility.tags && (
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <Popover open={showTagFilter} onOpenChange={setShowTagFilter}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          selectedTags.length === 0 && 'text-muted-foreground'
                        )}
                      >
                        <Tags className="mr-2 h-4 w-4" />
                        {selectedTags.length > 0 ? `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''}` : 'Select tags...'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="start">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">Filter by Tags</h4>
                          {selectedTags.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={clearAllTags}
                              className="text-xs"
                            >
                              Clear All
                            </Button>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <Input
                              placeholder="Add tag..."
                              value={tagInput}
                              onChange={(e) => {
                                setTagInput(e.target.value);
                                setShowTagSuggestions(e.target.value.length > 0 && getFilteredTagSuggestions().length > 0);
                              }}
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                              onFocus={() => {
                                setTagInputFocused(true);
                                setShowTagSuggestions(tagInput.length > 0 && getFilteredTagSuggestions().length > 0);
                              }}
                              onBlur={() => {
                                setTagInputFocused(false);
                                setTimeout(() => setShowTagSuggestions(false), 150);
                              }}
                              className="w-full"
                            />

                            {showTagSuggestions && getFilteredTagSuggestions().length > 0 && (
                              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-md shadow-lg max-h-[200px] overflow-y-auto">
                                <div className="p-2 border-b">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Suggestions</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => clearTagSuggestions()}
                                      className="text-xs h-auto p-1"
                                    >
                                      Clear All
                                    </Button>
                                  </div>
                                </div>
                                <div className="py-1">
                                  {getFilteredTagSuggestions().map((suggestion) => (
                                    <div
                                      key={suggestion.value}
                                      className="flex items-center justify-between px-3 py-2 hover:bg-accent cursor-pointer"
                                      onClick={() => addTag(suggestion.value)}
                                    >
                                      <span className="text-sm">{suggestion.value}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                          {suggestion.count}x
                                        </span>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeTagSuggestion(suggestion.value);
                                          }}
                                          className="h-auto p-0.5 text-muted-foreground hover:text-destructive"
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <Button onClick={() => addTag()} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {selectedTags.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Selected tags:</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedTags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-primary/10 text-primary rounded-full"
                                >
                                  {tag}
                                  <button
                                    onClick={() => removeTag(tag)}
                                    className="hover:bg-primary/20 rounded-full p-0.5"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </div>

          {/* Advanced Filters Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Advanced Filters</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filterVisibility.date_range && (
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'flex-1 justify-start text-left font-normal',
                            !fromDate && 'text-muted-foreground'
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {fromDate ? format(fromDate, 'PP') : 'From'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={fromDate}
                          onSelect={handleFromDateChange}
                          initialFocus
                          className="rounded-md border"
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'flex-1 justify-start text-left font-normal',
                            !toDate && 'text-muted-foreground'
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {toDate ? format(toDate, 'PP') : 'To'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={toDate}
                          onSelect={handleToDateChange}
                          initialFocus
                          className="rounded-md border"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              {filterVisibility.amount_range && (
                <div className="space-y-2">
                  <Label>Amount Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min amount"
                      value={filters.min_amount || ''}
                      onChange={(e) => setFilters({ min_amount: e.target.value ? Number(e.target.value) : undefined })}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="Max amount"
                      value={filters.max_amount || ''}
                      onChange={(e) => setFilters({ max_amount: e.target.value ? Number(e.target.value) : undefined })}
                      className="flex-1"
                    />
                  </div>
                </div>
              )}

              {filterVisibility.reference_number && (
                <div className="space-y-2">
                  <Label>Reference Number</Label>
                  <Input
                    placeholder="Enter reference..."
                    value={filters.reference_number || ''}
                    onChange={(e) => setFilters({ reference_number: e.target.value })}
                  />
                </div>
              )}

              {filterVisibility.invoice_number && (
                <div className="space-y-2">
                  <Label>Invoice Number</Label>
                  <Input
                    placeholder="Enter invoice..."
                    value={filters.invoice_number || ''}
                    onChange={(e) => setFilters({ invoice_number: e.target.value })}
                  />
                </div>
              )}

              {(filterVisibility.tax_filter || filterVisibility.discount_filter || filterVisibility.recurring_filter) && (
                <div className="space-y-2">
                  <Label>Special Filters</Label>
                  <div className="flex flex-wrap gap-2">
                    {filterVisibility.tax_filter && (
                      <Button
                        variant={filters.has_tax ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilters({ has_tax: filters.has_tax ? undefined : true })}
                      >
                        Has Tax
                      </Button>
                    )}
                    {filterVisibility.discount_filter && (
                      <Button
                        variant={filters.has_discount ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilters({ has_discount: filters.has_discount ? undefined : true })}
                      >
                        Has Discount
                      </Button>
                    )}
                    {filterVisibility.recurring_filter && (
                      <Button
                        variant={filters.is_recurring ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilters({ is_recurring: filters.is_recurring ? undefined : true })}
                      >
                        Recurring
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>


          {/* Quick Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground self-center">Quick dates:</span>
              {quickDateFilters.map((filter) => (
                <Button
                  key={filter.value}
                  variant="outline"
                  size="sm"
                  onClick={() => applyQuickDateFilter(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>

            <Button variant="outline" onClick={handleReset}>
              Reset All Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};