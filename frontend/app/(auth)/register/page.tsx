"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { registerSchema, RegisterInput } from "@/lib/validation/auth";
import FormField from "@/components/FormField";
import SubmitButton from "@/components/SubmitButton";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-base";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    setServerError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.detail || "Registration failed.");
        return;
      }
      router.push(`/verify-otp?phone=${encodeURIComponent(data.phone_number)}`);
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Create your account</h1>
      <p className="text-slate-500 mb-6 text-sm">
        Register your car, get a QR sticker, protect your number.
      </p>

      {serverError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{serverError}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Full name" error={errors.full_name?.message}>
          <input className={inputClass} {...register("full_name")} placeholder="Riya Sharma" />
        </FormField>

        <FormField label="Email" error={errors.email?.message}>
          <input
            className={inputClass}
            type="email"
            {...register("email")}
            placeholder="you@example.com"
          />
        </FormField>

        <FormField label="Phone number" error={errors.phone_number?.message}>
          <input
            className={inputClass}
            {...register("phone_number")}
            placeholder="+919876543210"
          />
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <input
            className={inputClass}
            type="password"
            {...register("password")}
            placeholder="At least 8 characters, 1 digit"
          />
        </FormField>

        <div className="mt-6">
          <SubmitButton loading={loading}>Create account</SubmitButton>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="text-teal-700 font-medium">
          Log in
        </Link>
      </p>
    </>
  );
}