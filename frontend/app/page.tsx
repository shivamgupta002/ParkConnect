"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function Home() {
  const [status, setStatus] = useState<string>("checking...");

  useEffect(() => {
    api
      .get("/health")
      .then((res) => setStatus(res.data.status))
      .catch(() => setStatus("backend unreachable"));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">ParkConnect</h1>
      <p>
        Backend status: <span className="font-mono">{status}</span>
      </p>
    </main>
  );
}