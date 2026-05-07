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

export default function SiteSettingsPage() {
  const [heroImage, setHeroImage] = useState("");
  const [aboutHeroImage, setAboutHeroImage] = useState("");
  const [uploading, setUploading] = useState(null); // "hero" | "about" | null
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "success" }), 3000);
  };

  // Fetch current settings
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/site-settings");
      const data = await res.json();
      if (Array.isArray(data)) {
        const heroSetting = data.find((s) => s.key === "hero_image");
        const aboutSetting = data.find((s) => s.key === "about_hero_image");
        if (heroSetting) setHeroImage(heroSetting.value);
        if (aboutSetting) setAboutHeroImage(aboutSetting.value);
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

  // Upload image
  const handleUpload = async (e, settingKey) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(settingKey);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed");

      const imageUrl = uploadData.url;
      // Save to site_settings
      const saveRes = await fetch("/api/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: settingKey, value: imageUrl }),
      });
      if (!saveRes.ok) throw new Error("Failed to save setting");

      if (settingKey === "hero_image") setHeroImage(imageUrl);
      if (settingKey === "about_hero_image") setAboutHeroImage(imageUrl);
      showToast("Image updated successfully!");
    } catch (err) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploading(null);
    }
  };

  // Save URL directly
  const handleSaveUrl = async (settingKey, value) => {
    setSaving(true);
    try {
      const res = await fetch("/api/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: settingKey, value }),
      });
      if (!res.ok) throw new Error("Failed to save");
      showToast("Setting saved!");
    } catch (err) {
      showToast(err.message || "Save failed", "error");
    } finally {
      setSaving(false);
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
          Manage your homepage hero images and other site-wide settings.
        </p>
      </div>

      <div className="grid gap-8 max-w-4xl">
        {/* Homepage Hero Image */}
        <div className="bg-surface border border-white/5 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">image</span>
            Homepage Hero Image
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            The main profile image shown in the homepage hero section.
          </p>

          {/* Current image preview */}
          {heroImage && (
            <div className="mb-6 relative inline-block">
              <img
                src={heroImage}
                alt="Hero preview"
                className="w-48 h-60 object-cover rounded-xl border border-white/10"
              />
            </div>
          )}

          {/* URL input */}
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={heroImage}
              onChange={(e) => setHeroImage(e.target.value)}
              placeholder="Image URL (e.g. img/profile.jpg)"
              className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50"
            />
            <button
              onClick={() => handleSaveUrl("hero_image", heroImage)}
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-background-dark font-bold px-6 py-3 rounded-xl text-sm transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save URL"}
            </button>
          </div>

          {/* Or upload */}
          <div className="flex items-center gap-4">
            <span className="text-slate-500 text-xs uppercase font-bold tracking-widest">
              Or upload a new image
            </span>
            <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-base">upload</span>
              {uploading === "hero_image" ? "Uploading..." : "Choose File"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUpload(e, "hero_image")}
                disabled={uploading === "hero_image"}
              />
            </label>
          </div>
        </div>

        {/* About Hero Image */}
        <div className="bg-surface border border-white/5 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person</span>
            About Section Hero Image
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            The portrait image shown in the &ldquo;Crafting Digital Masterpieces&rdquo;
            section on the homepage and about page.
          </p>

          {/* Current image preview */}
          {aboutHeroImage && (
            <div className="mb-6 relative inline-block">
              <img
                src={aboutHeroImage}
                alt="About hero preview"
                className="w-48 h-60 object-cover rounded-xl border border-white/10"
              />
            </div>
          )}

          {/* URL input */}
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={aboutHeroImage}
              onChange={(e) => setAboutHeroImage(e.target.value)}
              placeholder="Image URL (e.g. img/profile.jpg)"
              className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50"
            />
            <button
              onClick={() => handleSaveUrl("about_hero_image", aboutHeroImage)}
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-background-dark font-bold px-6 py-3 rounded-xl text-sm transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save URL"}
            </button>
          </div>

          {/* Or upload */}
          <div className="flex items-center gap-4">
            <span className="text-slate-500 text-xs uppercase font-bold tracking-widest">
              Or upload a new image
            </span>
            <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 border border-white/10 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-base">upload</span>
              {uploading === "about_hero_image" ? "Uploading..." : "Choose File"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUpload(e, "about_hero_image")}
                disabled={uploading === "about_hero_image"}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
