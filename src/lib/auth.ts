// src/lib/validations/auth.ts
import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include an uppercase letter")
    .regex(/[a-z]/, "Include a lowercase letter")
    .regex(/[0-9]/, "Include a number")
    .regex(/[!@#$%^&*]/, "Include a special character"),
});

export type LoginInput = z.infer<typeof loginSchema>;