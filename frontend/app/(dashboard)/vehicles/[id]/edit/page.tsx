"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehicleSchema, VehicleInput } from "@/lib/validation/vehicle";
import FormField from "@/components/FormField";
import SubmitButton from "@/components/SubmitButton";
import { CheckCircle2, Car } from "lucide-react";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base transition-all duration-200";

const fieldAnim = (i: number) => ({
  animation: `fadeIn 0.4s ease-out ${i * 60}ms both`,
});

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VehicleInput>({ resolver: zodResolver(vehicleSchema) });

  useEffect(() => {
    let cancelled = false;

    async function loadVehicle() {
      setFetching(true);
      setServerError(null);
      try {
        const res = await fetch(`/api/vehicles/${params.id}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || "Could not load vehicle.");
        }

        if (cancelled) return;

        reset({
          vehicle_type: data.vehicle_type ?? "car",
          vehicle_number: data.vehicle_number ?? "",
          brand: data.brand ?? "",
          model: data.model ?? "",
          color: data.color ?? "",
          emergency_contact: data.emergency_contact ?? "",
        });
      } catch (err: any) {
        if (!cancelled) setServerError(err.message || "Could not load vehicle.");
      } finally {
        if (!cancelled) setFetching(false);
      }
    }

    loadVehicle();
    return () => {
      cancelled = true;
    };
  }, [params.id, reset]);

  const onSubmit = async (data: VehicleInput) => {
    setServerError(null);
    setLoading(true);
    try {
      const { vehicle_number, ...updatable } = data;
      const res = await fetch(`/api/vehicles/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatable),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.detail || "Could not update vehicle.");
        return;
      }
      setSaved(true);
      setTimeout(() => router.push("/vehicles"), 550);
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
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
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes checkPop {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          60% {
            transform: scale(1.15);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>

      {fetching ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
          <div
            className="h-9 w-9 rounded-full border-[3px] border-sky-200 border-t-teal-500"
            style={{ animation: "spin 0.7s linear infinite" }}
          />
          <p className="text-slate-400 text-sm">Loading vehicle…</p>
        </div>
      ) : (
        <div
          className="max-w-md mx-auto bg-white rounded-2xl border border-sky-100 p-8 relative overflow-hidden"
          style={{ animation: "cardIn 0.45s cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          {saved && (
            <div
              className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-10"
              style={{ animation: "fadeIn 0.2s ease-out" }}
            >
              <CheckCircle2
                className="h-10 w-10 text-teal-500"
                style={{ animation: "checkPop 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
              />
              <p className="text-slate-600 text-sm font-medium">Vehicle updated</p>
            </div>
          )}

          <div
            className="mb-6 flex items-center gap-3"
            style={fieldAnim(0)}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 shrink-0">
              <Car className="h-5 w-5 text-teal-600" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">Edit Vehicle</h1>
          </div>

          {serverError && (
            <div
              className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm"
              style={{ animation: "shake 0.4s ease-in-out" }}
            >
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div style={fieldAnim(1)}>
              <FormField label="Vehicle type" error={errors.vehicle_type?.message}>
                <select className={inputClass} {...register("vehicle_type")}>
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                </select>
              </FormField>
            </div>

            <div style={fieldAnim(2)}>
              <FormField label="Vehicle number">
                <input
                  className={`${inputClass} bg-slate-100 cursor-not-allowed`}
                  {...register("vehicle_number")}
                  disabled
                />
              </FormField>
            </div>

            <div style={fieldAnim(3)}>
              <FormField label="Brand" error={errors.brand?.message}>
                <input className={inputClass} {...register("brand")} />
              </FormField>
            </div>

            <div style={fieldAnim(4)}>
              <FormField label="Model" error={errors.model?.message}>
                <input className={inputClass} {...register("model")} />
              </FormField>
            </div>

            <div style={fieldAnim(5)}>
              <FormField label="Color" error={errors.color?.message}>
                <input className={inputClass} {...register("color")} />
              </FormField>
            </div>

            <div style={fieldAnim(6)}>
              <FormField label="Emergency contact" error={errors.emergency_contact?.message}>
                <input className={inputClass} {...register("emergency_contact")} />
              </FormField>
            </div>

            <div className="mt-6" style={fieldAnim(7)}>
              <SubmitButton loading={loading}>Save changes</SubmitButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}