export const DEFAULT_SERVICES = [
  {
    href: "/graphic-design",
    slug: "graphic-design",
    icon: "brush",
    title: "Graphic Design",
    short_description: "Creative branding and visual identity solutions that make your brand stand out.",
    bullet_points: ["Logo & Identity", "Marketing Collateral", "Social Media Assets"],
    sort_order: 0,
    published: true,
  },
  {
    href: "/wordpress-dev",
    slug: "wordpress-dev",
    icon: "terminal",
    title: "Web Design",
    short_description: "Custom, high-performance website design focused on speed, security, and conversion.",
    bullet_points: ["WordPress / Shopify Dev", "E-commerce Solutions", "Speed Optimization"],
    sort_order: 1,
    published: true,
  },
  {
    href: "/meta-ads",
    slug: "meta-ads",
    icon: "ads_click",
    title: "Ads Management",
    short_description: "Data-driven ad campaigns designed to maximize ROI through precise targeting and optimization.",
    bullet_points: ["Campaign Strategy", "Retargeting Funnels", "Performance Analytics"],
    sort_order: 2,
    published: true,
  },
  {
    href: "/ui-design",
    slug: "ui-design",
    icon: "layers",
    title: "UI/UX Design",
    short_description: "Intuitive interfaces that enhance user engagement and support business goals.",
    bullet_points: ["User Research", "Wireframes", "High-Fidelity UI"],
    sort_order: 3,
    published: true,
  },
];

export const DEFAULT_STATS = [
  { value: "2+", label: "Years Experience", sort_order: 0, published: true },
  { value: "150+", label: "Projects Delivered", sort_order: 1, published: true },
  { value: "98%", label: "Client Satisfaction", sort_order: 2, published: true },
  { value: "12M+", label: "Reach Managed", sort_order: 3, published: true },
];

export const DEFAULT_SKILLS = [
  { label: "Graphic Design", percentage: 95, icon: "palette", sort_order: 0, published: true },
  { label: "Ads Strategy", percentage: 90, icon: "ads_click", sort_order: 1, published: true },
  { label: "UI/UX Design", percentage: 87, icon: "layers", sort_order: 2, published: true },
  { label: "Web Design", percentage: 88, icon: "code", sort_order: 3, published: true },
  { label: "Brand Strategy", percentage: 85, icon: "analytics", sort_order: 4, published: true },
  { label: "Shopify / E-commerce", percentage: 82, icon: "shopping_cart", sort_order: 5, published: true },
];

export const DEFAULT_PAGE_META = {
  index: {
    meta_title: "Mobarak Hossain Rinku | Portfolio",
    meta_description: "Results-driven design and marketing that scales your business.",
  },
  about: {
    meta_title: "About | Mobarak Hossain Rinku",
    meta_description: "Learn about Mobarak Hossain Rinku, a multidisciplinary designer and marketing professional.",
  },
  "graphic-design": {
    meta_title: "Graphic Design Services | Mobarak Hossain Rinku",
    meta_description: "Brand identity, marketing collateral, and digital design services by Mobarak Hossain Rinku.",
  },
  "ui-design": {
    meta_title: "UI/UX Design Services | Mobarak Hossain Rinku",
    meta_description: "UI/UX design for websites, landing pages, dashboards, and digital products.",
  },
  "meta-ads": {
    meta_title: "Ads Expert | Mobarak Hossain Rinku",
    meta_description: "Paid advertising strategy and campaign management across Meta, Google Ads, and TikTok Ads.",
  },
  "wordpress-dev": {
    meta_title: "Web Design | Mobarak Hossain Rinku",
    meta_description: "Editable, responsive WordPress, Shopify, and web design for business growth.",
  },
  seo: {
    meta_title: "SEO Service | Mobarak Hossain Rinku",
    meta_description: "Technical SEO, on-page optimization, and practical SEO planning by Mobarak Hossain Rinku.",
  },
};
