import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface PaymentStatusSelectorProps {
  value?: string;
  onChange: (value: 'pending' | 'completed' | 'partial' | 'due' | 'cancelled') => void;
  visible: boolean;
}

const statusOptions = [
  {
    value: 'pending',
    label: 'Pending',
    activeColor: 'border-yellow-500 bg-yellow-500 text-white',
    inactiveColor: 'border-gray-200 text-gray-700 hover:border-yellow-300 hover:bg-yellow-50 bg-white'
  },
  {
    value: 'completed',
    label: 'Completed',
    activeColor: 'border-green-500 bg-green-500 text-white',
    inactiveColor: 'border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50 bg-white'
  },
  {
    value: 'partial',
    label: 'Partial',
    activeColor: 'border-blue-500 bg-blue-500 text-white',
    inactiveColor: 'border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 bg-white'
  },
  {
    value: 'due',
    label: 'Due',
    activeColor: 'border-orange-500 bg-orange-500 text-white',
    inactiveColor: 'border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50 bg-white'
  },
  {
    value: 'cancelled',
    label: 'Cancelled',
    activeColor: 'border-red-500 bg-red-500 text-white',
    inactiveColor: 'border-gray-200 text-gray-700 hover:border-red-300 hover:bg-red-50 bg-white'
  }
];

export const PaymentStatusSelector: React.FC<PaymentStatusSelectorProps> = ({
  value,
  onChange,
  visible
}) => {
  if (!visible) return null;

  return (
    <div className="space-y-1">
      <Label htmlFor="payment_status" className="text-sm font-medium text-gray-700">
        Payment Status
      </Label>
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((status) => {
          const isSelected = value === status.value;
          return (
            <button
              key={status.value}
              type="button"
              onClick={() => onChange(status.value as 'pending' | 'completed' | 'partial' | 'due' | 'cancelled')}
              className={cn(
                'h-12 px-4 rounded-lg border-2 text-sm font-medium transition-all duration-200 flex-1 min-w-[100px]',
                isSelected ? status.activeColor : status.inactiveColor
              )}
            >
              {status.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};