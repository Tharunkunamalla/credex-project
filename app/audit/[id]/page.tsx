import React from "react";
import {notFound} from "next/navigation";
import {getAudit} from "../../../lib/db-helper";
import AuditResultsView from "../../../components/audit-results-view";

export const runtime = "nodejs";

interface PageProps {
  params: Promise<{id: string}>;
}

export async function generateMetadata({params}: PageProps) {
  try {
    const {id} = await params;
    const audit = await getAudit(id);

    if (!audit || !audit.results) {
      return {
        title: "Audit Report Not Found | StackSpend",
        description: "This AI Spend Audit report could not be found.",
      };
    }

    const monthlySavings = audit.results.totalMonthlySavings || 0;
    const annualSavings = audit.results.totalAnnualSavings || 0;

    return {
      title: `AI Spend Audit Report — Save $${monthlySavings.toLocaleString()}/mo | StackSpend`,
      description: `We identified $${monthlySavings.toLocaleString()}/month ($${annualSavings.toLocaleString()}/year) in potential AI subscription savings. Check the details.`,
      openGraph: {
        title: `StackSpend AI Spend Audit: Save $${monthlySavings.toLocaleString()}/mo`,
        description: `Detailed report analyzing AI subscriptions, redundant licenses, and pricing optimization opportunities.`,
        url: `${process.env.NEXT_PUBLIC_APP_URL || "https://stackspend.rocks"}/audit/${id}`,
        type: "website",
        images: [
          {
            url: "/favicon.ico", // Fallback to icon for now
            width: 1200,
            height: 630,
            alt: "StackSpend Spend Audit Results",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `StackSpend AI Spend Audit: Save $${monthlySavings.toLocaleString()}/mo`,
        description: `Detailed report analyzing AI subscriptions, redundant licenses, and pricing optimization opportunities.`,
      },
    };
  } catch (err) {
    console.error("Error generating dynamic metadata:", err);
    return {
      title: "AI Spend Audit Report | StackSpend",
    };
  }
}

export default async function AuditPage({params}: PageProps) {
  const {id} = await params;
  const audit = await getAudit(id);

  if (!audit) {
    notFound();
  }

  return <AuditResultsView record={audit} />;
}
export const revalidate = 0; // Force dynamic rendering on requests
