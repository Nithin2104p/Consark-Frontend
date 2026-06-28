import { useEffect, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { TrendingUp, Users } from "lucide-react";
import { employees } from "../data/employees";
import { COUNTRY_COORDINATES, ARC_COLORS } from "../data/countryCoordinates";
import { useTranslation } from "../hooks/useTranslation";
import { Card } from "./Card";
import { GLOBE_IMAGE } from "./constants";
import "./GlobeCard.css";

export function GlobeCard() {
  const { t } = useTranslation();
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      setSize({
        width: Math.floor(el.clientWidth),
        height: Math.floor(el.clientHeight),
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleGlobeReady = () => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
    }
  };

  const [hoveredEmployee, setHoveredEmployee] = useState<any | null>(null);

  const pointsData = employees.map((emp) => {
    const coords = COUNTRY_COORDINATES[emp.country];
    if (!coords) return null;

    // small deterministic offset to avoid exact overlap when multiple employees
    const offsetFactor = ((emp.id % 10) - 5) * 0.02;

    return {
      ...emp,
      lat: coords.lat + offsetFactor,
      lng: coords.lng + offsetFactor,
      size: 0.4 + Math.min(0.6, emp.projects * 0.05),
      color: "#8b5cf6",
    };
  }).filter(Boolean) as any[];

  const arcsData = employees
    .map((src, i) => {
      const dst = employees[(i + 1) % employees.length];
      const srcCoords = COUNTRY_COORDINATES[src.country];
      const dstCoords = COUNTRY_COORDINATES[dst.country];
      if (!srcCoords || !dstCoords) return null;

      return {
        startLat: srcCoords.lat,
        startLng: srcCoords.lng,
        endLat: dstCoords.lat,
        endLng: dstCoords.lng,
        color: ARC_COLORS[i % ARC_COLORS.length],
      };
    })
    .filter(Boolean) as any[];

  // stop auto-rotate when hovering an employee
  useEffect(() => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls();
    controls.autoRotate = !hoveredEmployee;
  }, [hoveredEmployee]);

  return (
    <Card title={t("cards.globe")} actionLabel={t("actions.viewDetails")}>
      <div className="globe-wrap">
        <div ref={containerRef} className="globe-canvas">
          {size.width > 0 && size.height > 0 && (
            <Globe
              ref={globeRef}
              width={size.width}
              height={size.height}
              globeImageUrl={GLOBE_IMAGE}
              backgroundColor="rgba(11, 14, 20, 0)"
              arcsData={arcsData}
              arcColor="color"
              arcDashLength={0.4}
              arcDashGap={0.2}
              arcDashAnimateTime={4000}
              arcStroke={0.5}
              pointsData={pointsData}
              pointColor="color"
              pointAltitude={0.01}
              pointRadius="size"
              onPointHover={(p) => setHoveredEmployee(p || null)}
              onPointClick={(p) => console.log("Clicked employee", p)}
              atmosphereColor="#8b5cf6"
              atmosphereAltitude={0.2}
              onGlobeReady={handleGlobeReady}
            />
          )}
        </div>

        {hoveredEmployee && (
          <div className="employee-tooltip glass">
            <img className="tooltip-avatar" src={hoveredEmployee.avatar} alt={hoveredEmployee.name} />
            <div className="tooltip-body">
              <div className="tooltip-name">{hoveredEmployee.name}</div>
              <div className="tooltip-role">{hoveredEmployee.designation}</div>
              <div className="tooltip-country">{hoveredEmployee.country}</div>
            </div>
          </div>
        )}

        <div className="globe-stats">
          <div className="globe-stat">
            <div className="small">{t("globe.employeesWorldwide")}</div>
            <div className="stat-value purple">
              <Users size={16} /> {t("globe.usersCount")}
            </div>
          </div>
          <div className="globe-stat">
            <div className="small">{t("globe.growth")}</div>
            <div className="stat-value green">
              <TrendingUp size={16} /> {t("globe.growthValue")}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
