---
name: dnd-kit-pattern
description: When implementing drag-and-drop functionality, sortable lists, or drag-between-containers UI, load this skill. Triggers on phrases like "drag and drop", "sortable", "draggable", "גרירה ושחרור", "גרירה בין", "ממשק DnD".
---

# Skill: Drag and Drop with @dnd-kit

## Role & Persona
You are a senior React developer who implements smooth, accessible drag-and-drop experiences using @dnd-kit. You choose the right pattern (sortable list vs. kanban drop zones) based on the use case.

## Trigger Description
Activate when the user wants to:
- Reorder items in a list via drag
- Drag items between containers/columns (Kanban style)
- Build a drag-handle for custom drag activation

---

## Step-by-Step Workflow

<workflow>

### Step 1 — Choose the Pattern

| Use Case | Pattern to use |
|----------|---------------|
| Reorder items in a single list | **Sortable List** (Steps 2a) |
| Move items between columns/zones | **Drop Zones** (Steps 2b) |

### Step 2a — Sortable List Pattern

```typescript
// components/<Entity>SortableList.tsx
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { GripVertical } from "lucide-react";
import { MyEntity } from "@teamapp/api/schema";

// ── Sortable Item ──────────────────────────────────
function SortableItem({ item }: { item: MyEntity }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 rounded border bg-card"
    >
      {/* Drag handle — listeners go on the handle, not the container */}
      <button
        {...listeners}
        {...attributes}
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        aria-label="גרור לסידור מחדש"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span>{item.name}</span>
    </div>
  );
}

// ── Main Sortable List ─────────────────────────────
export function MyEntitySortableList({
  initialItems,
  onReorder,          // optional: persist new order to server
}: {
  initialItems: MyEntity[];
  onReorder?: (items: MyEntity[]) => void;
}) {
  const [items, setItems] = useState(initialItems);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }, // prevents accidental drags
    })
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    setItems((prev) => {
      const oldIdx = prev.findIndex((i) => i.id === active.id);
      const newIdx = prev.findIndex((i) => i.id === over.id);
      const reordered = arrayMove(prev, oldIdx, newIdx);
      onReorder?.(reordered);  // persist to server
      return reordered;
    });
  };

  const activeItem = items.find((i) => i.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {items.map((item) => (
            <SortableItem key={item.id} item={item} />
          ))}
        </div>
      </SortableContext>

      {/* Overlay: what follows the cursor during drag */}
      <DragOverlay>
        {activeItem ? (
          <div className="p-3 rounded border bg-card shadow-lg opacity-90 cursor-grabbing">
            {activeItem.name}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
```

### Step 2b — Drop Zones Pattern (Kanban / Multi-column)

```typescript
// Move items between containers
import { useDraggable, useDroppable } from "@dnd-kit/core";

// Droppable Container
function DropZone({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-20 p-3 rounded-lg border-2 border-dashed transition-colors ${
        isOver ? "border-primary bg-primary/10" : "border-border bg-muted/30"
      }`}
    >
      <p className="text-sm font-medium mb-2">{label}</p>
      {children}
    </div>
  );
}

// Draggable Item
function DraggableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-2 rounded border bg-card cursor-grab select-none ${
        isDragging ? "opacity-50 cursor-grabbing shadow-lg" : ""
      }`}
    >
      {children}
    </div>
  );
}

// Parent with DndContext handling onDragEnd to move between containers
function KanbanBoard() {
  const [containers, setContainers] = useState<Record<string, string[]>>({
    "zone-1": ["item-1", "item-2"],
    "zone-2": ["item-3"],
  });

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return;
    const sourceContainer = Object.keys(containers).find((key) =>
      containers[key].includes(active.id as string)
    );
    const targetContainer = over.id as string;
    if (!sourceContainer || sourceContainer === targetContainer) return;

    setContainers((prev) => ({
      ...prev,
      [sourceContainer]: prev[sourceContainer].filter((id) => id !== active.id),
      [targetContainer]: [...prev[targetContainer], active.id as string],
    }));

    // Persist: updateItemContainer(active.id, targetContainer)
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(containers).map(([zoneId, itemIds]) => (
          <DropZone key={zoneId} id={zoneId} label={zoneId}>
            {itemIds.map((id) => (
              <DraggableItem key={id} id={id}>
                {id}
              </DraggableItem>
            ))}
          </DropZone>
        ))}
      </div>
    </DndContext>
  );
}
```

</workflow>

---

## Banned Patterns
- **NEVER** attach `listeners` to the whole card if there's a drag handle — attach to handle only
- **NEVER** use `distance: 0` in activationConstraint — it breaks click events
- **NEVER** skip `DragOverlay` — without it, the dragged item disappears
- **NEVER** mutate state directly in `onDragEnd` — always use setter function `setItems(prev => ...)`
- **NEVER** forget `touch-none` on drag handles — required for mobile drag support

---

## Quality Checklist
- [ ] `PointerSensor` with `activationConstraint: { distance: 8 }` configured?
- [ ] `DragOverlay` present and shows meaningful preview?
- [ ] Drag handle has `touch-none` class and `aria-label`?
- [ ] `onReorder` callback called after state update for server persistence?
- [ ] `isDragging` visual feedback (opacity, shadow) on the dragged item?
- [ ] Mobile tested? (`touch-none` on handle prevents scroll conflicts)
