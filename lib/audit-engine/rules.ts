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
  if (planId === "api" || planId === "api_direct" || toolId === "anthropic_api" || toolId === "openai_api") {
    const credexDiscount = 0.20; // 20% discount on API spends
    const recommendedSpend = monthlySpend * (1 - credexDiscount);
    recommendation.recommendedAction = "convert_to_credits";
    recommendation.recommendedPlan = "Credex API Credits";
    recommendation.recommendedSeats = seats;
    recommendation.recommendedSpend = Math.round(recommendedSpend * 100) / 100;
    recommendation.savings = Math.round((monthlySpend - recommendedSpend) * 100) / 100;
    recommendation.reason = `Switch to Credex API credits to receive an instant 20% discount on retail developer usage.`;
    return recommendation;
  }

  // Rule 2: Redundant coding tools (Cursor + GitHub Copilot)
  if (toolId === "github_copilot" && auditInput.tools.some(t => t.toolId === "cursor")) {
    recommendation.recommendedAction = "downgrade_plan";
    recommendation.recommendedPlan = "None (Use Cursor)";
    recommendation.recommendedSeats = 0;
    recommendation.recommendedSpend = 0;
    recommendation.savings = monthlySpend;
    recommendation.reason = `You are subscribing to both Cursor and GitHub Copilot. Cursor includes its own built-in next-generation autocomplete (Copilot++), making a separate Copilot subscription redundant.`;
    return recommendation;
  }

  // Rule 3: Coding use case + ChatGPT Team -> recommend Cursor
  if (toolId === "chatgpt" && planId === "team" && auditInput.useCase === "coding") {
    // Recommending Cursor Pro instead of ChatGPT Team for developers
    const cursorProPrice = 20;
    const recommendedSpend = cursorProPrice * seats;
    recommendation.recommendedAction = "switch_alternative";
    recommendation.recommendedPlan = "Cursor Pro";
    recommendation.recommendedSeats = seats;
    recommendation.recommendedSpend = recommendedSpend;
    recommendation.savings = Math.max(0, monthlySpend - recommendedSpend);
    recommendation.reason = `Your primary use case is Software Engineering, but you are paying for ChatGPT Team ($30/seat). Cursor Pro ($20/seat) is a developer-focused IDE with built-in model access, saving you $10/seat monthly while providing a vastly superior developer experience.`;
    return recommendation;
  }

  // Rule 4: Team plan with 1 seat -> downgrade
  if (seats === 1) {
    if (toolId === "chatgpt" && planId === "team") {
      const plusPlan = toolConfig.plans["plus"];
      const recommendedSpend = plusPlan.pricePerSeat;
      recommendation.recommendedAction = "downgrade_plan";
      recommendation.recommendedPlan = plusPlan.name;
      recommendation.recommendedSeats = 1;
      recommendation.recommendedSpend = recommendedSpend;
      recommendation.savings = Math.max(0, monthlySpend - recommendedSpend);
      recommendation.reason = `ChatGPT Team requires a minimum of 2 seats and costs $30/seat. For a single user, ChatGPT Plus offers similar capabilities for $20/mo, saving you $10/mo.`;
      return recommendation;
    }
    
    if (toolId === "claude" && planId === "team") {
      const proPlan = toolConfig.plans["pro"];
      const recommendedSpend = proPlan.pricePerSeat;
      recommendation.recommendedAction = "downgrade_plan";
      recommendation.recommendedPlan = proPlan.name;
      recommendation.recommendedSeats = 1;
      recommendation.recommendedSpend = recommendedSpend;
      recommendation.savings = Math.max(0, monthlySpend - recommendedSpend);
      recommendation.reason = `Claude Team has a minimum of 5 seats ($150/mo). For a single user, Claude Pro provides equivalent access and capabilities for just $20/mo.`;
      return recommendation;
    }

    if (toolId === "windsurf" && planId === "teams") {
      const proPlan = toolConfig.plans["pro"];
      const recommendedSpend = proPlan.pricePerSeat;
      recommendation.recommendedAction = "downgrade_plan";
      recommendation.recommendedPlan = proPlan.name;
      recommendation.recommendedSeats = 1;
      recommendation.recommendedSpend = recommendedSpend;
      recommendation.savings = Math.max(0, monthlySpend - recommendedSpend);
      recommendation.reason = `Windsurf Teams is $40/seat and requires a minimum of 2 seats. For a single user, Windsurf Pro ($20/mo) is more cost-effective, saving you $20/mo.`;
      return recommendation;
    }
  }

  // Rule 5: Enterprise for small team -> overkill
  if (planId === "enterprise" && seats <= 10) {
    if (toolId === "cursor") {
      const businessPlan = toolConfig.plans["business"];
      const recommendedSpend = businessPlan.pricePerSeat * seats;
      recommendation.recommendedAction = "downgrade_plan";
      recommendation.recommendedPlan = businessPlan.name;
      recommendation.recommendedSeats = seats;
      recommendation.recommendedSpend = recommendedSpend;
      recommendation.savings = Math.max(0, monthlySpend - recommendedSpend);
      recommendation.reason = `Cursor Enterprise ($100/seat) is overkill for small teams. Cursor Business ($40/seat) offers advanced security, team administration, and identical AI capabilities, saving you $60/seat monthly.`;
      return recommendation;
    }

    if (toolId === "claude") {
      // Claude Team if seats >= 5, Claude Pro if seats < 5
      const targetPlanKey = seats >= 5 ? "team" : "pro";
      const targetPlan = toolConfig.plans[targetPlanKey];
      const recommendedSpend = targetPlan.pricePerSeat * seats;
      recommendation.recommendedAction = "downgrade_plan";
      recommendation.recommendedPlan = targetPlan.name;
      recommendation.recommendedSeats = seats;
      recommendation.recommendedSpend = recommendedSpend;
      recommendation.savings = Math.max(0, monthlySpend - recommendedSpend);
      recommendation.reason = `Claude Enterprise ($75/seat) is overkill for small teams. Downgrading to Claude ${targetPlan.name} ($${targetPlan.pricePerSeat}/seat) provides administrative control and equivalent context windows while saving significant cost.`;
      return recommendation;
    }

    if (toolId === "chatgpt") {
      // ChatGPT Team if seats >= 2, ChatGPT Plus if seats === 1
      const targetPlanKey = seats >= 2 ? "team" : "plus";
      const targetPlan = toolConfig.plans[targetPlanKey];
      const recommendedSpend = targetPlan.pricePerSeat * seats;
      recommendation.recommendedAction = "downgrade_plan";
      recommendation.recommendedPlan = targetPlan.name;
      recommendation.recommendedSeats = seats;
      recommendation.recommendedSpend = recommendedSpend;
      recommendation.savings = Math.max(0, monthlySpend - recommendedSpend);
      recommendation.reason = `ChatGPT Enterprise ($60/seat) is overkill for small teams. Downgrading to ChatGPT ${targetPlan.name} ($${targetPlan.pricePerSeat}/seat) provides Custom GPT sharing, workspace management, and data privacy for less.`;
      return recommendation;
    }

    if (toolId === "github_copilot") {
      const businessPlan = toolConfig.plans["business"];
      const recommendedSpend = businessPlan.pricePerSeat * seats;
      recommendation.recommendedAction = "downgrade_plan";
      recommendation.recommendedPlan = businessPlan.name;
      recommendation.recommendedSeats = seats;
      recommendation.recommendedSpend = recommendedSpend;
      recommendation.savings = Math.max(0, monthlySpend - recommendedSpend);
      recommendation.reason = `GitHub Copilot Enterprise ($39/seat) is overkill for small teams. GitHub Copilot Business ($19/seat) offers license management and similar AI coding capabilities, saving you $20/seat monthly.`;
      return recommendation;
    }

    if (toolId === "windsurf") {
      const targetPlanKey = seats >= 2 ? "teams" : "pro";
      const targetPlan = toolConfig.plans[targetPlanKey];
      const recommendedSpend = targetPlan.pricePerSeat * seats;
      recommendation.recommendedAction = "downgrade_plan";
      recommendation.recommendedPlan = targetPlan.name;
      recommendation.recommendedSeats = seats;
      recommendation.recommendedSpend = recommendedSpend;
      recommendation.savings = Math.max(0, monthlySpend - recommendedSpend);
      recommendation.reason = `Windsurf Enterprise ($100/seat) is overkill for small teams. Windsurf Teams ($40/seat) provides collaboration features and identical agentic AI features, saving you $60/seat monthly.`;
      return recommendation;
    }
  }

  // Rule 6: Use case mismatches (e.g. non-developers paying for Cursor)
  if (toolId === "cursor" && auditInput.useCase !== "coding" && auditInput.useCase !== "mixed") {
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

