import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// GET - list all invitations
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("invitations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST - add an email to the invite list
export async function POST(req) {
  const { email, note } = await req.json();
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("invitations")
    .insert([{ email: email.toLowerCase().trim(), note: note || null }])
    .select()
    .single();

  if (error) {
    if (error.code === "23505")
      return NextResponse.json({ error: "This email is already invited." }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(req) {
  const { id, email, note } = await req.json();
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("invitations")
    .update({ email: email.toLowerCase().trim(), note: note || null })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505")
      return NextResponse.json({ error: "This email is already invited." }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// DELETE - remove an email from the invite list
export async function DELETE(req) {
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("invitations")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// POST /api/invitations/check - check if an email is invited (used by login page)
