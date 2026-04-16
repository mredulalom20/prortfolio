import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const SAMPLE_BLOGS = [
  {
    title: "Meta Ads-এ ROAS বাড়ানোর ৫টি প্রমাণিত কৌশল",
    slug: "meta-ads-roas-strategies",
    content: `<h2>Meta Ads থেকে সত্যিকারের ফলাফল পেতে হলে কী করবেন?</h2>
<p>অনেক ব্যবসায়ী শুধু বিজ্ঞাপন চালান, কিন্তু সঠিক ফলাফল পান না। এখানে আমার ৫টি প্রমাণিত কৌশল শেয়ার করছি যা আমার ক্লায়েন্টদের ROAS ৪x পর্যন্ত বাড়িয়েছে।</p>
<h3>১. Lookalike Audience সঠিকভাবে ব্যবহার করুন</h3>
<p>আপনার সেরা কাস্টমারদের তালিকা আপলোড করে 1-2% Lookalike Audience তৈরি করুন। এটি সবচেয়ে কার্যকর টার্গেটিং পদ্ধতি।</p>
<h3>২. Creative Testing — A/B Test করুন সব সময়</h3>
<p>একটি ad creative দিয়ে শুরু করলে অনেক সুযোগ হাতছাড়া হয়। কমপক্ষে ৩-৫টি আলাদা creative test করুন প্রথম সপ্তাহে।</p>
<h3>৩. Retargeting Funnel তৈরি করুন</h3>
<p>যারা আপনার ওয়েবসাইটে এসে কিনেননি তাদের জন্য আলাদা retargeting campaign চালান।</p>
<h3>৪. Budget Optimization — CBO ব্যবহার করুন</h3>
<p>Campaign Budget Optimization ব্যবহার করলে Meta নিজেই সবচেয়ে ভালো performing ad set-এ বাজেট বরাদ্দ করে।</p>
<h3>৫. প্রতিদিন Data Analysis করুন</h3>
<p>Frequency, CTR, CPC প্রতিদিন মনিটর করুন এবং প্রয়োজন মতো পরিবর্তন করুন।</p>
<p><strong>মনে রাখবেন:</strong> Meta Ads একটি চলমান প্রক্রিয়া। নিয়মিত পরীক্ষা-নিরীক্ষা করলেই সেরা ফলাফল পাবেন।</p>`,
    featuredImage: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80",
    metaTitle: "Meta Ads-এ ROAS বাড়ানোর ৫টি কৌশল | MHR",
    metaDescription: "Meta Ads থেকে সর্বোচ্চ Return পেতে এই ৫টি প্রমাণিত কৌশল অনুসরণ করুন।",
    published: true,
  },
  {
    title: "কেন আপনার ব্যবসার একটি প্রফেশনাল Website দরকার",
    slug: "why-your-business-needs-professional-website",
    content: `<h2>ডিজিটাল যুগে ওয়েবসাইট কেন অপরিহার্য?</h2>
<p>আজকের প্রতিযোগিতামূলক বাজারে একটি প্রফেশনাল ওয়েবসাইট শুধু একটি সুবিধা নয়, এটি আপনার ব্যবসার অস্তিত্বের জন্য প্রয়োজনীয়।</p>
<h3>বিশ্বাসযোগ্যতা তৈরি করে</h3>
<p>৭৫% মানুষ একটি কোম্পানির বিশ্বাসযোগ্যতা তার ওয়েবসাইটের ডিজাইন দেখে বিচার করেন। একটি পুরনো বা খারাপ ডিজাইনের ওয়েবসাইট আপনার ব্যবসার ক্ষতি করে।</p>
<h3>২৪/৭ বিক্রয় প্রতিনিধি</h3>
<p>একটি ভালো ওয়েবসাইট ঘুমালেও আপনার হয়ে কাজ করে। রাত ৩টায়ও কাস্টমার আপনার সেবা সম্পর্কে জানতে পারে।</p>
<h3>SEO-র মাধ্যমে বিনামূল্যে ট্র্যাফিক</h3>
<p>সঠিকভাবে অপ্টিমাইজ করা ওয়েবসাইট Google-এ র‌্যাংক করে এবং বিনামূল্যে organic traffic আনে।</p>
<h3>WordPress vs Shopify — কোনটি আপনার জন্য?</h3>
<p>সার্ভিস বা কন্টেন্ট বেসড ব্যবসার জন্য WordPress এবং E-commerce-এর জন্য Shopify সবচেয়ে ভালো।</p>
<p>আপনার ব্যবসার জন্য সঠিক সমাধান জানতে আজই আমার সাথে যোগাযোগ করুন।</p>`,
    featuredImage: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80",
    metaTitle: "কেন আপনার ব্যবসার প্রফেশনাল Website দরকার | MHR",
    metaDescription: "একটি প্রফেশনাল ওয়েবসাইট কীভাবে আপনার ব্যবসাকে এগিয়ে নিয়ে যায় তা জানুন।",
    published: true,
  },
];

export async function GET() {
  // Seed sample blogs if table is empty
  try {
    const { data: existing } = await supabaseAdmin.from("blogs").select("id").limit(1);
    if (!existing || existing.length === 0) {
      await supabaseAdmin.from("blogs").insert(SAMPLE_BLOGS);
    }
    const { data, error } = await supabaseAdmin
      .from("blogs")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (error) return NextResponse.json([], { status: 200 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { data, error } = await supabaseAdmin.from("blogs").insert([body]).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
