import {NextResponse} from "next/server";
import {leadFormSchema} from "../../../lib/validations/audit";
import {saveLead, getAudit} from "../../../lib/db-helper";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate lead form inputs
    const parseResult = leadFormSchema.safeParse(body);
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

    const {email, companyName, role, teamSize, auditId} = parseResult.data;

    // Save lead record in DB
    const savedLead = await saveLead({
      email,
      company_name: companyName,
      role,
      team_size: teamSize,
      audit_id: auditId || undefined,
    });

    // Check if we need to send email via Resend API
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      console.log("Resend API Key found. Sending transactional email...");

      // Fetch details of audit if available to customize email
      let auditDetailsText = "";
      if (auditId) {
        const audit = await getAudit(auditId);
        if (audit && audit.results) {
          const savings = audit.results.totalMonthlySavings;
          const current = audit.results.totalCurrentSpend;
          if (savings > 0) {
            auditDetailsText = `<p>Our audit identified <strong>$${savings}/month</strong> in immediate savings off your current $${current}/month AI tool spend!</p>`;
          }
        }
      }

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "StackSpend <onboarding@resend.dev>",
          to: email,
          subject: "Your StackSpend AI Spend Audit Report",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; rounded: 12px;">
              <h2 style="color: #4f46e5; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">Your AI Spend Audit Report</h2>
              <p>Hi there,</p>
              <p>Thank you for auditing your software stack using StackSpend. Here is a brief recap of your audit results:</p>
              ${auditDetailsText}
              <p>You can access your complete report dashboard and shareable link anytime here:</p>
              <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/audit/${auditId}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">View Full Audit Report</a></p>
              <p style="border-top: 1px solid #f3f4f6; padding-top: 15px; font-size: 12px; color: #6b7280;">
                StackSpend is a free tool powered by Credex to help startups maximize their runway. To claim discounted AI credits or run a deeper infrastructure audit, reply to this email or visit <a href="https://credex.rocks">credex.rocks</a>.
              </p>
            </div>
          `,
        }),
      });

      if (!emailResponse.ok) {
        console.error(
          "Resend API returned failure status:",
          await emailResponse.text(),
        );
      }
    } else {
      console.warn(
        "No RESEND_API_KEY environment variable set. Transactional email skipped.",
      );
    }

    return NextResponse.json({
      success: true,
      lead: savedLead,
    });
  } catch (error) {
    console.error("API Lead Route Error:", error);
    return NextResponse.json(
      {success: false, error: "Internal server error"},
      {status: 500},
    );
  }
}
