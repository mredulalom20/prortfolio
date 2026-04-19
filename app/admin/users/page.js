"use client";

import { useEffect, useState } from "react";

export default function UsersAdmin() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchInvitations = async () => {
    setLoading(true);
    const res = await fetch("/api/invitations");
    const data = await res.json();
    setInvitations(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchInvitations(); }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, note }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
    } else {
      setSuccess(`${email} has been added to the invite list.`);
      setEmail("");
      setNote("");
      fetchInvitations();
    }
    setSubmitting(false);
  };

  const handleRevoke = async (id, invEmail) => {
    if (!confirm(`Remove ${invEmail} from the invite list?`)) return;
    await fetch("/api/invitations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchInvitations();
  };

  return (
    <div>
      <h1 className="text-3xl font-black mb-2">User Invitations</h1>
      <p className="text-slate-400 text-sm mb-8">
        Only emails on this list can create an account. Login for existing accounts is never affected.
      </p>

      {/* Invite Form */}
      <div className="bg-surface rounded-2xl border border-white/5 p-6 mb-8">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">person_add</span>
          Add Invited Email
        </h2>
        {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 px-4 py-2 rounded-lg">{error}</p>}
        {success && <p className="text-emerald-400 text-sm mb-4 bg-emerald-500/10 px-4 py-2 rounded-lg">{success}</p>}
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none text-sm"
          />
          <input
            type="text"
            placeholder="Note (optional, e.g. 'Co-admin')"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none text-sm"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary hover:bg-primary/90 text-background-dark font-bold py-3 px-6 rounded-xl transition-all text-sm disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            {submitting ? "Adding..." : "Add to List"}
          </button>
        </form>
      </div>

      {/* Invitations Table */}
      <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-bold text-slate-300 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-primary">list</span>
            Invited Accounts
          </h2>
          <span className="text-xs text-muted bg-white/5 px-3 py-1 rounded-full">
            {invitations.length} {invitations.length === 1 ? "email" : "emails"}
          </span>
        </div>

        {loading ? (
          <div className="text-muted text-center py-16 text-sm">Loading...</div>
        ) : invitations.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-muted mb-3 block">group_off</span>
            <p className="font-bold text-white">No invitations yet</p>
            <p className="text-muted text-sm mt-1">Add an email above to allow someone to create an account</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-white/5 uppercase text-xs font-bold tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Note</th>
                <th className="px-6 py-3">Added</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invitations.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{inv.email}</td>
                  <td className="px-6 py-4 text-muted">{inv.note || <span className="italic opacity-40">—</span>}</td>
                  <td className="px-6 py-4 text-muted text-xs">
                    {new Date(inv.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRevoke(inv.id, inv.email)}
                      className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                      title="Remove from invite list"
                    >
                      <span className="material-symbols-outlined text-lg">person_remove</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
