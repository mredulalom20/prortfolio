import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET products
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const admin = searchParams.get("admin") === "1";

  let query = supabaseAdmin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (!admin) query = query.eq("published", true);

  const { data, error } = await query;
  if (error) return NextResponse.json([], { status: 200 });
  return NextResponse.json(data);
}

// POST create product (admin)
export async function POST(req) {
  const body = await req.json();
  const { title, description, category, cover_url, action_url, action_type, badge, published } = body;
  const { data, error } = await supabaseAdmin
    .from("products")
    .insert([{ title, description, category, cover_url: cover_url || "", action_url, action_type: action_type || "visit", badge: badge || "", published: published ?? true }])
    .select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0]);
}

export async function PUT(req) {
  const body = await req.json();
  const { id, created_at, ...fields } = body;
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("products")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// PATCH toggle publish
export async function PATCH(req) {
  const { id, published } = await req.json();
  const { data, error } = await supabaseAdmin.from("products").update({ published }).eq("id", id).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0]);
}

// DELETE
export async function DELETE(req) {
  const { id } = await req.json();
  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
