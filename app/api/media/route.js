import { NextResponse } from "next/server";
import { mkdir, readdir, stat } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const entries = await readdir(uploadDir);
    const files = await Promise.all(
      entries.map(async (name) => {
        const stats = await stat(path.join(uploadDir, name));
        return stats.isFile()
          ? { name, url: `/uploads/${name}`, date: stats.mtime.toISOString(), size: stats.size }
          : null;
      })
    );

    return NextResponse.json(
      files.filter(Boolean).sort((a, b) => new Date(b.date) - new Date(a.date))
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
