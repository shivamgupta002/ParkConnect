"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { loginSchema, LoginInput } from "@/lib/validation/auth";
import FormField from "@/components/FormField";
import SubmitButton from "@/components/SubmitButton";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base transition-all duration-200 hover:border-slate-400";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.detail || "Login failed.");
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
            <circle cx="8" cy="15" r="3" />
            <path d="M10.5 12.5L19 4M17 6l2 2M14 9l2 2" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 leading-tight">
            Welcome back
          </h1>
          <p className="text-slate-500 text-sm">Log in to manage your vehicles.</p>
        </div>
      </div>

      {serverError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm animate-shake">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="animate-fade-slide-down" style={{ animationDelay: "60ms" }}>
          <FormField label="Email" error={errors.email?.message}>
            <input
              className={inputClass}
              type="email"
              {...register("email")}
              placeholder="you@example.com"
            />
          </FormField>
        </div>

        <div className="animate-fade-slide-down" style={{ animationDelay: "110ms" }}>
          <FormField label="Password" error={errors.password?.message}>
            <input
              className={inputClass}
              type="password"
              {...register("password")}
              placeholder="••••••••"
            />
          </FormField>
        </div>

        <div className="flex justify-end mb-2 animate-fade-slide-down" style={{ animationDelay: "150ms" }}>
          <Link
            href="/forgot-password"
            className="text-sm text-teal-700 underline-offset-2 hover:text-teal-800 hover:underline transition-colors duration-150"
          >
            Forgot password?
          </Link>
        </div>

        <div className="mt-4 animate-fade-slide-down" style={{ animationDelay: "190ms" }}>
          <SubmitButton loading={loading}>Log in</SubmitButton>
        </div>
      </form>

      <p
        className="mt-6 text-center text-sm text-slate-500 animate-fade-slide-down"
        style={{ animationDelay: "230ms" }}
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-teal-700 font-medium hover:text-teal-800 transition-colors duration-150"
        >
          Register
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