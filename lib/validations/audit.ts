import { z } from "zod";

export const toolInputSchema = z.object({
  toolId: z.string().min(1, "Tool selection is required"),
  planId: z.string().min(1, "Plan selection is required"),
  seats: z.number().int().min(1, "Seats must be at least 1"),
  monthlySpend: z.number().nonnegative("Spend cannot be negative"),
});

export const auditFormSchema = z.object({
  tools: z.array(toolInputSchema).min(1, "Please add at least one tool to audit"),
  teamSize: z.number().int().min(1, "Team size must be at least 1"),
  useCase: z.enum(["coding", "writing", "data", "research", "mixed"], {
    errorMap: () => ({ message: "Please select a primary use case" }),
  }),
});

export type ToolFormInput = z.infer<typeof toolInputSchema>;
export type AuditFormInput = z.infer<typeof auditFormSchema>;
