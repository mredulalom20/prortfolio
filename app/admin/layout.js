"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabaseClient";

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let active = true;

    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (!active) return;
      const nextUser = data.session?.user || null;
      setUser(nextUser);
      setLoading(false);

      if (!nextUser) {
        router.push("/login");
      } else if (nextUser.user_metadata?.role && nextUser.user_metadata.role !== "admin") {
        router.push("/");
      }
    });

    const { data: listener } = supabaseBrowser.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user || null;
      setUser(nextUser);
      if (!nextUser) {
        router.push("/login");
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  if (loading) return <div className="min-h-screen text-white flex items-center justify-center">Loading...</div>;
  if (!user) return null;

  const navLinks = [
    { name: "Dashboard",    href: "/admin",          icon: "dashboard" },
    { name: "Blog Posts",   href: "/admin/blog",     icon: "article" },
    { name: "Projects",     href: "/admin/projects", icon: "folder" },
    { name: "Products",     href: "/admin/products", icon: "extension" },
    { name: "Reviews",      href: "/admin/reviews",  icon: "format_quote" },
    { name: "Our Team",     href: "/admin/team",     icon: "groups" },
    { name: "Contacts",     href: "/admin/contacts", icon: "inbox" },
    { name: "Social Links", href: "/admin/social",   icon: "share" },
    { name: "Media",        href: "/admin/media",    icon: "perm_media" },
    { name: "Users",        href: "/admin/users",    icon: "manage_accounts" },
  ];

  return (
    <div className="flex min-h-screen bg-background-dark text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-white/5 p-6 flex flex-col hidden md:flex">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="text-background-dark font-bold">A</span>
          </div>
          <span className="text-xl font-bold tracking-tight">Admin Panel</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${active ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-white/5 text-slate-400 hover:text-white'}`}
              >
                <span className="material-symbols-outlined">{link.icon}</span>
                {link.name}
              </Link>
            )
          })}
        </nav>

        <button
          onClick={() => supabaseBrowser.auth.signOut()}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 text-red-400 mt-auto transition-all"
        >
          <span className="material-symbols-outlined">logout</span>
          Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-900/50 p-8">
        {children}
      </main>
    </div>
  );
}
