import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { supabaseAdmin } from "@/lib/supabase";

const SLUG_RE = /^[a-z0-9-]+$/i;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }

  const key = `page_html_${slug}`;
  try {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .single();

    if (!error && data && Object.prototype.hasOwnProperty.call(data, "value")) {
      return NextResponse.json({ slug, html: data.value || "", source: "cms" });
    }
  } catch (error) {
    // fall back to file
  }

  let html = "";
  let source = "missing";
  try {
    const fileName = slug === "index" ? "index.html" : `${slug}.html`;
    const filePath = path.join(process.cwd(), "public", fileName);
    html = await fs.readFile(filePath, "utf8");
    source = "file";
  } catch (error) {
    html = "";
    source = "missing";
  }

  return NextResponse.json({ slug, html, source });
}

export async function PUT(request) {
  const body = await request.json();
  const { slug, html } = body || {};

  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }
  if (!SLUG_RE.test(slug)) {
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
