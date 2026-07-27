import ServicePage from "../components/ServicePage";
import { servicePageConfigs } from "../components/servicePageConfigs";
import { getPageMeta, toMetadata } from "@/lib/pageMeta";

export async function generateMetadata() {
  return toMetadata(await getPageMeta("graphic-design"), "/graphic-design");
}

export const dynamic = "force-dynamic";

export default function GraphicDesignPage() {
  return <ServicePage config={servicePageConfigs["graphic-design"]} />;
}
