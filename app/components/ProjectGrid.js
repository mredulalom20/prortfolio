"use client";

import { useState } from "react";
import Link from "next/link";

export default function ProjectGrid({ initialProjects }) {
  const [filter, setFilter] = useState("All");

  // Determine standard filter buttons based on data or fixed design
  const filters = ["All", "Design", "WordPress", "Ads", "SEO"];

  const filteredProjects = initialProjects.filter(p => {
    if (filter === "All") return true;
    if (filter === "Design") return p.category.includes("Design");
    if (filter === "WordPress") return p.category.includes("WordPress") || p.category.includes("CMS");
    if (filter === "Ads") return p.category.includes("Ads");
    if (filter === "SEO") return Array.isArray(p.service) && p.service.includes("seo");
    return true;
  });

  return (
    <>
      <div className="flex flex-wrap gap-4 mb-16">
        {filters.map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2.5 rounded tracking-widest text-xs uppercase transition-all duration-300 font-light ${filter === f ? 'bg-[#C6A75E] text-[#121212]' : 'border border-[#C6A75E]/50 text-[#888888] hover:border-[#C6A75E] hover:text-[#EDEDED]'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredProjects.map(project => (
          <div key={project.id} className="preview-card group relative aspect-[4/3] lg:aspect-[12/5] bg-[#1A1A1A] rounded overflow-hidden border border-white/5 hover:border-[#C6A75E]/30 transition-colors duration-500 hover:shadow-[0_0_30px_rgba(198,167,94,0.05)]">
            <img 
              alt={project.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale contrast-125 group-hover:grayscale-0" 
              src={project.thumbnail || (project.images && project.images[0]) || "/img/placeholder.jpg"}
            />
            <div className="absolute inset-0 bg-[#121212]/90 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm">
              <h5 className="text-2xl font-light tracking-tight mb-3 text-[#EDEDED]">{project.title}</h5>
              <p className="text-[#888888] font-light text-sm mb-8 leading-relaxed max-w-sm">{project.description}</p>
              
              {project.externalLink ? (
                <a href={project.externalLink} target="_blank" rel="noopener noreferrer" className="border border-[#C6A75E] text-[#EDEDED] hover:bg-[#C6A75E]/5 tracking-widest uppercase text-xs px-8 py-3 rounded transition-all duration-300 flex items-center gap-3">
                   View Project <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              ) : (
                <Link href={`/projects/${project.id}`} className="border border-[#C6A75E] text-[#EDEDED] hover:bg-[#C6A75E]/5 tracking-widest uppercase text-xs px-8 py-3 rounded transition-all duration-300 flex items-center gap-3">
                   Case Study <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              )}
            </div>
          </div>
        ))}
        {filteredProjects.length === 0 && (
          <div className="col-span-full py-16 text-center text-[#888888] font-light tracking-widest uppercase text-sm border border-white/5 bg-[#1A1A1A] rounded">
            No projects found in archive.
          </div>
        )}
      </div>
    </>
  );
}
