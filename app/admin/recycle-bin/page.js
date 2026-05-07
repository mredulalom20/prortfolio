"use client";

import { useState, useEffect, useCallback } from "react";

/* ── type config ── */
const TYPE_CONFIG = {
  blogs:    { label: "Blog Post",    icon: "article",    color: "text-blue-400",   bg: "bg-blue-400/10"   },
  projects: { label: "Project",      icon: "folder",     color: "text-purple-400", bg: "bg-purple-400/10" },
  reviews:  { label: "Review",       icon: "star",       color: "text-yellow-400", bg: "bg-yellow-400/10" },
  team:     { label: "Team Member",  icon: "person",     color: "text-green-400",  bg: "bg-green-400/10"  },
  media:    { label: "Media File",   icon: "imagesmode", color: "text-pink-400",   bg: "bg-pink-400/10"   },
};

/* ── toast ── */
function Toast({ message, type }) {
  if (!message) return null;
  const c = type === "error"
    ? "bg-red-500/10 border-red-500/30 text-red-400"
    : "bg-green-500/10 border-green-500/30 text-green-400";
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl border font-bold text-sm shadow-xl ${c}`}>
      {message}
    </div>
  );
}

/* ── confirm modal ── */
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-surface border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
        <span className="material-symbols-outlined text-5xl text-red-400 mb-4 block text-center">warning</span>
        <p className="text-center text-slate-300 mb-8 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 font-bold transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors">Delete Forever</button>
        </div>
      </div>
    </div>
  );
}

export default function RecycleBin() {
  const [dbItems,    setDbItems]    = useState([]);
  const [mediaItems, setMediaItems] = useState([]);
  const [fetching,   setFetching]   = useState(true);
  const [filter,     setFilter]     = useState("all"); // all | blogs | projects | reviews | team | media
  const [confirm,    setConfirm]    = useState(null);
  const [toast,      setToast]      = useState({ message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "success" }), 3000);
  };

  /* ── fetch ── */
  const fetchAll = useCallback(async () => {
    setFetching(true);
    try {
      const [dbRes, mediaRes] = await Promise.all([
        fetch("/api/recycle-bin"),
        fetch("/api/media/trash"),
      ]);
      const db    = await dbRes.json();
      const media = await mediaRes.json();
      setDbItems(Array.isArray(db)    ? db    : []);
      setMediaItems(Array.isArray(media) ? media : []);
    } catch {
      setDbItems([]);
      setMediaItems([]);
    }
    setFetching(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── DB restore ── */
  const restoreDb = async (item) => {
    try {
      const res = await fetch("/api/recycle-bin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, type: item._type }),
      });
      if (res.ok) { await fetchAll(); showToast(`"${item._label}" restored!`); }
      else        { showToast("Restore failed.", "error"); }
    } catch { showToast("Restore failed.", "error"); }
  };

  /* ── DB permanent delete ── */
  const purgeDb = (item) => {
    setConfirm({
      message: `Permanently delete "${item._label}"? This cannot be undone.`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          const res = await fetch("/api/recycle-bin", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: item.id, type: item._type }),
          });
          if (res.ok) { await fetchAll(); showToast("Permanently deleted."); }
          else        { showToast("Delete failed.", "error"); }
        } catch { showToast("Delete failed.", "error"); }
      },
    });
  };

  /* ── Media restore ── */
  const restoreMedia = async (item) => {
    try {
      const res = await fetch("/api/media/trash", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: item.name }),
      });
      if (res.ok) { await fetchAll(); showToast(`"${item.name}" restored!`); }
      else        { showToast("Restore failed.", "error"); }
    } catch { showToast("Restore failed.", "error"); }
  };

  /* ── Media permanent delete ── */
  const purgeMedia = (item) => {
    setConfirm({
      message: `Permanently delete file "${item.name}"? This cannot be undone.`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          const res = await fetch("/api/media/trash", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: item.name }),
          });
          if (res.ok) { await fetchAll(); showToast("File permanently deleted."); }
          else        { showToast("Delete failed.", "error"); }
        } catch { showToast("Delete failed.", "error"); }
      },
    });
  };

  /* ── Empty all ── */
  const emptyAll = () => {
    const total = dbItems.length + mediaItems.length;
    if (total === 0) return;
    setConfirm({
      message: `Permanently delete ALL ${total} item(s) in the Recycle Bin? This CANNOT be undone.`,
      onConfirm: async () => {
        setConfirm(null);
        await Promise.all([
          ...dbItems.map((item) =>
            fetch("/api/recycle-bin", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: item.id, type: item._type }),
            })
          ),
          ...mediaItems.map((item) =>
            fetch("/api/media/trash", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: item.name }),
            })
          ),
        ]);
        await fetchAll();
        showToast("Recycle Bin emptied.");
      },
    });
  };

  /* ── filter items ── */
  const allDbFormatted    = dbItems.map((i) => ({ ...i, _kind: "db" }));
  const allMediaFormatted = mediaItems.map((i) => ({ ...i, _type: "media", _label: i.name, _kind: "media" }));
  const all = [...allDbFormatted, ...allMediaFormatted].sort(
    (a, b) => new Date(b.deleted_at || b.date) - new Date(a.deleted_at || a.date)
  );

  const FILTERS = ["all", "blogs", "projects", "reviews", "team", "media"];
  const visible = filter === "all" ? all : all.filter((i) => i._type === filter);
  const totalCount = all.length;

  /* ── type badge ── */
  const TypeBadge = ({ type }) => {
    const cfg = TYPE_CONFIG[type] || {};
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${cfg.bg} ${cfg.color}`}>
        <span className="material-symbols-outlined text-xs">{cfg.icon}</span>
        {cfg.label}
      </span>
    );
  };

  /* ── row card ── */
  const ItemCard = ({ item }) => {
    const isMedia = item._kind === "media";
    const deletedOn = item.deleted_at || item.date;

    return (
      <div className="bg-surface border border-white/5 rounded-2xl p-5 flex items-center gap-5 hover:border-white/10 transition-all group">
        {/* thumbnail / icon */}
        {isMedia ? (
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/5 flex-shrink-0 bg-slate-900">
            <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${TYPE_CONFIG[item._type]?.bg || "bg-white/5"}`}>
            <span className={`material-symbols-outlined text-3xl ${TYPE_CONFIG[item._type]?.color || "text-muted"}`}>
              {TYPE_CONFIG[item._type]?.icon || "description"}
            </span>
          </div>
        )}

        {/* info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white truncate mb-1">{item._label}</p>
          <div className="flex flex-wrap items-center gap-2">
            <TypeBadge type={item._type} />
            <span className="text-[10px] text-muted uppercase tracking-wider">
              Deleted {new Date(deletedOn).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => isMedia ? restoreMedia(item) : restoreDb(item)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500 hover:text-white font-bold text-xs transition-all"
            title="Restore"
          >
            <span className="material-symbols-outlined text-base">restore_from_trash</span>
            <span className="hidden sm:inline">Restore</span>
          </button>
          <button
            onClick={() => isMedia ? purgeMedia(item) : purgeDb(item)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white font-bold text-xs transition-all"
            title="Delete forever"
          >
            <span className="material-symbols-outlined text-base">delete_forever</span>
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {confirm && (
        <ConfirmModal
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
      <Toast message={toast.message} type={toast.type} />

      {/* ── header ── */}
      <div className="flex flex-wrap justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <span className="material-symbols-outlined text-red-400 text-4xl">delete</span>
            Recycle Bin
          </h1>
          <p className="text-muted text-sm mt-1">
            {totalCount === 0 ? "Empty" : `${totalCount} item${totalCount !== 1 ? "s" : ""} waiting`}
          </p>
        </div>
        {totalCount > 0 && (
          <button
            onClick={emptyAll}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white font-bold text-sm transition-all"
          >
            <span className="material-symbols-outlined text-lg">delete_sweep</span>
            Empty Bin
          </button>
        )}
      </div>

      {/* ── filter tabs ── */}
      <div className="flex flex-wrap gap-2 mb-8">
        {FILTERS.map((f) => {
          const count = f === "all"
            ? all.length
            : all.filter((i) => i._type === f).length;
          const cfg = TYPE_CONFIG[f];
          const active = filter === f;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                active
                  ? "bg-primary border-primary text-background-dark"
                  : "bg-surface border-white/5 text-muted hover:text-white"
              }`}
            >
              {cfg && <span className="material-symbols-outlined text-base">{cfg.icon}</span>}
              <span className="capitalize">{f === "all" ? "All Items" : cfg?.label + "s"}</span>
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-background-dark/30" : "bg-white/10"}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── list ── */}
      {fetching ? (
        <div className="text-muted text-center py-20">Loading…</div>
      ) : visible.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-white/10 rounded-2xl">
          <span className="material-symbols-outlined text-6xl opacity-30 block mb-4">delete</span>
          <p className="font-bold text-slate-300 text-lg">
            {filter === "all" ? "Recycle Bin is empty." : `No deleted ${filter} found.`}
          </p>
          <p className="text-muted text-sm mt-2">Items you delete will appear here for recovery.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((item, i) => <ItemCard key={i} item={item} />)}
        </div>
      )}

      {/* ── info note ── */}
      {visible.length > 0 && (
        <p className="text-xs text-muted text-center mt-8 opacity-60">
          Restoring an item will return it to its original location. Permanently deleted items cannot be recovered.
        </p>
      )}
    </div>
  );
}
