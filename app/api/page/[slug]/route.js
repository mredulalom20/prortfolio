import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { supabaseAdmin } from "@/lib/supabase";

const SLUG_RE = /^[a-z0-9-]+$/i;

export async function GET(_request, { params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }

  try {
    const key = `page_html_${slug}`;
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .single();

    if (!error && data && Object.prototype.hasOwnProperty.call(data, "value")) {
      return new NextResponse(data.value || "", {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      });
    }

    const fileName = slug === "index" ? "index.html" : `${slug}.html`;
    const filePath = path.join(process.cwd(), "public", fileName);
    const html = await fs.readFile(filePath, "utf8");

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error) {
    return new NextResponse("Page not found", { status: 404 });
  }
}
