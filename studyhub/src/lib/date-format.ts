import { differenceInCalendarDays, format, isToday, isTomorrow, isYesterday } from "date-fns";
import { de } from "date-fns/locale";

// Every date in the interface goes through here, so the German locale is
// applied once rather than per call site — and 24-hour time comes with it.
const opts = { locale: de } as const;

export function formatDueLabel(iso: string): string {
  const d = new Date(iso);
  if (isToday(d)) return `Heute, ${format(d, "HH:mm", opts)}`;
  if (isTomorrow(d)) return "Morgen";
  if (isYesterday(d)) return "Gestern";
  const days = differenceInCalendarDays(d, new Date());
  if (days < 0) return `${Math.abs(days)} ${Math.abs(days) === 1 ? "Tag" : "Tage"} überfällig`;
  if (days <= 6) return format(d, "EEEE", opts);
  return format(d, "d. MMM", opts);
}

export function formatRelativeDays(iso: string): string {
  const days = differenceInCalendarDays(new Date(iso), new Date());
  if (days === 0) return "Heute";
  if (days === 1) return "Morgen";
  if (days === -1) return "Gestern";
  if (days < 0) return `vor ${Math.abs(days)} Tagen`;
  return `in ${days} Tagen`;
}

export function formatDateShort(iso: string): string {
  return format(new Date(iso), "d. MMM yyyy", opts);
}

export function formatDateLong(iso: string): string {
  return format(new Date(iso), "EEEE, d. MMMM yyyy", opts);
}

export function greeting(hour = new Date().getHours()): string {
  if (hour < 5) return "Noch wach";
  if (hour < 12) return "Guten Morgen";
  if (hour < 18) return "Guten Tag";
  return "Guten Abend";
}
