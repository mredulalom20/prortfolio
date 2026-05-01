"use client";

import { useState, useEffect } from "react";
import RichTextEditor from "../../components/RichTextEditor";

const EMPTY_FORM = { title: "", slug: "", content: "", featuredImage: "", metaTitle: "", metaDescription: "", published: false };

export default function BlogManagement() {
  const [blogs, setBlogs] = useState([]);
  const [view, setView] = useState("list"); // 'list', 'create', 'edit'
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const fetchBlogs = async () => {
    try {
      const res = await fetch("/api/blogs?admin=1");
      if (res.ok) {
        const data = await res.json();
        setBlogs(Array.isArray(data) ? data : []);
      }
    } catch(e) {}
  };

  useEffect(() => {
    fetchBlogs();
  }, [view]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const isEdit = view === "edit";
      const res = await fetch("/api/blogs", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if(res.ok) {
        setView("list");
        setFormData(EMPTY_FORM);
      }
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this blog post?")) return;
    await fetch("/api/blogs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    fetchBlogs();
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if(res.ok) setFormData({ ...formData, featuredImage: data.url });
    } catch(e) {}
  };

  if (view === "create" || view === "edit") {
    return (
      <div className="max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black">{view === "create" ? "Add New Blog" : "Edit Blog"}</h1>
          <button onClick={() => setView("list")} className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-all text-sm font-bold">
            Back to List
          </button>
        </div>
        
        <form onSubmit={handleSave} className="space-y-6 bg-surface p-8 rounded-2xl border border-white/5">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-sm font-bold text-slate-300">Title</label>
              <input type="text" required value={formData.title} onChange={e => {
                const title = e.target.value;
                const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                setFormData({...formData, title, slug: view === "create" ? slug : formData.slug})
              }} className="w-full bg-slate-900 border-white/10 rounded-xl p-3 focus:border-primary focus:ring-1 text-white" />
            </div>
            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-sm font-bold text-slate-300">Slug</label>
              <input type="text" required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full bg-slate-900 border-white/10 rounded-xl p-3 focus:border-primary focus:ring-1 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-300">Featured Image</label>
            <div className="flex items-center gap-4">
              <input type="file" onChange={handleImageUpload} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all cursor-pointer" />
              {formData.featuredImage && <img src={formData.featuredImage} alt="preview" className="h-12 w-12 rounded object-cover" />}
            </div>
          </div>

          <div className="space-y-2 pb-10">
            <label className="text-sm font-bold text-slate-300">Content</label>
            <RichTextEditor value={formData.content} onChange={val => setFormData({...formData, content: val})} />
          </div>

          <h3 className="text-xl font-bold pt-4 border-t border-white/10">SEO Settings</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-bold text-slate-300">Meta Title</label>
              <input type="text" value={formData.metaTitle} onChange={e => setFormData({...formData, metaTitle: e.target.value})} className="w-full bg-slate-900 border-white/10 rounded-xl p-3 text-white" />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-bold text-slate-300">Meta Description</label>
              <textarea value={formData.metaDescription} onChange={e => setFormData({...formData, metaDescription: e.target.value})} className="w-full bg-slate-900 border-white/10 rounded-xl p-3 text-white" rows="2" />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <input type="checkbox" id="published" checked={formData.published} onChange={e => setFormData({...formData, published: e.target.checked})} className="w-4 h-4 rounded text-primary focus:ring-primary focus:ring-offset-background-dark bg-slate-900 border-white/20" />
            <label htmlFor="published" className="text-sm font-bold text-slate-300">Publish Post</label>
          </div>

          <button disabled={loading} type="submit" className="bg-primary hover:bg-primary/90 text-background-dark font-black py-3 px-8 rounded-xl transition-all disabled:opacity-50">
            {loading ? "Saving..." : view === "edit" ? "Update Blog Post" : "Save Blog Post"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">Blog Posts</h1>
        <button onClick={() => { setView("create"); setFormData(EMPTY_FORM); }} className="bg-primary hover:bg-primary/90 text-background-dark font-bold py-2 px-6 rounded-lg transition-all flex items-center gap-2 text-sm shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined text-lg">add</span> Create Post
        </button>
      </div>

      <div className="bg-surface rounded-2xl border border-white/5 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-white/5 uppercase text-xs font-bold tracking-wider text-slate-400">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {blogs.map(blog => (
              <tr key={blog.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 font-bold text-white">{blog.title}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${blog.published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {blog.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-6 py-4">{new Date(blog.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="text-primary hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5" onClick={() => { setFormData({ ...EMPTY_FORM, ...blog }); setView("edit"); }} title="Edit">
                      <span className="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button className="text-red-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-red-500/20" onClick={() => handleDelete(blog.id)} title="Delete">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {blogs.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-muted italic">No blogs found. Create one.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
