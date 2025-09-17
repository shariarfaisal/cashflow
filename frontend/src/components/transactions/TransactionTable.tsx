import React, { useState } from 'react';
import { TransactionResponse } from '@/types/transactions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Calendar,
  Grid3x3,
  List,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { TableColumnSettings } from './TableColumnSettings';
import { useTransactionStore } from '@/stores/transactionStore';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TransactionTableProps {
  transactions: TransactionResponse[];
  loading?: boolean;
  viewMode: 'table' | 'grid' | 'calendar';
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEdit: (transaction: TransactionResponse) => void;
  onDelete: (id: string) => void;
  onView: (transaction: TransactionResponse) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  loading,
  viewMode,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  onView,
}) => {
  const [sortConfig, setSortConfig] = useState<{
    column: string | null;
    order: 'asc' | 'desc' | null;
  }>({ column: null, order: null });
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const { tableColumns, setTableColumns, resetTableColumns } = useTransactionStore();

  const handleSelectAll = () => {
    if (selectedRows.size === sortedTransactions.length) {
      setSelectedRows(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedRows(new Set(sortedTransactions.map(t => t.id)));
      setShowBulkActions(true);
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedRows(newSelection);
    setShowBulkActions(newSelection.size > 0);
  };

  const handleBulkDelete = () => {
    if (selectedRows.size === 0) return;

    const count = selectedRows.size;
    if (confirm(`Are you sure you want to delete ${count} transaction${count > 1 ? 's' : ''}?`)) {
      selectedRows.forEach(id => onDelete(id));
      setSelectedRows(new Set());
      setShowBulkActions(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleSort = (columnId: string) => {
    if (sortConfig.column === columnId) {
      // Same column clicked, cycle through: null -> desc -> asc -> null
      if (sortConfig.order === null) {
        setSortConfig({ column: columnId, order: 'desc' });
      } else if (sortConfig.order === 'desc') {
        setSortConfig({ column: columnId, order: 'asc' });
      } else {
        setSortConfig({ column: null, order: null });
      }
    } else {
      // Different column clicked, start with desc
      setSortConfig({ column: columnId, order: 'desc' });
    }
  };

  const isSortableColumn = (columnId: string) => {
    const sortableColumns = [
      'date', 'amount', 'net_amount', 'tax_amount', 'discount_amount', 'due_amount',
      'exchange_rate', 'type', 'category', 'payment_method', 'status',
      'discount', 'net', 'tax' // Additional sorting columns
    ];
    return sortableColumns.includes(columnId);
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (!sortConfig.column || !sortConfig.order) return 0;

    let aValue: any = a[sortConfig.column as keyof TransactionResponse];
    let bValue: any = b[sortConfig.column as keyof TransactionResponse];

    // Handle special cases
    switch (sortConfig.column) {
      case 'date':
        aValue = new Date(a.transaction_date).getTime();
        bValue = new Date(b.transaction_date).getTime();
        break;
      case 'amount':
        aValue = a.amount;
        bValue = b.amount;
        break;
      case 'net_amount':
        aValue = a.net_amount;
        bValue = b.net_amount;
        break;
      case 'tax_amount':
        aValue = a.tax_amount;
        bValue = b.tax_amount;
        break;
      case 'discount_amount':
        aValue = a.discount_amount;
        bValue = b.discount_amount;
        break;
      case 'due_amount':
        aValue = a.due_amount;
        bValue = b.due_amount;
        break;
      case 'exchange_rate':
        aValue = a.exchange_rate;
        bValue = b.exchange_rate;
        break;
      case 'status':
        aValue = a.payment_status;
        bValue = b.payment_status;
        break;
    }

    // Handle null/undefined values
    if (aValue == null) aValue = '';
    if (bValue == null) bValue = '';

    // Compare values
    let comparison = 0;
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else {
      comparison = String(aValue).localeCompare(String(bValue));
    }

    return sortConfig.order === 'asc' ? comparison : -comparison;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income':
      case 'sale':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'expense':
      case 'purchase':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'partial':
        return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30';
      case 'cancelled':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  const getColumnMinWidth = (columnId: string) => {
    switch (columnId) {
      case 'date':
        return 'min-w-[100px]';
      case 'type':
        return 'min-w-[80px]';
      case 'description':
        return 'min-w-[200px]';
      case 'amount':
      case 'net_amount':
      case 'tax_amount':
      case 'discount_amount':
      case 'due_amount':
        return 'min-w-[100px]';
      case 'category':
      case 'payment_method':
        return 'min-w-[120px]';
      case 'status':
        return 'min-w-[100px]';
      case 'customer_vendor':
        return 'min-w-[140px]';
      case 'reference_number':
      case 'invoice_number':
        return 'min-w-[120px]';
      case 'notes':
        return 'min-w-[150px]';
      case 'tags':
        return 'min-w-[100px]';
      case 'currency':
        return 'min-w-[60px]';
      case 'exchange_rate':
        return 'min-w-[80px]';
      case 'recurring':
        return 'min-w-[80px]';
      case 'actions':
        return 'min-w-[100px]';
      default:
        return 'min-w-[100px]';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-4">
              <div className="h-4 bg-muted rounded w-1/6"></div>
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/6"></div>
              <div className="h-4 bg-muted rounded w-1/6"></div>
              <div className="h-4 bg-muted rounded w-1/6"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="mx-auto w-64">
          <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
          <p className="text-muted-foreground text-sm">
            Add your first transaction to get started tracking your finances.
          </p>
        </div>
      </Card>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {transactions.map((transaction) => (
            <Card key={transaction.id} className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{transaction.description}</p>
                    <div className="space-y-0.5">
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.transaction_date), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium capitalize',
                      getTypeColor(transaction.type)
                    )}
                  >
                    {transaction.type}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-2xl font-bold">
                    {formatCurrency(transaction.net_amount)}
                  </p>
                  <span
                    className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium capitalize',
                      getStatusColor(transaction.payment_status)
                    )}
                  >
                    {transaction.payment_status}
                  </span>
                </div>

                {transaction.category && (
                  <p className="text-sm text-muted-foreground">
                    Category: {transaction.category}
                  </p>
                )}

                {transaction.customer_vendor && (
                  <p className="text-sm text-muted-foreground">
                    {transaction.type === 'expense' || transaction.type === 'purchase'
                      ? 'Vendor'
                      : 'Customer'}: {transaction.customer_vendor}
                  </p>
                )}

                <div className="flex justify-end space-x-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onView(transaction)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(transaction)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => onDelete(transaction.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <EnhancedPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    );
  }

  // Get visible and sorted columns
  const visibleColumns = tableColumns
    .filter(col => col.visible)
    .sort((a, b) => a.order - b.order);

  const renderColumnHeader = (columnId: string, label: string) => {
    if (isSortableColumn(columnId)) {
      const isCurrentSort = sortConfig.column === columnId;
      return (
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 font-medium hover:bg-transparent"
          onClick={() => handleSort(columnId)}
        >
          {label}
          {!isCurrentSort && <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />}
          {isCurrentSort && sortConfig.order === 'asc' && <ArrowUp className="ml-2 h-3 w-3" />}
          {isCurrentSort && sortConfig.order === 'desc' && <ArrowDown className="ml-2 h-3 w-3" />}
        </Button>
      );
    }
    return label;
  };

  const renderColumnCell = (columnId: string, transaction: TransactionResponse) => {
    switch (columnId) {
      case 'date':
        return (
          <div>
            <p className="text-sm font-medium">{format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}</p>
            <p className="text-xs text-muted-foreground">{format(new Date(transaction.transaction_date), 'h:mm a')}</p>
          </div>
        );
      case 'description':
        return (
          <div>
            <p className="font-medium">{transaction.description}</p>
            {transaction.customer_vendor && (
              <p className="text-sm text-muted-foreground">
                {transaction.customer_vendor}
              </p>
            )}
          </div>
        );
      case 'type':
        return (
          <span
            className={cn(
              'px-2 py-1 rounded-full text-xs font-medium capitalize',
              getTypeColor(transaction.type)
            )}
          >
            {transaction.type}
          </span>
        );
      case 'category':
        return transaction.category || '-';
      case 'customer_vendor':
        return transaction.customer_vendor || '-';
      case 'amount':
        return (
          <p
            className={cn(
              'font-semibold',
              transaction.type === 'income' || transaction.type === 'sale'
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            )}
          >
            {formatCurrency(transaction.amount)}
          </p>
        );
      case 'net_amount':
        return (
          <div>
            <p
              className={cn(
                'font-semibold',
                transaction.type === 'income' || transaction.type === 'sale'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              )}
            >
              {formatCurrency(transaction.net_amount)}
            </p>
            {(transaction.tax_amount > 0 || transaction.discount_amount > 0) && (
              <p className="text-xs text-muted-foreground">
                Base: {formatCurrency(transaction.amount)}
              </p>
            )}
          </div>
        );
      case 'status':
        return (
          <span
            className={cn(
              'px-2 py-1 rounded-full text-xs font-medium capitalize',
              getStatusColor(transaction.payment_status)
            )}
          >
            {transaction.payment_status}
          </span>
        );
      case 'payment_method':
        return transaction.payment_method || '-';
      case 'reference_number':
        return transaction.reference_number || '-';
      case 'invoice_number':
        return transaction.invoice_number || '-';
      case 'notes':
        return transaction.notes ? (
          <span className="text-sm truncate max-w-xs" title={transaction.notes}>
            {transaction.notes}
          </span>
        ) : '-';
      case 'tags':
        return transaction.tags && transaction.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {transaction.tags.map((tag, index) => (
              <span key={index} className="px-2 py-0.5 bg-muted rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>
        ) : '-';
      case 'tax_amount':
        return transaction.tax_amount > 0 ? formatCurrency(transaction.tax_amount) : '-';
      case 'discount_amount':
        return transaction.discount_amount > 0 ? formatCurrency(transaction.discount_amount) : '-';
      case 'due_amount':
        return transaction.due_amount > 0 ? formatCurrency(transaction.due_amount) : '-';
      case 'currency':
        return transaction.currency || 'USD';
      case 'recurring':
        return transaction.is_recurring ? (
          <span className="text-xs">{transaction.recurring_frequency}</span>
        ) : '-';
      case 'actions':
        return (
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onView(transaction)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(transaction)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-600 hover:text-red-700"
              onClick={() => onDelete(transaction.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      default:
        return '-';
    }
  };

  // Default table view
  return (
    <div className="space-y-4">
      <Card>
        <div className="p-2 border-b flex justify-between items-center">
          {showBulkActions && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedRows.size} selected
              </span>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Selected
              </Button>
            </div>
          )}
          {!showBulkActions && <div />}
          <TableColumnSettings
            columns={tableColumns}
            onColumnsChange={setTableColumns}
            onReset={resetTableColumns}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 min-w-[40px]">
                  <Checkbox
                    checked={selectedRows.size === sortedTransactions.length && sortedTransactions.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                {visibleColumns.map((column) => (
                  <th
                    key={column.id}
                    className={cn(
                      "px-4 py-3 text-left text-sm font-medium text-muted-foreground",
                      getColumnMinWidth(column.id)
                    )}
                  >
                    {renderColumnHeader(column.id, column.label)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedRows.has(transaction.id)}
                      onCheckedChange={() => handleSelectRow(transaction.id)}
                    />
                  </td>
                  {visibleColumns.map((column) => (
                    <td key={column.id} className={cn(
                      "px-4 py-3 text-sm",
                      getColumnMinWidth(column.id)
                    )}>
                      {renderColumnCell(column.id, transaction)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <EnhancedPagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};

interface EnhancedPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const EnhancedPagination: React.FC<EnhancedPaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  if (totalPages <= 1) return null;

  const generatePageNumbers = () => {
    const pages = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 4) {
        // Show pages 2-5 and ellipsis
        for (let i = 2; i <= Math.min(5, totalPages - 1); i++) {
          pages.push(i);
        }
        if (totalPages > 6) pages.push('ellipsis');
      } else if (currentPage >= totalPages - 3) {
        // Show ellipsis and last 4 pages
        pages.push('ellipsis');
        for (let i = Math.max(totalPages - 4, 2); i <= totalPages - 1; i++) {
          pages.push(i);
        }
      } else {
        // Show ellipsis, current page area, ellipsis
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
      }

      // Always show last page (if more than 1 page)
      if (totalPages > 1) pages.push(totalPages);
    }

    return pages;
  };

  const pages = generatePageNumbers();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <p className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Items per page:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
              className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>

          {pages.map((page, index) => (
            <PaginationItem key={index}>
              {page === 'ellipsis' ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => onPageChange(page as number)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
              className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

// Add missing import
import { Receipt } from 'lucide-react';