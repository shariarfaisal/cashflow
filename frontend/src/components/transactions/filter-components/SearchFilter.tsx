import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  isInSidebar?: boolean;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  value,
  onChange,
  isInSidebar = false,
}) => {
  if (isInSidebar) {
    return (
      <div className="space-y-2">
        <Label className="text-xs font-medium">Search</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 pl-9 text-sm"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search transactions..."
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-4 w-64 h-10"
      />
    </div>
  );
};