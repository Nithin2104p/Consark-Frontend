import { CheckCircle, Circle, Loader2, ListTodo } from "lucide-react";
import { Card } from "./Card";

type GoalstatCardsProps = {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
  loading?: boolean;
};

const stats = [
  { key: "total", label: "Total Goals", icon: ListTodo, color: "purple" },
  { key: "open", label: "Open", icon: Circle, color: "blue" },
  { key: "inProgress", label: "In Progress", icon: Loader2, color: "cyan" },
  { key: "completed", label: "Completed", icon: CheckCircle, color: "pink" },
] as const;

export function GoalstatCards({ total, open, inProgress, completed, loading }: GoalstatCardsProps) {
  const values = { total, open, inProgress, completed };

  return (
    <div className="grid cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.key} className="card">
            <div className="metric-top">
              <div className={`icon-box ${stat.color}`}>
                <Icon size={20} />
              </div>
            </div>
            <div className="big">{loading ? "—" : values[stat.key]}</div>
            <div className="muted">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
}

export function GoalstatCardSimple({ title, value }: { title: string; value: string | number }) {
  return (
    <Card title={title}>
      <div className="big">{value}</div>
    </Card>
  );
}
