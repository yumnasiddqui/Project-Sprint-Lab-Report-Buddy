// Auto-split logic for the Partners tab, kept separate from the UI so it is easy to test and explain.
import type { Task } from "@/lib/types";

export type Assignment = { id: string; assignee: string };

/**
 * Shares out every unassigned, unfinished task between the two partners.
 * Each task goes to whoever currently has FEWER open tasks, so the workload
 * ends up as even as possible. Ties go to the first partner.
 * Tasks that are already assigned or already done are left alone.
 */
export function autoSplit(tasks: Task[], partners: [string, string]): Assignment[] {
  const [a, b] = partners;
  const open: Record<string, number> = {
    [a]: tasks.filter((t) => t.assignee === a && !t.done).length,
    [b]: tasks.filter((t) => t.assignee === b && !t.done).length,
  };

  return tasks
    .filter((t) => !t.assignee && !t.done)
    .map((t) => {
      const pick = open[a] <= open[b] ? a : b;
      open[pick]++;
      return { id: t.id, assignee: pick };
    });
}