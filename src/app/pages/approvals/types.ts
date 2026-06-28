export type ApprovalItem = {
  id: string;
  title: string;
  requester: string;
  type: string;
  approver: string;
  status: "pending" | "approved" | "rejected";
};
