import { notFound } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

async function getProject(id) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/projects?id=eq.${id}&limit=1`, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data[0] || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) return {};

  return {
    title: project.title,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: project.thumbnail ? [project.thumbnail] : project.images || [],
    },
  };
}

export default async function ProjectCaseStudyPage({ params }) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) notFound();

  const images = Array.isArray(project.images) ? project.images.filter(Boolean) : [];
  const serviceLabels = Array.isArray(project.service) ? project.service : [];
  const heroImage = project.thumbnail || images[0] || null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background-dark pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mb-12">
            <p className="text-xs text-muted uppercase tracking-widest mb-4">Case Study</p>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">{project.title}</h1>
            <p className="text-lg text-slate-300 leading-relaxed">{project.description}</p>
            <div className="flex flex-wrap gap-2 mt-6">
              {serviceLabels.length > 0 ? (
                serviceLabels.map((service) => (
                  <span key={service} className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                    {service}
                  </span>
                ))
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/10">
                  {project.category}
                </span>
              )}
            </div>
            {project.externalLink && (
              <a
                href={project.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-8 bg-primary text-background-dark font-bold px-6 py-3 rounded-lg"
              >
                View Live Project
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </a>
            )}
          </div>

          {heroImage && (
            <div className="mb-12 overflow-hidden rounded-3xl border border-white/5 bg-surface">
              <img src={heroImage} alt={project.title} className="w-full max-h-[640px] object-cover" />
            </div>
          )}

          {images.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {images.slice(1).map((image, index) => (
                <div key={`${image}-${index}`} className="overflow-hidden rounded-2xl border border-white/5 bg-surface">
                  <img src={image} alt={`${project.title} preview ${index + 2}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {project.additionalFields && Object.keys(project.additionalFields).length > 0 && (
            <section className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(project.additionalFields).map(([key, value]) => (
                <div key={key} className="rounded-2xl border border-white/5 bg-surface p-6">
                  <p className="text-xs uppercase tracking-widest text-muted mb-2">{key}</p>
                  <p className="text-white leading-relaxed">{typeof value === "string" ? value : JSON.stringify(value)}</p>
                </div>
              ))}
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
