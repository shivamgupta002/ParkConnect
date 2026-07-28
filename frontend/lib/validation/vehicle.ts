import { z } from "zod";

export const vehicleSchema = z.object({
  vehicle_type: z.enum(["car", "bike"]),
  vehicle_number: z.string().min(3, "Enter a valid vehicle number"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  color: z.string().min(1, "Color is required"),
  emergency_contact: z
    .string()
    .min(8, "Enter a valid phone number")
    .regex(/^\+?[1-9]\d{7,14}$/, "Use international format, e.g. +919876543210"),
});
export type VehicleInput = z.infer<typeof vehicleSchema>;

export interface Vehicle extends VehicleInput {
  id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  qr_code_id?: string | null;
}