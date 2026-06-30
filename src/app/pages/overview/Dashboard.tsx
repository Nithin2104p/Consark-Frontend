import { GlobeCard } from "../../components/GlobeCard";
import { ProductivityChart } from "../../components/ProductivityChart";
import { PageHeader } from "../../components/PageHeader";
import { KpiCards } from "../../components/overview/KpiCards";

export function Dashboard() {
  return (
    <div className="page">
      <PageHeader />
      <KpiCards />

      <div className="grid cols-2">
        <GlobeCard />
        <ProductivityChart />
      </div>
    </div>
  );
}

