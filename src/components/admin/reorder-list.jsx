"use client";

/**
 * Vertical reorder list — @dnd-kit sortable with overlay.
 * Drag stays local; parent is notified only after drop (via startTransition).
 *
 * DragOverlay is portaled to document.body: Dialog/Sheet use CSS transform
 * for centering, which creates a containing block for position:fixed and
 * makes the overlay jump away from the pointer if rendered inside the modal.
 */
import { startTransition, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
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
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/utils/cn";

const dropAnimation = {
  duration: 180,
  easing: "cubic-bezier(0.25, 1, 0.5, 1)",
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0.4" } },
  }),
};

const verticalOnly = [restrictToVerticalAxis];

export function ReorderList({ items, onOrderChange, renderLabel, className }) {
  const [ordered, setOrdered] = useState(items);
  const [activeId, setActiveId] = useState(null);
  const [portalReady, setPortalReady] = useState(false);
  const itemsOrderKey = items.map((i) => i.id).join(",");

  useEffect(() => {
    setOrdered(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsOrderKey]);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  // PointerSensor covers mouse + touch/pen. Do not also register TouchSensor
  // (double sensors fight activation and feel sticky).
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
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

    const oldIndex = ordered.findIndex((i) => i.id === Number(active.id));
    const newIndex = ordered.findIndex((i) => i.id === Number(over.id));
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(ordered, oldIndex, newIndex);
    setOrdered(next);
    // Defer parent update so drop animation is not blocked by API / setState.
    startTransition(() => {
      onOrderChange(next.map((i) => i.id));
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

  const overlay = (
    <DragOverlay dropAnimation={dropAnimation} adjustScale={false}>
      {activeItem ? (
        <div className="flex cursor-grabbing items-center gap-2 rounded-admin-md border-2 border-admin-primary bg-admin-surface px-3 py-2.5 shadow-xl ring-1 ring-black/10">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-admin-sm bg-admin-primary-soft text-[0.65rem] font-semibold tabular-nums text-admin-primary">
            {activeIndex + 1}
          </span>
          <GripVertical className="size-4 shrink-0 text-admin-primary" />
          <div className="min-w-0 flex-1 truncate text-sm font-medium">
            {typeof activeItem.stop_name === "string" &&
            activeItem.stop_name.trim()
              ? activeItem.stop_name
              : typeof activeItem.name === "string"
                ? activeItem.name
                : `#${activeItem.id}`}
          </div>
        </div>
      ) : null}
    </DragOverlay>
  );

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
        modifiers={verticalOnly}
        autoScroll={false}
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
        {portalReady ? createPortal(overlay, document.body) : null}
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
        transform: CSS.Translate.toString(transform),
        // Skip transition while dragging — avoids laggy “rubber band” feel.
        transition: isDragging ? undefined : transition,
      }}
      className={cn(
        "flex items-center gap-2 rounded-admin-md border border-admin-border bg-admin-surface px-3 py-2.5 text-sm shadow-sm",
        isDragging && "opacity-40 shadow-none",
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
