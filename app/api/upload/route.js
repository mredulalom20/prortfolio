import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const DEFAULT_MAX_UPLOAD_MB = 10;
const MAX_UPLOAD_MB = Number(process.env.UPLOAD_MAX_MB || DEFAULT_MAX_UPLOAD_MB);
const MAX_UPLOAD_BYTES = Math.max(1, MAX_UPLOAD_MB) * 1024 * 1024;

const sanitizeFilename = (name) => {
  const base = String(name || "upload").split(/[\\/]/).pop();
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_+/g, "_");
  return cleaned || "upload";
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No files received." }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: `File too large. Max ${MAX_UPLOAD_MB}MB.` },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = sanitizeFilename(file.name);
    const filename = `${Date.now()}_${safeName}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ 
      message: "Success", 
      status: 201, 
      url: `/uploads/${filename}` 
    });
  } catch (error) {
    console.log("Error occurred ", error);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
