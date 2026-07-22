export const categoryFormatMeta: Record<
  number,
  { label: string; tone: 'primary' | 'success' | 'neutral' }
> = {
  1: { label: 'Individual', tone: 'primary' },
  2: { label: 'Dupla', tone: 'success' },
  3: { label: 'Trio', tone: 'primary' },
  4: { label: 'Time', tone: 'neutral' },
  5: { label: 'Time', tone: 'neutral' },
  6: { label: 'Time', tone: 'neutral' },
};

export function categoryFormatLabel(members: number) {
  return categoryFormatMeta[members]?.label ?? `${members} membros`;
}

export function categoryFormatTone(members: number) {
  return categoryFormatMeta[members]?.tone ?? 'neutral';
}
