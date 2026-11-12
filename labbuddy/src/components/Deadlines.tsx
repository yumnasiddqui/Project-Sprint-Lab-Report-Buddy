"use client";
// Deadline Tracker (Person A): add due dates and see Overdue / Due soon / On track badges.
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Lab, Deadline } from "@/lib/types";
import { daysLeft, labelFor, statusFor, type DeadlineStatus } from "@/lib/deadlines";

const BADGE: Record<DeadlineStatus, string> = {
  overdue: "bg-red-100 text-red-700",
  soon: "bg-amber-100 text-amber-800",
  ok: "bg-emerald-100 text-emerald-800",
};

const prettyDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

export default function Deadlines({ lab }: { lab: Lab }) {
  const [items, setItems] = useState<Deadline[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("deadlines")
      .select("*")
      .eq("lab_id", lab.id)
      .order("due_date");
    setLoading(false);
    if (error) return setError("Couldn't load deadlines.");
    setItems(data ?? []);
  }, [lab.id]);

  useEffect(() => {
    load();
    const t = setInterval(load, 5000); // refresh so your partner's changes show up
    return () => clearInterval(t);
  }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date) return setError("Enter a title and a due date.");
    const { error } = await supabase
      .from("deadlines")
      .insert({ lab_id: lab.id, title: title.trim(), due_date: date });
    if (error) return setError("Couldn't add the deadline.");
    setTitle("");
    setDate("");
    setError("");
    load();
  }

  async function remove(id: string) {
    setItems((prev) => prev.filter((d) => d.id !== id));
    const { error } = await supabase.from("deadlines").delete().eq("id", id);
    if (error) {
      setError("Couldn't delete the deadline.");
      load();
    }
  }

  const overdueCount = items.filter((d) => statusFor(daysLeft(d.due_date)) === "overdue").length;
  const soonCount = items.filter((d) => statusFor(daysLeft(d.due_date)) === "soon").length;

  return (
    <div className="space-y-6">
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 text-sm">
          <span className={`rounded-full px-3 py-1 ${BADGE.overdue}`}>{overdueCount} overdue</span>
          <span className={`rounded-full px-3 py-1 ${BADGE.soon}`}>{soonCount} due soon</span>
          <span className={`rounded-full px-3 py-1 ${BADGE.ok}`}>
            {items.length - overdueCount - soonCount} on track
          </span>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-red-700">
          {error}
        </p>
      )}

      <form onSubmit={add} className="flex flex-wrap gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Deadline title"
          placeholder="Lab 3 report due"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Due date"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2"
        />
        <button className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700">
          Add
        </button>
      </form>

      {loading && <p className="text-sm text-slate-500">Loading...</p>}
      {!loading && items.length === 0 && (
        <p className="text-sm text-slate-500">No deadlines yet. Add your pre-lab and report due dates above.</p>
      )}

      <ul className="space-y-2">
        {items.map((d) => {
          const days = daysLeft(d.due_date);
          return (
            <li key={d.id} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
              <div className="flex-1">
                <p className="font-medium">{d.title}</p>
                <p className="text-sm text-slate-500">{prettyDate(d.due_date)}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${BADGE[statusFor(days)]}`}>
                {labelFor(days)}
              </span>
              <button
                onClick={() => remove(d.id)}
                aria-label={`Delete ${d.title}`}
                className="text-slate-400 hover:text-red-600"
              >
                ✕
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
