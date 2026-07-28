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
  "w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 text-base";

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
      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Welcome back</h1>
      <p className="text-slate-500 mb-6 text-sm">Log in to manage your vehicles.</p>

      {serverError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{serverError}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Email" error={errors.email?.message}>
          <input className={inputClass} type="email" {...register("email")} placeholder="you@example.com" />
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <input className={inputClass} type="password" {...register("password")} placeholder="••••••••" />
        </FormField>

        <div className="flex justify-end mb-2">
          <Link href="/forgot-password" className="text-sm text-teal-700">
            Forgot password?
          </Link>
        </div>

        <div className="mt-4">
          <SubmitButton loading={loading}>Log in</SubmitButton>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-teal-700 font-medium">
          Register
        </Link>
      </p>
    </>
  );
}