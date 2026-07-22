import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SmartImage from "../components/SmartImage";
import { supabaseAdmin } from "@/lib/supabase";

export const metadata = {
  title: "About | Mobarak Hossain Rinku",
  description: "About Mobarak Hossain Rinku, a graphic designer, CMS developer, and Meta Ads manager.",
};

export const dynamic = "force-dynamic";

async function getAboutImage() {
  try {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "about_hero_image")
      .maybeSingle();

    if (error) return "";
    return data?.value || "";
  } catch {
    return "";
  }
}

export default async function AboutPage() {
  const image = await getAboutImage();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background-dark pt-28 text-slate-100">
        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(198,167,94,0.14),transparent_45%)]" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 md:grid-cols-2">
            <div className="relative">
              <div className="absolute -inset-4 rounded-2xl bg-primary/20 blur-3xl" />
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface aspect-[4/5]">
                <SmartImage src={image || "/img/profile.jpg"} alt="Professional portrait of Mobarak" className="h-full w-full object-cover" />
              </div>
            </div>
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-primary" /></span>
                My Story & Mission
              </div>
              <h1 className="text-5xl font-black tracking-tighter text-white md:text-7xl">Crafting Digital <span className="text-primary">Masterpieces</span> That Scale.</h1>
              <p className="mt-6 text-lg leading-relaxed text-slate-400">
                I am a multidisciplinary creator dedicated to blending strategic marketing with high-impact visual design. My mission is simple: help visionary brands navigate the digital landscape and achieve growth through creative excellence.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  ["5+", "Years Experience"],
                  ["150+", "Projects Delivered"],
                  ["98%", "Client Satisfaction"],
                  ["12M+", "Reach Managed"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border border-white/5 bg-surface p-6">
                    <p className="text-4xl font-black text-white">{value}</p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-widest text-primary">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/#portfolio" className="inline-flex items-center gap-2 rounded-xl bg-[#C6A75E] px-7 py-4 font-bold text-background-dark">
                  View My Work <span className="material-symbols-outlined">arrow_outward</span>
                </Link>
                <Link href="/#contact" className="rounded-xl border border-slate-700 px-7 py-4 font-bold text-white transition-colors hover:border-primary">
                  Contact Me
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-900/50 py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 text-center">
              <p className="mb-3 text-sm font-bold uppercase tracking-[0.3em] text-primary">Experience</p>
              <h2 className="text-4xl font-black text-white md:text-5xl">What I Bring</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {[
                ["Meta Ads Specialist", "Performance marketing strategies focused on ROAS optimization, creative testing, and scaling."],
                ["Graphic Design Lead", "High-converting ad creatives, visual identity systems, and polished digital assets."],
                ["CMS Developer", "SEO-ready business websites, landing pages, and CMS experiences that teams can manage."],
                ["Local Business Partner", "Growth-focused support for e-commerce and service companies in Bangladesh and beyond."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-white/5 bg-surface p-8 transition-colors hover:border-primary/30">
                  <h3 className="text-2xl font-bold text-white">{title}</h3>
                  <p className="mt-3 leading-relaxed text-slate-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
