import ServicePage from "../components/ServicePage";
import { servicePageConfigs } from "../components/servicePageConfigs";
import { getPageMeta, toMetadata } from "@/lib/pageMeta";

export async function generateMetadata() {
  return toMetadata(await getPageMeta("ui-design"), "/ui-design");
}

export const dynamic = "force-dynamic";

export default function UiDesignPage() {
  return <ServicePage config={servicePageConfigs["ui-design"]} />;
}
