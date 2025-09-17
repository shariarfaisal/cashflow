import React from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface FormFieldSettingsProps {
  visibility: Record<string, boolean>;
  onToggle: (field: string) => void;
  onReset: () => void;
}

const fieldOptions = [
  { key: 'category', label: 'Category' },
  { key: 'customer_vendor', label: 'Customer/Vendor' },
  { key: 'payment_method', label: 'Payment Method' },
  { key: 'payment_status', label: 'Payment Status' },
  { key: 'reference_number', label: 'Reference Number' },
  { key: 'invoice_number', label: 'Invoice Number' },
  { key: 'tax_amount', label: 'Tax Amount' },
  { key: 'discount_amount', label: 'Discount Amount' },
  { key: 'tags', label: 'Tags' },
  { key: 'recurring', label: 'Recurring Settings' },
  { key: 'notes', label: 'Notes' },
];

export const FormFieldSettings: React.FC<FormFieldSettingsProps> = ({
  visibility,
  onToggle,
  onReset
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Field Settings"
          className="h-8 w-8"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Field Visibility</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-xs"
            >
              Reset
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Choose which optional fields to show in the form
          </p>
          <div className="space-y-1">
            {fieldOptions.map((field) => (
              <div key={field.key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={field.key}
                  checked={visibility[field.key]}
                  onChange={() => onToggle(field.key)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor={field.key} className="text-sm">
                  {field.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};