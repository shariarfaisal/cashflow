import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Settings, GripVertical, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface FormFieldConfig {
  key: string;
  label: string;
  visible: boolean;
  order: number;
}

interface SortableItemProps {
  field: FormFieldConfig;
  onToggle: (field: string) => void;
}

interface FormFieldSettingsProps {
  visibility: Record<string, boolean>;
  order: Record<string, number>;
  onToggle: (field: string) => void;
  onReorder: (fields: FormFieldConfig[]) => void;
  onReset: () => void;
}

const baseFieldOptions = [
  { key: 'category', label: 'Category' },
  { key: 'customer_vendor', label: 'Customer/Vendor' },
  { key: 'payment_method', label: 'Payment Method' },
  { key: 'payment_status', label: 'Payment Status' },
  { key: 'reference_number', label: 'Reference Number' },
  { key: 'invoice_number', label: 'Invoice Number' },
  { key: 'tax_amount', label: 'Tax Amount' },
  { key: 'discount_amount', label: 'Discount Amount' },
  { key: 'due_amount', label: 'Due Amount' },
  { key: 'tags', label: 'Tags' },
  { key: 'recurring', label: 'Recurring Settings' },
  { key: 'notes', label: 'Notes' },
];

const SortableItem: React.FC<SortableItemProps> = ({ field, onToggle }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center space-x-2 p-2 rounded border',
        isDragging ? 'bg-muted opacity-50' : 'bg-background',
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <Checkbox
        id={field.key}
        checked={field.visible}
        onCheckedChange={() => onToggle(field.key)}
      />
      <Label
        htmlFor={field.key}
        className="text-sm flex-1 cursor-pointer"
      >
        {field.label}
      </Label>
    </div>
  );
};

export const FormFieldSettings: React.FC<FormFieldSettingsProps> = ({
  visibility,
  order,
  onToggle,
  onReorder,
  onReset
}) => {
  const [open, setOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Create field configs with visibility and order
  const fieldConfigs: FormFieldConfig[] = baseFieldOptions
    .map(field => ({
      key: field.key,
      label: field.label,
      visible: visibility[field.key] || false,
      order: order[field.key] || 0
    }))
    .sort((a, b) => a.order - b.order);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fieldConfigs.findIndex(field => field.key === active.id);
      const newIndex = fieldConfigs.findIndex(field => field.key === over.id);

      const reorderedFields = arrayMove(fieldConfigs, oldIndex, newIndex).map((field, index) => ({
        ...field,
        order: index
      }));

      onReorder(reorderedFields);
    }
  };

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
            <h4 className="font-semibold">Field Settings</h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={onReset}
              title="Reset to defaults"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Drag to reorder and toggle visibility of form fields
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fieldConfigs.map(field => field.key)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {fieldConfigs.map((field) => (
                  <SortableItem
                    key={field.key}
                    field={field}
                    onToggle={onToggle}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </PopoverContent>
    </Popover>
  );
};