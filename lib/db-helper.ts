import { supabase } from "./supabase/client";
import { AuditInput, AuditResult } from "./audit-engine/types";
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

// Helper to ensure data folder exists
function ensureDataFolder() {
  const dir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Local File Read/Write Helpers
function readLocalAudits(): AuditRecord[] {
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
  ensureDataFolder();
  try {
    fs.writeFileSync(LOCAL_AUDITS_FILE, JSON.stringify(audits, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing local audits file:", err);
  }
}

function readLocalLeads(): LeadRecord[] {
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
export async function saveAudit(record: Omit<AuditRecord, "id">): Promise<AuditRecord> {
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
  const fullRecord: AuditRecord = {
    ...record,
    id,
    created_at: new Date().toISOString(),
  };

  if (supabase) {
    console.log("Supabase is configured. Writing audit to remote DB...");
    const { data, error } = await supabase
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
      console.error("Supabase insert error for audit, falling back to local storage:", error);
    } else if (data) {
      return data as AuditRecord;
    }
  }

  // Fallback to local file storage
  console.warn("Supabase not configured or encountered error. Storing audit locally...");
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
    const { data: byId, error: errorId } = await supabase
      .from("audits")
      .select("*")
      .eq("id", idOrToken)
      .maybeSingle();

    if (byId) return byId as AuditRecord;

    const { data: byToken, error: errorToken } = await supabase
      .from("audits")
      .select("*")
      .eq("share_token", idOrToken)
      .maybeSingle();

    if (byToken) return byToken as AuditRecord;

    if (errorId || errorToken) {
      console.error("Supabase select error, checking local fallback:", errorId || errorToken);
    }
  }

  // Fallback check in local file
  const audits = readLocalAudits();
  const found = audits.find(a => a.id === idOrToken || a.share_token === idOrToken);
  return found || null;
}

/**
 * Save a lead record attached to an audit
 */
export async function saveLead(record: LeadRecord): Promise<LeadRecord> {
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
  const fullRecord = {
    ...record,
    id,
    created_at: new Date().toISOString()
  };

  if (supabase) {
    console.log("Supabase is configured. Writing lead to remote DB...");
    const { data, error } = await supabase
      .from("leads")
      .insert({
        email: fullRecord.email,
        company_name: fullRecord.company_name,
        role: fullRecord.role,
        team_size: fullRecord.team_size,
        audit_id: fullRecord.audit_id
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error for lead, falling back to local storage:", error);
    } else if (data) {
      return data as LeadRecord;
    }
  }

  // Fallback to local file storage
  console.warn("Supabase not configured or encountered error. Storing lead locally...");
  const leads = readLocalLeads();
  leads.push(fullRecord);
  writeLocalLeads(leads);
  return fullRecord;
}
