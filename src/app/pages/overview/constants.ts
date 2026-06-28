import type {
  MetricCard as _MetricCard,
  LineDataPoint,
  PieDataPoint,
  IncidentItem,
  ProjectItem,
  TaskItem,
} from "./types";


export const overviewLineData: LineDataPoint[] = [
  { month: "jan", value: 400 },
  { month: "feb", value: 300 },
  { month: "mar", value: 600 },
  { month: "apr", value: 800 },
  { month: "may", value: 500 },
  { month: "jun", value: 900 },
  { month: "jul", value: 1200 },
];

export const overviewPieData: PieDataPoint[] = [
  { key: "completed", value: 1430, color: "#06b6d4" },
  { key: "pending", value: 245, color: "#8b5cf6" },
  { key: "inProgress", value: 180, color: "#ec4899" },
];

export const overviewIncidents: IncidentItem[] = [
  { id: "req1245", ref: "#REQ-1245", change: "+12%", up: true },
  { id: "req1246", ref: "#REQ-1246", change: "+8%", up: true },
  { id: "req1247", ref: "#REQ-1247", change: "-3%", up: false },
  { id: "req1248", ref: "#REQ-1248", change: "+15%", up: true },
];

export const overviewProjects: ProjectItem[] = [
  { id: "alpha", status: "onTrack", progress: 78, health: "ok" },
  { id: "beta", status: "atRisk", progress: 45, health: "warn" },
  { id: "gamma", status: "onTrack", progress: 92, health: "ok" },
  { id: "delta", status: "delayed", progress: 34, health: "bad" },
];

export const overviewGoals: TaskItem[] = [
  { id: "uiReview", status: "completed", priority: "high" },
  { id: "backend", status: "inProgress", priority: "high" },
  { id: "qa", status: "pending", priority: "medium" },
  { id: "docs", status: "completed", priority: "low" },
];
