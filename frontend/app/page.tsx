"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

/**
 * Phase 0 placeholder home page.
 *
 * Its only job is to prove the frontend and backend are wired together by
 * fetching GET /health from the FastAPI backend and displaying the result.
 * No business logic, no routing, no auth — that all comes in later phases.
 */
export default function Home() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [detail, setDetail] = useState<string>("");

  useEffect(() => {
    api
      .get("/health")
      .then((res) => {
        setStatus(res.data?.status === "ok" ? "ok" : "error");
        setDetail(JSON.stringify(res.data));
      })
      .catch((err) => {
        setStatus("error");
        setDetail(err?.message ?? "Unknown error");
      });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-semibold">ParkConnect</h1>
      <p className="text-sm text-gray-500">Phase 0 — scaffolding check</p>

      <div className="rounded-lg border px-6 py-4 text-center">
        <p className="text-sm text-gray-500">Backend status</p>
        {status === "loading" && <p className="text-lg font-medium">Checking…</p>}
        {status === "ok" && (
          <p className="text-lg font-medium text-green-600">✅ Connected ({detail})</p>
        )}
        {status === "error" && (
          <p className="text-lg font-medium text-red-600">
            ❌ Could not reach backend ({detail})
          </p>
        )}
      </div>
    </main>
  );
}
