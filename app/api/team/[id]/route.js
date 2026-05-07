import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
      .from("team_members")
      .select("*")
      .eq("id", id)
      .eq("published", true)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
