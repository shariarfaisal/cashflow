import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PaymentMethod {
  id: string;
  name: string;
}

interface PaymentMethodFieldProps {
  value?: string;
  onChange: (value: string) => void;
  paymentMethods: PaymentMethod[];
  visible: boolean;
}

export const PaymentMethodField: React.FC<PaymentMethodFieldProps> = ({
  value,
  onChange,
  paymentMethods,
  visible
}) => {
  const [search, setSearch] = useState('');

  if (!visible) return null;

  return (
    <div className="space-y-1">
      <Label htmlFor="payment_method" className="text-sm font-medium text-gray-700">
        Payment Method
      </Label>
      <Select
        value={value || 'none'}
        onValueChange={(val: string) => onChange(val === 'none' ? '' : val)}
      >
        <SelectTrigger className="h-12 rounded-lg border-gray-200 bg-white text-gray-900 focus:border-indigo-500">
          <SelectValue placeholder="None" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] overflow-y-auto">
          <div className="sticky top-0 px-2 py-2 bg-popover z-10 border-b">
            <div className="relative">
              <Input
                placeholder="Search payment methods..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pr-8"
                onClick={(e) => e.stopPropagation()}
              />
              {search && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearch('');
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          <SelectItem value="none">None</SelectItem>
          {paymentMethods && paymentMethods.length > 0 ? (
            paymentMethods
              .filter(method =>
                search === '' || method.name.toLowerCase().includes(search.toLowerCase())
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
  );
};