import { useState, useEffect, useRef, useCallback, type FormEvent } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { SEARCH_DEBOUNCE_MS, SCROLL_LOAD_THRESHOLD_PX } from "../../constants/ui";
import { ASSIGNEE_SELF } from "../../constants/task";

type UserOption = { id: string; name: string };

type AssigneeSelectProps = {
  value: string;
  onChange: (userId: string) => void;
  users: UserOption[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
};

export function AssigneeSelect({
  value,
  onChange,
  users,
  loading,
  hasMore,
  onLoadMore,
  searchQuery,
  onSearchChange,
}: AssigneeSelectProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const handleToggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev) setLocalSearch(searchQuery);
      return !prev;
    });
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleSearchChange = useCallback(
    (e: FormEvent<HTMLInputElement>) => {
      const query = (e.target as HTMLInputElement).value;
      setLocalSearch(query);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onSearchChange(query), SEARCH_DEBOUNCE_MS);
    },
    [onSearchChange]
  );

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      if (!loading && hasMore && el.scrollTop + el.clientHeight >= el.scrollHeight - SCROLL_LOAD_THRESHOLD_PX) {
        onLoadMore();
      }
    },
    [hasMore, loading, onLoadMore]
  );

  const selectedUser = users.find((u) => u.id === value);
  const displayLabel =
    value === ASSIGNEE_SELF
      ? t("tasks.assignee.self")
      : selectedUser
        ? selectedUser.name
        : t("tasks.assignee.unassigned");

  return (
    <div className="assignee-dropdown" ref={rootRef}>
      <button type="button" className="assignee-trigger" onClick={handleToggle}>
        <span className="assignee-trigger-text">{displayLabel}</span>
        <svg className="assignee-chevron" width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 8l4 4 4-4" />
        </svg>
      </button>
      {open && (
        <div className="assignee-menu">
          <div className="assignee-search">
            <svg className="assignee-search-icon" width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="9" r="6" />
              <path d="M15 15l4 4" />
            </svg>
            <input
              type="text"
              placeholder={t("tasks.assignee.searchPlaceholder")}
              value={localSearch}
              onChange={handleSearchChange}
            />
          </div>
          <div className="assignee-list" onScroll={handleScroll}>
            <button
              type="button"
              className={`assignee-option ${value === ASSIGNEE_SELF ? "assignee-option--active" : ""}`}
              onClick={() => {
                onChange(ASSIGNEE_SELF);
                setOpen(false);
              }}
            >
              {t("tasks.assignee.self")}
            </button>
            {users.length === 0 && !loading && (
              <div className="assignee-empty">{t("tasks.assignee.empty")}</div>
            )}
            {users.map((user) => (
              <button
                type="button"
                key={user.id}
                className={`assignee-option ${user.id === value ? "assignee-option--active" : ""}`}
                onClick={() => {
                  onChange(user.id);
                  setOpen(false);
                }}
              >
                {user.name}
              </button>
            ))}
            {loading && <div className="assignee-loading">{t("tasks.assignee.loading")}</div>}
            {!loading && hasMore && <div className="assignee-load-more">{t("tasks.assignee.scrollForMore")}</div>}
            {!loading && !hasMore && users.length > 0 && (
              <div className="assignee-end">{t("tasks.assignee.endOfList")}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
