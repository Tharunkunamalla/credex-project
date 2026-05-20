import { ToolInput, Recommendation, AuditInput } from "./types";
import pricingData from "../../data/pricing.json";

// Type-safe reference to the pricing structure
interface PlanDetails {
  name: string;
  pricePerSeat: number;
  minSeats: number;
  isFlatRate: boolean;
}

interface ToolDetails {
  name: string;
  plans: Record<string, PlanDetails>;
}

const pricing: Record<string, ToolDetails> = pricingData.tools;

/**
 * Audit a single tool configuration and return optimization recommendations
 */
export function auditTool(toolInput: ToolInput, auditInput: AuditInput): Recommendation {
  const { toolId, planId, seats, monthlySpend } = toolInput;
  const toolConfig = pricing[toolId];
  
  // Fallback if tool isn't recognized in the dataset
  if (!toolConfig) {
    return {
      toolId,
      toolName: toolId,
      currentPlan: planId,
      currentSpend: monthlySpend,
      recommendedAction: "keep_plan",
      recommendedPlan: planId,
      recommendedSeats: seats,
      recommendedSpend: monthlySpend,
      savings: 0,
      reason: "Pricing data not found for this tool configuration."
    };
  }

  const planConfig = toolConfig.plans[planId];
  const toolName = toolConfig.name;

  if (!planConfig) {
    return {
      toolId,
      toolName,
      currentPlan: planId,
      currentSpend: monthlySpend,
      recommendedAction: "keep_plan",
      recommendedPlan: planId,
      recommendedSeats: seats,
      recommendedSpend: monthlySpend,
      savings: 0,
      reason: "Plan data not found for this tool configuration."
    };
  }

  // Baseline recommendation defaults to keeping current configuration
  const recommendation: Recommendation = {
    toolId,
    toolName,
    currentPlan: planConfig.name,
    currentSpend: monthlySpend,
    recommendedAction: "keep_plan",
    recommendedPlan: planConfig.name,
    recommendedSeats: seats,
    recommendedSpend: monthlySpend,
    savings: 0,
    reason: "Your subscription setup is optimized for your current usage."
  };

  // Rule 1: API tools overspending (Credex direct savings opportunity)
  if (planId === "api" || planId === "api_direct") {
    const credexDiscount = 0.20; // 20% discount on API spends
    const recommendedSpend = monthlySpend * (1 - credexDiscount);
    recommendation.recommendedAction = "convert_to_credits";
    recommendation.recommendedPlan = "Credex API Credits";
    recommendation.recommendedSpend = Math.round(recommendedSpend * 100) / 100;
    recommendation.savings = Math.round((monthlySpend - recommendedSpend) * 100) / 100;
    recommendation.reason = `Switch to Credex API credits to receive an instant 20% discount on retail developer usage.`;
    return recommendation;
  }

  // Rule 2: ChatGPT Team Plan seat count check
  if (toolId === "chatgpt" && planId === "team" && seats === 1) {
    const plusPlan = toolConfig.plans["plus"];
    const recommendedSpend = plusPlan.pricePerSeat * 1;
    recommendation.recommendedAction = "downgrade_plan";
    recommendation.recommendedPlan = plusPlan.name;
    recommendation.recommendedSeats = 1;
    recommendation.recommendedSpend = recommendedSpend;
    recommendation.savings = monthlySpend - recommendedSpend;
    recommendation.reason = "ChatGPT Team requires a minimum of 2 seats. For single users, ChatGPT Plus offers similar capabilities for $10 less.";
    return recommendation;
  }

  // Rule 3: Use case mismatches (e.g. non-developers paying for Cursor)
  if (toolId === "cursor" && auditInput.useCase !== "coding" && auditInput.useCase !== "mixed") {
    // If not coding, paying for Cursor is likely unnecessary
    recommendation.recommendedAction = "switch_alternative";
    recommendation.recommendedPlan = "Claude Pro";
    recommendation.recommendedSeats = seats;
    recommendation.recommendedSpend = 20 * seats;
    recommendation.savings = Math.max(0, monthlySpend - (20 * seats));
    recommendation.reason = `Cursor is a developer-focused IDE. For non-technical team use cases, standard models like Claude Pro offer identical reasoning capabilities for less.`;
    return recommendation;
  }

  return recommendation;
}
