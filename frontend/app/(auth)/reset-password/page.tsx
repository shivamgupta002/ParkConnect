"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence ,type Variants} from "framer-motion";
import { resetPasswordSchema, ResetPasswordInput } from "@/lib/validation/auth";
import FormField from "@/components/FormField";
import SubmitButton from "@/components/SubmitButton";

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-base transition-shadow duration-200";

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

// Padlock that draws itself in, then springs open on success
function LockGlyph({ unlocked }: { unlocked: boolean }) {
  return (
    <motion.svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      className="mx-auto mb-4"
      initial="hidden"
      animate="visible"
    >
      <motion.rect
        x="9"
        y="18"
        width="22"
        height="16"
        rx="4"
        stroke="#0d9488"
        strokeWidth="2.5"
        fill="#f0fdfa"
        variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
        transition={{ duration: 0.3 }}
      />
      <motion.path
        d="M14 18v-5a6 6 0 0 1 12 0v5"
        stroke="#0d9488"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        style={{ originX: "20px", originY: "18px" }}
        initial={{ pathLength: 0, rotate: 0 }}
        animate={
          unlocked
            ? { rotate: -25, y: -2, transition: { type: "spring", stiffness: 200, damping: 12 } }
            : { pathLength: 1, transition: { duration: 0.6, delay: 0.15 } }
        }
      />
      <motion.circle
        cx="20"
        cy="26"
        r="2"
        fill="#0d9488"
        animate={unlocked ? { scale: 0 } : { scale: 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.svg>
  );
}

function Requirement({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <motion.span
        className="flex h-4 w-4 items-center justify-center rounded-full"
        animate={{
          backgroundColor: met ? "#0d9488" : "#e2e8f0",
          scale: met ? 1 : 0.9,
        }}
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence>
          {met && (
            <motion.svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.span>
      <span className={met ? "text-teal-700" : "text-slate-400"}>{label}</span>
    </div>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get("email") ?? "";

  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: emailFromQuery, code: "", new_password: "" },
  });

  const password = watch("new_password") || "";
  const hasLength = password.length >= 8;
  const hasDigit = /\d/.test(password);

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
        setShake((n) => n + 1);
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 900);
    } catch {
      setServerError("Network error. Please try again.");
      setShake((n) => n + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {success ? (
        <motion.div
          key="success"
          className="text-center py-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <LockGlyph unlocked />
          <motion.h1
            className="text-xl font-semibold text-slate-900"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            Password reset
          </motion.h1>
          <p className="text-slate-500 text-sm mt-1">Taking you to sign in…</p>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          <motion.div variants={itemVariants}>
            <LockGlyph unlocked={false} />
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-2xl font-semibold text-slate-900 mb-1 text-center">
            Set a new password
          </motion.h1>
          <motion.p variants={itemVariants} className="text-slate-500 mb-6 text-sm text-center">
            Enter the code we sent and your new password.
          </motion.p>

          <AnimatePresence>
            {serverError && (
              <motion.div
                key={shake}
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: 1,
                  height: "auto",
                  x: [0, -6, 6, -4, 4, 0],
                }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ x: { duration: 0.35 }, default: { duration: 0.2 } }}
                className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm overflow-hidden"
              >
                {serverError}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <motion.div variants={itemVariants}>
              <FormField label="Email" error={errors.email?.message}>
                <input className={inputClass} type="email" {...register("email")} placeholder="you@example.com" />
              </FormField>
            </motion.div>

            <motion.div variants={itemVariants}>
              <FormField label="Verification code" error={errors.code?.message}>
                <input
                  className={`${inputClass} tracking-[0.3em] text-center font-mono`}
                  inputMode="numeric"
                  maxLength={6}
                  {...register("code")}
                  placeholder="123456"
                />
              </FormField>
            </motion.div>

            <motion.div variants={itemVariants}>
              <FormField label="New password" error={errors.new_password?.message}>
                <input
                  className={inputClass}
                  type="password"
                  {...register("new_password")}
                  placeholder="At least 8 characters, 1 digit"
                />
              </FormField>
              <div className="flex gap-4 -mt-2 mb-4 pl-1">
                <Requirement met={hasLength} label="8+ characters" />
                <Requirement met={hasDigit} label="1 digit" />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-2" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <SubmitButton loading={loading}>Reset password</SubmitButton>
            </motion.div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}