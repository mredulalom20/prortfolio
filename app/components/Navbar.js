"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const serviceLinks = [
  { href: "/graphic-design", glyph: "✦", label: "Graphic Design" },
  { href: "/ui-design", glyph: "▣", label: "UI/UX Design" },
  { href: "/meta-ads", glyph: "◉", label: "Ads Expert" },
  { href: "/wordpress-dev", glyph: "⌘", label: "Web Design" },
  { href: "/seo", glyph: "⌁", label: "SEO Service" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center group cursor-pointer">
            <Image src="/mhr-logo.png" alt="MHR logo" width={126} height={50} priority className="h-8 w-auto transition-transform duration-300 group-hover:scale-105" />
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="/">Home</Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="/about">About</Link>
            <div className="dropdown relative">
              <button className="group text-sm font-medium hover:text-primary transition-colors flex items-center gap-1.5">
                Services <span aria-hidden="true" className="mt-0.5 size-1.5 rotate-45 border-b border-r border-current transition-transform duration-200 group-hover:translate-y-0.5" />
              </button>
              <div className="dropdown-menu absolute top-full left-1/2 -translate-x-1/2 pt-3 w-56">
                <div className="bg-surface border border-white/10 rounded-xl shadow-2xl shadow-black/40 overflow-hidden p-2">
                  {serviceLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors">
                      <span aria-hidden="true" className="text-primary text-xl leading-none w-5 text-center">{link.glyph}</span>
                      <span className="text-sm font-medium">{link.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="/#portfolio">Portfolio</Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="/#testimonials">Testimonials</Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="/blog">Blog</Link>
            <Link className="text-sm font-medium hover:text-primary transition-colors" href="/#contact">Contact</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/#contact" className="hidden sm:block bg-primary hover:bg-primary/90 text-background-dark font-bold py-2.5 px-6 rounded-lg text-sm transition-all shadow-lg shadow-primary/20">
              Hire Me
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="md:hidden flex flex-col gap-1.5 p-2"
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              <span className="w-6 h-0.5 bg-white transition-all" style={menuOpen ? { transform: "rotate(45deg) translate(4px, 4px)" } : {}} />
              <span className="w-6 h-0.5 bg-white transition-all" style={menuOpen ? { opacity: 0 } : {}} />
              <span className="w-6 h-0.5 bg-white transition-all" style={menuOpen ? { transform: "rotate(-45deg) translate(4px, -4px)" } : {}} />
            </button>
          </div>
        </div>
      </nav>

      <div
        style={{ transform: menuOpen ? "translateX(0)" : "translateX(100%)", transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)" }}
        className="fixed inset-0 z-40 bg-background-dark/95 backdrop-blur-xl pt-24 px-8"
      >
        <div className="flex flex-col gap-6 text-2xl font-bold">
          <Link onClick={() => setMenuOpen(false)} className="hover:text-primary transition-colors py-2 border-b border-white/5" href="/">Home</Link>
          <Link onClick={() => setMenuOpen(false)} className="hover:text-primary transition-colors py-2 border-b border-white/5" href="/about">About</Link>
          <div className="py-2 border-b border-white/5">
            <span className="text-primary">Services</span>
            <div className="flex flex-col gap-2 mt-3 ml-4 text-lg">
              {serviceLinks.map((link) => (
                <Link key={link.href} onClick={() => setMenuOpen(false)} className="hover:text-primary transition-colors flex items-center gap-2" href={link.href}>
                  <span aria-hidden="true" className="text-primary text-xl leading-none w-5 text-center">{link.glyph}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <Link onClick={() => setMenuOpen(false)} className="hover:text-primary transition-colors py-2 border-b border-white/5" href="/#portfolio">Portfolio</Link>
          <Link onClick={() => setMenuOpen(false)} className="hover:text-primary transition-colors py-2 border-b border-white/5" href="/blog">Blog</Link>
          <Link onClick={() => setMenuOpen(false)} className="hover:text-primary transition-colors py-2 border-b border-white/5" href="/#contact">Contact</Link>
          <Link onClick={() => setMenuOpen(false)} href="/#contact" className="bg-primary text-background-dark font-bold py-4 px-8 rounded-xl text-lg text-center mt-4 shadow-lg shadow-primary/20">Hire Me</Link>
        </div>
      </div>
    </>
  );
}
