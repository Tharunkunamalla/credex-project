import {NextResponse} from "next/server";
import {auditFormSchema} from "../../../lib/validations/audit";
import {runAudit} from "../../../lib/audit-engine/calculations";
import {generatePersonalizedSummary} from "../../../lib/summary-helper";
import {saveAudit} from "../../../lib/db-helper";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Validate incoming data with Zod schema
    const parseResult = auditFormSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input data",
          details: parseResult.error.flatten().fieldErrors,
        },
        {status: 400},
      );
    }

    const inputData = parseResult.data;

    // 2. Execute deterministic business calculations
    const auditResult = runAudit(inputData);

    // 3. Generate summary paragraph (Anthropic API with template fallback)
    const summary = await generatePersonalizedSummary(inputData, auditResult);

    // 4. Generate unique share token
    const shareToken =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID().replace(/-/g, "").substring(0, 16)
        : Math.random().toString(36).substring(2, 18);

    // 5. Store record in database
    const savedRecord = await saveAudit({
      inputs: inputData,
      results: auditResult,
      summary,
      share_token: shareToken,
    });

    return NextResponse.json({
      success: true,
      auditId: savedRecord.id,
      shareToken: savedRecord.share_token,
      record: savedRecord,
    });
  } catch (error) {
    console.error("API Audit Route Error:", error);
    return NextResponse.json(
      {success: false, error: "Internal server error"},
      {status: 500},
    );
  }
}
