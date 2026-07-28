"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Vehicle } from "@/lib/validation/vehicle";

function extractVehicles(payload: any): Vehicle[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.vehicles)) return payload.vehicles;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export default function VehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isPremium, setIsPremium] = useState<boolean | null>(null); // null = unknown yet
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [vehiclesRes, meRes] = await Promise.all([
        fetch("/api/vehicles?limit=100"),
        fetch("/api/auth/me"),
      ]);

      const vehiclesJson = await vehiclesRes.json();
      if (!vehiclesRes.ok)
        throw new Error(vehiclesJson.detail || "Could not load vehicles.");
      setVehicles(extractVehicles(vehiclesJson));

      if (meRes.ok) {
        const meJson = await meRes.json();
        setIsPremium(!!meJson.is_premium);
      }
    } catch (err: any) {
      setError(err.message);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this vehicle? Its QR code will stop working.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.detail || "Could not delete vehicle.");
      }
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const activeCount = vehicles.filter((v) => v.is_active).length;
  // Only enforce the free-plan cap once we actually know the user isn't premium.
  const atFreeLimit = isPremium === false && activeCount >= 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white px-4 py-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 animate-fade-slide-down">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-teal-600 uppercase mb-1">
              Garage
            </p>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Your Vehicles
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={atFreeLimit ? "#" : "/vehicles/new"}
              title={
                atFreeLimit
                  ? "Free plan allows 1 vehicle — upgrade for more"
                  : undefined
              }
              className={`group inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                atFreeLimit
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed pointer-events-none"
                  : "bg-teal-600 text-white shadow-sm shadow-teal-600/20 hover:bg-teal-700 hover:shadow-md hover:shadow-teal-600/30 hover:-translate-y-0.5 active:translate-y-0"
              }`}
            >
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  !atFreeLimit ? "group-hover:rotate-90" : ""
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Vehicle
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-sm transition-colors duration-200 hover:bg-white hover:border-slate-400"
            >
              Log out
            </button>
          </div>
        </div>

        {atFreeLimit && (
          <p className="text-sm text-slate-500 mb-4 animate-fade-slide-down">
            You&apos;re on the free plan (1 vehicle).{" "}
            <Link
              href="/dashboard/subscription"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
            >
              Upgrade to add more
            </Link>
            .
          </p>
        )}

        {error && (
          <p className="text-sm text-rose-600 mb-4 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 animate-fade-slide-down">
            {error}
          </p>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid gap-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-sky-100 p-5 h-[76px] overflow-hidden relative animate-fade-slide-down"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="skeleton-shimmer absolute inset-0" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && vehicles.length === 0 && !error && (
          <div className="bg-white rounded-2xl border border-sky-100 p-10 text-center animate-fade-slide-down">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-sky-50 flex items-center justify-center animate-float">
              <svg
                className="w-7 h-7 text-teal-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 17h14M5 17a2 2 0 104 0M15 17a2 2 0 104 0M5 17V9l2-4h10l2 4v8M5 9h14" />
              </svg>
            </div>
            <p className="text-slate-600 mb-3">No vehicles yet.</p>
            <Link
              href="/vehicles/new"
              className="inline-flex items-center gap-1.5 text-teal-700 font-medium hover:text-teal-800"
            >
              Add your first vehicle
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        )}

        {/* Vehicle list */}
        {!loading && vehicles.length > 0 && (
          <div className="grid gap-4">
            {vehicles.map((v, i) => (
              <div
                key={v.id}
                className={`group relative bg-white rounded-2xl border border-sky-100 p-5 flex items-center justify-between overflow-hidden transition-all duration-300 hover:border-teal-200 hover:shadow-lg hover:shadow-sky-900/5 hover:-translate-y-0.5 animate-card-in ${
                  deletingId === v.id ? "opacity-40 scale-[0.98]" : ""
                }`}
                style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
              >
                {/* sheen sweep on hover */}
                <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-sky-50/60 to-transparent" />

                <div className="relative">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-semibold text-slate-900">
                      {v.color} {v.brand} {v.model}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                        v.is_active
                          ? "bg-teal-100 text-teal-700"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          v.is_active
                            ? "bg-teal-500 animate-pulse-dot"
                            : "bg-slate-400"
                        }`}
                      />
                      {v.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 capitalize flex items-center gap-2">
                    <span>{v.vehicle_type}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono tracking-wider text-[13px] uppercase px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-700">
                      {v.vehicle_number}
                    </span>
                  </p>
                </div>

                <div className="relative flex gap-2">
                  <Link
                    href={`/vehicles/${v.id}/qr`}
                    className="px-3 py-1.5 text-sm rounded-lg border border-teal-200 text-teal-700 transition-colors duration-150 hover:bg-teal-50"
                  >
                    QR
                  </Link>
                  <Link
                    href={`/vehicles/${v.id}/edit`}
                    className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 transition-colors duration-150 hover:bg-slate-50"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(v.id)}
                    disabled={deletingId === v.id}
                    className="px-3 py-1.5 text-sm rounded-lg border border-red-200 text-red-600 transition-colors duration-150 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === v.id ? "…" : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeSlideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
        @keyframes pulseDot {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.5);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(13, 148, 136, 0);
          }
        }
        @keyframes shimmer {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(100%);
          }
        }
        .animate-fade-slide-down {
          animation: fadeSlideDown 0.4s ease-out both;
        }
        .animate-card-in {
          animation: cardIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .animate-float {
          animation: float 2.4s ease-in-out infinite;
        }
        .animate-pulse-dot {
          animation: pulseDot 1.8s ease-in-out infinite;
        }
        .skeleton-shimmer {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(14, 165, 233, 0.08),
            transparent
          );
          animation: shimmer 1.4s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-slide-down,
          .animate-card-in,
          .animate-float,
          .animate-pulse-dot,
          .skeleton-shimmer {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}