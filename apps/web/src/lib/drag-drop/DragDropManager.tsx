'use client';

import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragStartEvent,
  useDraggable,
  MouseSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../utils';

export interface DragItem {
  id: string;
  [key: string]: any;
}

export interface DroppableContainerConfig {
  id: string;
  label: string;
  items: DragItem[];
  onDrop: (item: DragItem, sourceContainerId: string, targetContainerId: string) => void;
}

interface DragDropManagerProps {
  containers: DroppableContainerConfig[];
  onDragEnd?: (event: DragEndEvent) => void;
  renderItem: (item: DragItem, containerId: string) => React.ReactNode;
  renderContainer: (config: DroppableContainerConfig, children: React.ReactNode) => React.ReactNode;
  renderOverlay?: (item: DragItem) => React.ReactNode;
}

/**
 * Abstract drag and drop manager using dnd-kit
 * Provides a reusable layer for managing drag and drop across different views
 * Supports both mouse and touch operations
 */
export const DragDropManager: React.FC<DragDropManagerProps> = ({
  containers,
  onDragEnd,
  renderItem,
  renderContainer,
  renderOverlay,
}) => {
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [activeContainerId, setActiveContainerId] = React.useState<string | null>(null);

  // Configure sensors for both mouse and touch
  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 50,
        tolerance: 5,
      },
    }),
  );

  // Find which container an item belongs to
  const findItemContainer = (itemId: string): { containerId: string; item: DragItem } | null => {
    for (const container of containers) {
      const item = container.items.find((i) => i.id === itemId);
      if (item) {
        return { containerId: container.id, item };
      }
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id.toString());
    // Find which container this item is in
    const itemInfo = findItemContainer(active.id.toString());
    if (itemInfo) {
      setActiveContainerId(itemInfo.containerId);
    }
    console.log('active', active)
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('active end', active)
    setActiveId(null);
    setActiveContainerId(null);

    if (!over) return;

    const sourceContainerId = activeContainerId;
    const targetContainerId = over.id?.toString();

    if (!sourceContainerId) return;

    // Find the item being dragged
    const activeIdString = active.id?.toString() || '';
    const sourceInfo = findItemContainer(activeIdString);
    if (!sourceInfo) return;

    const { item } = sourceInfo;

    // Find the target container
    const targetContainer = containers.find((c) => c.id === targetContainerId);
    if (!targetContainer) return;

    // Call the onDrop callback for the target container
    targetContainer.onDrop(item, sourceContainerId, targetContainerId);

    // Call custom onDragEnd if provided
    if (onDragEnd) {
      onDragEnd(event);
    }
  };

  const activeItem = activeId ? findItemContainer(activeId)?.item : null;
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={(event) => {
        setActiveId(null);
        setActiveContainerId(null);
        console.log('Drag cancelled', event);
      }}
    >
      <div className="space-y-2">
        {containers.map((container) => (
          <div key={container.id}>
            <SortableContext
              items={container.items.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
              id={container.id}
            >
              {renderContainer(
                container,
                <div className="space-y-1">
                  {container.items.map((item) => (
                    <div key={item.id}>{renderItem(item, container.id)}</div>
                  ))}
                </div>
              )}
            </SortableContext>
          </div>
        ))}
      </div>

      {/* Drag Overlay - shows what's being dragged */}
      <DragOverlay >
        {activeItem && renderOverlay ? renderOverlay(activeItem) : null}
      </DragOverlay>
    </DndContext>
  );
};

/**
 * Draggable item wrapper for individual items
 */
interface DraggableItemProps {
  id: string;
  children: React.ReactNode;
  isDragging?: boolean;
  item: DragItem;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  id,
  children,
  item
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging,transition } = useSortable({
    id: id,
    data: {
      item
    }
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
  
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={isDragging ? 'opacity-50' : ''}
    >
      {children}
    </div>
  );
};

/**
 * Droppable container wrapper with drop zone detection
 */
interface DroppableContainerProps {
  id: string;
  label: string;
  children: React.ReactNode;
  colorClass?: string;
}

export const DroppableContainer: React.FC<DroppableContainerProps> = ({
  id,
  label,
  children,
  colorClass = 'bg-gray-500',
}) => {
  const { setNodeRef,isOver } = useDroppable({
    id,
    data: {
      type: 'Container',
      container: id,
    },
  });


  return (
    <div 
      ref={setNodeRef}
      className={cn(isOver ? 'scale-105 ' : '',"transition-all")}
    > 
      {/* Container Header */}
      <div className={`rounded-t-md p-2 text-center text-sm font-semibold text-white ${colorClass}`}>
        {label}
      </div>

      {/* Container Body */}
      <div
        className={`
          min-h-20 rounded-b-md border-2 border-dashed bg-muted/30 p-2 transition-colors
          flex flex-col gap-1
        `}
      >
        {children}
      </div>
    </div>
  );
};