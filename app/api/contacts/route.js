import { supabaseAdmin } from "@/lib/supabase";
import { NextResponse } from "next/server";

// GET all contact submissions
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST new contact submission
export async function POST(req) {
  const body = await req.json();
  const { name, email, service, message } = body;
  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email and message are required." }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin
    .from("contacts")
    .insert([{ name, email, service: service || "", message, read: false }])
    .select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0]);
}

// PATCH mark as read/unread
export async function PATCH(req) {
  const { id, read } = await req.json();
  const { data, error } = await supabaseAdmin
    .from("contacts")
    .update({ read })
    .eq("id", id)
    .select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data[0]);
}

// DELETE a contact
export async function DELETE(req) {
  const { id } = await req.json();
  const { error } = await supabaseAdmin.from("contacts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
