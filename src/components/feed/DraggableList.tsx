"use client";

import { Reorder, useDragControls } from "framer-motion";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { moveItem } from "@/lib/feed";
import type { ContentItem } from "@/types/content";

interface RowProps {
  item: ContentItem;
  index: number;
  total: number;
  onMove: (to: number) => void;
}

function SortableRow({ item, index, total, onMove }: RowProps) {
  const controls = useDragControls(); // lets only the handle start a drag

  return (
    <Reorder.Item
      value={item.id}
      dragListener={false}
      dragControls={controls}
      whileDrag={{ scale: 1.02, boxShadow: "0 12px 32px rgba(0,0,0,0.25)" }}
      className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3"
    >
      <button
        type="button"
        onPointerDown={(e) => controls.start(e)}
        aria-label={`Drag to reorder ${item.title}`}
        className="cursor-grab touch-none select-none rounded p-2 text-muted hover:bg-background active:cursor-grabbing"
      >
        <GripVertical size={18} aria-hidden="true" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.title}</p>
        <p className="text-xs text-muted">
          {item.source} · {item.type}
        </p>
      </div>

      <div className="flex shrink-0">
        <button
          type="button"
          onClick={() => onMove(index - 1)}
          disabled={index === 0}
          aria-label={`Move ${item.title} up`}
          className="rounded p-2 hover:bg-background disabled:opacity-30"
        >
          <ArrowUp size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onMove(index + 1)}
          disabled={index === total - 1}
          aria-label={`Move ${item.title} down`}
          className="rounded p-2 hover:bg-background disabled:opacity-30"
        >
          <ArrowDown size={16} aria-hidden="true" />
        </button>
      </div>
    </Reorder.Item>
  );
}

interface Props {
  items: ContentItem[];
  onReorder: (ids: string[]) => void;
}

export default function DraggableList({ items, onReorder }: Props) {
  const ids = items.map((i) => i.id);
  const byId = new Map(items.map((i) => [i.id, i]));

  return (
    <Reorder.Group axis="y" values={ids} onReorder={onReorder} className="space-y-3">
      {ids.map((id, index) => (
        <SortableRow
          key={id}
          item={byId.get(id)!}
          index={index}
          total={ids.length}
          onMove={(to) => onReorder(moveItem(ids, index, to))}
        />
      ))}
    </Reorder.Group>
  );
}