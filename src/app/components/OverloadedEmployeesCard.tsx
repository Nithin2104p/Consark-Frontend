import { useEffect, useMemo, useState } from "react";
import { Card } from "./Card";

import { getEmployeesLikeFromUsers, type EmployeeLike } from "../services/user.service";

import "./OverloadedEmployeesCard.css";

type EmployeeRow = {
  id: string;
  name: string;
  utilization: number;
  Goals: number;
  overtimeHours: number;
  risk: "overloaded" | "warning" | "ok";
  statusLabel: string;
};

function getRisk(utilization: number, overtimeHours: number): EmployeeRow["risk"] {
  if (utilization >= 90 || overtimeHours >= 10) return "overloaded";
  if (utilization >= 80 || overtimeHours >= 7) return "warning";
  return "ok";
}

export function OverloadedEmployeesCard() {
  const [employees, setEmployees] = useState<EmployeeLike[] | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const next = await getEmployeesLikeFromUsers();
        setEmployees(next);
      } catch {
        setEmployees([]);
      }
    })();
  }, []);

  const rows: EmployeeRow[] = useMemo(() => {
    if (!employees) return [];

    const baseGoals = 10 + (employees.length % 7);

    return employees.map((e, idx) => {
      // Deterministic pseudo-variation per employee.
      const utilization = Math.min(100, 72 + ((idx * 11) % 29));
      const overtimeHours = ((idx * 7) % 13) + (idx % 2);
      const Goals = Math.max(0, baseGoals + ((idx * 3) % 9) - 4);

      const risk = getRisk(utilization, overtimeHours);
      const statusLabel =
        risk === "overloaded" ? "overloaded" : risk === "warning" ? "warning" : "ok";

      return {
        id: e.id,
        name: e.name,
        utilization,
        Goals,
        overtimeHours,
        risk,
        statusLabel,
      };
    });
  }, [employees]);

  return (
    <Card title="Overloaded Employees" actionLabel="View all">
      <div className="overloaded-grid">
        {rows
          .slice()
          .sort((a, b) => b.utilization - a.utilization)
          .map((r) => (
            <div key={r.id} className="overloaded-row">
              <div className="overloaded-name">{r.name}</div>
              <div className="overloaded-util">
                <div className="overloaded-util-top">
                  <span className="overloaded-util-pct">{r.utilization}%</span>
                </div>
                <div className="overloaded-bar">
                  <div
                    className={`overloaded-bar-fill ${r.risk}`}
                    style={{ width: `${r.utilization}%` }}
                  />
                </div>
              </div>
              <div className="overloaded-metric">
                <div className="overloaded-metric-value">{r.Goals}</div>
                <div className="overloaded-metric-label">Goals</div>
              </div>
              <div className="overloaded-metric">
                <div className="overloaded-metric-value">{r.overtimeHours}h</div>
                <div className="overloaded-metric-label">OT</div>
              </div>
              <div className={`overloaded-risk-pill ${r.risk}`}>{r.statusLabel}</div>
            </div>
          ))}
      </div>
    </Card>
  );
}

