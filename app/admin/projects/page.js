"use client";

import { useState, useEffect } from "react";
import RichTextEditor from "../../components/RichTextEditor";

const categories = [
  "Graphic Design Projects",
  "Meta Ads / Marketing Proof",
  "UI/UX Design",
  "CMS Projects",
  "WordPress Plugins & Themes",
  "Landing Page Bundles"
];

export default function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [view, setView] = useState("list"); // 'list', 'create', 'edit'
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Form State
  const [formData, setFormData] = useState({ 
    title: "", description: "", category: categories[0], 
    thumbnail: "", images: [], externalLink: "", 
    additionalFields: {} 
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [view]);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if(res.ok) {
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch(e) {}
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if(res.ok) {
        setSuccess("Project saved successfully!");
        setTimeout(() => setView("list"), 800);
      } else {
        setError(data?.error || `Error ${res.status}: Failed to save project.`);
      }
    } catch(e) {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    try {
      const res = await fetch("/api/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        fetchProjects();
      } else {
        const data = await res.json();
        alert(data?.error || "Failed to delete project.");
      }
    } catch(e) {
      alert("Network error. Please try again.");
    }
  };

  const handleImageUpload = async (e, field, isArray = false) => {
    const file = e.target.files[0];
    if(!file) return;
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if(res.ok) {
        if (isArray) {
          setFormData({ ...formData, [field]: [...formData[field], data.url] });
        } else {
          setFormData({ ...formData, [field]: data.url });
        }
      } else {
        setError(data?.error || "Image upload failed.");
      }
    } catch(e) {
      setError("Image upload failed. Check your connection.");
    }
  };

  const setAdditional = (key, val) => {
    setFormData(prev => ({ ...prev, additionalFields: { ...prev.additionalFields, [key]: val } }));
  };

  if (view === "create" || view === "edit") {
    return (
      <div className="max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black">{view === "create" ? "Add New Project" : "Edit Project"}</h1>
          <button onClick={() => { setView("list"); setError(""); }} className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-all text-sm font-bold">
            Back to List
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
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-bold text-slate-300">Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 focus:border-primary focus:outline-none text-white appearance-none">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-sm font-bold text-slate-300">Project Title</label>
              <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 focus:border-primary focus:outline-none text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300">Description</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white" rows="3" />
          </div>

          <div className="p-6 bg-white/5 rounded-xl border border-white/10 space-y-4">
            <h3 className="text-primary font-bold mb-4 tracking-wider text-sm uppercase">Category Specific Fields</h3>
            
            {(formData.category === "Graphic Design Projects" || formData.category === "UI/UX Design") && (
              <div className="space-y-2 mb-4">
                <label className="text-sm font-bold text-slate-300">Image Gallery Upload</label>
                <div className="flex flex-col gap-4">
                  <input type="file" accept="image/*" onChange={e => handleImageUpload(e, "images", true)} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary cursor-pointer" />
                  <div className="flex gap-2 flex-wrap">
                    {formData.images.map((img, i) => (
                      <div key={i} className="relative group">
                        <img src={img} className="h-16 w-16 object-cover rounded shadow border border-white/20" />
                        <button type="button" onClick={() => setFormData({...formData, images: formData.images.filter((_, idx) => idx !== i)})} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">x</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {(formData.category === "Meta Ads / Marketing Proof" || formData.category === "CMS Projects" || formData.category === "WordPress Plugins & Themes" || formData.category === "Landing Page Bundles") && (
              <div className="space-y-2 mb-4">
                <label className="text-sm font-bold text-slate-300">Preview Image / Screenshot</label>
                <div className="flex items-center gap-4">
                  <input type="file" accept="image/*" onChange={e => handleImageUpload(e, "thumbnail", false)} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary cursor-pointer" />
                  {formData.thumbnail && <img src={formData.thumbnail} alt="preview" className="h-12 w-12 rounded object-cover" />}
                </div>
              </div>
            )}

            {(formData.category === "UI/UX Design") && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">Figma / Dribbble Link (Optional)</label>
                <input type="url" value={formData.externalLink} onChange={e => setFormData({...formData, externalLink: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white" />
              </div>
            )}
            
            {(formData.category === "CMS Projects") && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300">Sub Category</label>
                  <select value={formData.additionalFields.subCategory || "WordPress"} onChange={e => setAdditional("subCategory", e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white appearance-none">
                    <option>WordPress</option>
                    <option>Shopify</option>
                  </select>
                </div>
                <div className="space-y-2 mt-4">
                  <label className="text-sm font-bold text-slate-300">Live URL</label>
                  <input type="url" value={formData.externalLink} onChange={e => setFormData({...formData, externalLink: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white" />
                </div>
              </>
            )}

            {(formData.category === "WordPress Plugins & Themes" || formData.category === "Landing Page Bundles") && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-300">Download / Demo Link</label>
                <input type="url" value={formData.externalLink} onChange={e => setFormData({...formData, externalLink: e.target.value})} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white" />
              </div>
            )}
          </div>

          <button disabled={loading} type="submit" className="bg-primary hover:bg-primary/90 text-background-dark font-black py-3 px-8 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2">
            {loading ? "Saving..." : "Save Project"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">Projects Catalog</h1>
        <button
          onClick={() => {
            setView("create");
            setError("");
            setSuccess("");
            setFormData({ title: "", description: "", category: categories[0], thumbnail: "", images: [], externalLink: "", additionalFields: {} });
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
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {projects.map(p => (
              <tr key={p.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-bold text-white">{p.title}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-white/10 text-white">
                    {p.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="text-primary hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
                      onClick={() => { setFormData(p); setView("edit"); setError(""); setSuccess(""); }}
                    >
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button
                      className="text-red-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-red-500/20"
                      onClick={() => handleDelete(p.id)}
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan="3" className="px-6 py-8 text-center text-muted italic">No projects found. Add one.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
