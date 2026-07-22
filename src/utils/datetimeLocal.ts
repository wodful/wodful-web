/** Convert `datetime-local` (local wall clock, no TZ) into an unambiguous ISO instant. */
export function datetimeLocalToIso(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString();
}

/** Convert an ISO/Date instant into a `datetime-local` input value in the browser timezone. */
export function isoToDatetimeLocal(value?: Date | string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const tzOffsetMs = date.getTimezoneOffset() * 60000;
  const localTime = new Date(date.getTime() - tzOffsetMs);
  return localTime.toISOString().slice(0, 16);
}
