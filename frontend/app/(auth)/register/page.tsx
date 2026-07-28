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
  "w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base transition-all duration-200 hover:border-slate-400";

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
      <div className="flex items-center gap-3 mb-5 animate-fade-slide-down">
        <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
          <svg
            className="w-5 h-5 text-teal-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20v.01" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 leading-tight">
            Create your account
          </h1>
          <p className="text-slate-500 text-sm">
            Register your car, get a QR sticker, protect your number.
          </p>
        </div>
      </div>

      {serverError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm animate-shake">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="animate-fade-slide-down" style={{ animationDelay: "60ms" }}>
          <FormField label="Full name" error={errors.full_name?.message}>
            <input className={inputClass} {...register("full_name")} placeholder="Riya Sharma" />
          </FormField>
        </div>

        <div className="animate-fade-slide-down" style={{ animationDelay: "100ms" }}>
          <FormField label="Email" error={errors.email?.message}>
            <input
              className={inputClass}
              type="email"
              {...register("email")}
              placeholder="you@example.com"
            />
          </FormField>
        </div>

        <div className="animate-fade-slide-down" style={{ animationDelay: "140ms" }}>
          <FormField label="Phone number" error={errors.phone_number?.message}>
            <input
              className={inputClass}
              {...register("phone_number")}
              placeholder="+919876543210"
            />
          </FormField>
        </div>

        <div className="animate-fade-slide-down" style={{ animationDelay: "180ms" }}>
          <FormField label="Password" error={errors.password?.message}>
            <input
              className={inputClass}
              type="password"
              {...register("password")}
              placeholder="At least 8 characters, 1 digit"
            />
          </FormField>
        </div>

        <div className="mt-6 animate-fade-slide-down" style={{ animationDelay: "220ms" }}>
          <SubmitButton loading={loading}>Create account</SubmitButton>
        </div>
      </form>

      <p
        className="mt-6 text-center text-sm text-slate-500 animate-fade-slide-down"
        style={{ animationDelay: "260ms" }}
      >
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-teal-700 font-medium hover:text-teal-800 transition-colors duration-150"
        >
          Log in
        </Link>
      </p>

      <style jsx global>{`
        @keyframes fadeSlideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes shake {
          10%,
          90% {
            transform: translateX(-1px);
          }
          20%,
          80% {
            transform: translateX(2px);
          }
          30%,
          50%,
          70% {
            transform: translateX(-4px);
          }
          40%,
          60% {
            transform: translateX(4px);
          }
        }
        .animate-fade-slide-down {
          animation: fadeSlideDown 0.4s ease-out both;
        }
        .animate-shake {
          animation: fadeSlideDown 0.3s ease-out both,
            shake 0.4s ease-in-out 0.3s both;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-slide-down,
          .animate-shake {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}