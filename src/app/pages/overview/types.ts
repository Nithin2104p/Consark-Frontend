export type MetricCard = {
  id: string;
  value: string;
  change?: string;
  color: "purple" | "blue" | "cyan" | "pink";
  changeKey?: string;
};

export type LineDataPoint = {
  month: string;
  value: number;
};

export type PieDataPoint = {
  key: string;
  value: number;
  color: string;
};

export type IncidentItem = {
  id: string;
  ref: string;
  change: string;
  up: boolean;
};

export type ProjectItem = {
  id: string;
  status: "onTrack" | "atRisk" | "delayed";
  progress: number;
  health: "ok" | "warn" | "bad";
};

export type TaskItem = {
  id: string;
  status: "completed" | "inProgress" | "pending";
  priority: "high" | "medium" | "low";
};
