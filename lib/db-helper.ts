import {supabase} from "./supabase/client";
import {AuditInput, AuditResult} from "./audit-engine/types";
import fs from "fs";
import path from "path";

// Interfaces corresponding to the schema.sql definitions
export interface AuditRecord {
  id: string;
  inputs: AuditInput;
  results: AuditResult;
  summary: string;
  share_token: string;
  created_at?: string;
}

export interface LeadRecord {
  id?: string;
  email: string;
  company_name?: string;
  role?: string;
  team_size?: number;
  audit_id?: string;
  created_at?: string;
}

const LOCAL_AUDITS_FILE = path.join(process.cwd(), "data", "local_db.json");
const LOCAL_LEADS_FILE = path.join(process.cwd(), "data", "local_leads.json");

function canUseLocalFallback() {
  return process.env.NODE_ENV !== "production" && process.env.VERCEL !== "1";
}

// Helper to ensure data folder exists
function ensureDataFolder() {
  const dir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {recursive: true});
  }
}

// Local File Read/Write Helpers
function readLocalAudits(): AuditRecord[] {
  if (!canUseLocalFallback()) {
    return [];
  }

  ensureDataFolder();
  if (!fs.existsSync(LOCAL_AUDITS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(LOCAL_AUDITS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading local audits file:", err);
    return [];
  }
}

function writeLocalAudits(audits: AuditRecord[]) {
  if (!canUseLocalFallback()) {
    throw new Error(
      "Local audit storage is disabled in production. Configure Supabase to persist audits on Vercel.",
    );
  }

  ensureDataFolder();
  try {
    fs.writeFileSync(
      LOCAL_AUDITS_FILE,
      JSON.stringify(audits, null, 2),
      "utf-8",
    );
  } catch (err) {
    console.error("Error writing local audits file:", err);
  }
}

function readLocalLeads(): LeadRecord[] {
  if (!canUseLocalFallback()) {
    return [];
  }

  ensureDataFolder();
  if (!fs.existsSync(LOCAL_LEADS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(LOCAL_LEADS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading local leads file:", err);
    return [];
  }
}

function writeLocalLeads(leads: LeadRecord[]) {
  if (!canUseLocalFallback()) {
    throw new Error(
      "Local lead storage is disabled in production. Configure Supabase to persist leads on Vercel.",
    );
  }

  ensureDataFolder();
  try {
    fs.writeFileSync(LOCAL_LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing local leads file:", err);
  }
}

/**
 * Save an audit record to either Supabase or local JSON file fallback
 */
export async function saveAudit(
  record: Omit<AuditRecord, "id">,
): Promise<AuditRecord> {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15);
  const fullRecord: AuditRecord = {
    ...record,
    id,
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    console.log("Supabase is configured. Writing audit to remote DB...");
    const {data, error} = await supabase
      .from("audits")
      .insert({
        id: fullRecord.id,
        inputs: fullRecord.inputs,
        results: fullRecord.results,
        summary: fullRecord.summary,
        share_token: fullRecord.share_token,
      })
      .select()
      .single();

    if (error) {
      console.error(
        "Supabase insert error for audit, falling back to local storage:",
        error,
      );
      if (!canUseLocalFallback()) {
        throw error;
      }
    } else if (data) {
      return data as AuditRecord;
    }
  }

  // Fallback to local file storage
  if (!canUseLocalFallback()) {
    throw new Error(
      "Supabase is required in production. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.",
    );
  }

  console.warn(
    "Supabase not configured or encountered error. Storing audit locally...",
  );
  const audits = readLocalAudits();
  audits.push(fullRecord);
  writeLocalAudits(audits);
  return fullRecord;
}

/**
 * Fetch an audit record by ID or Share Token
 */
export async function getAudit(idOrToken: string): Promise<AuditRecord | null> {
  if (supabase) {
    console.log("Checking Supabase for audit...");
    // Try to query by ID first, then by share_token
    const {data: byId, error: errorId} = await supabase
      .from("audits")
      .select("*")
      .eq("id", idOrToken)
      .maybeSingle();

    if (byId) return byId as AuditRecord;

    const {data: byToken, error: errorToken} = await supabase
      .from("audits")
      .select("*")
      .eq("share_token", idOrToken)
      .maybeSingle();

    if (byToken) return byToken as AuditRecord;

    if (errorId || errorToken) {
      console.error(
        "Supabase select error, checking local fallback:",
        errorId || errorToken,
      );
    }
  }

  if (!canUseLocalFallback()) {
    return null;
  }

  // Fallback check in local file
  const audits = readLocalAudits();
  const found = audits.find(
    (a) => a.id === idOrToken || a.share_token === idOrToken,
  );
  return found || null;
}

/**
 * Save a lead record attached to an audit
 */
export async function saveLead(record: LeadRecord): Promise<LeadRecord> {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15);
  const fullRecord = {
    ...record,
    id,
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    console.log("Supabase is configured. Writing lead to remote DB...");

    let finalAuditId: string | undefined = fullRecord.audit_id;
    if (finalAuditId) {
      // Validate UUID format
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(finalAuditId)) {
        console.warn(
          `Audit ID ${finalAuditId} is not a valid UUID format. Setting to undefined to avoid insert failure.`,
        );
        finalAuditId = undefined;
      } else {
        // Verify the audit exists in the remote DB to prevent foreign key violations
        try {
          const {data: auditExists, error: existError} = await supabase
            .from("audits")
            .select("id")
            .eq("id", finalAuditId)
            .maybeSingle();

          if (existError || !auditExists) {
            console.warn(
              `Audit ID ${finalAuditId} was not found in the remote audits table. Setting to undefined to avoid foreign key failure.`,
            );
            finalAuditId = undefined;
          }
        } catch (e) {
          console.error("Error verifying audit existence in remote DB:", e);
          finalAuditId = undefined;
        }
      }
    }

    // Perform insert without .select().single() because the RLS policy forbids public reads (SELECT)
    // of the leads table, which would cause RETURNING statements to fail with PGRST116 (0 rows returned).
    const {error} = await supabase.from("leads").insert({
      email: fullRecord.email,
      company_name: fullRecord.company_name,
      role: fullRecord.role,
      team_size: fullRecord.team_size,
      audit_id: finalAuditId,
    });

    if (error) {
      console.error(
        "Supabase insert error for lead, falling back to local storage:",
        error,
      );
      if (!canUseLocalFallback()) {
        throw error;
      }
    } else {
      console.log("Lead inserted successfully into remote DB.");
      return fullRecord;
    }
  }

  // Fallback to local file storage
  if (!canUseLocalFallback()) {
    throw new Error(
      "Supabase is required in production. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.",
    );
  }

  console.warn(
    "Supabase not configured or encountered error. Storing lead locally...",
  );
  const leads = readLocalLeads();
  leads.push(fullRecord);
  writeLocalLeads(leads);
  return fullRecord;
}
