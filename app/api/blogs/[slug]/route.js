import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(_req, { params }) {
  const { slug } = await params;
  let { data, error } = await supabaseAdmin
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (error && error.message?.includes("deleted_at")) {
    const result = await supabaseAdmin
      .from("blogs")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    data = result.data;
    error = result.error;
  }

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(data);
}
