import { AuditInput, AuditResult } from "./audit-engine/types";

/**
 * Generate a personalized executive summary for the audit
 */
export async function generatePersonalizedSummary(
  input: AuditInput,
  result: AuditResult
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      console.log("Anthropic API key found. Querying Claude for summary...");
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 400,
          system: "You are a senior financial analyst and SaaS procurement expert specializing in AI tooling for startups. Write a brief (3-4 sentences), highly professional, actionable executive summary paragraph based on the user's stack audit results. Highlight the primary area of waste (e.g. redundant tools, api markup, or enterprise overkill) and how the savings can be achieved. Keep the tone encouraging, expert, and direct. Do not use generic greetings, intros, markdown headers or bullet points; output only the paragraph.",
          messages: [
            {
              role: "user",
              content: `Analyze this audit:
Current Stack: ${JSON.stringify(input.tools)}
Team Size: ${input.teamSize}
Core Use Case: ${input.useCase}

Calculated Results:
Total Current Spend: $${result.totalCurrentSpend}/mo
Total Recommended Spend: $${result.totalRecommendedSpend}/mo
Monthly Savings: $${result.totalMonthlySavings}/mo
Annual Savings: $${result.totalAnnualSavings}/yr
Key Recommendations:
${result.recommendations
  .filter((r) => r.savings > 0)
  .map(
    (r) =>
      `- Tool: ${r.toolName}, Action: ${r.recommendedAction}, Rec Plan: ${r.recommendedPlan}, Savings: $${r.savings}/mo. Reason: ${r.reason}`
  )
  .join("\n")}
`
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.content && data.content[0] && data.content[0].text) {
          return data.content[0].text.trim();
        }
      } else {
        console.error("Anthropic API error response:", await response.text());
      }
    } catch (err) {
      console.error("Failed to query Anthropic API, using fallback:", err);
    }
  }

  // Fallback template builder if no key is present or request fails
  console.log("Using localized template fallback for executive summary...");
  return buildFallbackSummary(input, result);
}

function buildFallbackSummary(input: AuditInput, result: AuditResult): string {
  const { totalCurrentSpend, totalMonthlySavings, totalAnnualSavings, recommendations } = result;
  
  if (totalMonthlySavings <= 0) {
    return `Excellent job! Your team's AI subscription stack is fully optimized. With a total monthly spend of $${totalCurrentSpend}, you are not carrying any redundant developer licenses, mismatched use cases, or unnecessary enterprise overhead. Keep monitoring your seat usage periodically as your team scales.`;
  }

  const savingsPercent = Math.round((totalMonthlySavings / totalCurrentSpend) * 100);
  const actions = recommendations.filter(r => r.savings > 0);
  
  let keyObservation = "";
  const hasCopilotRedundant = actions.some(a => a.toolId === "github_copilot" && a.recommendedPlan.includes("Use Cursor"));
  const hasApiCredits = actions.some(a => a.recommendedAction === "convert_to_credits");
  const hasDowngrade = actions.some(a => a.recommendedAction === "downgrade_plan");
  const hasAlternative = actions.some(a => a.recommendedAction === "switch_alternative");

  if (hasCopilotRedundant) {
    keyObservation = "The primary area of waste in your stack is subscription overlap between GitHub Copilot and Cursor, which can be eliminated since Cursor offers native autocomplete.";
  } else if (hasApiCredits && hasDowngrade) {
    keyObservation = "Your audit reveals two key opportunities: converting retail developer API usages to discounted Credex credits, and downgrading single-user seats currently locked in team plans.";
  } else if (hasApiCredits) {
    keyObservation = "Your primary savings opportunity lies in migrating pay-as-you-go developer API workloads from retail accounts to discounted API credits.";
  } else if (hasDowngrade) {
    keyObservation = "We identified that you are carrying unnecessary premium team/enterprise subscription tiers for small seat allocations or team counts.";
  } else if (hasAlternative) {
    keyObservation = "You have tools like Cursor allocated to teams whose primary roles do not involve active software development, leading to licensing mismatches.";
  } else {
    keyObservation = "We detected multiple minor inefficiencies in seat limits and tier selections across your stack.";
  }

  const actionStepText = actions.length > 0
    ? `By executing these ${actions.length} recommendations—specifically downgrading redundant licenses and optimizing seats—you can reduce your monthly bill to $${result.totalRecommendedSpend}, resulting in a ${savingsPercent}% cost reduction.`
    : `Optimizing these parameters will bring your monthly spend to $${result.totalRecommendedSpend}.`;

  return `We analyzed your AI tool stack and identified $${totalMonthlySavings} in monthly waste (${savingsPercent}% of your current $${totalCurrentSpend} budget), translating to $${totalAnnualSavings} in annual savings. ${keyObservation} ${actionStepText} We recommend initiating these plan adjustments immediately or contacting Credex to secure pre-discounted developer credits.`;
}
