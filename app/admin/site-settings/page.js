"use client";

import { useState, useEffect, useCallback } from "react";

function Toast({ message, type }) {
  if (!message) return null;
  const colors =
    type === "error"
      ? "bg-red-500/10 border-red-500/30 text-red-400"
      : "bg-green-500/10 border-green-500/30 text-green-400";
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl border font-bold text-sm shadow-xl ${colors}`}
    >
      {message}
    </div>
  );
}

const IMAGE_SETTINGS = [
  {
    key: "hero_image",
    label: "Homepage Hero Image",
    icon: "image",
    description: "The main profile image shown in the homepage hero section.",
  },
  {
    key: "about_hero_image",
    label: "About Section Hero Image",
    icon: "person",
    description:
      'The portrait image in the "Crafting Digital Masterpieces" section on the homepage and about page.',
  },
  {
    key: "graphic_design_image",
    label: "Graphic Design Showcase Image",
    icon: "brush",
    description:
      "The showcase image in the overview section of the Graphic Design service page.",
  },
  {
    key: "meta_ads_image",
    label: "Meta Ads Hero Image",
    icon: "ads_click",
    description:
      "The dashboard image in the hero section of the Meta Ads service page.",
  },
];

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState({});
  const [uploading, setUploading] = useState(null);
  const [saving, setSaving] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "success" }), 3000);
  };

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/site-settings");
      const data = await res.json();
      if (Array.isArray(data)) {
        const map = {};
        data.forEach((s) => (map[s.key] = s.value));
        setSettings(map);
      }
    } catch {
      showToast("Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleUpload = async (e, settingKey) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(settingKey);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

      const imageUrl = uploadData.url;
      const saveRes = await fetch("/api/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: settingKey, value: imageUrl }),
      });
      if (!saveRes.ok) throw new Error("Failed to save setting");

      setSettings((prev) => ({ ...prev, [settingKey]: imageUrl }));
      showToast("Image updated successfully!");
    } catch (err) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploading(null);
    }
  };

  const handleSaveUrl = async (settingKey) => {
    setSaving(settingKey);
    try {
      const res = await fetch("/api/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: settingKey, value: settings[settingKey] || "" }),
      });
      if (!res.ok) throw new Error("Failed to save");
      showToast("Setting saved!");
    } catch (err) {
      showToast(err.message || "Save failed", "error");
    } finally {
      setSaving(null);
    }
  };

  if (loading)
    return (
      <div className="text-slate-400 py-20 text-center">Loading settings...</div>
    );

  return (
    <div>
      <Toast message={toast.message} type={toast.type} />

      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Site Settings</h1>
        <p className="text-slate-400">
          Manage images across your website. Upload or paste a URL for each section.
        </p>
      </div>

      <div className="grid gap-8 max-w-4xl">
        {IMAGE_SETTINGS.map((item) => (
          <div
            key={item.key}
            className="bg-surface border border-white/5 rounded-2xl p-8"
          >
            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                {item.icon}
              </span>
              {item.label}
            </h2>
            <p className="text-slate-400 text-sm mb-6">{item.description}</p>

            {/* Preview */}
            {settings[item.key] && (
              <div className="mb-6 relative inline-block">
                <img
                  src={settings[item.key]}
                  alt={`${item.label} preview`}
                  className="w-48 h-60 object-cover rounded-xl border border-white/10"
                />
              </div>
            )}

            {/* URL input */}
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={settings[item.key] || ""}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    [item.key]: e.target.value,
                  }))
                }
                placeholder="Image URL"
                className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50"
              />
              <button
                onClick={() => handleSaveUrl(item.key)}
                disabled={saving === item.key}
                className="bg-primary hover:bg-primary/90 text-background-dark font-bold px-6 py-3 rounded-xl text-sm transition-all disabled:opacity-50"
              >
                {saving === item.key ? "Saving..." : "Save URL"}
              </button>
            </div>

            {/* Upload */}
            <div className="flex items-center gap-4">
              <span className="text-slate-500 text-xs uppercase font-bold tracking-widest">
                Or upload a new image
              </span>
              <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-base">upload</span>
                {uploading === item.key ? "Uploading..." : "Choose File"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleUpload(e, item.key)}
                  disabled={uploading === item.key}
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
