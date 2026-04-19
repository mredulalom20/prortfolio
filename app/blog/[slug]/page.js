import { notFound } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

async function getBlog(slug) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/blogs?slug=eq.${slug}&published=eq.true&limit=1`, {
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
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) return {};
  return {
    title: blog.metaTitle || blog.title,
    description: blog.metaDescription || "",
    openGraph: {
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || "",
      images: blog.featuredImage ? [blog.featuredImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) notFound();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background-dark pt-32 pb-20">
        {blog.featuredImage && (
          <div className="w-full h-72 md:h-96 overflow-hidden mb-12">
            <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-xs text-muted uppercase tracking-widest mb-4">
            {new Date(blog.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-10 leading-tight">{blog.title}</h1>
          <article
            className="prose prose-invert prose-lg max-w-none text-slate-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
