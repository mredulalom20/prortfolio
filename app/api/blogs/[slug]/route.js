import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(_req, { params }) {
  const { slug } = await params;
  const { data, error } = await supabaseAdmin
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}
