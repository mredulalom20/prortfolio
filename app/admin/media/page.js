"use client";

import { useState, useEffect } from "react";

export default function MediaManager() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [mediaItems, setMediaItems] = useState([]);

  const fetchMedia = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      setMediaItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setMediaItems([]);
    }
    setFetching(false);
  };

  useEffect(() => { fetchMedia(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    setLoading(true);
    
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (res.ok) {
        await fetchMedia();
      }
    } catch(e) {}
    setLoading(false);
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    alert("Copied to clipboard!");
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">Media Library</h1>
        <label className="bg-primary hover:bg-primary/90 text-background-dark font-bold py-2 px-6 rounded-lg transition-all flex items-center gap-2 text-sm shadow-lg shadow-primary/20 cursor-pointer">
          <span className="material-symbols-outlined text-lg">upload</span> 
          {loading ? "Uploading..." : "Upload File"}
          <input type="file" className="hidden" onChange={handleUpload} disabled={loading} />
        </label>
      </div>

      {fetching ? (
        <div className="text-muted text-center py-20">Loading media...</div>
      ) : (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {mediaItems.map((item, i) => (
          <div key={i} className="bg-surface rounded-xl border border-white/5 overflow-hidden group relative">
            <div className="aspect-square bg-slate-900 border-b border-white/5 relative">
               <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-background-dark/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                 <button onClick={() => copyToClipboard(item.url)} className="p-2 bg-white/10 rounded hover:bg-primary hover:text-background-dark transition-colors" title="Copy Link">
                   <span className="material-symbols-outlined">link</span>
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
          <div className="col-span-full py-12 text-center text-muted border border-dashed border-white/10 rounded-2xl">
             <span className="material-symbols-outlined text-4xl mb-2 opacity-50">imagesmode</span>
             <p>No media uploaded yet.</p>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
