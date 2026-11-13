"use client";
// Partner Workspace (Person C): see each partner's progress, assign tasks, and auto-split the work.
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Lab, Task } from "@/lib/types";
import { autoSplit } from "@/lib/autoSplit";

export default function Partners({ lab }: { lab: Lab }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [splitting, setSplitting] = useState(false);
  const people: [string, string] = [lab.partner1, lab.partner2];

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("lab_id", lab.id)
      .order("created_at");
    setLoading(false);
    if (error) return setError("Couldn't load tasks.");
    setTasks(data ?? []);
  }, [lab.id]);

  useEffect(() => {
    load();
    const t = setInterval(load, 5000); // refresh so your partner's changes show up
    return () => clearInterval(t);
  }, [load]);

  async function assign(id: string, assignee: string) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, assignee: assignee || null } : t)));
    const { error } = await supabase
      .from("tasks")
      .update({ assignee: assignee || null })
      .eq("id", id);
    if (error) setError("Couldn't assign the task.");
    load();
  }

  async function runAutoSplit() {
    const changes = autoSplit(tasks, people);
    if (changes.length === 0) {
      setMessage("Nothing to split: every open task already has someone.");
      return;
    }
    setSplitting(true);
    setError("");
    const results = await Promise.all(
      changes.map((c) => supabase.from("tasks").update({ assignee: c.assignee }).eq("id", c.id))
    );
    setSplitting(false);
    if (results.some((r) => r.error)) setError("Some tasks couldn't be assigned. Please try again.");
    else setMessage(`Split ${changes.length} task${changes.length === 1 ? "" : "s"} between ${people[0]} and ${people[1]}.`);
    load();
  }

  const unassigned = tasks.filter((t) => !t.assignee && !t.done).length;

  return (
    <div className="space-y-6">
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-red-700">{error}</p>
      )}
      {message && (
        <p role="status" className="rounded-lg bg-emerald-50 px-4 py-2 text-emerald-800">{message}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {people.map((p) => {
          const mine = tasks.filter((t) => t.assignee === p);
          const done = mine.filter((t) => t.done).length;
          const pct = mine.length ? Math.round((done / mine.length) * 100) : 0;
          return (
            <div key={p} className="rounded-2xl bg-white p-5 shadow">
              <h2 className="text-lg font-semibold">{p}</h2>
              <p className="text-sm text-slate-600">
                {done}/{mine.length} done ({pct}%)
              </p>
              <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${p} progress`}
              >
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Assign tasks</h2>
          <p className="text-sm text-slate-500">{unassigned} open task{unassigned === 1 ? "" : "s"} without an owner</p>
        </div>
        <button
          onClick={runAutoSplit}
          disabled={splitting || unassigned === 0}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {splitting ? "Splitting..." : "Auto-split unassigned"}
        </button>
      </div>

      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      {!loading && tasks.length === 0 && (
        <p className="text-sm text-slate-500">No tasks yet. Add tasks in the Checklist tab first.</p>
      )}

      <ul className="space-y-2">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
            <span className={`flex-1 ${t.done ? "text-slate-400 line-through" : ""}`}>
              {t.title}
              <span className="ml-2 text-xs text-slate-400">{t.section === "pre" ? "Pre-lab" : "Post-lab"}</span>
            </span>
            <select
              value={t.assignee ?? ""}
              onChange={(e) => assign(t.id, e.target.value)}
              aria-label={`Assign ${t.title}`}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm"
            >
              <option value="">Unassigned</option>
              {people.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}