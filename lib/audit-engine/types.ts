// Type definitions for StackSpend Audit Engine

export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

export interface ToolInput {
  toolId: string; // e.g. "cursor", "claude"
  planId: string; // e.g. "pro", "business"
  seats: number;
  monthlySpend: number;
}

export interface AuditInput {
  tools: ToolInput[];
  teamSize: number;
  useCase: UseCase;
}

export type RecommendedAction = 
  | "optimize_seats" 
  | "downgrade_plan" 
  | "switch_alternative" 
  | "keep_plan"
  | "convert_to_credits";

export interface Recommendation {
  toolId: string;
  toolName: string;
  currentPlan: string;
  currentSpend: number;
  recommendedAction: RecommendedAction;
  recommendedPlan: string;
  recommendedSeats: number;
  recommendedSpend: number;
  savings: number;
  reason: string;
}

export interface AuditResult {
  recommendations: Recommendation[];
  totalCurrentSpend: number;
  totalRecommendedSpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  isOptimal: boolean; // true if savings < 100/mo
  isHighSavings: boolean; // true if savings >= 500/mo
}
