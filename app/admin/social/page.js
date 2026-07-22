"use client";
import { useEffect, useState } from "react";
import { adminFetch } from "../../../lib/adminFetch";
import SmartImage from "../../components/SmartImage";

const PLATFORMS = [
  { key: "facebook",  label: "Facebook",  icon: "https://cdn.simpleicons.org/facebook/C6A75E",  placeholder: "https://facebook.com/yourpage" },
  { key: "instagram", label: "Instagram", icon: "https://cdn.simpleicons.org/instagram/C6A75E", placeholder: "https://instagram.com/yourhandle" },
  { key: "linkedin",  label: "LinkedIn",  icon: "https://cdn.simpleicons.org/linkedin/C6A75E",  placeholder: "https://linkedin.com/in/yourprofile" },
  { key: "behance",   label: "Behance",   icon: "https://cdn.simpleicons.org/behance/C6A75E",   placeholder: "https://behance.net/yourportfolio" },
  { key: "pinterest", label: "Pinterest", icon: "https://cdn.simpleicons.org/pinterest/C6A75E", placeholder: "https://pinterest.com/yourprofile" },
];

export default function SocialAdmin() {
  const [links, setLinks] = useState({ facebook: "", instagram: "", linkedin: "", behance: "", pinterest: "" });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminFetch("/api/social?admin=1").then(r => r.json()).then(data => {
      setLinks(prev => ({ ...prev, ...data }));
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true); setSaved(false);
    const res = await adminFetch("/api/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(links),
    });
    setLoading(false);
    if (res.ok) setSaved(true);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-black mb-2">Social Links</h1>
      <p className="text-muted mb-8">Enter your profile URLs. They will appear as clickable logos in the website footer.</p>

      {/* Live Preview */}
      <div className="bg-surface border border-white/5 rounded-2xl p-6 mb-8">
        <p className="text-xs font-bold text-muted uppercase tracking-wider mb-4">Footer Preview</p>
        <div className="flex gap-3 flex-wrap">
          {PLATFORMS.map(p => (
            <a key={p.key}
              href={links[p.key] || "#"}
              target={links[p.key] ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 border ${links[p.key] ? 'border-primary/30 bg-primary/10 hover:bg-primary hover:scale-110' : 'border-white/10 bg-white/5 opacity-40'}`}
              title={p.label}
            >
              <SmartImage src={p.icon} alt={p.label} className="w-5 h-5" />
            </a>
          ))}
        </div>
        <p className="text-xs text-muted mt-3">Greyed out = no link set yet</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5 bg-surface border border-white/5 rounded-2xl p-8">
        {PLATFORMS.map(p => (
          <div key={p.key}>
            <label className="flex items-center gap-3 text-sm font-bold mb-2">
              <SmartImage src={p.icon} alt={p.label} className="w-5 h-5 opacity-80" />
              {p.label}
            </label>
            <input
              type="url"
              value={links[p.key]}
              onChange={e => setLinks({ ...links, [p.key]: e.target.value })}
              placeholder={p.placeholder}
              className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white outline-none focus:border-primary transition-colors"
            />
          </div>
        ))}

        <div className="pt-2 flex items-center gap-4">
          <button type="submit" disabled={loading}
            className="bg-primary hover:bg-primary/90 text-background-dark font-black py-3 px-8 rounded-xl transition-all disabled:opacity-50">
            {loading ? "Saving..." : "Save All Links"}
          </button>
          {saved && <span className="text-green-400 font-bold text-sm">✅ Saved! Footer updated.</span>}
        </div>
      </form>
    </div>
  );
}
