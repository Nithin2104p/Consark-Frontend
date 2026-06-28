import { GlobeCard } from "../../components/GlobeCard";
import { ProductivityChart } from "../../components/ProductivityChart";
import { PageHeader } from "../../components/PageHeader";
import { KpiCards } from "../../components/overview/KpiCards";
import { IncidentsCard } from "../../components/IncidentsCard";
import { ProjectHealthCard } from "../../components/ProjectHealthCard";
import { TaskProgressCard } from "../../components/TaskProgressCard";

export function Dashboard() {
  return (
    <div className="page">
      <PageHeader />
      <KpiCards />

      <div className="grid cols-2">
        <GlobeCard />
        <ProductivityChart />
      </div>

      {/* <div className="grid cols-3">
        <IncidentsCard />
        <ProjectHealthCard />
        <TaskProgressCard />
      </div> */}
    </div>
  );
}

