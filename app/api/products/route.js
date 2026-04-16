import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET all published products
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
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
