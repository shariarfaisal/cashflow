import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateRangeFilterProps {
  fromDate?: string;
  toDate?: string;
  onChange: (filters: { from_date?: string; to_date?: string }) => void;
  isInSidebar?: boolean;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  fromDate,
  toDate,
  onChange,
  isInSidebar = false,
}) => {
  const [localFromDate, setLocalFromDate] = useState<Date | undefined>(
    fromDate ? new Date(fromDate) : undefined
  );
  const [localToDate, setLocalToDate] = useState<Date | undefined>(
    toDate ? new Date(toDate) : undefined
  );

  useEffect(() => {
    setLocalFromDate(fromDate ? new Date(fromDate) : undefined);
  }, [fromDate]);

  useEffect(() => {
    setLocalToDate(toDate ? new Date(toDate) : undefined);
  }, [toDate]);

  const handleFromDateChange = (date: Date | undefined) => {
    setLocalFromDate(date);
    onChange({
      from_date: date ? format(date, 'yyyy-MM-dd') : undefined,
      to_date: toDate,
    });
  };

  const handleToDateChange = (date: Date | undefined) => {
    setLocalToDate(date);
    onChange({
      from_date: fromDate,
      to_date: date ? format(date, 'yyyy-MM-dd') : undefined,
    });
  };

  if (isInSidebar) {
    return (
      <div className="space-y-2">
        <Label className="text-xs font-medium">Date Range</Label>
        <div className="space-y-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'w-full justify-start text-left font-normal h-9',
                  !localFromDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-3 w-3" />
                <span className="text-xs">
                  {localFromDate ? format(localFromDate, 'PPP') : 'From date'}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={localFromDate}
                onSelect={handleFromDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  'w-full justify-start text-left font-normal h-9',
                  !localToDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-3 w-3" />
                <span className="text-xs">
                  {localToDate ? format(localToDate, 'PPP') : 'To date'}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={localToDate}
                onSelect={handleToDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'justify-start text-left font-normal w-[160px]',
              !localFromDate && 'text-muted-foreground'
            )}
          >
            <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate text-sm">
              {localFromDate ? format(localFromDate, 'MMM d') : 'From date'}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={localFromDate}
            onSelect={handleFromDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <span className="text-sm text-muted-foreground">to</span>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'justify-start text-left font-normal w-[160px]',
              !localToDate && 'text-muted-foreground'
            )}
          >
            <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate text-sm">
              {localToDate ? format(localToDate, 'MMM d') : 'To date'}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={localToDate}
            onSelect={handleToDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};