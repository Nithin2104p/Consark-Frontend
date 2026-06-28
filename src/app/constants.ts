export const metrics = [
  { id: "pending", value: "245", change: "+12%", color: "purple" },
  { id: "conversion", value: "347", change: "+5.2%", color: "blue" },
  { id: "total", value: "82%", change: "+29.6%", color: "cyan" },
  { id: "score", value: "92", changeKey: "metrics.score.change", color: "pink" },
] as const;

export const lineData = [
  { month: "jan", value: 400 },
  { month: "feb", value: 300 },
  { month: "mar", value: 600 },
  { month: "apr", value: 800 },
  { month: "may", value: 500 },
  { month: "jun", value: 900 },
  { month: "jul", value: 1200 },
] as const;

export const pieData = [
  { key: "completed", value: 1793, color: "#06b6d4" },
  { key: "inProgress", value: 786, color: "#8b5cf6" },
  { key: "delayed", value: 267, color: "#ec4899" },
] as const;

export const incidents = [
  { id: "req1245", ref: "#Consark-1245", change: "+12%", up: true },
  { id: "req1246", ref: "#Consark-1246", change: "+8%", up: true },
  { id: "req1247", ref: "#Consark-1247", change: "-3%", up: false },
  { id: "req1248", ref: "#Consark-1248", change: "+15%", up: true },
  { id: "req1248", ref: "#Consark-1249", change: "+12%", up: true },
  { id: "req1247", ref: "#Consark-1250", change: "+8%", up: true },
  { id: "req1246", ref: "#Consark-1251", change: "-3%", up: false },
  { id: "req1245", ref: "#Consark-1252", change: "+15%", up: true },
] as const;

export const Goals = [
  { id: "uiReview", status: "completed", priority: "high" },
  { id: "backend", status: "inProgress", priority: "high" },
  { id: "qa", status: "pending", priority: "medium" },
  { id: "docs", status: "completed", priority: "low" },
] as const;

export const globeArcs = [
  { startLat: 40.7128, startLng: -74.006, endLat: 51.5074, endLng: -0.1278, color: "#8b5cf6" },
  { startLat: 35.6762, startLng: 139.6503, endLat: 40.7128, endLng: -74.006, color: "#06b6d4" },
  { startLat: -33.8688, startLng: 151.2093, endLat: 51.5074, endLng: -0.1278, color: "#ec4899" },
  { startLat: 1.3521, startLng: 103.8198, endLat: 35.6762, endLng: 139.6503, color: "#10b981" },
] as const;

export const globePoints = [
  { lat: 40.7128, lng: -74.006, size: 0.8, color: "#8b5cf6" },
  { lat: 51.5074, lng: -0.1278, size: 0.7, color: "#06b6d4" },
  { lat: 35.6762, lng: 139.6503, size: 0.9, color: "#ec4899" },
  { lat: -33.8688, lng: 151.2093, size: 0.6, color: "#10b981" },
  { lat: 1.3521, lng: 103.8198, size: 0.7, color: "#f59e0b" },
] as const;

export const taskNavItems = [
  { id: "taskDashboard", path: "/dashboard", icon: "taskDashboard" },
  { id: "Goals", path: "/Goals", icon: "Goals" },
] as const;

export const navItems = [
  { id: "employees", path: "/employees", icon: "employees" },
  { id: "Goals", path: "/Goals", icon: "Goals" },
  { id: "config", path: "/config", icon: "settings" },
] as const;


