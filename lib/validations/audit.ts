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
  useCase: z.enum(["coding", "writing", "data", "research", "mixed"]),
});

export type ToolFormInput = z.infer<typeof toolInputSchema>;
export type AuditFormInput = z.infer<typeof auditFormSchema>;

export const leadFormSchema = z.object({
  email: z.string().email("A valid email address is required"),
  companyName: z.string().min(1, "Company name is required"),
  role: z.string().min(1, "Role is required"),
  teamSize: z.number().int().min(1, "Team size must be at least 1").optional(),
  auditId: z.string().uuid("Invalid audit UUID").optional().or(z.literal("")),
});

export type LeadFormInput = z.infer<typeof leadFormSchema>;

