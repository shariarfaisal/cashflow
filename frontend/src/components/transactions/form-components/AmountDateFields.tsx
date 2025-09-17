import React from 'react';
import { DollarSign, CalendarIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AmountDateFieldsProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  errors?: any;
}

export const AmountDateFields: React.FC<AmountDateFieldsProps> = ({
  register,
  watch,
  setValue,
  errors
}) => {
  const transactionDate = watch('transaction_date');

  return (
    <div className="grid gap-6 grid-cols-2">
      <div className="space-y-1">
        <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
          Amount <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <DollarSign className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            {...register('amount', {
              required: 'Amount is required',
              min: { value: 0.01, message: 'Amount must be greater than 0' },
              valueAsNumber: true
            })}
            placeholder="0.00"
            className="pl-10 h-12 rounded-lg border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-indigo-500"
            onWheel={(e) => e.currentTarget.blur()}
          />
        </div>
        {errors?.amount && (
          <p className="text-sm text-red-500 mt-1">{errors.amount.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="transaction_date" className="text-sm font-medium text-gray-700">
          Date <span className="text-red-500">*</span>
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full h-12 justify-start text-left font-normal rounded-lg border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
                !transactionDate && 'text-gray-400'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {transactionDate ? format(new Date(transactionDate), 'PPP') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={transactionDate ? new Date(transactionDate) : undefined}
              onSelect={(date) => setValue('transaction_date', date ? format(date, 'yyyy-MM-dd') : '')}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors?.transaction_date && (
          <p className="text-sm text-red-500 mt-1">{errors.transaction_date.message}</p>
        )}
      </div>
    </div>
  );
};