import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const PLATFORMS = ["facebook", "instagram", "linkedin", "behance", "pinterest"];

// GET all social links
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("social_links")
    .select("*")
    .in("platform", PLATFORMS);
  if (error) return NextResponse.json({}, { status: 200 });
  // Return as {platform: url} map
  const map = {};
  (data || []).forEach(row => { map[row.platform] = row.url; });
  return NextResponse.json(map);
}

// POST upsert all social links at once
export async function POST(req) {
  const body = await req.json(); // { facebook: "url", instagram: "url", ... }
  const rows = Object.entries(body)
    .filter(([k]) => PLATFORMS.includes(k))
    .map(([platform, url]) => ({ platform, url: url || "" }));

  const { error } = await supabaseAdmin
    .from("social_links")
    .upsert(rows, { onConflict: "platform" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
