import { NextResponse } from "next/server";
import { mkdir, readdir, stat, rename } from "fs/promises";
import path from "path";

const UPLOAD_DIR = () => path.join(process.cwd(), "public", "uploads");
const TRASH_DIR  = () => path.join(process.cwd(), "public", "uploads", ".trash");

/** GET — list active media (skips .trash sub-directory) */
export async function GET() {
  try {
    const uploadDir = UPLOAD_DIR();
    await mkdir(uploadDir, { recursive: true });

    const entries = await readdir(uploadDir);
    const files = await Promise.all(
      entries.map(async (name) => {
        const full = path.join(uploadDir, name);
        const s = await stat(full);
        if (!s.isFile()) return null; // skip .trash dir
        return { name, url: `/uploads/${name}`, date: s.mtime.toISOString(), size: s.size };
      })
    );

    return NextResponse.json(
      files.filter(Boolean).sort((a, b) => new Date(b.date) - new Date(a.date))
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/** DELETE — soft-delete (move file to .trash folder) */
export async function DELETE(request) {
  try {
    const { name } = await request.json();
    if (!name) return NextResponse.json({ error: "No filename provided" }, { status: 400 });

    const trashDir = TRASH_DIR();
    await mkdir(trashDir, { recursive: true });

    await rename(path.join(UPLOAD_DIR(), name), path.join(trashDir, name));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
