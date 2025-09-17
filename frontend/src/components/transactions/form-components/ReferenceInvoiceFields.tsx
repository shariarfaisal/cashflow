import React from 'react';
import { Receipt } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UseFormRegister } from 'react-hook-form';

interface ReferenceInvoiceFieldsProps {
  register: UseFormRegister<any>;
  showReference: boolean;
  showInvoice: boolean;
}

export const ReferenceInvoiceFields: React.FC<ReferenceInvoiceFieldsProps> = ({
  register,
  showReference,
  showInvoice
}) => {
  if (!showReference && !showInvoice) return null;

  return (
    <>
      {showReference && (
        <div className="space-y-1">
          <Label htmlFor="reference_number" className="text-sm font-medium text-gray-700">
            Reference Number
          </Label>
          <Input
            id="reference_number"
            {...register('reference_number')}
            placeholder="Enter reference #"
            className="h-12 px-4 rounded-lg border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-indigo-500"
          />
        </div>
      )}

      {showInvoice && (
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
    </>
  );
};