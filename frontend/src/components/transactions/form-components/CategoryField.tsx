import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
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
import { CategoryResponse as Category } from '@/types/transactions';

interface CategoryFieldProps {
  value?: string;
  onChange: (value: string) => void;
  categories: Category[];
  transactionType: string;
  onAddCategory: () => void;
  visible: boolean;
}

export const CategoryField: React.FC<CategoryFieldProps> = ({
  value,
  onChange,
  categories,
  transactionType,
  onAddCategory,
  visible
}) => {
  const [categorySearch, setCategorySearch] = useState('');

  if (!visible) return null;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label htmlFor="category" className="text-sm font-medium text-gray-700">
          Category <span className="text-gray-400 font-normal">Optional</span>
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAddCategory}
          className="h-8 px-3 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
      </div>
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
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="h-8 pr-8"
                onClick={(e) => e.stopPropagation()}
              />
              {categorySearch && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCategorySearch('');
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          <SelectItem value="none">None</SelectItem>
          {categories && categories.length > 0 ? (
            categories
              .filter((cat) =>
                (cat.type === 'both' ||
                cat.type === (transactionType === 'income' || transactionType === 'sale' ? 'income' : 'expense')) &&
                (categorySearch === '' || cat.name.toLowerCase().includes(categorySearch.toLowerCase()))
              )
              .map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))
          ) : null}
        </SelectContent>
      </Select>
    </div>
  );
};