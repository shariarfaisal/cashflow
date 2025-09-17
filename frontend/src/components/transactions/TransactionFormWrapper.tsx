import React from 'react';
import { TransactionForm } from './TransactionForm';
import { TransactionResponse, CreateTransactionParams, UpdateTransactionParams } from '@/types/transactions';

interface TransactionFormWrapperProps {
  transaction?: TransactionResponse | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTransactionParams | UpdateTransactionParams) => Promise<void>;
  mode?: 'create' | 'edit';
  isInSidebar?: boolean;
}

// This wrapper handles the sidebar mode for the transaction form
// Since the original TransactionForm is complex, we'll just hide the dialog when in sidebar mode
export const TransactionFormWrapper: React.FC<TransactionFormWrapperProps> = ({
  transaction,
  open,
  onClose,
  onSubmit,
  mode = 'create',
  isInSidebar = false,
}) => {
  if (!open && !isInSidebar) return null;

  return (
    <div className={isInSidebar ? '' : ''}>
      <style>{`
        ${isInSidebar ? `
          .transaction-form-wrapper [role="dialog"] {
            position: static !important;
            pointer-events: auto !important;
            opacity: 1 !important;
            transform: none !important;
            background: transparent !important;
          }
          .transaction-form-wrapper [data-radix-portal] {
            display: none !important;
          }
          .transaction-form-wrapper [data-state="open"] {
            animation: none !important;
          }
          .transaction-form-wrapper .fixed {
            position: static !important;
          }
          .transaction-form-wrapper .inset-0 {
            position: static !important;
          }
        ` : ''}
      `}</style>
      <div className={isInSidebar ? 'transaction-form-wrapper' : ''}>
        <TransactionForm
          transaction={transaction}
          open={open || isInSidebar}
          onClose={onClose}
          onSubmit={onSubmit}
          mode={mode}
          isInSidebar={isInSidebar}
        />
      </div>
    </div>
  );
};