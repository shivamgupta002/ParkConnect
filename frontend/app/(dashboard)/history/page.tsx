"use client";

import { useEffect, useState } from "react";
import { CallRecord } from "@/lib/validation/call";
import { PhoneOff, PhoneIncoming, Clock } from "lucide-react";

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

function SkeletonRow({ delay }: { delay: number }) {
  return (
    <div
      className="bg-white rounded-2xl border border-sky-100 p-4 flex items-center justify-between"
      style={{ animation: `fadeIn 0.4s ease-out ${delay}ms both` }}
    >
      <div className="space-y-2">
        <div className="h-4 w-20 rounded-full bg-slate-200 animate-pulse" />
        <div className="h-3 w-32 rounded bg-slate-100 animate-pulse" />
      </div>
      <div className="h-4 w-12 rounded bg-slate-200 animate-pulse" />
    </div>
  );
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
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-4px);
          }
          75% {
            transform: translateX(4px);
          }
        }
      `}</style>

      <div className="max-w-2xl mx-auto">
        <h1
          className="text-2xl font-semibold text-slate-900 mb-6"
          style={{ animation: "fadeIn 0.4s ease-out" }}
        >
          Call History
        </h1>

        {loading && (
          <div className="grid gap-3">
            {[0, 1, 2, 3].map((i) => (
              <SkeletonRow key={i} delay={i * 80} />
            ))}
          </div>
        )}

        {error && (
          <div
            className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-600 text-sm"
            style={{ animation: "shake 0.4s ease-in-out" }}
          >
            {error}
          </div>
        )}

        {!loading && calls.length === 0 && !error && (
          <div
            className="bg-white rounded-2xl border border-sky-100 p-8 text-center"
            style={{ animation: "popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky-50">
              <PhoneIncoming className="h-5 w-5 text-sky-400" />
            </div>
            <p className="text-slate-600">No calls yet.</p>
            <p className="text-sm text-slate-400 mt-1">
              When someone scans your QR and calls you, it&apos;ll show up here.
            </p>
          </div>
        )}

        <div className="grid gap-3">
          {calls.map((c, i) => {
            const isFailed = c.status === "failed" || c.status === "no-answer";
            return (
              <div
                key={c.id}
                className="group bg-white rounded-2xl border border-sky-100 p-4 flex items-center justify-between transition-all duration-200 hover:shadow-md hover:shadow-sky-900/5 hover:border-sky-200 hover:-translate-y-0.5"
                style={{ animation: `fadeIn 0.4s ease-out ${Math.min(i, 10) * 50}ms both` }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full shrink-0 ${
                      isFailed ? "bg-red-50" : "bg-teal-50"
                    }`}
                  >
                    {isFailed ? (
                      <PhoneOff className="h-3.5 w-3.5 text-red-400" />
                    ) : (
                      <PhoneIncoming className="h-3.5 w-3.5 text-teal-500" />
                    )}
                  </div>
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
                </div>
                <p className="text-slate-700 font-medium flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-300 transition-colors group-hover:text-teal-400" />
                  {formatDuration(c.duration_seconds)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}