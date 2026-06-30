import { useState, useEffect, useRef, useCallback, type FormEvent } from "react";

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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleToggle = useCallback(() => {
    setOpen((prev) => {
      if (!prev) {
        setLocalSearch(searchQuery);
      }
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
      if (event.key === "Escape") {
        setOpen(false);
      }
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
      const target = e.target as HTMLInputElement;
      const query = target.value;
      setLocalSearch(query);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onSearchChange(query);
      }, 250);
    },
    [onSearchChange]
  );

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      if (!loading && hasMore && el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
        onLoadMore();
      }
    },
    [hasMore, loading, onLoadMore]
  );

  const selectedUser = users.find((u) => u.id === value);
  const displayLabel = value === "self" ? "Self" : selectedUser ? selectedUser.name : "Unassigned";

  return (
    <div className="assignee-dropdown" ref={rootRef}>
      <button
        type="button"
        className="assignee-trigger"
        onClick={handleToggle}
      >
        <span className="assignee-trigger-text">{displayLabel}</span>
        <svg
          className="assignee-chevron"
          width="16"
          height="16"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 8l4 4 4-4" />
        </svg>
      </button>
      {open && (
        <div className="assignee-menu">
          <div className="assignee-search">
            <svg
              className="assignee-search-icon"
              width="16"
              height="16"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="9" cy="9" r="6" />
              <path d="M15 15l4 4" />
            </svg>
          <input
            type="text"
            placeholder="Search users..."
            value={localSearch}
            onChange={handleSearchChange}
          />
          </div>
          <div className="assignee-list" onScroll={handleScroll}>
            <button
              type="button"
              className={`assignee-option ${value === "self" ? "assignee-option--active" : ""}`}
              onClick={() => {
                onChange("self");
                setOpen(false);
              }}
            >
              Self
            </button>
            {users.length === 0 && !loading && (
              <div className="assignee-empty">No users found</div>
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
            {loading && <div className="assignee-loading">Loading...</div>}
            {!loading && hasMore && (
              <div className="assignee-load-more">Scroll for more</div>
            )}
            {!loading && !hasMore && users.length > 0 && (
              <div className="assignee-end">End of list</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
