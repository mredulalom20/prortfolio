"use client";

import { useEffect, useState } from "react";

const emptyForm = { name: "", role: "", message: "", avatar_url: "", published: true };

export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [view, setView] = useState("list");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchReviews = async () => {
    const res = await fetch("/api/reviews");
    const data = await res.json();
    setReviews(Array.isArray(data) ? data : []);
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const isEdit = view === "edit";
    const res = await fetch("/api/reviews", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.error) setMsg("Error: " + data.error);
    else {
      setMsg(isEdit ? "Review updated." : "Review added.");
      setForm(emptyForm);
      fetchReviews();
      setView("list");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this review?")) return;
    await fetch("/api/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchReviews();
  };

  const handleTogglePublish = async (id, published) => {
    await fetch("/api/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, published: !published }),
    });
    fetchReviews();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black">Testimonials / Reviews</h1>
        {view === "list" ? (
          <button
            onClick={() => { setView("create"); setForm(emptyForm); setMsg(""); }}
            className="bg-primary hover:bg-primary/90 text-background-dark font-bold py-2 px-6 rounded-lg transition-all flex items-center gap-2 text-sm shadow-lg shadow-primary/20"
          >
            <span className="material-symbols-outlined text-lg">add</span> Add Review
          </button>
        ) : (
          <button onClick={() => setView("list")} className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-all text-sm font-bold">
            Back to List
          </button>
        )}
      </div>

      {(view === "create" || view === "edit") && (
        <form onSubmit={handleSave} className="space-y-6 bg-surface p-8 rounded-2xl border border-white/5 max-w-2xl">
          <h2 className="text-xl font-bold mb-2">{view === "edit" ? "Edit Testimonial" : "New Testimonial"}</h2>

          <div>
            <label className="block text-sm font-bold text-muted mb-2 uppercase tracking-wider">Client Name *</label>
            <input
              type="text" required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. James Wilson"
              className="w-full bg-background-dark border border-white/10 rounded-xl p-3 focus:border-primary focus:ring-1 focus:ring-primary text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-muted mb-2 uppercase tracking-wider">Role / Company</label>
            <input
              type="text"
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              placeholder="e.g. CEO, TechFlow Solutions"
              className="w-full bg-background-dark border border-white/10 rounded-xl p-3 focus:border-primary focus:ring-1 focus:ring-primary text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-muted mb-2 uppercase tracking-wider">Review Message *</label>
            <textarea
              required
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              placeholder="Client testimonial..."
              rows="4"
              className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-muted mb-2 uppercase tracking-wider">Profile Photo URL</label>
            <input
              type="url"
              value={form.avatar_url}
              onChange={e => setForm({ ...form, avatar_url: e.target.value })}
              placeholder="https://example.com/photo.jpg"
              className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox" id="pub"
              checked={form.published}
              onChange={e => setForm({ ...form, published: e.target.checked })}
              className="w-4 h-4 rounded accent-primary"
            />
            <label htmlFor="pub" className="text-sm font-bold">Publish immediately (show on website)</label>
          </div>

          {msg && <p className="text-sm font-bold text-primary">{msg}</p>}

          <button disabled={loading} type="submit" className="bg-primary hover:bg-primary/90 text-background-dark font-black py-3 px-8 rounded-xl transition-all disabled:opacity-50">
            {loading ? "Saving..." : view === "edit" ? "Update Review" : "Save Review"}
          </button>
        </form>
      )}

      {view === "list" && (
        <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
          {reviews.length === 0 ? (
            <div className="p-16 text-center text-muted">
              <span className="material-symbols-outlined text-6xl mb-4 block">format_quote</span>
              <p className="font-bold text-lg">No reviews yet</p>
              <p className="text-sm mt-1">Click &quot;Add Review&quot; to add your first testimonial</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-white/5 uppercase text-xs font-bold tracking-wider text-muted">
                <tr>
                  <th className="p-4 text-left">Client</th>
                  <th className="p-4 text-left">Role</th>
                  <th className="p-4 text-left">Message</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reviews.map(r => (
                  <tr key={r.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-3">
                      {r.avatar_url ? (
                        <img src={r.avatar_url} alt={r.name} className="w-9 h-9 rounded-full object-cover border-2 border-primary/30" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black">
                          {r.name?.charAt(0)}
                        </div>
                      )}
                      {r.name}
                    </td>
                    <td className="p-4 text-muted">{r.role || "-"}</td>
                    <td className="p-4 text-muted max-w-xs truncate">{r.message}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleTogglePublish(r.id, r.published)}
                        className={`px-3 py-1 rounded-full text-xs font-bold ${r.published ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-muted'}`}
                      >
                        {r.published ? "Published" : "Hidden"}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => { setView("edit"); setMsg(""); setForm({ ...emptyForm, ...r }); }} className="p-2 hover:bg-white/10 text-primary rounded-lg transition-all" title="Edit">
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button onClick={() => handleDelete(r.id)} className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-all" title="Delete">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
