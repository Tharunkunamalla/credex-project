import { describe, it, expect } from "vitest";
import { runAudit } from "../../lib/audit-engine/calculations";
import { AuditInput } from "../../lib/audit-engine/types";

describe("StackSpend Audit Engine Rules", () => {
  it("should calculate 20% savings for API direct direct spends", () => {
    const input: AuditInput = {
      tools: [
        { toolId: "anthropic_api", planId: "api", seats: 1, monthlySpend: 500 }
      ],
      teamSize: 5,
      useCase: "mixed"
    };

    const result = runAudit(input);
    expect(result.totalCurrentSpend).toBe(500);
    expect(result.totalRecommendedSpend).toBe(400); // 20% discount on $500
    expect(result.totalMonthlySavings).toBe(100);
    expect(result.totalAnnualSavings).toBe(1200);
    expect(result.recommendations[0].recommendedAction).toBe("convert_to_credits");
    expect(result.recommendations[0].recommendedPlan).toBe("Credex API Credits");
  });

  it("should recommend downgrading ChatGPT Team with 1 seat to ChatGPT Plus", () => {
    const input: AuditInput = {
      tools: [
        { toolId: "chatgpt", planId: "team", seats: 1, monthlySpend: 30 }
      ],
      teamSize: 1,
      useCase: "writing"
    };

    const result = runAudit(input);
    expect(result.totalCurrentSpend).toBe(30);
    expect(result.totalRecommendedSpend).toBe(20); // ChatGPT Plus is $20
    expect(result.totalMonthlySavings).toBe(10);
    expect(result.recommendations[0].recommendedAction).toBe("downgrade_plan");
    expect(result.recommendations[0].recommendedPlan).toBe("Plus");
  });

  it("should flag redundant coding tools when Cursor and GitHub Copilot are used together", () => {
    const input: AuditInput = {
      tools: [
        { toolId: "cursor", planId: "pro", seats: 2, monthlySpend: 40 },
        { toolId: "github_copilot", planId: "business", seats: 2, monthlySpend: 38 }
      ],
      teamSize: 2,
      useCase: "coding"
    };

    const result = runAudit(input);
    // Cursor pro should be kept ($40), GitHub Copilot should be eliminated ($0 spend recommended)
    const copilotRec = result.recommendations.find(r => r.toolId === "github_copilot");
    expect(copilotRec).toBeDefined();
    expect(copilotRec?.recommendedSpend).toBe(0);
    expect(copilotRec?.savings).toBe(38);
    expect(copilotRec?.recommendedAction).toBe("downgrade_plan");
    expect(copilotRec?.recommendedPlan).toBe("None (Use Cursor)");
  });

  it("should recommend Cursor instead of ChatGPT Team for a software engineering team", () => {
    const input: AuditInput = {
      tools: [
        { toolId: "chatgpt", planId: "team", seats: 3, monthlySpend: 90 }
      ],
      teamSize: 3,
      useCase: "coding"
    };

    const result = runAudit(input);
    const rec = result.recommendations[0];
    expect(rec.recommendedAction).toBe("switch_alternative");
    expect(rec.recommendedPlan).toBe("Cursor Pro");
    expect(rec.recommendedSpend).toBe(60); // 3 * $20
    expect(rec.savings).toBe(30);
  });

  it("should suggest downgrading Enterprise plans for small teams of 10 or fewer", () => {
    const input: AuditInput = {
      tools: [
        { toolId: "cursor", planId: "enterprise", seats: 3, monthlySpend: 300 }
      ],
      teamSize: 3,
      useCase: "coding"
    };

    const result = runAudit(input);
    const rec = result.recommendations[0];
    expect(rec.recommendedAction).toBe("downgrade_plan");
    expect(rec.recommendedPlan).toBe("Business");
    expect(rec.recommendedSpend).toBe(120); // 3 * $40
    expect(rec.savings).toBe(180);
  });

  it("should flag Cursor for non-developer use cases", () => {
    const input: AuditInput = {
      tools: [
        { toolId: "cursor", planId: "pro", seats: 1, monthlySpend: 20 }
      ],
      teamSize: 1,
      useCase: "writing"
    };

    const result = runAudit(input);
    const rec = result.recommendations[0];
    expect(rec.recommendedAction).toBe("switch_alternative");
    expect(rec.recommendedPlan).toBe("Claude Pro");
  });
});
