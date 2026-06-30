export const ASSIGNEE_SELF = "self";

export const TASK_SORT_OPTIONS = [
  { value: "-createdAt", labelKey: "tasks.list.sortNewest" },
  { value: "createdAt", labelKey: "tasks.list.sortOldest" },
  { value: "title", labelKey: "tasks.list.sortTitleAsc" },
  { value: "-title", labelKey: "tasks.list.sortTitleDesc" },
] as const;
