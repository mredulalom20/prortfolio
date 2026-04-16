import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No files received." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = Date.now() + "_" + file.name.replace(/\\s/g, "_");
    
    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public/uploads");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch(e) {}

    await writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ 
      message: "Success", 
      status: 201, 
      url: `/uploads/${filename}` 
    });
  } catch (error) {
    console.log("Error occurred ", error);
    return NextResponse.json({ message: "Failed", status: 500 });
  }
}
