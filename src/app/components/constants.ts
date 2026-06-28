export const GLOBE_IMAGE = "https://unpkg.com/three-globe/example/img/earth-night.jpg";

export type ApprovalRow = {
  id: string;
  label: string;
  value: number;
};

export const pendingApprovalRows: ApprovalRow[] = [
  { id: "leave", label: "Leave requests", value: 3 },
  { id: "timesheets", label: "Timesheets", value: 4 },
  { id: "expenses", label: "Expense approvals", value: 2 },
  { id: "access", label: "Access requests", value: 1 },
    { id: "leave", label: "Leave requests", value: 3 },
  { id: "timesheets", label: "Timesheets", value: 4 },
  { id: "expenses", label: "Expense approvals", value: 2 },
  { id: "access", label: "Access requests", value: 1 },
    { id: "leave", label: "Leave requests", value: 3 },
  { id: "leave", label: "Leave requests", value: 3 },


];
