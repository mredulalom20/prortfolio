import ServicePage from "../components/ServicePage";
import { servicePageConfigs } from "../components/servicePageConfigs";

export const metadata = {
  title: "UI/UX Design Services | Mobarak Hossain Rinku",
  description: "UI/UX design for websites, landing pages, dashboards, and digital products.",
};

export const dynamic = "force-dynamic";

export default function UiDesignPage() {
  return <ServicePage config={servicePageConfigs["ui-design"]} />;
}
