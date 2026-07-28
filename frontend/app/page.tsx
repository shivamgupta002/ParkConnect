"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { ParkingSquare, ArrowRight, Car, ScanLine, Lock } from "lucide-react";

const steps = [
  {
    icon: Car,
    title: "Register your vehicle",
    desc: "Add your car or bike and get a unique QR sticker in seconds.",
  },
  {
    icon: ScanLine,
    title: "Stick it on your vehicle",
    desc: "Anyone who needs you — for parking, an accident, or an emergency — scans it.",
  },
  {
    icon: Lock,
    title: "Talk, stay private",
    desc: "Calls are bridged through a masked number. Your phone number is never revealed.",
  },
];

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

export default function Home() {
  const [status, setStatus] = useState<string>("checking...");
  const howItWorks = useScrollReveal();

  useEffect(() => {
    api
      .get("/health")
      .then((res) => setStatus(res.data.status))
      .catch(() => setStatus("backend unreachable"));
  }, []);

  const isOk = status === "ok";

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-50 to-teal-50">
      <style jsx global>{`
        @keyframes blobFloat {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(20px, -15px) scale(1.05);
          }
          66% {
            transform: translate(-15px, 10px) scale(0.97);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes ping {
          75%,
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
        @keyframes cardReveal {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      {/* Decorative floating gradient blobs */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-teal-200/40 blur-3xl"
        style={{ animation: "blobFloat 10s ease-in-out infinite" }}
      />
      <div
        className="pointer-events-none absolute top-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-sky-200/40 blur-3xl"
        style={{ animation: "blobFloat 13s ease-in-out infinite reverse" }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-teal-100/40 blur-3xl"
        style={{ animation: "blobFloat 8s ease-in-out infinite" }}
      />

      {/* Nav */}
      <nav
        className="relative flex items-center justify-between px-6 py-5 max-w-5xl mx-auto"
        style={{ animation: "fadeInDown 0.5s ease-out" }}
      >
        <span className="flex items-center gap-2 text-xl font-semibold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-teal-600">
            <ParkingSquare className="h-4.5 w-4.5 text-white" />
          </span>
          ParkConnect
        </span>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:text-teal-700"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-medium rounded-xl bg-teal-600 text-white transition-all duration-200 hover:bg-teal-700 hover:shadow-md hover:shadow-teal-500/25 active:scale-95"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-3xl mx-auto px-6 pt-16 pb-20 text-center">
        <h1
          className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-4"
          style={{ animation: "fadeIn 0.6s ease-out 80ms both" }}
        >
          Let people reach you.
          <br />
          <span className="bg-gradient-to-r from-teal-600 to-sky-600 bg-clip-text text-transparent">
            Without ever seeing your number.
          </span>
        </h1>
        <p
          className="text-lg text-slate-600 mb-8 max-w-xl mx-auto"
          style={{ animation: "fadeIn 0.6s ease-out 160ms both" }}
        >
          Stick a ParkConnect QR code on your vehicle. Anyone who needs to reach
          you can scan it and call — through a masked number, no personal
          details shared, ever.
        </p>
        <div
          className="flex flex-col sm:flex-row gap-3 justify-center"
          style={{ animation: "fadeIn 0.6s ease-out 240ms both" }}
        >
          <Link
            href="/register"
            className="group px-6 py-3 rounded-xl bg-teal-600 text-white font-medium transition-all duration-200 hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-500/25 active:scale-95 flex items-center justify-center gap-1.5"
          >
            Create your account
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium transition-all duration-200 hover:bg-white hover:border-slate-400 active:scale-95"
          >
            I already have one
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section
        ref={howItWorks.ref}
        className="relative max-w-4xl mx-auto px-6 pb-20"
      >
        <h2 className="text-center text-sm font-semibold text-teal-700 uppercase tracking-wide mb-8">
          How it works
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {steps.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="group bg-white rounded-2xl border border-sky-100 p-6 text-center transition-all duration-300 hover:shadow-xl hover:shadow-teal-900/5 hover:-translate-y-1 hover:border-teal-200"
              style={
                howItWorks.visible
                  ? { animation: `cardReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 120}ms both` }
                  : { opacity: 0 }
              }
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 transition-all duration-300 group-hover:bg-teal-100 group-hover:scale-105">
                <Icon className="h-5 w-5 text-teal-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
              <p className="text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer / status */}
      <footer className="relative max-w-5xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-slate-400 border-t border-sky-100">
        <span>© {new Date().getFullYear()} ParkConnect</span>
        <span className="font-mono flex items-center gap-1.5">
          backend:
          <span className="relative flex h-2 w-2">
            {isOk && (
              <span
                className="absolute inline-flex h-full w-full rounded-full bg-teal-500"
                style={{ animation: "ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite" }}
              />
            )}
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                isOk ? "bg-teal-500" : status === "checking..." ? "bg-amber-400" : "bg-red-500"
              }`}
            />
          </span>
          <span className={isOk ? "text-teal-600" : status === "checking..." ? "text-amber-500" : "text-red-500"}>
            {status}
          </span>
        </span>
      </footer>
    </main>
  );
}