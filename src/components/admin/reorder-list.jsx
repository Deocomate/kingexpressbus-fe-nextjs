"use client";

/**
 * Vertical reorder list — @dnd-kit sortable with overlay, touch support,
 * and vertical-axis lock for predictable admin list sorting.
 */
import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  TouchSensor,
  closestCenter,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/utils/cn";

const dropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0.4" } },
  }),
};

const measuring = {
  droppable: { strategy: MeasuringStrategy.Always },
};

export function ReorderList({ items, onOrderChange, renderLabel, className }) {
  const [ordered, setOrdered] = useState(items);
  const [activeId, setActiveId] = useState(null);
  const itemIdsKey = items.map((i) => i.id).join(",");

  useEffect(() => {
    setOrdered(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemIdsKey]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 180, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const sortableIds = useMemo(() => ordered.map((i) => i.id), [ordered]);

  function handleDragStart(event) {
    setActiveId(Number(event.active.id));
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    setOrdered((prev) => {
      const oldIndex = prev.findIndex((i) => i.id === Number(active.id));
      const newIndex = prev.findIndex((i) => i.id === Number(over.id));
      if (oldIndex < 0 || newIndex < 0) return prev;
      const next = arrayMove(prev, oldIndex, newIndex);
      onOrderChange(next.map((i) => i.id));
      return next;
    });
  }

  const activeItem = activeId
    ? ordered.find((i) => i.id === activeId)
    : null;
  const activeIndex = activeId
    ? ordered.findIndex((i) => i.id === activeId)
    : -1;

  if (ordered.length === 0) {
    return (
      <p className="rounded-admin-md border border-dashed border-admin-border px-3 py-6 text-center text-sm text-admin-muted">
        Chưa có mục để sắp xếp.
      </p>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-xs text-admin-muted">
        Kéo biểu tượng{" "}
        <GripVertical className="inline size-3.5 align-text-bottom" /> để đổi
        thứ tự. Hỗ trợ chuột, cảm ứng và bàn phím.
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        measuring={measuring}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext
          items={sortableIds}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-1.5" role="list">
            {ordered.map((item, index) => (
              <ReorderRow
                key={item.id}
                id={item.id}
                index={index}
                isActive={item.id === activeId}
              >
                {renderLabel(item)}
              </ReorderRow>
            ))}
          </ul>
        </SortableContext>
        <DragOverlay dropAnimation={dropAnimation} adjustScale={false}>
          {activeItem ? (
            <div className="flex items-center gap-2 rounded-admin-md border-2 border-admin-primary bg-admin-surface px-3 py-2.5 shadow-xl ring-1 ring-black/10">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-admin-sm bg-admin-primary-soft text-[0.65rem] font-semibold tabular-nums text-admin-primary">
                {activeIndex + 1}
              </span>
              <GripVertical className="size-4 shrink-0 text-admin-primary" />
              <div className="min-w-0 flex-1 truncate text-sm font-medium">
                {renderLabel(activeItem)}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function ReorderRow({ id, index, isActive, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "flex items-center gap-2 rounded-admin-md border border-admin-border bg-admin-surface px-2 py-2 text-sm transition-shadow",
        isDragging && "opacity-30 shadow-none",
        isActive && !isDragging && "ring-2 ring-admin-primary/30",
      )}
    >
      <span
        className="flex size-6 shrink-0 items-center justify-center rounded-admin-sm bg-slate-100 text-[0.65rem] font-semibold tabular-nums text-admin-muted"
        aria-hidden="true"
      >
        {index + 1}
      </span>
      <button
        type="button"
        ref={setActivatorNodeRef}
        className="cursor-grab touch-none rounded-admin-sm p-1.5 text-admin-muted hover:bg-admin-surface-hover hover:text-admin-ink active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-ring"
        aria-label={`Kéo để sắp xếp, vị trí ${index + 1}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </li>
  );
}
