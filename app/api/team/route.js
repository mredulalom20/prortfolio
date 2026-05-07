import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const admin = searchParams.get("admin") === "1";

  let query = supabaseAdmin
    .from("team_members")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (!admin) query = query.eq("published", true);

  let { data, error } = await query;

  // Graceful fallback if deleted_at column doesn't exist yet (migration not run)
  if (error && error.message?.includes("deleted_at")) {
    let fallback = supabaseAdmin
      .from("team_members")
      .select("*")
      .order("created_at", { ascending: false });
    if (!admin) fallback = fallback.eq("published", true);
    const result = await fallback;
    if (result.error) return NextResponse.json([], { status: 200 });
    data = result.data;
    error = null;
  }

  if (error) return NextResponse.json([], { status: 200 });
  return NextResponse.json(data ?? []);
}


export async function POST(req) {
  const body = await req.json();
  const { name, role, photo_url, bio, published } = body;
  const { data, error } = await supabaseAdmin
    .from("team_members")
    .insert([{ name, role, photo_url: photo_url || "", bio: bio || "", published: published ?? true }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(req) {
  const body = await req.json();
  const { id, created_at, ...fields } = body;
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("team_members")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req) {
  const { id, published } = await req.json();
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("team_members")
    .update({ published })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  // Soft-delete
  const { error } = await supabaseAdmin
    .from("team_members")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
