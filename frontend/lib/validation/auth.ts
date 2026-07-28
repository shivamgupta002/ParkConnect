// frontend/lib/validation/auth.ts
import { z } from "zod";

// Matches backend rule: password must be 8+ chars and contain at least one digit
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/\d/, "Password must contain at least one digit");

// Loose E.164-ish check; backend does the authoritative validation via `phonenumbers`
const phoneSchema = z
  .string()
  .min(8, "Enter a valid phone number")
  .regex(/^\+?[1-9]\d{7,14}$/, "Enter phone in international format, e.g. +919876543210");

export const registerSchema = z.object({
  full_name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone_number: phoneSchema,
  password: passwordSchema,
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const verifyOtpSchema = z.object({
  phone_number: phoneSchema,
  code: z.string().length(6, "Enter the 6-digit code"),
});
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
  code: z.string().length(6, "Enter the 6-digit code"),
  new_password: passwordSchema,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;