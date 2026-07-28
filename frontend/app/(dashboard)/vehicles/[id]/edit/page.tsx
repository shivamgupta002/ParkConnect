// frontend/app/(dashboard)/vehicles/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehicleSchema, VehicleInput } from "@/lib/validation/vehicle";
import FormField from "@/components/FormField";
import SubmitButton from "@/components/SubmitButton";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-base";

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

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
      router.push("/vehicles");
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center">
        <p className="text-slate-400">Loading vehicle…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-50 px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl border border-sky-100 p-8">
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">Edit Vehicle</h1>

        {serverError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{serverError}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="Vehicle type" error={errors.vehicle_type?.message}>
            <select className={inputClass} {...register("vehicle_type")}>
              <option value="car">Car</option>
              <option value="bike">Bike</option>
            </select>
          </FormField>

          <FormField label="Vehicle number">
            <input
              className={`${inputClass} bg-slate-100 cursor-not-allowed`}
              {...register("vehicle_number")}
              disabled
            />
          </FormField>

          <FormField label="Brand" error={errors.brand?.message}>
            <input className={inputClass} {...register("brand")} />
          </FormField>

          <FormField label="Model" error={errors.model?.message}>
            <input className={inputClass} {...register("model")} />
          </FormField>

          <FormField label="Color" error={errors.color?.message}>
            <input className={inputClass} {...register("color")} />
          </FormField>

          <FormField label="Emergency contact" error={errors.emergency_contact?.message}>
            <input className={inputClass} {...register("emergency_contact")} />
          </FormField>

          <div className="mt-6">
            <SubmitButton loading={loading}>Save changes</SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}