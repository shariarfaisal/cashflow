import React, { useState, useEffect, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface Suggestion {
  value: string;
  frequency: number;
}

interface CustomerVendorFieldProps {
  value: string;
  onChange: (value: string) => void;
  transactionType: string;
  visible: boolean;
  loadSuggestions: (search: string) => Promise<Suggestion[]>;
}

export const CustomerVendorField: React.FC<CustomerVendorFieldProps> = ({
  value,
  onChange,
  transactionType,
  visible,
  loadSuggestions
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleInputChange = useCallback(async (newValue: string) => {
    setInputValue(newValue);
    onChange(newValue);

    if (newValue.length >= 0) {
      const loadedSuggestions = await loadSuggestions(newValue);
      setSuggestions(loadedSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [onChange, loadSuggestions]);

  const selectSuggestion = (suggestionValue: string) => {
    setInputValue(suggestionValue);
    onChange(suggestionValue);
    setShowSuggestions(false);
  };

  if (!visible) return null;

  const isVendor = transactionType === 'expense' || transactionType === 'purchase';
  const label = isVendor ? 'Vendor' : 'Customer';

  return (
    <div className="space-y-1 relative">
      <Label htmlFor="customer_vendor" className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      <div className="relative">
        <Input
          id="customer_vendor"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => loadSuggestions(inputValue).then(s => {
            setSuggestions(s);
            setShowSuggestions(true);
          })}
          onBlur={() => {
            // Delay hiding to allow clicking on suggestions
            setTimeout(() => setShowSuggestions(false), 150);
          }}
          placeholder={`Enter ${label.toLowerCase()} name`}
          autoComplete="off"
          className="h-12 px-4 rounded-lg border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-indigo-500"
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-lg shadow-2xl max-h-64 overflow-hidden mt-1">
            {/* Header */}
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>
                  {inputValue.length < 2 ?
                    `Recent ${isVendor ? 'vendors' : 'customers'}` :
                    `Suggested ${isVendor ? 'vendors' : 'customers'}`
                  }
                </span>
              </div>
            </div>
            {/* Suggestions */}
            <div className="max-h-52 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between group transition-all duration-150 border-b border-gray-100 last:border-b-0"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectSuggestion(suggestion.value)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-blue-500 flex-shrink-0 group-hover:text-blue-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="text-sm text-gray-800 truncate flex-1 group-hover:text-blue-800">
                      {suggestion.value}
                    </span>
                  </div>
                  {suggestion.frequency > 1 && (
                    <span className="text-xs text-gray-400 ml-2 bg-gray-100 px-2 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600">
                      {suggestion.frequency}x
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};