"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "../../../lib/adminFetch";
import { getMaxUploadBytes, getFileTooLargeMessage, uploadDirectToStorage } from "../../../lib/uploadClient";
import SmartImage from "../../components/SmartImage";

const SERVICES = [
  { label: "Graphic Design", value: "graphic-design", icon: "brush" },
  { label: "UI/UX Design", value: "ui-design", icon: "layers" },
  { label: "Meta Ads", value: "meta-ads", icon: "ads_click" },
  { label: "Web Design", value: "wordpress-dev", icon: "terminal" },
  { label: "SEO", value: "seo", icon: "query_stats" },
];

function Toast({ message, type }) {
  if (!message) return null;
  const colors = type === "error"
    ? "bg-red-500/10 border-red-500/30 text-red-400"
    : "bg-green-500/10 border-green-500/30 text-green-400";

  return (
    <div className={`fixed bottom-6 right-6 z-50 rounded-xl border px-5 py-3 text-sm font-bold shadow-xl ${colors}`}>
      {message}
    </div>
  );
}

export default function ServicesAdmin() {
  const [selectedService, setSelectedService] = useState(SERVICES[0].value);
  const [certificates, setCertificates] = useState([]);
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const selectedMeta = SERVICES.find((service) => service.value === selectedService) || SERVICES[0];

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "success" }), 3000);
  }, []);

  const fetchCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch(`/api/service-certifications?service=${selectedService}`);
      const data = await res.json();
      setCertificates(Array.isArray(data) ? data : []);
    } catch {
      setCertificates([]);
      showToast("Failed to load certificates.", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedService, showToast]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > getMaxUploadBytes()) {
      showToast(getFileTooLargeMessage(), "error");
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const { url } = await uploadDirectToStorage(file);
      setImage(url || "");
      showToast("Image uploaded.");
    } catch (error) {
      showToast(error?.message || "Image upload failed.", "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return showToast("Title is required.", "error");
    if (!image.trim()) return showToast("Image is required.", "error");

    setSaving(true);
    try {
      const res = await adminFetch("/api/service-certifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: selectedService,
          title: title.trim(),
          image: image.trim(),
          sort_order: certificates.length,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed.");

      setTitle("");
      setImage("");
      await fetchCertificates();
      showToast("Certificate added.");
    } catch (error) {
      showToast(error?.message || "Save failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  const updateCertificate = async (certificate, updates) => {
    const res = await adminFetch("/api/service-certifications", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...certificate, ...updates }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Update failed.");
    return data;
  };

  const handleTitleSave = async (certificate, nextTitle) => {
    try {
      if (!nextTitle.trim()) return showToast("Title is required.", "error");
      await updateCertificate(certificate, { title: nextTitle.trim() });
      setCertificates((prev) => prev.map((item) => item.id === certificate.id ? { ...item, title: nextTitle.trim() } : item));
      showToast("Certificate updated.");
    } catch (error) {
      showToast(error?.message || "Update failed.", "error");
    }
  };

  const handleDelete = async (certificate) => {
    if (!confirm(`Delete "${certificate.title}"?`)) return;

    try {
      const res = await adminFetch("/api/service-certifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: certificate.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || "Delete failed.");
      }
      await fetchCertificates();
      showToast("Certificate deleted.");
    } catch (error) {
      showToast(error?.message || "Delete failed.", "error");
    }
  };

  const moveCertificate = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= certificates.length) return;

    const current = certificates[index];
    const target = certificates[targetIndex];
    const currentOrder = current.sort_order ?? index;
    const targetOrder = target.sort_order ?? targetIndex;

    try {
      await Promise.all([
        updateCertificate(current, { sort_order: targetOrder }),
        updateCertificate(target, { sort_order: currentOrder }),
      ]);
      await fetchCertificates();
      showToast("Order updated.");
    } catch (error) {
      showToast(error?.message || "Order update failed.", "error");
    }
  };

  return (
    <div>
      <Toast message={toast.message} type={toast.type} />

      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-black text-white">Service Certifications</h1>
        <p className="text-slate-400">Add certification and qualification images for each service page. Images display as 500x500 squares.</p>
      </div>

      <div className="mb-8 rounded-2xl border border-white/5 bg-surface p-6">
        <label className="text-sm font-bold text-slate-300">Select Service</label>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-5">
          {SERVICES.map((service) => {
            const active = selectedService === service.value;
            return (
              <button
                key={service.value}
                type="button"
                onClick={() => setSelectedService(service.value)}
                className={`rounded-xl border p-4 text-left transition-all ${active ? "border-primary/40 bg-primary/15 text-primary" : "border-white/10 text-slate-400 hover:border-white/20 hover:text-white"}`}
              >
                <span className="material-symbols-outlined mb-2 block">{service.icon}</span>
                <span className="text-xs font-bold">{service.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleAdd} className="mb-10 max-w-4xl rounded-2xl border border-white/5 bg-surface p-8">
        <h2 className="mb-1 flex items-center gap-2 text-xl font-bold text-white">
          <span className="material-symbols-outlined text-primary">workspace_premium</span>
          Add Certificate For {selectedMeta.label}
        </h2>
        <p className="mb-6 text-sm text-slate-400">Upload certificate image and add title shown below it.</p>

        <div className="grid gap-6 md:grid-cols-[1fr_220px]">
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-white focus:border-primary focus:outline-none"
                placeholder="e.g. Google Analytics Certification"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-300">Image *</label>
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/20 p-4 transition-colors hover:border-primary/40 ${uploading ? "pointer-events-none opacity-50" : ""}`}>
                <span className="material-symbols-outlined text-primary">add_photo_alternate</span>
                <span className="text-sm text-slate-400">{uploading ? "Uploading…" : "Click to upload certificate image"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-xs text-white focus:border-primary focus:outline-none"
                placeholder="Or paste image URL"
              />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900 p-3">
            <div className="aspect-square overflow-hidden rounded-lg bg-white/5">
              {image ? (
                <SmartImage src={image} alt="Certificate preview" width={500} height={500} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-600">
                  <span className="material-symbols-outlined text-5xl">image</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || uploading}
          className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-8 py-3 font-black text-background-dark transition-all hover:bg-primary/90 disabled:opacity-50"
        >
          <span className="material-symbols-outlined">add_circle</span>
          {saving ? "Saving…" : "Add Certificate"}
        </button>
      </form>

      <div className="rounded-2xl border border-white/5 bg-surface p-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white">{selectedMeta.label} Certificates</h2>
            <p className="mt-1 text-sm text-slate-400">{certificates.length} item{certificates.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400">Loading…</div>
        ) : certificates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center text-slate-500">
            No certificates added for this service yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {certificates.map((certificate, index) => (
              <div key={certificate.id} className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900">
                <div className="aspect-square overflow-hidden bg-white/5">
                  <SmartImage src={certificate.image} alt={certificate.title} width={500} height={500} className="h-full w-full object-cover" />
                </div>
                <div className="space-y-4 p-5">
                  <input
                    type="text"
                    defaultValue={certificate.title}
                    onBlur={(e) => e.target.value !== certificate.title && handleTitleSave(certificate, e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-surface p-3 text-sm font-bold text-white focus:border-primary focus:outline-none"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => moveCertificate(index, -1)}
                        disabled={index === 0}
                        className="rounded-lg border border-white/10 p-2 text-slate-300 transition-colors hover:border-primary hover:text-primary disabled:opacity-30"
                        title="Move up"
                      >
                        <span className="material-symbols-outlined text-lg">arrow_upward</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveCertificate(index, 1)}
                        disabled={index === certificates.length - 1}
                        className="rounded-lg border border-white/10 p-2 text-slate-300 transition-colors hover:border-primary hover:text-primary disabled:opacity-30"
                        title="Move down"
                      >
                        <span className="material-symbols-outlined text-lg">arrow_downward</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(certificate)}
                      className="rounded-lg border border-red-500/20 p-2 text-red-400 transition-colors hover:bg-red-500/10 hover:text-white"
                      title="Delete"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
