"use client";

import { useEffect, useState } from "react";

const emptyForm = { name: "", role: "", photo_url: "", bio: "", published: true };

export default function TeamAdmin() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [view, setView] = useState("list");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchMembers = async () => {
    const res = await fetch("/api/team?admin=1");
    const data = await res.json();
    setMembers(Array.isArray(data) ? data : []);
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const isEdit = view === "edit";
    const res = await fetch("/api/team", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.error) setMsg("Error: " + data.error);
    else {
      setMsg(isEdit ? "Team member updated." : "Team member added.");
      setForm(emptyForm);
      setView("list");
      fetchMembers();
    }
    setLoading(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (res.ok) setForm(prev => ({ ...prev, photo_url: data.url }));
    } catch (e) {}
    setUploading(false);
  };

  const handleToggle = async (id, published) => {
    await fetch("/api/team", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, published: !published }),
    });
    fetchMembers();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this team member?")) return;
    await fetch("/api/team", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchMembers();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black">Our Team</h1>
        {view === "list" ? (
          <button onClick={() => { setView("create"); setForm(emptyForm); setMsg(""); }}
            className="bg-primary hover:bg-primary/90 text-background-dark font-bold py-2 px-6 rounded-lg transition-all flex items-center gap-2 text-sm shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-lg">add</span> Add Member
          </button>
        ) : (
          <button onClick={() => setView("list")} className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-all text-sm font-bold">
            Back to List
          </button>
        )}
      </div>

      {(view === "create" || view === "edit") && (
        <form onSubmit={handleSave} className="space-y-6 bg-surface p-8 rounded-2xl border border-white/5 max-w-2xl">
          <h2 className="text-xl font-bold">{view === "edit" ? "Edit Team Member" : "New Team Member"}</h2>

          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Name *</label>
            <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white outline-none focus:border-primary" />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Role *</label>
            <input required value={form.role} onChange={e => setForm({...form, role: e.target.value})}
              className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white outline-none focus:border-primary" />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Photo</label>
            <label className={`flex items-center gap-3 cursor-pointer border border-dashed border-white/20 rounded-xl p-4 hover:border-primary/40 transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
              <span className="material-symbols-outlined text-primary">add_photo_alternate</span>
              <span className="text-sm text-slate-400">{uploading ? "Uploading..." : "Upload photo"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            {form.photo_url && (
              <div className="mt-3 flex items-center gap-3">
                <img src={form.photo_url} alt="preview" className="w-16 h-16 rounded-xl object-cover border border-white/10" />
                <button type="button" onClick={() => setForm({...form, photo_url: ""})} className="text-red-400 text-sm font-bold hover:text-white">Remove</button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Bio *</label>
            <textarea required rows="4" value={form.bio} onChange={e => setForm({...form, bio: e.target.value})}
              className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white outline-none focus:border-primary" />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="team-pub" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} className="w-4 h-4 accent-primary" />
            <label htmlFor="team-pub" className="text-sm font-bold">Publish immediately (show on website)</label>
          </div>

          {msg && <p className="text-sm font-bold text-primary">{msg}</p>}
          <button disabled={loading || uploading} type="submit" className="bg-primary hover:bg-primary/90 text-background-dark font-black py-3 px-8 rounded-xl transition-all disabled:opacity-50">
            {loading ? "Saving..." : view === "edit" ? "Update Member" : "Save Member"}
          </button>
        </form>
      )}

      {view === "list" && (
        <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
          {members.length === 0 ? (
            <div className="p-16 text-center text-muted">
              <span className="material-symbols-outlined text-6xl mb-4 block">groups</span>
              <p className="font-bold text-lg">No team members yet</p>
              <p className="text-sm mt-1">Add your first team member.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {members.map(member => (
                <div key={member.id} className="flex items-center gap-4 p-5 hover:bg-white/5 transition-all">
                  {member.photo_url ? (
                    <img src={member.photo_url} alt={member.name} className="w-14 h-14 rounded-xl object-cover border border-white/10" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">{member.name?.charAt(0)}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate">{member.name}</p>
                    <p className="text-xs text-primary font-bold uppercase tracking-wider">{member.role}</p>
                    <p className="text-sm text-muted truncate mt-1">{member.bio}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => handleToggle(member.id, member.published)}
                      className={`px-3 py-1 rounded-full text-xs font-bold ${member.published ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-muted'}`}>
                      {member.published ? "Published" : "Hidden"}
                    </button>
                    <button onClick={() => { setView("edit"); setMsg(""); setForm({ ...emptyForm, ...member }); }} className="p-2 hover:bg-white/10 text-primary rounded-lg transition-all" title="Edit">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button onClick={() => handleDelete(member.id)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-all" title="Delete">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
