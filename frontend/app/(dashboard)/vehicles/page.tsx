"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Vehicle } from "@/lib/validation/vehicle";

// Normalizes whatever shape the backend returns into a plain array.
function extractVehicles(payload: any): Vehicle[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.vehicles)) return payload.vehicles;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/vehicles?limit=100");
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Could not load vehicles.");
      setVehicles(extractVehicles(json));
    } catch (err: any) {
      setError(err.message);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
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
      await loadVehicles();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const activeCount = vehicles.filter((v) => v.is_active).length;
  const atFreeLimit = activeCount >= 1;

  return (
    <div className="min-h-screen bg-sky-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Your Vehicles</h1>
          <Link
            href={atFreeLimit ? "#" : "/vehicles/new"}
            title={atFreeLimit ? "Free plan allows 1 vehicle — upgrade for more" : undefined}
            className={`px-4 py-2 rounded-xl font-medium text-sm ${
              atFreeLimit
                ? "bg-slate-200 text-slate-500 cursor-not-allowed pointer-events-none"
                : "bg-teal-600 text-white hover:bg-teal-700"
            }`}
          >
            + Add Vehicle
          </Link>
        </div>

        {atFreeLimit && (
          <p className="text-sm text-slate-500 mb-4">
            You&apos;re on the free plan (1 vehicle).{" "}
            <Link href="/dashboard/subscription" className="text-teal-700 underline">
              Upgrade to add more
            </Link>
            .
          </p>
        )}

        {loading && <p className="text-slate-500">Loading vehicles…</p>}
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {!loading && vehicles.length === 0 && !error && (
          <div className="bg-white rounded-2xl border border-sky-100 p-8 text-center">
            <p className="text-slate-600 mb-3">No vehicles yet.</p>
            <Link href="/vehicles/new" className="text-teal-700 font-medium underline">
              Add your first vehicle
            </Link>
          </div>
        )}

        <div className="grid gap-4">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-2xl border border-sky-100 p-5 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-900">
                    {v.color} {v.brand} {v.model}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      v.is_active ? "bg-teal-100 text-teal-700" : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {v.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-slate-500 capitalize">
                  {v.vehicle_type} · {v.vehicle_number}
                </p>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/vehicles/${v.id}/qr`}
                  className="px-3 py-1.5 text-sm rounded-lg border border-teal-200 text-teal-700 hover:bg-teal-50"
                >
                  QR
                </Link>
                <Link
                  href={`/vehicles/${v.id}/edit`}
                  className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(v.id)}
                  disabled={deletingId === v.id}
                  className="px-3 py-1.5 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {deletingId === v.id ? "…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}