import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Suggestion {
  value: string;
  frequency: number;
}

interface DescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
  loadSuggestions: (search: string) => Promise<Suggestion[]>;
  required?: boolean;
}

export const DescriptionField: React.FC<DescriptionFieldProps> = ({
  value,
  onChange,
  loadSuggestions,
  required = true
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleInputChange = async (newValue: string) => {
    setInputValue(newValue);
    onChange(newValue);

    if (newValue.length >= 0) {
      const loadedSuggestions = await loadSuggestions(newValue);
      setSuggestions(loadedSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestionValue: string) => {
    setInputValue(suggestionValue);
    onChange(suggestionValue);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-1 relative">
      <Label htmlFor="description" className="text-sm font-medium text-gray-700">
        Description {required && <span className="text-red-500">*</span>}
      </Label>
      <Textarea
        id="description"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => loadSuggestions(inputValue).then(s => {
          setSuggestions(s);
          setShowSuggestions(true);
        })}
        onBlur={() => {
          setTimeout(() => setShowSuggestions(false), 150);
        }}
        placeholder="Enter transaction description"
        className="min-h-[100px] resize-none rounded-lg border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:border-indigo-500"
        required={required}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-lg shadow-2xl max-h-64 overflow-hidden mt-1">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>
                {inputValue.length < 2 ? 'Recent descriptions' : 'Suggested descriptions'}
              </span>
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between group transition-all duration-150 border-b border-gray-100 last:border-b-0"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectSuggestion(suggestion.value)}
              >
                <span className="text-sm text-gray-800 truncate flex-1 group-hover:text-blue-800">
                  {suggestion.value}
                </span>
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
  );
};