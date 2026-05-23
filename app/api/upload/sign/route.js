import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const DEFAULT_MAX_UPLOAD_MB = 10;
const MAX_UPLOAD_MB = Number(process.env.UPLOAD_MAX_MB || DEFAULT_MAX_UPLOAD_MB);
const MAX_UPLOAD_BYTES = Math.max(1, MAX_UPLOAD_MB) * 1024 * 1024;
const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "uploads";

const sanitizeFilename = (name) => {
  const base = String(name || "upload").split(/[\\/]/).pop();
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_");
  return cleaned || "upload";
};

export async function POST(request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Supabase server credentials are missing." }, { status: 500 });
    }

    const body = await request.json();
    const filename = body?.filename;
    const size = body?.size;

    if (!filename || typeof filename !== "string") {
      return NextResponse.json({ error: "filename is required." }, { status: 400 });
    }

    if (typeof size === "number" && size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: `File too large. Max ${MAX_UPLOAD_MB}MB.` }, { status: 413 });
    }

    const safeName = sanitizeFilename(filename);
    const path = `${Date.now()}_${safeName}`;

    const { data, error } = await supabaseAdmin
      .storage
      .from(STORAGE_BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data?.token) {
      return NextResponse.json({ error: error?.message || "Failed to create signed URL." }, { status: 500 });
    }

    const { data: publicData } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(path);

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path,
      bucket: STORAGE_BUCKET,
      publicUrl: publicData?.publicUrl || "",
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create upload URL." }, { status: 500 });
  }
}
