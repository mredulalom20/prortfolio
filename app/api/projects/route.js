import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const service  = searchParams.get("service");

    let query = supabaseAdmin
      .from("projects")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (category) query = query.ilike("category", `%${category}%`);
    if (service)  query = query.contains("service", [service]);

    let { data: projects, error } = await query;

    // Graceful fallback if deleted_at column doesn't exist yet (migration not run)
    if (error && error.message?.includes("deleted_at")) {
      const fallback = supabaseAdmin
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      if (category) fallback.ilike("category", `%${category}%`);
      if (service)  fallback.contains("service", [service]);
      const result = await fallback;
      if (result.error) throw result.error;
      projects = result.data;
    } else if (error) {
      throw error;
    }

    return NextResponse.json(projects || [], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const { id, created_at, ...fields } = body;
    if (!Array.isArray(fields.service)) fields.service = [];

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
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const { id, created_at, ...fields } = body;
    if (!id) return NextResponse.json({ error: "ID is required for update" }, { status: 400 });
    if (!Array.isArray(fields.service)) fields.service = [];

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
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    // Try soft-delete first; fall back to hard delete if column missing
    const { error } = await supabaseAdmin
      .from("projects")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error && error.message?.includes("deleted_at")) {
      // Column not yet migrated — hard delete as fallback
      const { error: delErr } = await supabaseAdmin.from("projects").delete().eq("id", id);
      if (delErr) throw delErr;
    } else if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
