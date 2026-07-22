"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "../../../lib/adminFetch";

export default function ContactsAdmin() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchContacts = async () => {
    setLoading(true);
    const res = await adminFetch("/api/contacts");
    const data = await res.json();
    setContacts(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchContacts(); }, []);

  const handleRead = async (id, read) => {
    await adminFetch("/api/contacts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read: !read }),
    });
    fetchContacts();
    if (selected?.id === id) setSelected(prev => ({ ...prev, read: !read }));
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this message?")) return;
    await adminFetch("/api/contacts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (selected?.id === id) setSelected(null);
    fetchContacts();
  };

  const unread = contacts.filter(c => !c.read).length;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-black">Contact Messages</h1>
        {unread > 0 && (
          <span className="bg-primary text-background-dark text-xs font-black px-3 py-1 rounded-full">
            {unread} New
          </span>
        )}
      </div>

      {loading ? (
        <div className="text-muted text-center py-20">Loading messages...</div>
      ) : contacts.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-white/5 p-16 text-center">
          <span className="material-symbols-outlined text-6xl text-muted mb-4 block">inbox</span>
          <p className="font-bold text-lg text-white">No messages yet</p>
          <p className="text-muted text-sm mt-1">Messages from your contact form will appear here</p>
        </div>
      ) : (
        <div className="flex gap-6 h-[70vh]">
          {/* Message List */}
          <div className="w-80 flex-shrink-0 bg-surface rounded-2xl border border-white/5 overflow-y-auto">
            {contacts.map(c => (
              <button
                key={c.id}
                onClick={() => { setSelected(c); if (!c.read) handleRead(c.id, c.read); }}
                className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-all ${selected?.id === c.id ? 'bg-primary/10 border-l-2 border-l-primary' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-bold text-sm ${!c.read ? 'text-white' : 'text-muted'}`}>
                    {c.name}
                  </span>
                  {!c.read && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>}
                </div>
                <p className="text-xs text-muted truncate">{c.service || "General Inquiry"}</p>
                <p className="text-xs text-muted/60 mt-1 truncate">{c.message}</p>
                <p className="text-xs text-muted/40 mt-1">
                  {new Date(c.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </button>
            ))}
          </div>

          {/* Message Detail */}
          <div className="flex-1 bg-surface rounded-2xl border border-white/5 overflow-hidden">
            {selected ? (
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-black text-white">{selected.name}</h2>
                    <a href={`mailto:${selected.email}`} className="text-primary text-sm hover:underline">{selected.email}</a>
                    {selected.service && (
                      <span className="ml-3 px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                        {selected.service}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRead(selected.id, selected.read)}
                      className="px-3 py-1.5 text-xs font-bold border border-white/10 rounded-lg hover:bg-white/5 transition-all"
                    >
                      {selected.read ? "Mark Unread" : "Mark Read"}
                    </button>
                    <a
                      href={`mailto:${selected.email}?subject=Re: ${selected.service || "Your Inquiry"}`}
                      className="px-3 py-1.5 text-xs font-bold bg-primary text-background-dark rounded-lg hover:bg-primary/90 transition-all flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">reply</span> Reply
                    </a>
                    <button
                      onClick={() => handleDelete(selected.id)}
                      className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
                {/* Message Body */}
                <div className="p-6 flex-1 overflow-y-auto">
                  <p className="text-xs text-muted/60 mb-4">
                    Received: {new Date(selected.created_at).toLocaleString("en-GB")}
                  </p>
                  <div className="bg-background-dark rounded-xl p-6 text-white leading-relaxed whitespace-pre-wrap">
                    {selected.message}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-muted">
                  <span className="material-symbols-outlined text-6xl mb-3 block">mark_email_unread</span>
                  <p className="font-bold">Select a message to read</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
