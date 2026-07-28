"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehicleSchema, VehicleInput } from "@/lib/validation/vehicle";
import FormField from "@/components/FormField";
import SubmitButton from "@/components/SubmitButton";
import { CheckCircle2, CarFront } from "lucide-react";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base transition-all duration-200";

const fieldAnim = (i: number) => ({
  animation: `fadeIn 0.4s ease-out ${i * 60}ms both`,
});

export default function NewVehiclePage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleInput>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: { vehicle_type: "car" },
  });

  const onSubmit = async (data: VehicleInput) => {
    setServerError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.detail || "Could not add vehicle.");
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
            <p className="text-slate-600 text-sm font-medium">Vehicle added</p>
          </div>
        )}

        <div className="mb-6 flex items-center gap-3" style={fieldAnim(0)}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 shrink-0">
            <CarFront className="h-5 w-5 text-teal-600" />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Add a Vehicle</h1>
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
            <FormField label="Vehicle number" error={errors.vehicle_number?.message}>
              <input
                className={inputClass}
                {...register("vehicle_number")}
                placeholder="MH12AB1234"
              />
            </FormField>
          </div>

          <div style={fieldAnim(3)}>
            <FormField label="Brand" error={errors.brand?.message}>
              <input className={inputClass} {...register("brand")} placeholder="Hyundai" />
            </FormField>
          </div>

          <div style={fieldAnim(4)}>
            <FormField label="Model" error={errors.model?.message}>
              <input className={inputClass} {...register("model")} placeholder="i20" />
            </FormField>
          </div>

          <div style={fieldAnim(5)}>
            <FormField label="Color" error={errors.color?.message}>
              <input className={inputClass} {...register("color")} placeholder="White" />
            </FormField>
          </div>

          <div style={fieldAnim(6)}>
            <FormField label="Emergency contact" error={errors.emergency_contact?.message}>
              <input
                className={inputClass}
                {...register("emergency_contact")}
                placeholder="+919876543210"
              />
            </FormField>
          </div>

          <div className="mt-6" style={fieldAnim(7)}>
            <SubmitButton loading={loading}>Add vehicle</SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}