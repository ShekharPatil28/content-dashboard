// Round-robin merge: [a1,a2] + [b1,b2] -> a1, b1, a2, b2
export function interleave<T>(lists: T[][]): T[] {
  const out: T[] = [];
  const max = Math.max(0, ...lists.map((l) => l.length));
  for (let i = 0; i < max; i++) {
    for (const list of lists) {
      if (i < list.length) out.push(list[i]);
    }
  }
  return out;
}

// Puts items the user has ordered first (in their order); everything else follows
export function applyOrder<T extends { id: string }>(items: T[], order: string[]): T[] {
  if (order.length === 0) return items;
  const rank = new Map(order.map((id, i) => [id, i]));
  const ordered = items
    .filter((x) => rank.has(x.id))
    .sort((a, b) => rank.get(a.id)! - rank.get(b.id)!);
  const rest = items.filter((x) => !rank.has(x.id));
  return [...ordered, ...rest];
}

// Returns a new list with the item at `from` moved to `to`
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length || from === to) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}