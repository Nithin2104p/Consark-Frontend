export const COUNTRY_DATA: Record<string, { lat: number; lng: number; color: string }> = {
  India: { lat: 20.5937, lng: 78.9629, color: "#f59e0b" },
  USA: { lat: 37.0902, lng: -95.7129, color: "#3b82f6" },
  Germany: { lat: 51.1657, lng: 10.4515, color: "#10b981" },
  UK: { lat: 55.3781, lng: -3.436, color: "#8b5cf6" },
  Australia: { lat: -25.2744, lng: 133.7751, color: "#f43f5e" },
};

export const COUNTRY_COORDINATES: Record<string, { lat: number; lng: number }> = Object.fromEntries(
  Object.entries(COUNTRY_DATA).map(([k, v]) => [k, { lat: v.lat, lng: v.lng }])
);

export const COUNTRY_COLORS: Record<string, string> = Object.fromEntries(
  Object.entries(COUNTRY_DATA).map(([k, v]) => [k, v.color])
);

export const COUNTRY_OPTIONS = Object.keys(COUNTRY_DATA);

export const ARC_COLORS = [
  "#8b5cf6",
  "#06b6d4",
  "#f59e0b",
  "#10b981",
  "#f43f5e",
  "#3b82f6",
  "#a78bfa",
  "#34d399",
  "#fb923c",
  "#e879f9",
];