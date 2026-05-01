import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MobileCarousel from "../components/MobileCarousel";

export const metadata = {
  title: "Blog | MHR",
  description: "Insights on Meta Ads, web design, and digital marketing by Mobarak Hossain Rinku.",
};

async function getBlogs() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/blogs?published=eq.true&order=created_at.desc`, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const blogs = await getBlogs();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background-dark pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-white">Blog</h1>
          <p className="text-muted mb-12">Insights on Meta Ads, web design, and digital marketing.</p>

          {blogs.length === 0 ? (
            <p className="text-muted text-center py-20">No posts published yet. Check back soon.</p>
          ) : (
            <MobileCarousel className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 lg:grid lg:grid-cols-2 lg:overflow-visible" interval={3000}>
              {blogs.map((blog) => (
                <Link key={blog.id} href={`/blog/${blog.slug}`} className="blog-card group block bg-surface border border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 transition-all min-w-[85vw] sm:min-w-[60vw] md:min-w-[40vw] lg:min-w-0 flex-shrink-0 snap-center" data-carousel-card>
                  {blog.featuredImage && (
                    <div className="aspect-[4/3] lg:aspect-[12/5] overflow-hidden">
                      <img
                        src={blog.featuredImage}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <p className="text-xs text-muted uppercase tracking-widest mb-3">
                      {new Date(blog.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                    <h2 className="text-xl font-bold text-white group-hover:text-primary transition-colors leading-snug">{blog.title}</h2>
                    {blog.metaDescription && (
                      <p className="text-muted text-sm mt-3 line-clamp-2">{blog.metaDescription}</p>
                    )}
                  </div>
                </Link>
              ))}
            </MobileCarousel>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
