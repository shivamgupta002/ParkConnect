"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardStub() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");

  // Minimal client-side decode of a non-sensitive claim for display only.
  // The actual auth check happens server-side (middleware + cookie).
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setEmail(data.email ?? ""))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-sky-50">
      <p className="text-lg">Logged in as {email || "…"}</p>
      <button
        onClick={handleLogout}
        className="px-5 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900"
      >
        Log out
      </button>
    </main>
  );
}