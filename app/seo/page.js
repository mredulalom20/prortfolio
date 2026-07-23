import ServicePage from "../components/ServicePage";
import { servicePageConfigs } from "../components/servicePageConfigs";

export const metadata = {
  title: "SEO Service | Mobarak Hossain Rinku",
  description: "Technical SEO, on-page optimization, and practical SEO planning by Mobarak Hossain Rinku.",
};

export const dynamic = "force-dynamic";

export default function SeoPage() {
  return <ServicePage config={servicePageConfigs.seo} />;
}
