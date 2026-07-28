// frontend/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-teal-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <span className="text-xl font-semibold text-slate-900">ParkConnect</span>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-teal-700"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-medium rounded-xl bg-teal-600 text-white hover:bg-teal-700"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-4">
          Let people reach you.
          <br />
          Without ever seeing your number.
        </h1>
        <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto">
          Stick a ParkConnect QR code on your vehicle. Anyone who needs to reach
          you can scan it and call — through a masked number, no personal
          details shared, ever.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="px-6 py-3 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700"
          >
            Create your account
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-white"
          >
            I already have one
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-center text-sm font-semibold text-teal-700 uppercase tracking-wide mb-8">
          How it works
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-sky-100 p-6 text-center">
            <div className="text-3xl mb-3">🚗</div>
            <h3 className="font-semibold text-slate-900 mb-1">Register your vehicle</h3>
            <p className="text-sm text-slate-500">
              Add your car or bike and get a unique QR sticker in seconds.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-sky-100 p-6 text-center">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="font-semibold text-slate-900 mb-1">Stick it on your vehicle</h3>
            <p className="text-sm text-slate-500">
              Anyone who needs you — for parking, an accident, or an emergency — scans it.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-sky-100 p-6 text-center">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-semibold text-slate-900 mb-1">Talk, stay private</h3>
            <p className="text-sm text-slate-500">
              Calls are bridged through a masked number. Your phone number is never revealed.
            </p>
          </div>
        </div>
      </section>

      {/* Footer / status */}
      <footer className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-slate-400 border-t border-sky-100">
        <span>© {new Date().getFullYear()} ParkConnect</span>
        <span className="font-mono">
          backend: <span className={status === "ok" ? "text-teal-600" : "text-red-500"}>{status}</span>
        </span>
      </footer>
    </main>
  );
}