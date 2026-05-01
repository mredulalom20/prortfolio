"use client";
import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="size-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-background-dark font-black text-xl">M</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight dark:text-white">MHR</h2>
          </Link>
          <div className="hidden md:flex items-center gap-12 font-light tracking-wide">
            <Link className="text-xs uppercase tracking-widest text-[#EDEDED] border-b border-[#C6A75E] pb-1" href="#home">Home</Link>
            <Link className="text-xs uppercase tracking-widest text-[#888888] hover:text-[#EDEDED] transition-colors" href="/about">About</Link>
            <div className="dropdown relative">
              <button className="text-xs uppercase tracking-widest text-[#888888] hover:text-[#EDEDED] transition-colors flex items-center gap-1">
                Services <span className="material-symbols-outlined text-sm">expand_more</span>
              </button>
              <div className="dropdown-menu absolute top-full left-1/2 -translate-x-1/2 pt-6 w-56">
                <div className="bg-[#121212] border border-white/5 rounded shadow-2xl p-2 font-light">
                  <Link href="/graphic-design" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
                    <span className="material-symbols-outlined text-[#C6A75E] text-lg">brush</span>
                    <span className="text-xs uppercase tracking-widest text-[#888888]">Graphic Design</span>
                  </Link>
                  <Link href="/ui-design" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
                    <span className="material-symbols-outlined text-[#C6A75E] text-lg">layers</span>
                    <span className="text-xs uppercase tracking-widest text-[#888888]">UI/UX Design</span>
                  </Link>
                  <Link href="/meta-ads" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
                    <span className="material-symbols-outlined text-[#C6A75E] text-lg">ads_click</span>
                    <span className="text-xs uppercase tracking-widest text-[#888888]">Meta Ads</span>
                  </Link>
                  <Link href="/wordpress-dev" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
                    <span className="material-symbols-outlined text-[#C6A75E] text-lg">terminal</span>
                    <span className="text-xs uppercase tracking-widest text-[#888888]">CMS Dev</span>
                  </Link>
                  <Link href="/seo" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
                    <span className="material-symbols-outlined text-[#C6A75E] text-lg">query_stats</span>
                    <span className="text-xs uppercase tracking-widest text-[#888888]">SEO Service</span>
                  </Link>
                </div>
              </div>
            </div>
            <Link className="text-xs uppercase tracking-widest text-[#888888] hover:text-[#EDEDED] transition-colors" href="/#portfolio">Portfolio</Link>
            <Link className="text-xs uppercase tracking-widest text-[#888888] hover:text-[#EDEDED] transition-colors" href="/#testimonials">Testimonials</Link>
            <Link className="text-xs uppercase tracking-widest text-[#888888] hover:text-[#EDEDED] transition-colors" href="/blog">Blog</Link>
            <Link className="text-xs uppercase tracking-widest text-[#888888] hover:text-[#EDEDED] transition-colors" href="/#contact">Contact</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/#contact" className="hidden flex sm:flex items-center justify-center border border-[#C6A75E] text-[#EDEDED] hover:bg-[#C6A75E]/5 transition-colors font-medium text-xs tracking-widest uppercase px-6 py-2 h-10 rounded">
              Hire Me
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex flex-col gap-1.5 p-2"
            >
              <span className="w-6 h-px bg-white transition-all xl-bar1" style={menuOpen ? {transform: 'rotate(45deg) translate(4px, 4px)'} : {}}></span>
              <span className="w-6 h-px bg-white transition-all xl-bar2" style={menuOpen ? {opacity: 0} : {}}></span>
              <span className="w-6 h-px bg-white transition-all xl-bar3" style={menuOpen ? {transform: 'rotate(-45deg) translate(4px, -4px)'} : {}}></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        style={{ transform: menuOpen ? "translateX(0)" : "translateX(100%)", transition: "transform 0.5s cubic-bezier(0.16,1,0.3,1)" }}
        className="fixed inset-0 z-40 bg-[#121212] pt-24 px-8 border-l border-white/5"
      >
        <div className="flex flex-col gap-8 text-xl font-light tracking-wide">
          <Link onClick={() => setMenuOpen(false)} className="text-[#EDEDED] pb-2 border-b border-white/5 uppercase text-sm tracking-widest" href="/#home">Home</Link>
          <Link onClick={() => setMenuOpen(false)} className="text-[#888888] hover:text-[#EDEDED] transition-colors pb-2 border-b border-white/5 uppercase text-sm tracking-widest" href="/about">About</Link>
          <div className="pb-2 border-b border-white/5">
            <span className="text-[#888888] hover:text-[#EDEDED] transition-colors uppercase text-sm tracking-widest">Services</span>
            <div className="flex flex-col gap-4 mt-6 ml-4 text-sm font-light">
              <Link onClick={() => setMenuOpen(false)} className="text-[#888888] hover:text-white transition-colors flex items-center gap-3" href="/graphic-design"><span className="material-symbols-outlined text-base">brush</span> Graphic Design</Link>
              <Link onClick={() => setMenuOpen(false)} className="text-[#888888] hover:text-white transition-colors flex items-center gap-3" href="/ui-design"><span className="material-symbols-outlined text-base">layers</span> UI/UX Design</Link>
              <Link onClick={() => setMenuOpen(false)} className="text-[#888888] hover:text-white transition-colors flex items-center gap-3" href="/meta-ads"><span className="material-symbols-outlined text-base">ads_click</span> Meta Ads</Link>
              <Link onClick={() => setMenuOpen(false)} className="text-[#888888] hover:text-white transition-colors flex items-center gap-3" href="/wordpress-dev"><span className="material-symbols-outlined text-base">terminal</span> CMS Dev</Link>
              <Link onClick={() => setMenuOpen(false)} className="text-[#888888] hover:text-white transition-colors flex items-center gap-3" href="/seo"><span className="material-symbols-outlined text-base">query_stats</span> SEO Service</Link>
            </div>
          </div>
          <Link onClick={() => setMenuOpen(false)} className="text-[#888888] hover:text-[#EDEDED] transition-colors pb-2 border-b border-white/5 uppercase text-sm tracking-widest" href="/#portfolio">Portfolio</Link>
          <Link onClick={() => setMenuOpen(false)} className="text-[#888888] hover:text-[#EDEDED] transition-colors pb-2 border-b border-white/5 uppercase text-sm tracking-widest" href="/blog">Blog</Link>
          <Link onClick={() => setMenuOpen(false)} className="text-[#888888] hover:text-[#EDEDED] transition-colors pb-2 border-b border-white/5 uppercase text-sm tracking-widest" href="/#contact">Contact</Link>
          <Link onClick={() => setMenuOpen(false)} href="/#contact" className="border border-[#C6A75E] text-[#EDEDED] hover:bg-[#C6A75E]/5 py-4 px-8 rounded text-sm text-center tracking-widest uppercase mt-4">Hire Me</Link>
        </div>
      </div>
    </>
  );
}
