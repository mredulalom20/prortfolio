import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getPageHtml, isValidPageSlug } from "@/lib/pageHtml";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }
  if (!isValidPageSlug(slug)) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }

  try {
    const { html, source } = await getPageHtml(slug);
    return NextResponse.json({ slug, html, source });
  } catch {
    return NextResponse.json({ slug, html: "", source: "missing" });
  }
}

export async function PUT(request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const { slug, html } = body || {};

  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }
  if (!isValidPageSlug(slug)) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }

  const key = `page_html_${slug}`;
  const { error } = await supabaseAdmin
    .from("site_settings")
    .upsert(
      { key, value: html || "", updated_at: new Date().toISOString() },
      { onConflict: "key" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
