// frontend/app/(auth)/reset-password/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema, ResetPasswordInput } from "@/lib/validation/auth";
import FormField from "@/components/FormField";
import SubmitButton from "@/components/SubmitButton";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-base";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") ?? "";

  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: emailFromQuery, code: "", new_password: "" },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.detail || "Could not reset password.");
        return;
      }
      router.push("/login");
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Set a new password</h1>
      <p className="text-slate-500 mb-6 text-sm">Enter the code we sent and your new password.</p>

      {serverError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{serverError}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Email" error={errors.email?.message}>
          <input className={inputClass} type="email" {...register("email")} placeholder="you@example.com" />
        </FormField>

        <FormField label="Verification code" error={errors.code?.message}>
          <input className={inputClass} inputMode="numeric" maxLength={6} {...register("code")} placeholder="123456" />
        </FormField>

        <FormField label="New password" error={errors.new_password?.message}>
          <input
            className={inputClass}
            type="password"
            {...register("new_password")}
            placeholder="At least 8 characters, 1 digit"
          />
        </FormField>

        <div className="mt-6">
          <SubmitButton loading={loading}>Reset password</SubmitButton>
        </div>
      </form>
    </>
  );
}