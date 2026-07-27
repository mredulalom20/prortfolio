import ServicePage from "../components/ServicePage";
import { servicePageConfigs } from "../components/servicePageConfigs";
import { getPageMeta, toMetadata } from "@/lib/pageMeta";

export async function generateMetadata() {
  return toMetadata(await getPageMeta("meta-ads"), "/meta-ads");
}

export const dynamic = "force-dynamic";

export default function MetaAdsPage() {
  return <ServicePage config={servicePageConfigs["meta-ads"]} />;
}
