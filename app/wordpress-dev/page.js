import ServicePage from "../components/ServicePage";
import { servicePageConfigs } from "../components/servicePageConfigs";
import { getPageMeta, toMetadata } from "@/lib/pageMeta";

export async function generateMetadata() {
  return toMetadata(await getPageMeta("wordpress-dev"), "/wordpress-dev");
}

export const dynamic = "force-dynamic";

export default function WordPressDevPage() {
  return <ServicePage config={servicePageConfigs["wordpress-dev"]} />;
}
