import { createClient } from "@supabase/supabase-js";
import { describe, it } from "vitest";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

describe("Read live audits", () => {
  it("should fetch all audits in the DB and print them", async () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !key) return;
    const client = createClient(url, key);

    const { data, error } = await client
      .from("audits")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching live audits:", error);
    } else {
      console.log("Live audits in Supabase:", JSON.stringify(data, null, 2));
    }
  });
});
