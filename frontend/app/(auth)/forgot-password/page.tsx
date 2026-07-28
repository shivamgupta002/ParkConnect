"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordInput } from "@/lib/validation/auth";
import FormField from "@/components/FormField";
import SubmitButton from "@/components/SubmitButton";
import { Mail, KeyRound, ArrowRight } from "lucide-react";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base transition-all duration-200";

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
    setMessage(null);
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
    <div className="animate-[fadeSlideIn_0.5s_ease-out]">
      <style jsx global>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.97);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes iconPulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
        }
      `}</style>

      <div
        className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg shadow-teal-500/25"
        style={{ animation: "iconPulse 2.5s ease-in-out infinite" }}
      >
        <Mail className="h-6 w-6 text-white" />
      </div>

      <h1 className="text-2xl font-semibold text-slate-900 mb-1 text-center">
        Reset your password
      </h1>
      <p className="text-slate-500 mb-6 text-sm text-center">
        Enter your email and we&apos;ll send a code to your registered phone.
      </p>

      {message && (
        <div
          className="mb-4 p-3 rounded-lg bg-teal-50 border border-teal-100 text-teal-800 text-sm flex items-start gap-2"
          style={{ animation: "fadeIn 0.35s ease-out" }}
        >
          <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0" />
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Email" error={errors.email?.message}>
          <input
            className={inputClass}
            type="email"
            {...register("email")}
            placeholder="you@example.com"
          />
        </FormField>

        <div className="mt-4">
          <SubmitButton loading={loading}>
            <span className="flex items-center justify-center gap-2 transition-transform duration-200 group-hover:translate-x-0.5">
              Send code
            </span>
          </SubmitButton>
        </div>
      </form>

      {message && (
        <button
          onClick={() =>
            router.push(`/reset-password?email=${encodeURIComponent(getValues("email") || "")}`)
          }
          className="group mt-4 w-full flex items-center justify-center gap-1.5 text-sm font-medium text-teal-700 py-2 rounded-lg transition-all duration-200 hover:bg-teal-50 hover:gap-2"
          style={{ animation: "fadeIn 0.4s ease-out" }}
        >
          <KeyRound className="h-3.5 w-3.5" />
          I have my code — reset password
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      )}
    </div>
  );
}