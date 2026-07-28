// frontend/app/(dashboard)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Me {
  full_name: string;
  email: string;
  phone_number: string;
  is_verified: boolean;
  is_premium: boolean;
}

interface Vehicle {
  id: string;
  vehicle_type: string;
  brand: string;
  model: string;
  color: string;
  is_active: boolean;
}

function extractVehicles(payload: any): Vehicle[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.vehicles)) return payload.vehicles;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/vehicles?limit=5")
        .then(async (r) => {
          const json = await r.json();
          if (!r.ok) {
            setLoadError(json.detail || "Could not load vehicles.");
            return [];
          }
          return json;
        })
        .catch(() => {
          setLoadError("Network error loading vehicles.");
          return [];
        }),
    ])
      .then(([meData, vehiclesPayload]) => {
        setMe(meData);
        setVehicles(extractVehicles(vehiclesPayload));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-teal-200 border-t-teal-600 animate-spin" />
          <p className="text-slate-400 text-sm animate-pulse">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const activeVehicles = vehicles.filter((v) => v.is_active);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 px-4 py-8 overflow-hidden">
      {/* Ambient floating blobs — purely decorative */}
      <div className="pointer-events-none fixed -top-24 -left-24 w-72 h-72 bg-teal-200/30 rounded-full blur-3xl animate-blob" />
      <div className="pointer-events-none fixed top-40 -right-24 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl animate-blob animation-delay-2000" />

      <div className="max-w-3xl mx-auto relative">
        {/* Welcome header */}
        <div
          className="flex items-center justify-between mb-8 opacity-0 animate-fade-in-down"
          style={{ animationDelay: "0ms", animationFillMode: "forwards" }}
        >
          <div>
            <p className="text-teal-600 text-sm font-medium mb-1">
              {greeting()}
              {me ? `, ${me.full_name.split(" ")[0]}` : ""} 👋
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">Your Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">{me?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="group relative px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-sm
                       hover:bg-white hover:border-red-200 hover:text-red-600 hover:shadow-sm
                       active:scale-95 transition-all duration-200 disabled:opacity-50"
          >
            <span className="inline-flex items-center gap-1.5">
              {loggingOut ? "Logging out…" : "Log out"}
              <svg
                className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </span>
          </button>
        </div>

        {!me && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-shake">
            Could not load your profile.
          </div>
        )}

        {me && !me.is_verified && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm opacity-0 animate-fade-in-up animation-delay-100">
            Your account isn&apos;t verified yet.
          </div>
        )}

        {loadError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {loadError}
          </div>
        )}

        {/* Plan badge */}
        <div
          className="mb-8 flex items-center gap-2 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "80ms", animationFillMode: "forwards" }}
        >
          <span
            className={`text-xs px-3 py-1 rounded-full font-medium transition-transform hover:scale-105 ${
              me?.is_premium
                ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-sm shadow-teal-200"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {me?.is_premium ? "✨ Premium plan" : "Free plan"}
          </span>
          {!me?.is_premium && (
            <span className="text-xs text-slate-400">1 vehicle limit</span>
          )}
        </div>

        {/* Quick stats */}
        <div
          className="grid sm:grid-cols-3 gap-4 mb-8 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "140ms", animationFillMode: "forwards" }}
        >
          <div className="bg-white rounded-2xl border border-sky-100 p-5 transition-all duration-200 hover:shadow-lg hover:shadow-teal-100/50 hover:-translate-y-0.5">
            <p className="text-2xl font-semibold text-slate-900 tabular-nums">
              {activeVehicles.length}
            </p>
            <p className="text-sm text-slate-500">Active vehicles</p>
          </div>
          <Link
            href="/history"
            className="group bg-white rounded-2xl border border-sky-100 p-5 transition-all duration-200 hover:shadow-lg hover:shadow-teal-100/50 hover:-translate-y-0.5 hover:border-teal-200"
          >
            <p className="text-2xl font-semibold text-slate-900 transition-transform duration-200 group-hover:translate-x-1">
              →
            </p>
            <p className="text-sm text-slate-500">View call history</p>
          </Link>
          <Link
            href="/vehicles"
            className="group bg-white rounded-2xl border border-sky-100 p-5 transition-all duration-200 hover:shadow-lg hover:shadow-teal-100/50 hover:-translate-y-0.5 hover:border-teal-200"
          >
            <p className="text-2xl font-semibold text-slate-900 transition-transform duration-200 group-hover:translate-x-1">
              →
            </p>
            <p className="text-sm text-slate-500">Manage vehicles</p>
          </Link>
        </div>

        {/* Vehicles preview */}
        <div
          className="bg-white rounded-2xl border border-sky-100 p-6 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "200ms", animationFillMode: "forwards" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Your vehicles</h2>
            <Link
              href="/vehicles"
              className="text-sm text-teal-700 font-medium hover:text-teal-800 hover:underline underline-offset-2 transition-colors"
            >
              See all
            </Link>
          </div>

          {vehicles.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3 animate-bounce-slow">🚗</div>
              <p className="text-slate-500 mb-3">No vehicles added yet.</p>
              <Link
                href="/vehicles/new"
                className="inline-block px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-medium
                           hover:bg-teal-700 hover:shadow-md hover:shadow-teal-200 active:scale-95 transition-all duration-200"
              >
                Add your first vehicle
              </Link>
            </div>
          ) : (
            <div className="grid gap-3">
              {vehicles.map((v, i) => (
                <Link
                  key={v.id}
                  href={`/vehicles/${v.id}/qr`}
                  className="group flex items-center justify-between p-3 rounded-xl border border-slate-100
                             hover:border-teal-200 hover:bg-teal-50/40 hover:shadow-sm
                             active:scale-[0.99] transition-all duration-200 opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${260 + i * 60}ms`, animationFillMode: "forwards" }}
                >
                  <span className="flex items-center gap-2 text-sm text-slate-700 capitalize">
                    <span className="text-lg">{v.vehicle_type === "bike" ? "🏍️" : "🚗"}</span>
                    <span className="group-hover:text-teal-700 transition-colors">
                      {v.color} {v.brand} {v.model}
                    </span>
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full transition-transform group-hover:scale-105 ${
                      v.is_active ? "bg-teal-100 text-teal-700" : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {v.is_active ? "Active" : "Inactive"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}