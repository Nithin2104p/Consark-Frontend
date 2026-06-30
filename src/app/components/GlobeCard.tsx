import { useEffect, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { Users } from "lucide-react";
import { getUsers, getUserCount } from "../services/user.service";
import { COUNTRY_COORDINATES, COUNTRY_COLORS, ARC_COLORS } from "../data/countryCoordinates";
import { useTranslation } from "../hooks/useTranslation";
import { Card } from "./Card";
import {
  GLOBE_AUTO_ROTATE_SPEED,
  GLOBE_DEFAULT_POINT_COLOR,
  GLOBE_IMAGE,
  GLOBE_POINT_OFFSET_FACTOR,
  GLOBE_POINT_SIZE,
  GLOBE_USER_FETCH_LIMIT,
} from "../constants/ui";
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
      globeRef.current.controls().autoRotateSpeed = GLOBE_AUTO_ROTATE_SPEED;
    }
  };

  const [hoveredUser, setHoveredUser] = useState<any | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [users, setUsers] = useState<{ _id: string; firstName?: string; lastName?: string; email: string; location?: string }[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const count = await getUserCount();
        setUserCount(count);
      } catch {
        // keep default on error
      }
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const res = await getUsers({ limit: GLOBE_USER_FETCH_LIMIT });
        setUsers(res.users);
      } catch {
        // keep empty on error
      }
    })();
  }, []);

  const pointsData = users
    .map((u) => {
      const country = u.location;
      const coords = country ? COUNTRY_COORDINATES[country] : null;
      if (!coords) return null;

      const offsetFactor = (parseInt(u._id.slice(-2), 16) % 10 - 5) * GLOBE_POINT_OFFSET_FACTOR;
      const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email;

      return {
        _id: u._id,
        name,
        email: u.email,
        country,
        lat: coords.lat + offsetFactor,
        lng: coords.lng + offsetFactor,
        size: GLOBE_POINT_SIZE,
        color: (COUNTRY_COLORS as Record<string, string>)[country!] || GLOBE_DEFAULT_POINT_COLOR,
      };
    })
    .filter(Boolean) as any[];

  const arcsData = users
    .map((src, i) => {
      const dst = users[(i + 1) % users.length];
      const srcCountry = src.location;
      const dstCountry = dst.location;
      const srcCoords = srcCountry ? COUNTRY_COORDINATES[srcCountry] : null;
      const dstCoords = dstCountry ? COUNTRY_COORDINATES[dstCountry] : null;
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

  // stop auto-rotate when hovering a user
  useEffect(() => {
    if (!globeRef.current) return;
    const controls = globeRef.current.controls();
    controls.autoRotate = !hoveredUser;
  }, [hoveredUser]);

  return (
    <Card title={t("cards.globe")}>
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
              onPointHover={(p) => setHoveredUser(p || null)}
              atmosphereColor="#8b5cf6"
              atmosphereAltitude={0.2}
              onGlobeReady={handleGlobeReady}
            />
          )}
        </div>

        {hoveredUser && (
          <div className="employee-tooltip">
            <div className="tooltip-body">
              <div className="tooltip-name">{hoveredUser.name}</div>
              <div className="tooltip-country">{hoveredUser.country}</div>
            </div>
          </div>
        )}

        <div className="globe-stats">
          <div className="globe-stat">
            <div className="small">{t("globe.employeesWorldwide")}</div>
            <div className="stat-value purple">
              <Users size={16} /> {userCount != null ? userCount.toLocaleString() : t("common.notAvailable")}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
