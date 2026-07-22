import fs from "fs/promises";
import path from "path";
import { supabaseAdmin } from "./supabase";

export const PAGE_SLUG_RE = /^[a-z0-9-]+$/i;

export function isValidPageSlug(slug) {
  return Boolean(slug && PAGE_SLUG_RE.test(slug));
}

export async function getPageHtml(slug) {
  const key = `page_html_${slug}`;
  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .single();

  if (!error && data && Object.prototype.hasOwnProperty.call(data, "value")) {
    return { html: data.value || "", source: "cms" };
  }

  const fileName = slug === "index" ? "index.html" : `${slug}.html`;
  const filePath = path.join(process.cwd(), "public", fileName);
  const html = await fs.readFile(filePath, "utf8");

  return { html, source: "file" };
}
