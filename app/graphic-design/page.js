import ServicePage from "../components/ServicePage";
import { servicePageConfigs } from "../components/servicePageConfigs";

export const metadata = {
  title: "Graphic Design Services | Mobarak Hossain Rinku",
  description: "Brand identity, marketing collateral, and digital design services by Mobarak Hossain Rinku.",
};

export const dynamic = "force-dynamic";

export default function GraphicDesignPage() {
  return <ServicePage config={servicePageConfigs["graphic-design"]} />;
}
