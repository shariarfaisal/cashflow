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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Settings2, GripVertical, RotateCcw } from 'lucide-react';
import { TableColumn } from '@/types/transactions';
import { cn } from '@/lib/utils';

interface SortableItemProps {
  column: TableColumn;
  onToggle: (columnId: string) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({ column, onToggle }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center space-x-2 p-2 rounded-md',
        isDragging && 'opacity-50 bg-muted',
        'hover:bg-muted/50'
      )}
    >
      <div {...attributes} {...listeners} className="cursor-grab">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <Checkbox
        id={column.id}
        checked={column.visible}
        onCheckedChange={() => onToggle(column.id)}
      />
      <Label
        htmlFor={column.id}
        className="flex-1 cursor-pointer select-none text-sm"
      >
        {column.label}
      </Label>
    </div>
  );
};

interface TableColumnSettingsProps {
  columns: TableColumn[];
  onColumnsChange: (columns: TableColumn[]) => void;
  onReset: () => void;
}

export const TableColumnSettings: React.FC<TableColumnSettingsProps> = ({
  columns,
  onColumnsChange,
  onReset,
}) => {
  const [open, setOpen] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = columns.findIndex((col) => col.id === active.id);
      const newIndex = columns.findIndex((col) => col.id === over.id);

      const newColumns = arrayMove(columns, oldIndex, newIndex).map((col, index) => ({
        ...col,
        order: index,
      }));

      onColumnsChange(newColumns);
    }
  };

  const handleToggleColumn = (columnId: string) => {
    const updatedColumns = columns.map((col) =>
      col.id === columnId ? { ...col, visible: !col.visible } : col
    );
    onColumnsChange(updatedColumns);
  };

  const handleToggleAll = () => {
    const allVisible = columns.every((col) => col.visible);
    const updatedColumns = columns.map((col) => ({
      ...col,
      visible: !allVisible,
    }));
    onColumnsChange(updatedColumns);
  };

  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Settings2 className="h-4 w-4" />
          <span className="sr-only">Configure columns</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Table Columns</h3>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleAll}
                className="h-8 px-2 text-xs"
              >
                {columns.every((col) => col.visible) ? 'Hide All' : 'Show All'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="h-8 w-8 p-0"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Drag to reorder • Check to show/hide
          </div>

          <div className="space-y-1 max-h-96 overflow-y-auto">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedColumns.map((col) => col.id)}
                strategy={verticalListSortingStrategy}
              >
                {sortedColumns.map((column) => (
                  <SortableItem
                    key={column.id}
                    column={column}
                    onToggle={handleToggleColumn}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};