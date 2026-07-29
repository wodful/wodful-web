/**
 * Convert `datetime-local` (local wall clock, no TZ) into an unambiguous ISO instant.
 * Uses the browser's local timezone — correct for organizers editing sale windows.
 */
export function datetimeLocalToIso(value: string): string {
  if (!value) return value;
  // `YYYY-MM-DDTHH:mm` is parsed as local time by the Date constructor in browsers.
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString();
}

/** Convert an ISO/Date instant into a `datetime-local` input value in the browser timezone. */
export function isoToDatetimeLocal(value?: Date | string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
