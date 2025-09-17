import React from 'react';
import { Plus, Minus, DollarSign } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UseFormRegister } from 'react-hook-form';

interface TaxDiscountFieldsProps {
  register: UseFormRegister<any>;
  taxAmount?: number;
  discountAmount?: number;
  dueAmount?: number;
  netAmount: number;
  showTaxField: boolean;
  showDiscountField: boolean;
  showDueField: boolean;
}

export const TaxDiscountFields: React.FC<TaxDiscountFieldsProps> = ({
  register,
  taxAmount = 0,
  discountAmount = 0,
  dueAmount = 0,
  netAmount,
  showTaxField,
  showDiscountField,
  showDueField
}) => {
  if (!showTaxField && !showDiscountField && !showDueField) return null;

  return (
    <>
      <div className={`grid gap-6 ${[showTaxField, showDiscountField, showDueField].filter(Boolean).length > 1 ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {showTaxField && (
          <div className="space-y-2">
            <Label htmlFor="tax_amount" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Tax Amount
            </Label>
            <Input
              id="tax_amount"
              type="number"
              step="1"
              min="0"
              {...register('tax_amount', { valueAsNumber: true })}
              placeholder="0"
              onWheel={(e) => e.currentTarget.blur()}
              onKeyDown={(e) => {
                if (e.key === '.' || e.key === ',' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                  e.preventDefault();
                }
              }}
            />
          </div>
        )}

        {showDiscountField && (
          <div className="space-y-2">
            <Label htmlFor="discount_amount" className="flex items-center gap-2">
              <Minus className="h-4 w-4" />
              Discount Amount
            </Label>
            <Input
              id="discount_amount"
              type="number"
              step="1"
              min="0"
              {...register('discount_amount', { valueAsNumber: true })}
              placeholder="0"
              onWheel={(e) => e.currentTarget.blur()}
              onKeyDown={(e) => {
                if (e.key === '.' || e.key === ',' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                  e.preventDefault();
                }
              }}
            />
          </div>
        )}

        {showDueField && (
          <div className="space-y-2">
            <Label htmlFor="due_amount" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Due Amount
            </Label>
            <Input
              id="due_amount"
              type="number"
              step="1"
              min="0"
              {...register('due_amount', { valueAsNumber: true })}
              placeholder="0"
              onWheel={(e) => e.currentTarget.blur()}
              onKeyDown={(e) => {
                if (e.key === '.' || e.key === ',' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                  e.preventDefault();
                }
              }}
            />
          </div>
        )}
      </div>

      {(taxAmount > 0 || discountAmount > 0) && (
        <div className="rounded-lg bg-muted p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Net Amount</span>
            <span className="text-lg font-semibold">
              ${netAmount.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </>
  );
};