import ServicePage from "../components/ServicePage";
import { servicePageConfigs } from "../components/servicePageConfigs";

export const metadata = {
  title: "Meta Ads Management | Mobarak Hossain Rinku",
  description: "Facebook and Instagram ad campaign strategy, creative testing, and optimization.",
};

export const dynamic = "force-dynamic";

export default function MetaAdsPage() {
  return <ServicePage config={servicePageConfigs["meta-ads"]} />;
}
