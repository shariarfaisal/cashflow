import React from 'react';
import { Repeat, CalendarIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface RecurringSettingsProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  visible: boolean;
}

const frequencyOptions = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

export const RecurringSettings: React.FC<RecurringSettingsProps> = ({
  register,
  watch,
  setValue,
  visible
}) => {
  const isRecurring = watch('is_recurring');
  const recurringEndDate = watch('recurring_end_date');

  if (!visible) return null;

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_recurring"
            {...register('is_recurring')}
            className="rounded border-gray-300"
          />
          <Label htmlFor="is_recurring" className="flex items-center gap-2">
            Recurring Transaction
            <Repeat className="h-4 w-4" />
          </Label>
        </div>
      </div>

      {isRecurring && (
        <div className="grid gap-6 grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="recurring_frequency" className="flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              Frequency
            </Label>
            <Select
              value={watch('recurring_frequency') || ''}
              onValueChange={(value) => setValue('recurring_frequency', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {frequencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recurring_end_date" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              End Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !recurringEndDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {recurringEndDate ? format(new Date(recurringEndDate), 'PPP') : 'Select end date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={recurringEndDate ? new Date(recurringEndDate) : undefined}
                  onSelect={(date) => setValue('recurring_end_date', date ? format(date, 'yyyy-MM-dd') : '')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
    </>
  );
};