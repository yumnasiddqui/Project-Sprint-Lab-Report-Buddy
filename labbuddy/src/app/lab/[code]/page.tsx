"use client";
// Lab dashboard: loads the lab by its code and shows three tabs.
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Lab } from "@/lib/types";
import Checklist from "@/components/Checklist";
import Partners from "@/components/Partners";
import Deadlines from "@/components/Deadlines";

const TABS = ["Checklist", "Partners", "Deadlines"] as const;

export default function LabPage() {
  const { code } = useParams<{ code: string }>();
  const [lab, setLab] = useState<Lab | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Checklist");
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("labs")
      .select("*")
      .eq("code", code.toUpperCase())
      .maybeSingle()
      .then(({ data }) => (data ? setLab(data) : setError("Lab not found. Check the code.")));
  }, [code]);

  if (error)
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p role="alert" className="text-red-700">{error}</p>
        <Link href="/" className="text-indigo-700 underline">Back home</Link>
      </main>
    );
  if (!lab) return <main className="px-4 py-12 text-center text-slate-500">Loading...</main>;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/" className="text-sm text-indigo-700 underline">LabBuddy</Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-3xl font-bold">{lab.name}</h1>
        <span className="rounded-full bg-indigo-100 px-3 py-1 font-mono text-sm text-indigo-800">
          Code: {lab.code}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        {lab.partner1} &amp; {lab.partner2}. Share the code with your partner so they can join.
      </p>

      <div role="tablist" className="mt-6 flex gap-2 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 font-medium ${tab === t ? "border-b-2 border-indigo-600 text-indigo-700" : "text-slate-500 hover:text-slate-800"}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "Checklist" && <Checklist lab={lab} />}
        {tab === "Partners" && <Partners lab={lab} />}
        {tab === "Deadlines" && <Deadlines lab={lab} />}
      </div>
    </main>
  );
}
