// Deadline logic, kept separate from the UI so it is easy to test and explain.

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days from `today` until `dueDate` ("YYYY-MM-DD"). Negative = overdue. */
export function daysLeft(dueDate: string, today: Date = new Date()): number {
  const due = new Date(dueDate + "T00:00:00");
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((due.getTime() - start.getTime()) / DAY_MS);
}

export type DeadlineStatus = "overdue" | "soon" | "ok";

/** Overdue if the date has passed, "soon" if it's due within 2 days, otherwise on track. */
export function statusFor(days: number): DeadlineStatus {
  if (days < 0) return "overdue";
  if (days <= 2) return "soon";
  return "ok";
}

/** Short human label for a badge, e.g. "Due today", "Due in 2d", "5 days left". */
export function labelFor(days: number): string {
  if (days < -1) return `Overdue by ${-days} days`;
  if (days === -1) return "Overdue by 1 day";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days === 2) return "Due in 2 days";
  return `${days} days left`;
}
