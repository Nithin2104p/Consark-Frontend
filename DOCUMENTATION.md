# Ai-Consark-Dashboard — Implementation Documentation

This document describes the full approach implemented in this repo: architecture, authorization, i18n, notifications, domain models (Goals/Goals), progress computation, and how data flows through the UI.

---

## 1) High-level architecture

### Runtime & framework
- **Frontend**: React + TypeScript
- **Router**: `react-router-dom`
- **Build tool**: Vite

### App entry
- `src/main.tsx` (bootstraps React)
- `src/app/App.tsx` (global providers and global UI)

### Top-level component tree
- `AuthProvider` wraps the entire app (role switching / authorization)
- `AppRouter` renders routes
- `ToastContainer` is mounted globally (for `react-toastify` toasts)

**Where:**
- `src/app/App.tsx`

---

## 2) Authorization model (Roles, Permissions, Access)

### Role state
- `src/app/auth/AuthContext.tsx`
  - `role` stored in React state
  - default role is **`"superAdmin"`**
  - `setRole` updates role

### Roles
In `src/app/auth/permissions.ts`:
- `ROLES.SUPER_ADMIN = "superAdmin"`
- `ROLES.ADMIN = "admin"`
- `ROLES.EMPLOYEE = "employee"`

### Permissions
In `src/app/auth/permissions.ts`:
- `PERMISSIONS` includes route-level permissions such as:
  - `overview:view`
  - `employees:view`, `employees:edit`
  - `projects:view`, `projects:edit`
  - `analytics:view`
  - `approvals:view`, `approvals:edit`
  - `Goals:view`, `Goals:create`
  - `settings:view`, `settings:edit`

### Permission matrix
`ROLE_PERMISSIONS` defines which permissions each role has.
- `superAdmin` gets **all** permissions (via `...Object.values(PERMISSIONS)`)
- `admin` gets a curated subset (overview + full CRUD-ish for employees/projects/approvals/Goals)
- `employee` gets only `projects:view`, `approvals:view`, `Goals:view`

### Route mapping
`ROUTE_PERMISSIONS` maps a route id (string used by `ProtectedRoute`) to the required permission.
Example:
- `overview` -> `overview:view`
- `employees` -> `employees:view`
- `approvals` -> `approvals:view`
- `Goals` -> `Goals:view`
- `settings` -> `settings:view`

### Access check
- `canAccess(role, routeId)` returns `true` if the role includes the required permission.

### ProtectedRoute behavior
- `src/app/auth/ProtectedRoute.tsx`
  - If access denied: redirect to `/unauthorized`
  - If allowed: render children

### Unauthorized page
- `src/app/pages/UnauthorizedPage.tsx`
  - shows translated unauthorized text
  - provides a link back to `/Goals`

---

## 3) Navigation visibility (who can see what)

### Nav item list
- `src/app/constants.ts`
  - `navItems = [{ id, path, icon }, ...]`

### Sidebar filtering by permission
- `src/app/components/Sidebar.tsx`
  - computes `visibleNav = navItems.filter(item => canAccess(role, item.id))`
  - each `NavLink` label is translated with `t(\`nav.${item.id}\`)`

**Result:**
- Users only see menu items for which their role has the required permission.

---

## 4) Who can update approvals? (Required permissions)

Approvals page is `src/app/pages/approvals/ApprovalsPage.tsx`.

### Route access vs edit access
- `ProtectedRoute` only controls **route visibility**.
  - Route id for approvals is `approvals` which requires **`approvals:view`**.
- “Can the user update approval status?” is controlled separately by:
  - `canEdit = hasPermission(role, PERMISSIONS.APPROVALS_EDIT)`

So:
- **To update approval status:** role must have `approvals:edit`.
- **To view approvals page:** role must have `approvals:view`.

In the current `ROLE_PERMISSIONS`:
- `superAdmin` can edit (has all permissions)
- `admin` can edit approvals (includes `approvals:edit`)
- `employee` can NOT edit approvals (only `approvals:view`)

### UI behavior when editing is not allowed
- If `canEdit` is false:
  - the status becomes a translated read-only `<span>`
- If `canEdit` is true:
  - status is editable via a `<select>`

### Notification on create
- On approval request creation, the page uses **`toast` from `sonner`** (see section 6).

---

## 5) Domain model: Goal, Task, Level, Visibility, Status

### Goal / Task / Status types
In `src/app/pages/Goals/types.ts`:

#### GoalItem
```ts
export type GoalItem = {
  id: string;
  title: string;
  owner: string;
  description?: string;
  level: "individual" | "team" | "org";
  status:
    | "on-track"
    | "at-risk"
    | "delayed"
    | "in-progress"
    | "completed"
    | "archived"
    | "inactive";
  visibility: "private" | "public" | "team" | "custom";
  dueDate?: string;
  Goals: GoalTask[];
};
```

#### GoalTask / Task
```ts
export type Task = {
  id: string;
  goalId: string;
  title: string;
  owner: string;
  status: "in-progress" | "completed" | "inactive" | "at-risk" | "delayed";
  visibility: "private" | "public" | "team" | "custom";
};

export type GoalTask = Task;
```

### Meaning of Level and Visibility (in current implementation)
- **Level** is stored on `GoalItem` and selectable in the Goals UI.
- **Visibility** is stored on `GoalItem` and also gets propagated to Goals when Goals are added via the GoalDetails sidebar.

**Important:** visibility is **not used for UI filtering** in the current code; it is mainly informational (displayed as a value and persisted in state).

### Meaning of Status (and how it affects progress)
- Goal `status` impacts:
  - which Goals appear in Goals list: GoalsPage filters out `status === "inactive"`
  - project health computation (see section 9)
