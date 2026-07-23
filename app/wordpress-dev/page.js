import ServicePage from "../components/ServicePage";
import { servicePageConfigs } from "../components/servicePageConfigs";

export const metadata = {
  title: "Web Design | Mobarak Hossain Rinku",
  description: "Editable, responsive WordPress, Shopify, and web design for business growth.",
};

export const dynamic = "force-dynamic";

export default function WordPressDevPage() {
  return <ServicePage config={servicePageConfigs["wordpress-dev"]} />;
}
