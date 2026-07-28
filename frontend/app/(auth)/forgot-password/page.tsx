"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordInput } from "@/lib/validation/auth";
import FormField from "@/components/FormField";
import SubmitButton from "@/components/SubmitButton";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-base";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      setMessage(json.message || "If that account exists, a code was sent.");
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Reset your password</h1>
      <p className="text-slate-500 mb-6 text-sm">
        Enter your email and we&apos;ll send a code to your registered phone.
      </p>

      {message && (
        <div className="mb-4 p-3 rounded-lg bg-teal-50 text-teal-800 text-sm">{message}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Email" error={errors.email?.message}>
          <input className={inputClass} type="email" {...register("email")} placeholder="you@example.com" />
        </FormField>

        <div className="mt-4">
          <SubmitButton loading={loading}>Send code</SubmitButton>
        </div>
      </form>

      {message && (
        <button
          onClick={() =>
            router.push(`/reset-password?email=${encodeURIComponent(getValues("email") || "")}`)
          }
          className="mt-4 w-full text-sm text-teal-700 underline"
        >
          I have my code — reset password
        </button>
      )}
    </>
  );
}