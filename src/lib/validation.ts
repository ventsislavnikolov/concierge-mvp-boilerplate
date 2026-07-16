import { z } from "zod";

/**
 * Shared form-boundary schemas. Convex validates again at the function
 * boundary with its own `v.*` validators (convex/schema.ts mirrors these).
 */

export const leadSchema = z.object({
  email: z.email(),
  phone: z
    .string()
    .trim()
    .min(6)
    .max(20)
    .regex(/^[+\d][\d\s-]+$/)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type LeadInput = z.infer<typeof leadSchema>;
