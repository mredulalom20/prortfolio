import ServicePage from "../components/ServicePage";
import { servicePageConfigs } from "../components/servicePageConfigs";

export const metadata = {
  title: "Ads Expert | Mobarak Hossain Rinku",
  description: "Paid advertising strategy and campaign management across Meta, Google Ads, and TikTok Ads.",
};

export const dynamic = "force-dynamic";

export default function MetaAdsPage() {
  return <ServicePage config={servicePageConfigs["meta-ads"]} />;
}
