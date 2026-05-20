import { AuditInput, AuditResult } from "./types";
import { auditTool } from "./rules";

/**
 * Perform a full audit over the complete user stack input
 */
export function runAudit(input: AuditInput): AuditResult {
  const recommendations = input.tools.map(tool => auditTool(tool, input));

  const totalCurrentSpend = recommendations.reduce((acc, curr) => acc + curr.currentSpend, 0);
  const totalRecommendedSpend = recommendations.reduce((acc, curr) => acc + curr.recommendedSpend, 0);
  
  const rawSavings = totalCurrentSpend - totalRecommendedSpend;
  const totalMonthlySavings = Math.max(0, Math.round(rawSavings * 100) / 100);
  const totalAnnualSavings = Math.round(totalMonthlySavings * 12 * 100) / 100;

  // Indicators based on savings levels
  const isOptimal = totalMonthlySavings < 100;
  const isHighSavings = totalMonthlySavings >= 500;

  return {
    recommendations,
    totalCurrentSpend: Math.round(totalCurrentSpend * 100) / 100,
    totalRecommendedSpend: Math.round(totalRecommendedSpend * 100) / 100,
    totalMonthlySavings,
    totalAnnualSavings,
    isOptimal,
    isHighSavings
  };
}