- Task `status` impacts:
  - goal completion percentage computation (`completed` vs not `completed`)

---

## 6) Notifications: Toastify and Sonner

### react-toastify (Toastify)
- Dependency: `react-toastify`
- Global container:
  - `src/app/App.tsx`
  - `<ToastContainer position="top-right" autoClose={3000} hideProgressBar />`

Toast usage:
- `src/app/pages/Goals/GoalsPage.tsx`
  - `import { toast } from "react-toastify";`
  - used for:
    - form validation errors
    - success messages: goal created / deleted

### sonner
- Dependency: `sonner`
- Toast usage:
  - `src/app/pages/approvals/ApprovalsPage.tsx`
  - `import { toast } from "sonner";`

#### Note on coexistence
This repo currently uses **two toast libraries**:
- `react-toastify` (global `ToastContainer` in `App.tsx`)
- `sonner` (used directly via `toast` in ApprovalsPage)

They are independent. The codebase does not provide a shared abstraction for toast notifications.

---

## 7) i18n (Internationalization)

### Initialization
- `src/app/i18n/index.ts`
  - uses `i18next` + `initReactI18next`
  - loads `src/app/i18n/translation.json` into `resources.en.translation`
  - sets `lng: "en"` and `fallbackLng: "en"`

### Hook
- `src/app/hooks/useTranslation.ts`
  - wraps `react-i18next` `useTranslation`.
  - returns `{ t, i18n }`

### Translation usage
Across components/pages, text is rendered by calling:
- `t("pages.Goals.title")`
- `t("status.completed")`
- `t(\`Goals.${item.id}.name\`)`

### Example translation keys
- Sidebar:
  - `t(\`nav.${item.id}\`)`
- Roles:
  - `t(\`roles.${r}\`)`

---

## 8) Data layer: where Goals/Goals come from

### Seed Goals
- `src/app/pages/Goals/constants.ts`
  - exports `Goals: GoalItem[]` (with `Goals: []` initially)

### Seed Goals and attach them to Goals
- `src/app/data/Goals.ts`
  - exports `Goals: Task[]`
  - each task has a `goalId` linking to the goal.

- `src/app/data/Goals.ts`
  - constructs `GoalsByGoalId`
  - exports `GoalsWithGoals: GoalItem[]` where each goal gets `Goals: GoalsByGoalId[g.id] ?? []`

### Employee -> Goal mapping
- `src/app/pages/employees/EmployeesList.tsx`
  - imports:
    - `employees`
    - `employeeGoalMapping`
    - `GoalsWithGoals as Goals`
  - `getEmployeeGoals(employeeId)`:
    1. reads goal ids from `employeeGoalMapping[employeeId]`
    2. looks up Goals by id
    3. returns only found Goals

---

## 9) Progress computation (exact formulas)

This section answers: **how progress is computed**, and **where it’s displayed**.

### 9.1 Goal progress: `goalCompletionPercent`
Defined in `src/app/pages/Goals/goalUtils.ts`:

```ts
export function goalCompletionPercent(goal: GoalItem): number {
  const total = goal.Goals.length;
  if (total === 0) return 0;

  const completed = goal.Goals.filter((t) => t.status === "completed").length;
  return Math.round((completed / total) * 100);
}
```

**Interpretation:**
- Completion is **binary per task**: only Goals with `status === "completed"` count.
- Any other task status (e.g. in-progress, at-risk, delayed, inactive) does not count as completed.
- If there are no Goals: progress is `0`.

**Where used:**
- `src/app/pages/employees/EmployeesList.tsx`
  - `const progress = goalCompletionPercent(g)`
  - progress bar width set to `progress%`
- `src/app/components/ProjectGoalsSidebar.tsx`
  - calculates `gp = goalCompletionPercent(g)`
  - displayed per goal in the project sidebar
- `src/app/components/GoalDetailsSidebar.tsx`
  - calculates `progress = goalCompletionPercent(goal)`
  - shown in sidebar header

### 9.2 Task row “pct” rendering (binary)
In `src/app/components/GoalDetailsSidebar.tsx`:
- per-task display:
  - `pct = task.status === "completed" ? 100 : 0`

So Goals displayed as either **100% completed** or **0%**.

### 9.3 Project progress: `projectProgressPercent`
Defined in `src/app/pages/projects/projectUtils.ts`:

```ts
export function projectProgressPercent(Goals: GoalItem[]): number {
  if (Goals.length === 0) return 0;
  const sum = Goals.reduce((acc, g) => acc + goalCompletionPercent(g), 0);
  return Math.round(sum / Goals.length);
}
```

**Interpretation:**
- Project progress is the **average** of each goal’s completion percentage.

**Where used:**
- `src/app/components/ProjectGoalsSidebar.tsx`
  - `progress = projectProgressPercent(Goals)`
  - displayed as “X% progress”

### 9.4 Project health: `projectHealth`
Defined in `src/app/pages/projects/projectUtils.ts`:

```ts
export function projectHealth(Goals: GoalItem[]): ProjectHealthLike {
  const activeGoals = Goals.filter((g) => g.status !== "archived" && g.status !== "inactive");
  if (activeGoals.length === 0) return "warn";

  const hasBad = activeGoals.some((g) => g.status === "at-risk" || g.status === "delayed");
  if (hasBad) return "bad";

  const hasWarn = activeGoals.some((g) => g.status === "in-progress");
  if (hasWarn) return "warn";

  return "ok";
}
```

**Interpretation (priority rules):**
1. If all Goals are archived/inactive => health `"warn"`
2. If any active goal is `"at-risk"` or `"delayed"` => health `"bad"`
3. Else if any active goal is `"in-progress"` => health `"warn"`
4. Else => health `"ok"`

