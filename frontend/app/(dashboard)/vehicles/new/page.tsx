"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehicleSchema, VehicleInput } from "@/lib/validation/vehicle";
import FormField from "@/components/FormField";
import SubmitButton from "@/components/SubmitButton";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-base";

export default function NewVehiclePage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      router.push("/vehicles");
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl border border-sky-100 p-8">
        <h1 className="text-2xl font-semibold text-slate-900 mb-6">Add a Vehicle</h1>

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

          <FormField label="Vehicle number" error={errors.vehicle_number?.message}>
            <input className={inputClass} {...register("vehicle_number")} placeholder="MH12AB1234" />
          </FormField>

          <FormField label="Brand" error={errors.brand?.message}>
            <input className={inputClass} {...register("brand")} placeholder="Hyundai" />
          </FormField>

          <FormField label="Model" error={errors.model?.message}>
            <input className={inputClass} {...register("model")} placeholder="i20" />
          </FormField>

          <FormField label="Color" error={errors.color?.message}>
            <input className={inputClass} {...register("color")} placeholder="White" />
          </FormField>

          <FormField label="Emergency contact" error={errors.emergency_contact?.message}>
            <input
              className={inputClass}
              {...register("emergency_contact")}
              placeholder="+919876543210"
            />
          </FormField>

          <div className="mt-6">
            <SubmitButton loading={loading}>Add vehicle</SubmitButton>
          </div>
        </form>
      </div>
    </div>
  );
}