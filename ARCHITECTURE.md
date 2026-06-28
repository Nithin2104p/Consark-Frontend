# Ai-Consark-Dashboard — Architecture & Workflow

This file explains the end-to-end workflow of the app: routing, authorization, page layout, and how user actions affect the domain state (Goals/Goals/Approvals) and computed metrics.

---

## 1) System layout and routing workflow

### 1.1 App boot
1. React renders `src/app/App.tsx`
2. `AuthProvider` is mounted at the root
3. `AppRouter` mounts the route tree
4. `ToastContainer` (react-toastify) is mounted globally

**Source:**
- `src/app/App.tsx`
- `src/app/auth/AuthContext.tsx`
- `src/app/routes/AppRouter.tsx`

### 1.2 Route guarding
- Every major route element is wrapped with `ProtectedRoute`.
- `ProtectedRoute` uses current `role` from `AuthContext`.
- `ProtectedRoute` checks `canAccess(role, routeId)` from `src/app/auth/permissions.ts`.

**If denied:** redirect to `/unauthorized`.

**Sources:**
- `src/app/auth/ProtectedRoute.tsx`
- `src/app/routes/AppRouter.tsx`
- `src/app/auth/permissions.ts`

---

## 2) UI shell workflow (Layout)

### 2.1 AppLayout
`AppLayout` provides a consistent shell:
- `Sidebar`
- `Header`
- `Outlet` for the current page

**Sources:**
- `src/app/layout/AppLayout.tsx`

### 2.2 Sidebar visibility by permission
`Sidebar` builds `visibleNav` by filtering `navItems` based on `canAccess(role, navItem.id)`.

**Sources:**
- `src/app/components/Sidebar.tsx`
- `src/app/constants.ts`
- `src/app/auth/permissions.ts`

---

## 3) Domain workflows

## 3.1 Goals & Goals

### A) Data seeding and attachment
1. Base goal templates are defined in `src/app/pages/Goals/constants.ts`.
2. Goals are defined in `src/app/data/Goals.ts`.
3. Goals are attached to Goals by goalId in `src/app/data/Goals.ts`.
4. Employee sidebar uses `employeeGoalMapping` to select which Goals a given employee has.

**Sources:**
- `src/app/pages/Goals/constants.ts`
- `src/app/data/Goals.ts`
- `src/app/data/Goals.ts`
- `src/app/data/employeeGoals.ts`
- `src/app/pages/employees/EmployeesList.tsx`

### B) Progress computation
- Goal progress:
  - computed by counting Goals where `task.status === "completed"`
  - `progress = round(completed / total * 100)`
- Project progress:
  - average goal progress across project Goals
- Project health:
  - derived from active Goals statuses (ok / warn / bad)

**Sources:**
- `src/app/pages/Goals/goalUtils.ts`
- `src/app/pages/projects/projectUtils.ts`
- `src/app/components/ProjectGoalsSidebar.tsx`
- `src/app/pages/employees/EmployeesList.tsx`
- `src/app/components/GoalDetailsSidebar.tsx`

### C) User actions that mutate Goals state

#### Create goal (GoalsPage)
- `GoalsPage` has local state `items` initialized from `./constants`.
- On submit:
  - validates form via `validateGoalForm` (zod)
  - creates new GoalItem with `id: goal-${crypto.randomUUID()}`
  - sets `Goals: []`
  - prepends to `items`

**Sources:**
- `src/app/pages/Goals/GoalsPage.tsx`
- `src/app/pages/Goals/validation.ts`

#### Edit goal fields (GoalDetailsSidebar)
- `GoalsPage` opens `GoalDetailsSidebar` when a goal is selected.
- Sidebar supports inline editing of goal fields.
- Sidebar calls `onUpdateGoal(next)` which updates parent `items`.

**Sources:**
- `src/app/components/GoalDetailsSidebar.tsx`
- `src/app/pages/Goals/GoalsPage.tsx`

#### Add a task (GoalDetailsSidebar)
- Creating a task:
  - uses goal id, owner, and visibility from the current goal
  - task starts with `status: "in-progress"`
  - sidebar calls `onUpdateGoal` with `Goals: [newTask, ...goal.Goals]`

**Source:**
- `src/app/components/GoalDetailsSidebar.tsx`

#### Toggle task completion (GoalDetailsSidebar)
- On toggle:
  - if task is `completed` => set to `in-progress`
  - else => set to `completed`
- Sidebar calls `onUpdateGoal` with updated Goals.

**Source:**
- `src/app/components/GoalDetailsSidebar.tsx`

#### Delete goal (GoalsPage)
- Removes goal from `items` state.

**Source:**
- `src/app/pages/Goals/GoalsPage.tsx`

---

## 3.2 Approvals workflow

### A) Access control model
Approvals page route access:
- governed by `ProtectedRoute` + `ROUTE_PERMISSIONS["approvals"] = approvals:view`.

Approvals status editing:
- governed by `hasPermission(role, PERMISSIONS.APPROVALS_EDIT)`.

**Sources:**
- `src/app/routes/AppRouter.tsx`
- `src/app/auth/permissions.ts`
- `src/app/pages/approvals/ApprovalsPage.tsx`

### B) Status updates
- The list is stored in local state `approvalItems` initialized from `approvals` constants.
- If `canEdit`:
  - status is changed via a `<select>`
  - updates state immutably:
    - map + replace the matching item by id

**Sources:**
- `src/app/pages/approvals/ApprovalsPage.tsx`

### C) Create request
- On submit:
  - validate via `validateApprovalForm` (zod)
  - create newRequest with:
    - `id: request-${Date.now()}`
    - `requester: "You"` (current demo logic)
    - `status: "pending"`
  - unshift into approvalItems

**Sources:**
- `src/app/pages/approvals/validation.ts`
- `src/app/pages/approvals/ApprovalsPage.tsx`

---

## 4) Metrics and analytics cards

Analytics page is composed of cards:
- IncidentsCard
- OverloadedEmployeesCard
- PendingApprovalsCard

Each card computes demo-safe metrics locally (no API).

**Source:**
- `src/app/pages/analytics/AnalyticsPage.tsx`

---

## 5) Notes on toast notifications

This repo uses:
- **react-toastify** (with global ToastContainer) for GoalsPage notifications.
- **sonner** for ApprovalsPage notifications.

They are independent; no unified abstraction is implemented.

---

## 6) How to read “who can update what”

At runtime there are 2 layers:
1. **Can the user see a route?**
   - determined by `ProtectedRoute` -> `canAccess(role, routeId)`
2. **Can the user edit within the route?**
   - determined by `hasPermission(role, PERMISSIONS.<X>)` inside the page

That is why Employees/Goals create/edit controls and Approvals status controls depend on different permission checks.

