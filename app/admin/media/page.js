"use client";

import { useState, useEffect, useCallback } from "react";
import { getMaxUploadBytes, getFileTooLargeMessage, uploadDirectToStorage } from "../../../lib/uploadClient";

function Toast({ message, type }) {
  if (!message) return null;
  const colors = type === "error"
    ? "bg-red-500/10 border-red-500/30 text-red-400"
    : "bg-green-500/10 border-green-500/30 text-green-400";
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl border font-bold text-sm shadow-xl ${colors}`}>
      {message}
    </div>
  );
}

export default function MediaManager() {
  const [loading, setLoading]       = useState(false);
  const [fetching, setFetching]     = useState(true);
  const [mediaItems, setMediaItems] = useState([]);
  const [toast, setToast]           = useState({ message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "success" }), 3000);
  };

  const fetchMedia = useCallback(async () => {
    setFetching(true);
    try {
      const res  = await fetch("/api/media");
      const data = await res.json();
      setMediaItems(Array.isArray(data) ? data : []);
    } catch { setMediaItems([]); }
    setFetching(false);
  }, []);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > getMaxUploadBytes()) {
      showToast(getFileTooLargeMessage(), "error");
      e.target.value = "";
      return;
    }
    setLoading(true);
    try {
      const { url } = await uploadDirectToStorage(file);
      if (url) {
        await fetchMedia();
        showToast("File uploaded!");
      } else {
        showToast("Upload failed.", "error");
      }
    } catch (e) { showToast(e?.message || "Upload failed.", "error"); }
    setLoading(false);
    e.target.value = "";
  };

  const copyToClipboard = (url) => {
    const fullUrl = /^https?:\/\//i.test(url) ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    showToast("Link copied!");
  };

  const handleDelete = async (item) => {
    if (!confirm(`Move "${item.name}" to the Recycle Bin?`)) return;
    try {
      const res = await fetch("/api/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: item.name }),
      });
      if (res.ok) { await fetchMedia(); showToast("Moved to Recycle Bin."); }
      else        { showToast("Delete failed.", "error"); }
    } catch { showToast("Delete failed.", "error"); }
  };

  return (
    <div>
      <Toast message={toast.message} type={toast.type} />

      <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black">Media Library</h1>
          <p className="text-muted text-sm mt-1">{mediaItems.length} file{mediaItems.length !== 1 ? "s" : ""}</p>
        </div>
        <label className="bg-primary hover:bg-primary/90 text-background-dark font-bold py-2 px-6 rounded-lg transition-all flex items-center gap-2 text-sm shadow-lg shadow-primary/20 cursor-pointer">
          <span className="material-symbols-outlined text-lg">upload</span>
          {loading ? "Uploading…" : "Upload File"}
          <input type="file" className="hidden" onChange={handleUpload} disabled={loading} />
        </label>
      </div>

      {fetching ? (
        <div className="text-muted text-center py-20">Loading…</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {mediaItems.map((item, i) => (
            <div key={i} className="bg-surface rounded-xl border border-white/5 overflow-hidden group relative">
              <div className="aspect-square bg-slate-900 border-b border-white/5 relative overflow-hidden">
                <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-background-dark/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => copyToClipboard(item.url)} className="p-2 bg-white/10 rounded-lg hover:bg-primary hover:text-background-dark transition-colors" title="Copy link">
                    <span className="material-symbols-outlined text-xl">link</span>
                  </button>
                  <button onClick={() => handleDelete(item)} className="p-2 bg-white/10 rounded-lg hover:bg-red-500 hover:text-white transition-colors" title="Move to Recycle Bin">
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs font-bold truncate text-slate-300" title={item.name}>{item.name}</p>
                <p className="text-[10px] text-muted mt-1 uppercase tracking-wider">{new Date(item.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
          {mediaItems.length === 0 && (
            <div className="col-span-full py-16 text-center text-muted border border-dashed border-white/10 rounded-2xl">
              <span className="material-symbols-outlined text-5xl mb-3 opacity-40 block">imagesmode</span>
              <p className="font-bold">No media uploaded yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
