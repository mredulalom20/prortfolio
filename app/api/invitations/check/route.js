import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST - check if an email is in the invite list
export async function POST(req) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ allowed: false });

  const { data, error } = await supabaseAdmin
    .from("invitations")
    .select("id")
    .eq("email", email.toLowerCase().trim())
    .single();

  if (error || !data) return NextResponse.json({ allowed: false });
  return NextResponse.json({ allowed: true });
}
