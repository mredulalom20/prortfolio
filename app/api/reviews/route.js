import { requireAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const admin = searchParams.get("admin") === "1";
  if (admin) {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
  }

  let query = supabaseAdmin
    .from("reviews")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (!admin) query = query.eq("published", true);

  let { data, error } = await query;

  // Graceful fallback if deleted_at column doesn't exist yet
  if (error && error.message?.includes("deleted_at")) {
    let fallback = supabaseAdmin
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (!admin) fallback = fallback.eq("published", true);
    const result = await fallback;
    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
    data = result.data;
    error = null;
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}


export async function POST(req) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const { name, role, message, avatar_url, published } = body;
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .insert([{ name, role, message, avatar_url: avatar_url || "", published: published ?? true }])
    .select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0]);
}

export async function PUT(req) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const { id, created_at, ...fields } = body;
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("reviews")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  // Try soft-delete; fall back to hard delete if column missing
  const { error } = await supabaseAdmin
    .from("reviews")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error && error.message?.includes("deleted_at")) {
    const { error: delErr } = await supabaseAdmin.from("reviews").delete().eq("id", id);
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });
  } else if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(req) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const { id, published } = await req.json();
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .update({ published })
    .eq("id", id)
    .select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0]);
}
