type SlotItem = {
  id: string;
  slotId?: string | null;
  slotOrder?: number;
};

export function slotKey(item: SlotItem) {
  return item.slotId || item.id;
}

/** Preserve list order, then lane order inside each card. */
export function groupBySlot<T extends SlotItem>(items: T[]): T[][] {
  const order: string[] = [];
  const groups = new Map<string, T[]>();

  items.forEach((item) => {
    const key = slotKey(item);
    const group = groups.get(key);
    if (!group) {
      order.push(key);
      groups.set(key, [item]);
      return;
    }
    group.push(item);
  });

  return order.map((key) =>
    groups
      .get(key)!
      .slice()
      .sort((a, b) => (a.slotOrder ?? 0) - (b.slotOrder ?? 0)),
  );
}

export function uniqueJoined(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).join(' · ');
}

export function slotLaneQuantity(segments: { laneQuantity?: number }[]) {
  return segments.reduce((sum, segment) => sum + (segment.laneQuantity ?? 0), 0);
}
