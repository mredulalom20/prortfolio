/**
 * One-shot migration: adds `service text[] default '{}'` to the projects table.
 * Run with: node --env-file=.env.local add-service-column.js
 */
const { createClient } = require("@supabase/supabase-js");


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function main() {
  console.log("Adding `service` column to projects table…");

  const { error } = await supabase.rpc("exec_sql", {
    sql: "ALTER TABLE projects ADD COLUMN IF NOT EXISTS service text[] DEFAULT '{}';"
  });

  if (error) {
    // Supabase may not expose exec_sql; try a direct query approach
    console.warn("RPC exec_sql failed (expected if not enabled):", error.message);
    console.log("\nPlease run the following SQL manually in your Supabase SQL editor:");
    console.log("\n  ALTER TABLE projects ADD COLUMN IF NOT EXISTS service text[] DEFAULT '{}';\n");
  } else {
    console.log("✅  Column added successfully!");
  }
}

main().catch(console.error);
