import React from 'react';
import { TrendingUp, TrendingDown, ShoppingCart, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TypeSelectorProps {
  value: string;
  onChange: (value: 'income' | 'expense' | 'sale' | 'purchase') => void;
}

const typeOptions = [
  { value: 'income', label: 'Income', icon: TrendingUp, color: 'green' },
  { value: 'expense', label: 'Expense', icon: TrendingDown, color: 'red' },
  { value: 'sale', label: 'Sale', icon: ShoppingCart, color: 'indigo' },
  { value: 'purchase', label: 'Purchase', icon: Package, color: 'purple' },
];

export const TypeSelector: React.FC<TypeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {typeOptions.map((option) => {
          const IconComponent = option.icon;
          const isActive = value === option.value;

          const colorMap = {
            income: isActive ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50',
            expense: isActive ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:bg-red-50',
            sale: isActive ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-green-50',
            purchase: isActive ? 'bg-purple-500 text-white border-purple-500' : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50',
          };

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value as 'income' | 'expense' | 'sale' | 'purchase')}
              className={cn(
                'h-20 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all duration-200',
                colorMap[option.value as keyof typeof colorMap]
              )}
            >
              <IconComponent className="h-6 w-6" />
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};