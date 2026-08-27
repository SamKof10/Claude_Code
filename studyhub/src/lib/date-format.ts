import { differenceInCalendarDays, format, isToday, isTomorrow, isYesterday } from "date-fns";

export function formatDueLabel(iso: string): string {
  const d = new Date(iso);
  if (isToday(d)) return `Today, ${format(d, "h:mm a")}`;
  if (isTomorrow(d)) return "Tomorrow";
  if (isYesterday(d)) return "Yesterday";
  const days = differenceInCalendarDays(d, new Date());
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days <= 6) return format(d, "EEEE");
  return format(d, "MMM d");
}

export function formatRelativeDays(iso: string): string {
  const days = differenceInCalendarDays(new Date(iso), new Date());
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days < 0) return `${Math.abs(days)} days ago`;
  return `In ${days} days`;
}

export function formatDateShort(iso: string): string {
  return format(new Date(iso), "MMM d, yyyy");
}

export function formatDateLong(iso: string): string {
  return format(new Date(iso), "EEEE, MMMM d, yyyy");
}

export function greeting(hour = new Date().getHours()): string {
  if (hour < 5) return "Burning the midnight oil";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
