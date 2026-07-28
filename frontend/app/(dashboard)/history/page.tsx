"use client";

import { useEffect, useState } from "react";
import { CallRecord } from "@/lib/validation/call";

const statusStyles: Record<string, string> = {
  "in-progress": "bg-teal-100 text-teal-700",
  completed: "bg-teal-100 text-teal-700",
  ringing: "bg-amber-100 text-amber-700",
  initiating: "bg-amber-100 text-amber-700",
  "no-answer": "bg-slate-200 text-slate-600",
  failed: "bg-red-100 text-red-700",
};

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function CallHistoryPage() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/calls?limit=50")
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.detail || "Could not load call history.");
        setCalls(json.items ?? json);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-sky-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">Call History</h1>

        {loading && <p className="text-slate-500">Loading…</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        {!loading && calls.length === 0 && !error && (
          <div className="bg-white rounded-2xl border border-sky-100 p-8 text-center">
            <p className="text-slate-600">No calls yet.</p>
            <p className="text-sm text-slate-400 mt-1">
              When someone scans your QR and calls you, it&apos;ll show up here.
            </p>
          </div>
        )}

        <div className="grid gap-3">
          {calls.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-sky-100 p-4 flex items-center justify-between"
            >
              <div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                    statusStyles[c.status] ?? "bg-slate-100 text-slate-600"
                  }`}
                >
                  {c.status.replace("-", " ")}
                </span>
                <p className="text-sm text-slate-500 mt-1">
                  {new Date(c.created_at).toLocaleString()}
                </p>
              </div>
              <p className="text-slate-700 font-medium">{formatDuration(c.duration_seconds)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}