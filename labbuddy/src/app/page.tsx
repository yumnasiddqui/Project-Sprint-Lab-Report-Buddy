"use client";
// Home page: start a new lab or join one with a 6-character code.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// No 0/O or 1/I so codes are easy to read out loud to your partner.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const makeCode = () =>
  Array.from({ length: 6 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");

const input =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function createLab(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !p1.trim() || !p2.trim())
      return setError("Enter a lab name and both partner names.");
    setBusy(true);
    const code = makeCode();
    const { error } = await supabase
      .from("labs")
      .insert({ code, name: name.trim(), partner1: p1.trim(), partner2: p2.trim() });
    setBusy(false);
    if (error) return setError("Couldn't create the lab. Please try again.");
    router.push(`/lab/${code}`);
  }

  async function joinLab(e: React.FormEvent) {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!code) return setError("Enter a lab code.");
    const { data } = await supabase.from("labs").select("code").eq("code", code).maybeSingle();
    if (!data) return setError("No lab found with that code.");
    router.push(`/lab/${code}`);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-bold text-indigo-700">LabBuddy</h1>
      <p className="mt-2 text-slate-600">
        Pre-labs, partner tasks and deadlines, all in one dashboard.
      </p>

      {error && (
        <p role="alert" className="mt-6 rounded-lg bg-red-50 px-4 py-2 text-red-700">
          {error}
        </p>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <form onSubmit={createLab} className="space-y-3 rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">Start a new lab</h2>
          <label className="block text-sm font-medium">
            Lab name
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Circuits Lab 3" />
          </label>
          <label className="block text-sm font-medium">
            Your name
            <input className={input} value={p1} onChange={(e) => setP1(e.target.value)} />
          </label>
          <label className="block text-sm font-medium">
            Partner&apos;s name
            <input className={input} value={p2} onChange={(e) => setP2(e.target.value)} />
          </label>
          <button disabled={busy} className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
            {busy ? "Creating..." : "Create lab"}
          </button>
        </form>

        <form onSubmit={joinLab} className="space-y-3 rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">Join with a code</h2>
          <label className="block text-sm font-medium">
            Lab code
            <input className={input + " uppercase tracking-widest"} value={joinCode} onChange={(e) => setJoinCode(e.target.value)} maxLength={6} />
          </label>
          <button className="w-full rounded-lg border border-indigo-600 py-2 font-medium text-indigo-700 hover:bg-indigo-50">
            Join lab
          </button>
        </form>
      </div>
    </main>
  );
}
