import { z } from "zod";

// Validation boundaries (forms today; reused by API routes once the backend lands).
export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

export const magicLinkSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Tell us your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

export const farmBasicsSchema = z.object({
  name: z.string().min(2, "Farm name is required"),
  location: z.string().min(2, "Where is it? (county, region)"),
});

export const parcelSchema = z.object({
  name: z.string().min(1, "Name"),
  crop: z.string().min(1, "Crop"),
  area: z.coerce.number().positive("Area must be > 0"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ParcelInput = z.infer<typeof parcelSchema>;

// Turns a ZodError into a { field: message } map for inline form errors.
export function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const i of err.issues) {
    const key = String(i.path[0] ?? "form");
    if (!out[key]) out[key] = i.message;
  }
  return out;
}
