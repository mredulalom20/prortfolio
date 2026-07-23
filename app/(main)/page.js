import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase";
import ContactForm from "../components/ContactForm";
import Footer from "../components/Footer";
import MobileCarousel from "../components/MobileCarousel";
import Navbar from "../components/Navbar";
import ProjectGrid from "../components/ProjectGrid";
import SmartImage from "../components/SmartImage";
import TestimonialsCarousel from "../components/TestimonialsCarousel";

export const dynamic = "force-dynamic";

async function getProjects() {
  try {
    let { data, error } = await supabaseAdmin
      .from("projects")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error && error.message?.includes("deleted_at")) {
      const fallback = await supabaseAdmin
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
      data = fallback.data;
      error = fallback.error;
    }

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

async function getSettings() {
  try {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("key,value")
      .in("key", ["hero_image", "about_hero_image"]);

    if (error) return {};
    return Object.fromEntries((data || []).map((item) => [item.key, item.value]));
  } catch {
    return {};
  }
}

async function getReviews() {
  try {
    let { data, error } = await supabaseAdmin
      .from("reviews")
      .select("*")
      .eq("published", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error && error.message?.includes("deleted_at")) {
      const fallback = await supabaseAdmin
        .from("reviews")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      data = fallback.data;
      error = fallback.error;
    }

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

async function getTeamMembers() {
  try {
    let { data, error } = await supabaseAdmin
      .from("team_members")
      .select("*")
      .eq("published", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error && error.message?.includes("deleted_at")) {
      const fallback = await supabaseAdmin
        .from("team_members")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      data = fallback.data;
      error = fallback.error;
    }

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

const services = [
  {
    href: "/graphic-design",
    icon: "brush",
    title: "Graphic Design",
    text: "Creative branding and visual identity solutions that make your brand stand out.",
    bullets: ["Logo & Identity", "Marketing Collateral", "Social Media Assets"],
  },
  {
    href: "/wordpress-dev",
    icon: "terminal",
    title: "Web Design",
    text: "Custom, high-performance website design focused on speed, security, and conversion.",
    bullets: ["WordPress / Shopify Dev", "E-commerce Solutions", "Speed Optimization"],
  },
  {
    href: "/meta-ads",
    icon: "ads_click",
    title: "Ads Management",
    text: "Data-driven ad campaigns designed to maximize ROI through precise targeting and optimization.",
    bullets: ["Campaign Strategy", "Retargeting Funnels", "Performance Analytics"],
  },
  {
    href: "/ui-design",
    icon: "layers",
    title: "UI/UX Design",
    text: "Intuitive interfaces that enhance user engagement and support business goals.",
    bullets: ["User Research", "Wireframes", "High-Fidelity UI"],
  },
];

const skills = [
  ["Graphic Design", 95, "palette"],
  ["Meta Ads Strategy", 90, "ads_click"],
  ["UI/UX Design", 87, "layers"],
  ["Web Design", 88, "code"],
  ["Brand Strategy", 85, "analytics"],
  ["Shopify / E-commerce", 82, "shopping_cart"],
];

const floatingLogos = [
  { src: "https://cdn.simpleicons.org/meta/C6A75E", alt: "Meta", className: "animate-float-2", style: { top: "12%", left: "4%", width: "100px" } },
  { src: "/icons/photoshop.svg", alt: "Photoshop", className: "animate-float-3", style: { top: "58%", left: "3%", width: "90px", animationDelay: "-3s" } },
  { src: "/icons/illustrator.svg", alt: "Illustrator", className: "animate-float-1", style: { top: "22%", right: "8%", width: "95px", animationDelay: "-6s" } },
  { src: "https://cdn.simpleicons.org/wordpress/C6A75E", alt: "WordPress", className: "animate-float-2", style: { top: "75%", right: "12%", width: "110px", animationDelay: "-5s" } },
  { src: "https://cdn.simpleicons.org/shopify/C6A75E", alt: "Shopify", className: "animate-float-3", style: { top: "42%", left: "44%", width: "85px", animationDelay: "-10s" } },
  { src: "https://cdn.simpleicons.org/figma/C6A75E", alt: "Figma", className: "animate-float-1", style: { top: "68%", left: "28%", width: "70px", animationDelay: "-2s" } },
  { src: "/icons/indesign.svg", alt: "InDesign", className: "animate-float-2", style: { top: "8%", right: "38%", width: "90px", animationDelay: "-8s" } },
];

export default async function Home() {
  const [projects, settings, reviews, teamMembers] = await Promise.all([
    getProjects(),
    getSettings(),
    getReviews(),
    getTeamMembers(),
  ]);
  const heroImage = settings.hero_image || "/img/profile.jpg";
  const aboutImage = settings.about_hero_image || heroImage;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background-dark text-slate-100">
        <section className="relative flex min-h-screen items-center overflow-hidden pb-10 pt-32" id="home">
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {floatingLogos.map((logo) => (
              <SmartImage
                key={logo.alt}
                src={logo.src}
                alt={logo.alt}
                className={`floating-logo ${logo.className}`}
                style={logo.style}
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(198,167,94,0.14),transparent_45%)]" />
          <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-primary" /></span>
                Available for new projects
              </div>
              <h1 className="mb-6 text-6xl font-black leading-[0.9] tracking-tighter md:text-7xl lg:text-8xl">
                Mobarak Hossain <span className="text-primary">Rinku.</span>
              </h1>
              <p className="mb-8 max-w-xl text-xl font-medium leading-relaxed text-slate-400 md:text-2xl">
                Graphic Designer <span className="text-primary/50">|</span> Web Designer <span className="text-primary/50">|</span> Meta Ads Manager.
              </p>
              <p className="mb-10 max-w-lg text-lg text-muted">
                Results-driven design and marketing that scales your business. I bridge the gap between aesthetics and performance.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="#portfolio" className="inline-flex items-center gap-2 rounded-xl bg-[#C6A75E] px-8 py-4 text-lg font-bold text-background-dark transition-all hover:-translate-y-0.5">
                  View Work <span aria-hidden="true">↗</span>
                </Link>
                <Link href="#contact" className="rounded-xl border-2 border-slate-700 px-8 py-4 text-lg font-bold text-slate-100 transition-all hover:border-primary">
                  Hire Me
                </Link>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 scale-75 rounded-full bg-primary/20 blur-3xl transition-transform duration-700 group-hover:scale-90" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                <SmartImage id="homepage-hero-img" alt="Professional Portrait" className="h-full w-full object-cover" src={heroImage} />
              </div>
              <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border border-white/5 bg-surface p-6 shadow-xl md:block">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/20 p-3 text-primary"><span className="material-symbols-outlined text-3xl">verified</span></div>
                  <div><p className="text-2xl font-black text-white">2+ Years</p><p className="text-sm font-bold uppercase tracking-wider text-muted">Experience</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-900/50 py-14" id="services">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-10 text-center lg:text-left">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">Expertise</h2>
              <h3 className="text-4xl font-black md:text-5xl">My Specialized Services</h3>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {services.map((service, index) => (
                <Link key={service.href} href={service.href} style={{ animationDelay: `${index * 120}ms` }} className="service-card service-card-animate group flex h-full cursor-pointer flex-col gap-6 rounded-2xl border border-white/5 bg-surface p-8 transition-all duration-300 hover:no-underline">
                  <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:border group-hover:border-primary group-hover:bg-[#C6A75E] group-hover:text-background-dark">
                    <span className="material-symbols-outlined text-4xl">{service.icon}</span>
                  </div>
                  <div className="flex flex-1 flex-col">
                    <h4 className="mb-4 text-2xl font-bold transition-colors group-hover:text-primary">{service.title}</h4>
                    <p className="leading-relaxed text-muted">{service.text}</p>
                    <ul className="mt-auto space-y-3 pt-6 text-sm font-medium">
                      {service.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-center gap-2"><span className="material-symbols-outlined text-lg text-primary">check_circle</span>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                  <span className="mt-auto flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-primary opacity-0 transition-opacity group-hover:opacity-100">Learn More <span className="material-symbols-outlined text-sm">arrow_forward</span></span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14" id="about-hero">
          <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 md:grid-cols-2">
            <div className="relative group">
              <div className="absolute -inset-4 rounded-xl bg-primary/20 blur-2xl transition-all duration-700 group-hover:bg-primary/30" />
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-surface">
                <SmartImage id="about-hero-img" alt="Professional portrait of Mobarak" className="h-full w-full object-cover" src={aboutImage} />
              </div>
            </div>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-primary" /></span>
                My Story & Mission
              </div>
              <h2 className="text-4xl font-black leading-[0.95] tracking-tighter md:text-6xl">Crafting Digital <br /><span className="text-primary">Masterpieces</span> That Scale.</h2>
              <p className="text-lg leading-relaxed text-slate-400">I am a multidisciplinary creator dedicated to blending strategic marketing with high-impact visual design.</p>
              <div className="flex flex-wrap gap-6 pt-4 text-slate-300">
                <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">location_on</span><span>Bangladesh | Remote</span></div>
                <div className="flex items-center gap-2"><span className="material-symbols-outlined text-primary">verified</span><span>2+ Years Experience</span></div>
              </div>
              <Link href="/about" className="inline-flex items-center gap-2 rounded-xl border border-primary px-7 py-4 font-bold text-white transition-colors hover:bg-primary/10">
                More About Me <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="border-y border-primary/10 bg-primary/5 py-12">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-12 px-6 text-center md:grid-cols-4">
            {[["2+", "Years Experience"], ["150+", "Projects Delivered"], ["98%", "Client Satisfaction"], ["12M+", "Reach Managed"]].map(([value, label]) => (
              <div key={label}><p className="mb-2 text-5xl font-black text-white">{value}</p><p className="text-xs font-bold uppercase tracking-widest text-primary">{label}</p></div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900/50 py-14" id="hp-skills-section">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-10 text-center">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">Expertise</h2>
              <h3 className="text-4xl font-black md:text-5xl">Technical Proficiency</h3>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">Mastering the intersection of technology and creativity to deliver results that matter.</p>
            </div>
            <div className="grid gap-12 md:grid-cols-2">
              {skills.map(([label, value, icon]) => (
                <div key={label}>
                  <div className="mb-3 flex justify-between"><span className="flex items-center gap-2 font-bold"><span className="material-symbols-outlined text-xl text-primary">{icon}</span>{label}</span><span className="text-lg font-black text-primary">{value}%</span></div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-300" style={{ width: `${value}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24" id="portfolio">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div><h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">Portfolio</h2><h3 className="text-4xl font-black text-white md:text-5xl">Featured Projects</h3></div>
            </div>
            <ProjectGrid initialProjects={projects} />
          </div>
        </section>

        {reviews.length > 0 && (
          <section className="bg-slate-900/50 py-24" id="testimonials">
            <div className="mx-auto max-w-7xl px-6">
              <div className="mb-16 text-center">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">Testimonials</h2>
                <h3 className="text-4xl font-black text-white md:text-5xl">What Clients Say</h3>
              </div>
              <TestimonialsCarousel reviews={reviews} />
            </div>
          </section>
        )}

        {teamMembers.length > 0 && (
          <section className="py-24" id="team">
            <div className="mx-auto max-w-7xl px-6">
              <div className="mb-16 text-center">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">Team</h2>
                <h3 className="text-4xl font-black text-white md:text-5xl">Meet the Team</h3>
              </div>
              <MobileCarousel className="no-scrollbar mx-auto flex max-w-7xl gap-4 overflow-x-auto snap-x snap-mandatory pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible" interval={3200}>
                {teamMembers.slice(0, 4).map((member) => (
                  <Link key={member.id} data-carousel-card href={`/team/${member.id}`} className="group grid min-w-10/12 snap-center grid-cols-[45%_55%] overflow-hidden rounded-xl border border-white/5 bg-surface transition-all hover:-translate-y-1 hover:border-primary/40 hover:no-underline lg:min-w-0">
                    <div className="min-h-36 overflow-hidden bg-background-dark sm:min-h-44">
                      {member.photo_url ? (
                        <SmartImage src={member.photo_url} alt={member.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-4xl font-black text-primary sm:text-5xl">
                          {member.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex min-h-36 flex-col justify-center p-3 sm:min-h-44 sm:p-4">
                      <h4 className="text-lg font-black text-white transition-colors group-hover:text-primary sm:text-xl">{member.name}</h4>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-primary sm:text-xs">{member.role}</p>
                      {member.bio && <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted sm:mt-3 sm:text-sm">{member.bio}</p>}
                      <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary opacity-0 transition-opacity group-hover:opacity-100 sm:text-xs">
                        View Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </MobileCarousel>
            </div>
          </section>
        )}

        <section className="py-14" id="contact">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
              <div>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-primary">Get in touch</h2>
                <h3 className="mb-8 text-5xl font-black text-white">Let&apos;s build something great.</h3>
                <p className="mb-12 max-w-md text-lg leading-relaxed text-muted">Ready to scale your business or start a new creative project? Reach out and let&apos;s discuss how I can help you achieve your goals.</p>
                <div className="space-y-8">
                  <div className="flex items-center gap-6"><div className="flex size-14 items-center justify-center rounded-xl border border-white/5 bg-surface text-primary"><span className="material-symbols-outlined">mail</span></div><div><p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">Email</p><p className="text-lg font-bold text-white">contact@mhrinku.com</p></div></div>
                  <div className="flex items-center gap-6"><div className="flex size-14 items-center justify-center rounded-xl border border-white/5 bg-surface text-primary"><span className="material-symbols-outlined">location_on</span></div><div><p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">Location</p><p className="text-lg font-bold text-white">Dhaka, Bangladesh</p></div></div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-surface p-10 shadow-2xl">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
