import { NextResponse } from "next/server";
import { mkdir, readdir, stat, rename, unlink } from "fs/promises";
import path from "path";

const UPLOAD_DIR = () => path.join(process.cwd(), "public", "uploads");
const TRASH_DIR  = () => path.join(process.cwd(), "public", "uploads", ".trash");

/** GET — list items in trash */
export async function GET() {
  try {
    const trashDir = TRASH_DIR();
    await mkdir(trashDir, { recursive: true });

    const entries = await readdir(trashDir);
    const files = await Promise.all(
      entries.map(async (name) => {
        const full = path.join(trashDir, name);
        const s = await stat(full);
        if (!s.isFile()) return null;
        return { name, url: `/uploads/.trash/${name}`, date: s.mtime.toISOString(), size: s.size };
      })
    );

    return NextResponse.json(
      files.filter(Boolean).sort((a, b) => new Date(b.date) - new Date(a.date))
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/** PATCH — restore an item from trash back to uploads */
export async function PATCH(request) {
  try {
    const { name } = await request.json();
    if (!name) return NextResponse.json({ error: "No filename provided" }, { status: 400 });

    const src  = path.join(TRASH_DIR(), name);
    const dest = path.join(UPLOAD_DIR(), name);

    await rename(src, dest);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/** DELETE — permanently delete an item from trash */
export async function DELETE(request) {
  try {
    const { name } = await request.json();
    if (!name) return NextResponse.json({ error: "No filename provided" }, { status: 400 });

    const filePath = path.join(TRASH_DIR(), name);
    await unlink(filePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
