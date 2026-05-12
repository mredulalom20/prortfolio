"use client";

import { useEffect, useState } from "react";

const PAGES = [
  { label: "Homepage", slug: "index", path: "/" },
  { label: "About Page", slug: "about", path: "/about" },
  { label: "Graphic Design", slug: "graphic-design", path: "/graphic-design" },
  { label: "UI/UX Design", slug: "ui-design", path: "/ui-design" },
  { label: "Meta Ads", slug: "meta-ads", path: "/meta-ads" },
  { label: "CMS Dev", slug: "wordpress-dev", path: "/wordpress-dev" },
  { label: "Blog Landing", slug: "blog", path: "/blog" },
  { label: "SEO", slug: "seo", path: "/seo" },
];

export default function PagesAdmin() {
  const [selected, setSelected] = useState(PAGES[0].slug);
  const [content, setContent] = useState("");
  const [source, setSource] = useState("file");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadPage = async (slug) => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/pages?slug=${slug}`);
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error || "Failed to load page.");
        setContent("");
        setSource("missing");
        return;
      }
      setContent(data?.html || "");
      setSource(data?.source || "file");
    } catch (error) {
      setMessage("Failed to load page.");
      setContent("");
      setSource("missing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage(selected);
  }, [selected]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: selected, html: content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.error || "Save failed.");
        return;
      }
      setSource("cms");
      setMessage("Page saved.");
    } catch (error) {
      setMessage("Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const currentPage = PAGES.find((p) => p.slug === selected);

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Pages CMS</h1>
        <p className="text-slate-400">
          Edit full HTML for each public page. Saved content overrides the file in
          public/.
        </p>
      </div>

      <div className="bg-surface border border-white/5 rounded-2xl p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="text-sm font-bold text-slate-300">Select Page</label>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="mt-2 w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white appearance-none"
            >
              {PAGES.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.label} ({p.path})
                </option>
              ))}
            </select>
          </div>
          <div className="text-sm text-slate-400">
            <div>Source: <span className="text-white font-bold">{source}</span></div>
            {currentPage && (
              <div>Path: <span className="text-white">{currentPage.path}</span></div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-surface border border-white/5 rounded-2xl p-6">
        {message && (
          <div className="mb-4 text-sm text-slate-300">
            {message}
          </div>
        )}
        <label className="text-sm font-bold text-slate-300">Page HTML</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={18}
          className="mt-2 w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white text-xs font-mono focus:outline-none focus:border-primary/50"
          placeholder={loading ? "Loading..." : "Paste full HTML here"}
          disabled={loading}
        />
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="bg-primary hover:bg-primary/90 text-background-dark font-bold px-6 py-3 rounded-xl text-sm transition-all disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Page"}
          </button>
          <span className="text-xs text-slate-500">
            Saving will publish immediately.
          </span>
        </div>
      </div>
    </div>
  );
}
