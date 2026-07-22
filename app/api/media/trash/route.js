import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabase";

const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "uploads";
const TRASH_PREFIX = ".trash/";

const trashPath = (name) => `${TRASH_PREFIX}${name}`;

/** GET — list items in trash */
export async function GET(request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Supabase server credentials are missing." }, { status: 500 });
    }

    const { data, error } = await supabaseAdmin
      .storage
      .from(STORAGE_BUCKET)
      .list(".trash", {
        limit: 1000,
        offset: 0,
        sortBy: { column: "updated_at", order: "desc" },
      });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const files = (data || [])
      .filter((item) => item?.name && item.metadata?.size !== undefined)
      .map((item) => {
        const path = trashPath(item.name);
        const { data: publicData } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(path);
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

/** PATCH — restore an item from trash back to uploads */
export async function PATCH(request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Supabase server credentials are missing." }, { status: 500 });
    }

    const { name } = await request.json();
    if (!name) return NextResponse.json({ error: "No filename provided" }, { status: 400 });

    const { error } = await supabaseAdmin.storage.from(STORAGE_BUCKET).move(trashPath(name), name);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/** DELETE — permanently delete an item from trash */
export async function DELETE(request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "Supabase server credentials are missing." }, { status: 500 });
    }

    const { name } = await request.json();
    if (!name) return NextResponse.json({ error: "No filename provided" }, { status: 400 });

    const { error } = await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([trashPath(name)]);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
