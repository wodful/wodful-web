/**
 * Date helpers for Wodful (web).
 *
 * - Date-only (championship / schedule calendar): UTC calendar day — no addDays(+1).
 * - DateTime (tickets, createdAt): format in the browser local timezone.
 */

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})/;

/** Normalize any Date / ISO / YYYY-MM-DD into YYYY-MM-DD via UTC calendar. */
export function toDateOnlyString(value: Date | string): string {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const match = trimmed.match(DATE_ONLY_RE);
    if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Display date-only as dd/MM/yyyy (or custom from YYYY-MM-DD parts). */
export function formatDateOnly(
  value: Date | string,
  mask: 'dd/MM/yyyy' | 'dd/MM' | 'yyyy-MM-dd' = 'dd/MM/yyyy',
): string {
  const ymd = toDateOnlyString(value);
  if (!ymd) return '';
  const [y, m, d] = ymd.split('-');
  if (mask === 'yyyy-MM-dd') return ymd;
  if (mask === 'dd/MM') return `${d}/${m}`;
  return `${d}/${m}/${y}`;
}

/**
 * @deprecated Use formatDateOnly for @db.Date fields.
 * Kept as alias so leftover imports keep the correct calendar day (no +1).
 */
export const incrementAndFormatDate = (
  date: Date | string,
  mask: 'dd/MM/yyyy' | 'dd/MM' | 'yyyy-MM-dd' = 'dd/MM/yyyy',
) => formatDateOnly(date, mask);

/** Format a DateTime instant in the browser local timezone. */
export const formatDate = (date: Date | string, mask = 'dd/MM/yyyy') => {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return '';

  const pad = (n: number) => String(n).padStart(2, '0');
  const map: Record<string, string> = {
    yyyy: String(value.getFullYear()),
    MM: pad(value.getMonth() + 1),
    dd: pad(value.getDate()),
    HH: pad(value.getHours()),
    mm: pad(value.getMinutes()),
    ss: pad(value.getSeconds()),
  };

  return mask.replace(/yyyy|MM|dd|HH|mm|ss/g, (token) => map[token] ?? token);
};

export const formatHour = (date: Date | string) => {
  return formatDate(date, 'HH:mm');
};
