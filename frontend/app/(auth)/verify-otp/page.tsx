"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyOtpSchema, VerifyOtpInput } from "@/lib/validation/auth";
import FormField from "@/components/FormField";
import SubmitButton from "@/components/SubmitButton";
import { ShieldCheck, CheckCircle2, RotateCw } from "lucide-react";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base text-center tracking-[0.5em] text-lg font-medium transition-all duration-200";

const RESEND_SECONDS = 30;

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneFromQuery = searchParams.get("phone") ?? "";

  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { phone_number: phoneFromQuery, code: "" },
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

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
      setSaved(true);
      setTimeout(() => router.push("/dashboard"), 550);
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setServerError(null);
    try {
      await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phoneFromQuery }),
      });
      setCooldown(RESEND_SECONDS);
    } catch {
      setServerError("Could not resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative">
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
        @keyframes iconPulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
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

      {saved && (
        <div
          className="absolute inset-0 -m-8 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-10 rounded-2xl"
          style={{ animation: "fadeIn 0.2s ease-out" }}
        >
          <CheckCircle2
            className="h-10 w-10 text-teal-500"
            style={{ animation: "checkPop 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
          />
          <p className="text-slate-600 text-sm font-medium">Verified</p>
        </div>
      )}

      <div
        className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg shadow-teal-500/25"
        style={{ animation: "iconPulse 2.5s ease-in-out infinite" }}
      >
        <ShieldCheck className="h-6 w-6 text-white" />
      </div>

      <h1 className="text-2xl font-semibold text-slate-900 mb-1 text-center">
        Verify your phone
      </h1>
      <p className="text-slate-500 mb-6 text-sm text-center">
        We sent a 6-digit code to{" "}
        <span className="font-medium text-slate-700">{phoneFromQuery || "your phone"}</span>.
      </p>

      {serverError && (
        <div
          className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm"
          style={{ animation: "shake 0.4s ease-in-out" }}
        >
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <input type="hidden" {...register("phone_number")} />

        <div style={{ animation: "fadeIn 0.4s ease-out 60ms both" }}>
          <FormField label="Verification code" error={errors.code?.message}>
            <input
              className={inputClass}
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              {...register("code")}
              placeholder="••••••"
            />
          </FormField>
        </div>

        <div className="mt-6" style={{ animation: "fadeIn 0.4s ease-out 120ms both" }}>
          <SubmitButton loading={loading}>Verify & continue</SubmitButton>
        </div>
      </form>

      <div
        className="mt-4 text-center text-sm"
        style={{ animation: "fadeIn 0.4s ease-out 160ms both" }}
      >
        {cooldown > 0 ? (
          <span className="text-slate-400">
            Resend code in{" "}
            <span className="font-medium text-slate-500 tabular-nums">{cooldown}s</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="group inline-flex items-center gap-1.5 font-medium text-teal-700 disabled:opacity-50"
          >
            <RotateCw
              className={`h-3.5 w-3.5 transition-transform duration-500 ${
                resending ? "animate-spin" : "group-hover:rotate-180"
              }`}
            />
            {resending ? "Sending…" : "Resend code"}
          </button>
        )}
      </div>
    </div>
  );
}