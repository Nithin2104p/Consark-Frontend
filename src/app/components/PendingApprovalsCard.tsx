import { Card } from "./Card";
import { pendingApprovalRows, type ApprovalRow } from "./constants";

import "./PendingApprovalsCard.css";

export function PendingApprovalsCard() {
  const rows: ApprovalRow[] = pendingApprovalRows;

const total = rows.reduce((sum, r) => sum + r.value, 0);

  return (
    <Card title="Pending Approvals" actionLabel="View all">
      <div className="approvals-top">
        <div className="approvals-total">{total}</div>
        <div className="approvals-sub">pending approvals</div>
      </div>

      <div className="approvals-list">
        {rows.map((r) => (
          <div key={r.id} className="approval-row">
            <span className="approval-label">{r.label}</span>
            <span className="approval-value">{r.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

