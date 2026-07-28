"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyOtpSchema, VerifyOtpInput } from "@/lib/validation/auth";
import FormField from "@/components/FormField";
import SubmitButton from "@/components/SubmitButton";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-base text-center tracking-widest text-lg";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneFromQuery = searchParams.get("phone") ?? "";

  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { phone_number: phoneFromQuery, code: "" },
  });

  const onSubmit = async (data: VerifyOtpInput) => {
    setServerError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.detail || "Invalid or expired code.");
        return;
      }
      router.push("/dashboard");
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Verify your phone</h1>
      <p className="text-slate-500 mb-6 text-sm">
        We sent a 6-digit code to <span className="font-medium">{phoneFromQuery || "your phone"}</span>.
      </p>

      {serverError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{serverError}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <input type="hidden" {...register("phone_number")} />

        <FormField label="Verification code" error={errors.code?.message}>
          <input
            className={inputClass}
            inputMode="numeric"
            maxLength={6}
            {...register("code")}
            placeholder="123456"
          />
        </FormField>

        <div className="mt-6">
          <SubmitButton loading={loading}>Verify & continue</SubmitButton>
        </div>
      </form>
    </>
  );
}