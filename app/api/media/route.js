import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "uploads";

/** GET — list active media (skips .trash sub-directory) */
export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Supabase server credentials are missing." }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .storage
      .from(STORAGE_BUCKET)
      .list("", {
        limit: 1000,
        offset: 0,
        sortBy: { column: "updated_at", order: "desc" },
      });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const files = (data || [])
      .filter((item) => item?.name && !item.name.startsWith(".trash") && item.metadata?.size !== undefined)
      .map((item) => {
        const { data: publicData } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(item.name);
        return {
          name: item.name,
          url: publicData?.publicUrl || "",
          date: item.updated_at || item.created_at || new Date().toISOString(),
          size: item.metadata?.size || 0,
        };
      })
      .filter((item) => item.url);

    return NextResponse.json(files.sort((a, b) => new Date(b.date) - new Date(a.date)));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/** DELETE — soft-delete (move file to .trash folder) */
export async function DELETE(request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Supabase server credentials are missing." }, { status: 500 });
    }

    const { name } = await request.json();
    if (!name) return NextResponse.json({ error: "No filename provided" }, { status: 400 });

    const { error } = await supabaseAdmin.storage.from(STORAGE_BUCKET).move(name, `.trash/${name}`);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
