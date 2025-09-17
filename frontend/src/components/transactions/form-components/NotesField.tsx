import React from 'react';
import { StickyNote } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UseFormRegister } from 'react-hook-form';

interface NotesFieldProps {
  register: UseFormRegister<any>;
  visible: boolean;
}

export const NotesField: React.FC<NotesFieldProps> = ({
  register,
  visible
}) => {
  if (!visible) return null;

  return (
    <div className="space-y-2">
      <Label htmlFor="notes" className="flex items-center gap-2">
        <StickyNote className="h-4 w-4" />
        Notes
      </Label>
      <Textarea
        id="notes"
        {...register('notes')}
        placeholder="Add any additional notes..."
        className="min-h-[100px]"
      />
    </div>
  );
};