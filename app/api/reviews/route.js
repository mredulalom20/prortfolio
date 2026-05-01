import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

// GET all reviews
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST create review
export async function POST(req) {
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

// DELETE review
export async function DELETE(req) {
  const { id } = await req.json();
  const { error } = await supabaseAdmin.from("reviews").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// PATCH toggle publish
export async function PATCH(req) {
  const { id, published } = await req.json();
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .update({ published })
    .eq("id", id)
    .select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0]);
}
