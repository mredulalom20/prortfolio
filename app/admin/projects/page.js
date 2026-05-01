"use client";

import { useState, useEffect } from "react";

const categories = [
  "Graphic Design Projects",
  "Meta Ads / Marketing Proof",
  "UI/UX Design",
  "CMS Projects",
  "WordPress Plugins & Themes",
  "Landing Page Bundles"
];

const services = [
  { label: "Graphic Design", value: "graphic-design", icon: "brush" },
  { label: "UI/UX Design",   value: "ui-design",      icon: "layers" },
  { label: "Meta Ads",       value: "meta-ads",        icon: "ads_click" },
  { label: "CMS Dev",        value: "wordpress-dev",   icon: "terminal" },
  { label: "SEO",            value: "seo",             icon: "query_stats" },
];

const EMPTY_FORM = {
  title: "", description: "", category: categories[0],
  thumbnail: "", images: [], externalLink: "",
  additionalFields: {}, service: []
};

export default function ProjectManagement() {
  const [projects, setProjects]   = useState([]);
  const [view, setView]           = useState("list"); // 'list' | 'create' | 'edit'
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const [formData, setFormData]   = useState(EMPTY_FORM);
  const [loading, setLoading]     = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchProjects = async () => {
    try {
      const res  = await fetch("/api/projects");
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (e) {}
  };

  useEffect(() => {
    fetchProjects();
  }, [view]);

  /* ── save (create or update) ─────────────────────────── */
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const isEdit = view === "edit";
      const res = await fetch("/api/projects", {
        method:  isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(isEdit ? "Project updated successfully!" : "Project created successfully!");
        setTimeout(() => setView("list"), 800);
      } else {
        setError(data?.error || `Error ${res.status}: Failed to save project.`);
      }
    } catch (e) {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  /* ── delete ──────────────────────────────────────────── */
  const handleDelete = async (id) => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    try {
      const res = await fetch("/api/projects", {
        method:  "DELETE",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ id }),
      });
      if (res.ok) {
        fetchProjects();
      } else {
        const data = await res.json();
        alert(data?.error || "Failed to delete project.");
      }
    } catch (e) {
      alert("Network error. Please try again.");
    }
  };

  /* ── image upload ────────────────────────────────────── */
  const handleImageUpload = async (e, field, isArray = false) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const body = new FormData();
    body.append("file", file);
    try {
      const res  = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (res.ok) {
        setFormData(prev =>
          isArray
            ? { ...prev, [field]: [...prev[field], data.url] }
            : { ...prev, [field]: data.url }
        );
      } else {
        setError(data?.error || "Image upload failed.");
      }
    } catch (e) {
      setError("Image upload failed. Check your connection.");
    }
    setUploading(false);
  };

  const setAdditional = (key, val) =>
    setFormData(prev => ({ ...prev, additionalFields: { ...prev.additionalFields, [key]: val } }));

  /* ── toggle service checkbox ─────────────────────────── */
  const toggleService = (value) => {
    setFormData(prev => {
      const current = Array.isArray(prev.service) ? prev.service : [];
      return {
        ...prev,
        service: current.includes(value)
          ? current.filter(s => s !== value)
          : [...current, value],
      };
    });
  };

  /* ── start editing a project ─────────────────────────── */
  const startEdit = (project) => {
    setFormData({
      ...EMPTY_FORM,
      ...project,
      service: Array.isArray(project.service) ? project.service : [],
      images:  Array.isArray(project.images)  ? project.images  : [],
      additionalFields: project.additionalFields || {},
    });
    setView("edit");
    setError("");
    setSuccess("");
  };

  /* ─────────────────────────────────────────────────────────
     FORM VIEW  (create or edit)
  ───────────────────────────────────────────────────────── */
  if (view === "create" || view === "edit") {
    return (
      <div className="max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black">
            {view === "create" ? "Add New Project" : "Edit Project"}
          </h1>
          <button
            onClick={() => { setView("list"); setError(""); }}
            className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-all text-sm font-bold"
          >
            ← Back to List
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
            <span className="material-symbols-outlined text-base mt-0.5">error</span>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-base">check_circle</span>
            {success}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 bg-surface p-8 rounded-2xl border border-white/5">

          {/* ── Basic Info ─────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-sm font-bold text-slate-300">Project Title *</label>
              <input
                type="text" required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 focus:border-primary focus:outline-none text-white"
                placeholder="e.g. Brand Identity for XYZ Corp"
              />
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-sm font-bold text-slate-300">Category *</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 focus:border-primary focus:outline-none text-white appearance-none"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-2 col-span-2">
              <label className="text-sm font-bold text-slate-300">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none"
                rows="3"
                placeholder="Brief description of the project..."
              />
            </div>
          </div>

          {/* ── Service Association ────────────── */}
          <div className="p-5 bg-primary/5 rounded-xl border border-primary/20 space-y-3">
            <div>
              <h3 className="text-primary font-bold tracking-wider text-sm uppercase mb-1">
                Service Pages
              </h3>
              <p className="text-slate-400 text-xs">
                Select which service page(s) this project should appear on. Leave empty to exclude from all service pages.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {services.map(s => {
                const checked = Array.isArray(formData.service) && formData.service.includes(s.value);
                return (
                  <label
                    key={s.value}
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all select-none ${
                      checked
                        ? "bg-primary/15 border-primary/40 text-primary"
                        : "border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={checked}
                      onChange={() => toggleService(s.value)}
                    />
                    <span className="material-symbols-outlined text-base">{s.icon}</span>
                    <span className="text-xs font-bold">{s.label}</span>
                    {checked && <span className="material-symbols-outlined text-base ml-auto">check_circle</span>}
                  </label>
                );
              })}
            </div>
          </div>

          {/* ── Category-specific fields ───────── */}
          <div className="p-6 bg-white/5 rounded-xl border border-white/10 space-y-4">
            <h3 className="text-primary font-bold mb-4 tracking-wider text-sm uppercase">Media & Links</h3>

            {/* Image gallery for Design categories */}
            {(formData.category === "Graphic Design Projects" || formData.category === "UI/UX Design") && (
              <div className="space-y-2 mb-4">
                <label className="text-sm font-bold text-slate-300">Image Gallery</label>
                <div className="flex flex-col gap-4">
                  <label className={`flex items-center gap-3 cursor-pointer border border-dashed border-white/20 rounded-xl p-4 hover:border-primary/40 transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                    <span className="material-symbols-outlined text-primary">add_photo_alternate</span>
                    <span className="text-sm text-slate-400">{uploading ? "Uploading…" : "Click to upload image"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, "images", true)} />
                  </label>
                  {formData.images.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {formData.images.map((img, i) => (
                        <div key={i} className="relative group">
                          <img src={img} className="h-16 w-16 object-cover rounded-lg shadow border border-white/20" alt="" />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, images: formData.images.filter((_, idx) => idx !== i) })}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                          >×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Thumbnail for non-gallery categories */}
            {(formData.category === "Meta Ads / Marketing Proof" ||
              formData.category === "CMS Projects" ||
              formData.category === "WordPress Plugins & Themes" ||
              formData.category === "Landing Page Bundles") && (
              <div className="space-y-2 mb-4">
                <label className="text-sm font-bold text-slate-300">Preview Image / Screenshot</label>
                <label className={`flex items-center gap-3 cursor-pointer border border-dashed border-white/20 rounded-xl p-4 hover:border-primary/40 transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                  <span className="material-symbols-outlined text-primary">add_photo_alternate</span>
                  <span className="text-sm text-slate-400">{uploading ? "Uploading…" : "Click to upload screenshot"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, "thumbnail", false)} />
                </label>
                {formData.thumbnail && (
                  <div className="relative group w-fit mt-2">
                    <img src={formData.thumbnail} alt="preview" className="h-20 rounded-lg object-cover border border-white/20" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, thumbnail: "" })}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >×</button>
                  </div>
                )}
              </div>
            )}

            {/* Figma / Dribbble link for UI/UX */}
            {formData.category === "UI/UX Design" && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">Figma / Dribbble Link (Optional)</label>
                <input
                  type="url"
                  value={formData.externalLink}
                  onChange={e => setFormData({ ...formData, externalLink: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none"
                  placeholder="https://figma.com/..."
                />
              </div>
            )}

            {/* CMS sub-category + live URL */}
            {formData.category === "CMS Projects" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300">Sub Category</label>
                  <select
                    value={formData.additionalFields.subCategory || "WordPress"}
                    onChange={e => setAdditional("subCategory", e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white appearance-none focus:border-primary focus:outline-none"
                  >
                    <option>WordPress</option>
                    <option>Shopify</option>
                  </select>
                </div>
                <div className="space-y-2 mt-4">
                  <label className="text-sm font-bold text-slate-300">Live URL</label>
                  <input
                    type="url"
                    value={formData.externalLink}
                    onChange={e => setFormData({ ...formData, externalLink: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </>
            )}

            {/* Download / demo for plugins & bundles */}
            {(formData.category === "WordPress Plugins & Themes" || formData.category === "Landing Page Bundles") && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">Download / Demo Link</label>
                <input
                  type="url"
                  value={formData.externalLink}
                  onChange={e => setFormData({ ...formData, externalLink: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none"
                  placeholder="https://..."
                />
              </div>
            )}
          </div>

          <button
            disabled={loading || uploading}
            type="submit"
            className="bg-primary hover:bg-primary/90 text-background-dark font-black py-3 px-8 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <span className="material-symbols-outlined">{view === "edit" ? "save" : "add_circle"}</span>
            {loading ? "Saving…" : view === "edit" ? "Update Project" : "Create Project"}
          </button>
        </form>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────
     LIST VIEW
  ───────────────────────────────────────────────────────── */
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black">Projects Catalog</h1>
          <p className="text-slate-400 text-sm mt-1">{projects.length} project{projects.length !== 1 ? "s" : ""} total</p>
        </div>
        <button
          onClick={() => {
            setView("create");
            setError("");
            setSuccess("");
            setFormData(EMPTY_FORM);
          }}
          className="bg-primary hover:bg-primary/90 text-background-dark font-bold py-2 px-6 rounded-lg transition-all flex items-center gap-2 text-sm shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined text-lg">add</span> Add Project
        </button>
      </div>

      <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-white/5 uppercase text-xs font-bold tracking-wider text-slate-400">
            <tr>
              <th className="px-6 py-4">Preview</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Services</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {projects.map(p => {
              const thumb = p.thumbnail || (p.images && p.images[0]) || null;
              const svcList = Array.isArray(p.service) ? p.service : [];
              return (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    {thumb
                      ? <img src={thumb} alt={p.title} className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                      : <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-600">
                          <span className="material-symbols-outlined text-xl">image</span>
                        </div>
                    }
                  </td>
                  <td className="px-6 py-4 font-bold text-white">{p.title}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-white/10 text-white">
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {svcList.length === 0
                        ? <span className="text-slate-600 text-xs italic">None</span>
                        : svcList.map(sv => {
                            const svc = services.find(s => s.value === sv);
                            return (
                              <span key={sv} className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                                {svc ? svc.label : sv}
                              </span>
                            );
                          })
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="text-primary hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
                        title="Edit"
                        onClick={() => startEdit(p)}
                      >
                        <span className="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button
                        className="text-red-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-red-500/20"
                        title="Delete"
                        onClick={() => handleDelete(p.id)}
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {projects.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-muted italic">
                  No projects yet. Click <strong className="text-white">Add Project</strong> to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
