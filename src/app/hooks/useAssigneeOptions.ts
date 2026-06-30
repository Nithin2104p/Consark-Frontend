import { useCallback, useEffect, useState } from "react";
import { ASSIGNEE_PAGE_SIZE } from "../constants/pagination";
import { formatUserName } from "../utils/format";
import { getUsers, type UserDto } from "../services/user.service";

export function useAssigneeOptions(enabled: boolean) {
  const [assignees, setAssignees] = useState<UserDto[]>([]);
  const [assigneePage, setAssigneePage] = useState(1);
  const [assigneeTotalPages, setAssigneeTotalPages] = useState(1);
  const [assigneeLoading, setAssigneeLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadAssignees = useCallback(async (page: number, search: string) => {
    setAssigneeLoading(true);
    try {
      const res = await getUsers({ page, limit: ASSIGNEE_PAGE_SIZE, search: search || undefined });
      setAssignees(res.users);
      setAssigneePage(res.pagination.page);
      setAssigneeTotalPages(res.pagination.totalPages);
    } catch {
      setAssignees([]);
      setAssigneeTotalPages(1);
    } finally {
      setAssigneeLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void loadAssignees(1, "");
  }, [enabled, loadAssignees]);

  const handleAssigneeLoadMore = useCallback(async () => {
    if (assigneeLoading) return;
    const nextPage = assigneePage + 1;
    setAssigneeLoading(true);
    try {
      const res = await getUsers({ page: nextPage, limit: ASSIGNEE_PAGE_SIZE, search: searchQuery || undefined });
      setAssignees((prev) => [...prev, ...res.users]);
      setAssigneePage(res.pagination.page);
      setAssigneeTotalPages(res.pagination.totalPages);
    } catch {
      // keep existing list
    } finally {
      setAssigneeLoading(false);
    }
  }, [assigneeLoading, assigneePage, searchQuery]);

  const handleAssigneeSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
      void loadAssignees(1, query);
    },
    [loadAssignees]
  );

  const assigneeOptions = assignees.map((user) => ({
    id: user._id,
    name: formatUserName(user),
  }));

  return {
    assigneeOptions,
    assigneeLoading,
    assigneeHasMore: assigneePage < assigneeTotalPages,
    searchQuery,
    handleAssigneeLoadMore,
    handleAssigneeSearchChange,
  };
}
