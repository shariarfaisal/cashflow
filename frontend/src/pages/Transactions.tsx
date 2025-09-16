import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TransactionStats } from '@/components/transactions/TransactionStats';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { useTransactionStore } from '@/stores/transactionStore';
import {
  CreateTransaction,
  UpdateTransaction,
  DeleteTransaction,
  ListTransactions,
  GetTransactionStats,
  GetTransactionsByCategory,
  ListActiveCategories,
} from '../../wailsjs/go/main/App';
import toast from 'react-hot-toast';
import { TransactionResponse, CreateTransactionParams, UpdateTransactionParams } from '@/types/transactions';

export const Transactions: React.FC = () => {
  const {
    transactions,
    stats,
    filters,
    currentPage,
    pageSize,
    viewMode,
    showForm,
    formMode,
    selectedTransaction,
    isLoading,
    setTransactions,
    setStats,
    setCategories,
    setLoading,
    setShowForm,
    setFormMode,
    setSelectedTransaction,
    setTotalCount,
    setCurrentPage,
    getTotalPages,
  } = useTransactionStore();

  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadTransactions();
    loadStats();
    loadCategories();
  }, [filters, currentPage, pageSize]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const result = await ListTransactions({
        created_by: '',
        from_date: filters.from_date || '',
        to_date: filters.to_date || '',
        type: filters.type || '',
        category: filters.category || '',
        payment_status: filters.payment_status || '',
        customer_vendor: filters.customer_vendor || '',
        search: filters.search || '',
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
      });

      if (result && Array.isArray(result)) {
        // Convert the result to match our frontend types
        const convertedTransactions = result.map((t: any) => ({
          ...t,
          type: t.type as 'income' | 'expense' | 'sale' | 'purchase',
        }));
        setTransactions(convertedTransactions);
        setTotalCount(convertedTransactions.length);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await GetTransactionStats({
        created_by: '',
        from_date: filters.from_date || '',
        to_date: filters.to_date || '',
      });

      if (result) {
        setStats(result);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await ListActiveCategories();
      // Map the data to match our types properly
      const mappedCategories = data.map((cat: any) => ({
        ...cat,
        type: cat.type as 'income' | 'expense' | 'both',
        created_at: cat.created_at || '',
        updated_at: cat.updated_at || ''
      }));
      setCategories(mappedCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      // Set empty categories on error
      setCategories([]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadTransactions(), loadStats(), loadCategories()]);
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  const handleAddTransaction = () => {
    setSelectedTransaction(null);
    setFormMode('create');
    setShowForm(true);
  };

  const handleEditTransaction = (transaction: TransactionResponse) => {
    setSelectedTransaction(transaction);
    setFormMode('edit');
    setShowForm(true);
  };

  const handleViewTransaction = (transaction: TransactionResponse) => {
    setSelectedTransaction(transaction);
    toast(
      <div>
        <p className="font-semibold">{transaction.description}</p>
        <p className="text-sm">Amount: ${transaction.net_amount.toFixed(2)}</p>
        <p className="text-sm">Date: {new Date(transaction.transaction_date).toLocaleDateString()}</p>
        <p className="text-sm">Status: {transaction.payment_status}</p>
      </div>,
      { duration: 5000 }
    );
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;

    try {
      await DeleteTransaction(transactionToDelete);
      toast.success('Transaction deleted successfully');
      await loadTransactions();
      await loadStats();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    } finally {
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };

  const handleFormSubmit = async (data: CreateTransactionParams | UpdateTransactionParams) => {
    try {
      if (formMode === 'create') {
        const createData = {
          ...data,
          category: data.category || '',
          tags: data.tags || [],
          customer_vendor: data.customer_vendor || '',
          payment_method: data.payment_method || '',
          payment_status: data.payment_status || 'pending',
          reference_number: data.reference_number || '',
          invoice_number: data.invoice_number || '',
          notes: data.notes || '',
          attachments: data.attachments || [],
          tax_amount: data.tax_amount || 0,
          discount_amount: data.discount_amount || 0,
          currency: data.currency || 'USD',
          exchange_rate: data.exchange_rate || 1,
          is_recurring: data.is_recurring || false,
          recurring_frequency: data.recurring_frequency || '',
          recurring_end_date: data.recurring_end_date || '',
          parent_transaction_id: '',
          created_by: '',
        } as any;
        await CreateTransaction(createData);
        toast.success('Transaction created successfully');
      } else {
        if (selectedTransaction) {
          const updateData = {
            ...data,
            category: data.category || '',
            tags: data.tags || [],
            customer_vendor: data.customer_vendor || '',
            payment_method: data.payment_method || '',
            payment_status: data.payment_status || 'pending',
            reference_number: data.reference_number || '',
            invoice_number: data.invoice_number || '',
            notes: data.notes || '',
            attachments: data.attachments || [],
            tax_amount: data.tax_amount || 0,
            discount_amount: data.discount_amount || 0,
            currency: data.currency || 'USD',
            exchange_rate: data.exchange_rate || 1,
            is_recurring: data.is_recurring || false,
            recurring_frequency: data.recurring_frequency || '',
            recurring_end_date: data.recurring_end_date || '',
          } as any;
          await UpdateTransaction(selectedTransaction.id, updateData);
          toast.success('Transaction updated successfully');
        }
      }
      setShowForm(false);
      await loadTransactions();
      await loadStats();
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast.error('Failed to save transaction');
      throw error;
    }
  };

  const handleExport = async () => {
    try {
      const dataStr = JSON.stringify(transactions, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Transactions exported successfully');
    } catch (error) {
      console.error('Error exporting transactions:', error);
      toast.error('Failed to export transactions');
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const importedTransactions = JSON.parse(text);

          if (!Array.isArray(importedTransactions)) {
            throw new Error('Invalid file format');
          }

          for (const transaction of importedTransactions) {
            await CreateTransaction({
              type: transaction.type,
              description: transaction.description,
              amount: transaction.amount,
              transaction_date: transaction.transaction_date,
              category: transaction.category || '',
              customer_vendor: transaction.customer_vendor || '',
              payment_method: transaction.payment_method || '',
              payment_status: transaction.payment_status || 'pending',
              reference_number: transaction.reference_number || '',
              invoice_number: transaction.invoice_number || '',
              notes: transaction.notes || '',
              tags: transaction.tags || [],
              attachments: transaction.attachments || [],
              tax_amount: transaction.tax_amount || 0,
              discount_amount: transaction.discount_amount || 0,
              currency: transaction.currency || 'USD',
              exchange_rate: transaction.exchange_rate || 1,
              is_recurring: transaction.is_recurring || false,
              recurring_frequency: transaction.recurring_frequency || '',
              recurring_end_date: transaction.recurring_end_date || '',
              parent_transaction_id: '',
              created_by: '',
            } as any);
          }

          toast.success(`Imported ${importedTransactions.length} transactions`);
          await loadTransactions();
          await loadStats();
        } catch (error) {
          console.error('Error importing transactions:', error);
          toast.error('Failed to import transactions');
        }
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
        </Button>
        <Button onClick={handleAddTransaction}>
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      <TransactionStats stats={stats} loading={isLoading} />

      <TransactionFilters onExport={handleExport} onImport={handleImport} />

      <TransactionTable
        transactions={transactions}
        loading={isLoading}
        viewMode={viewMode}
        currentPage={currentPage}
        totalPages={getTotalPages()}
        onPageChange={setCurrentPage}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
        onView={handleViewTransaction}
      />

      <TransactionForm
        transaction={selectedTransaction}
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleFormSubmit}
        mode={formMode}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              transaction from your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};