const fs = require('fs');

let html = fs.readFileSync('public/index.html', 'utf-8');

const heroStart = html.indexOf('<!-- Hero Section -->');
const portfolioStart = html.indexOf('<!-- Portfolio Section -->');
const statsStart = html.indexOf('<!-- Contact Section -->');
const footerStart = html.indexOf('<!-- Footer -->');

let heroAndServices = html.substring(heroStart, portfolioStart);
let statsAndContact = html.substring(statsStart, footerStart);

function toStyleObject(style) {
  const entries = style
    .split(';')
    .map(rule => rule.trim())
    .filter(Boolean)
    .map(rule => {
      const colon = rule.indexOf(':');
      if (colon === -1) return null;
      const key = rule.slice(0, colon).trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      const value = rule.slice(colon + 1).trim();
      return `${JSON.stringify(key)}: ${JSON.stringify(value)}`;
    })
    .filter(Boolean);
  return `style={{${entries.join(', ')}}}`;
}

function jsxify(content) {
  content = content.replace(/class="/g, 'className="');
  content = content.replace(/tabindex="/g, 'tabIndex="');
  content = content.replace(/for="/g, 'htmlFor="');
  content = content.replace(/viewBox="/g, 'viewBox="');
  content = content.replace(/fill-rule="/g, 'fillRule="');
  content = content.replace(/clip-rule="/g, 'clipRule="');
  content = content.replace(/style="([^"]*)"/g, (_, style) => toStyleObject(style));
  content = content.replace(/<!--(.*?)-->/g, '{/*$1*/}');
  content = content.replace(/<img([^>]*)>/g, (m, a) => `<img${a.replace(/\s*\/$/, '')} />`);
  content = content.replace(/<input([^>]*)>/g, (m, a) => `<input${a.replace(/\s*\/$/, '')} />`);
  content = content.replace(/<br>/g, '<br />');
  content = content.replace(/<hr>/g, '<hr />');
  content = content.replace(/<(style|script)>([\s\S]*?)<\/(style|script)>/g, (_, tag, body) =>
    `<${tag} dangerouslySetInnerHTML={{__html: ${JSON.stringify(body)}}} />`
  );
  return content;
}

const finalJsx = `import Link from "next/link";
import { supabaseAdmin } from "../../lib/supabase";
import ProjectGrid from "../components/ProjectGrid";
import Navbar from "../components/Navbar";

export const dynamic = 'force-dynamic';

export default async function Home() {
  let { data: projects, error } = await supabaseAdmin
    .from("projects")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error && error.message?.includes("deleted_at")) {
    const fallback = await supabaseAdmin
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });
    projects = fallback.data || [];
  } else if (error) {
    projects = [];
  }

  return (
    <>
      <Navbar />
      ${jsxify(heroAndServices)}

      {/* Portfolio Section */}
      <section className="py-24" id="portfolio">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div>
              <h2 className="text-primary font-bold tracking-widest uppercase text-sm mb-3">Portfolio</h2>
              <h3 className="text-4xl md:text-5xl font-black text-white">Featured Projects</h3>
            </div>
          </div>
          <ProjectGrid initialProjects={projects} />
        </div>
      </section>

      ${jsxify(statsAndContact)}
    </>
  );
}
`;

fs.writeFileSync('app/(main)/page.js', finalJsx);
console.log('Successfully generated dynamic page.js');
