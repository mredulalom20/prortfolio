import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const service  = searchParams.get("service");

    let query = supabaseAdmin
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (category) {
      // Partial match so "Meta Ads" matches "Meta Ads / Marketing Proof"
      query = query.ilike("category", `%${category}%`);
    }

    if (service) {
      // service is stored as a text[] — filter rows where the array contains the value
      query = query.contains("service", [service]);
    }

    const { data: projects, error } = await query;
    if (error) throw error;

    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    // Strip any existing id so Supabase generates a fresh one
    const { id, created_at, ...fields } = body;

    // Ensure service is always an array
    if (!Array.isArray(fields.service)) {
      fields.service = [];
    }

    const { data: project, error } = await supabaseAdmin
      .from("projects")
      .insert([fields])
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, created_at, ...fields } = body;

    if (!id) return NextResponse.json({ error: "ID is required for update" }, { status: 400 });

    // Ensure service is always an array
    if (!Array.isArray(fields.service)) {
      fields.service = [];
    }

    const { data: project, error } = await supabaseAdmin
      .from("projects")
      .update(fields)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;

    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const { error } = await supabaseAdmin.from("projects").delete().eq("id", id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
