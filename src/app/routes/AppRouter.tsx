import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { GuestOnly, ProtectedRoute, RequireAuth } from "../auth/ProtectedRoute";
import { AppLayout } from "../layout/AppLayout";
import { ROUTES } from "../constants/routes";
import { LoginPage } from "../pages/auth/LoginPage";
import { SignupPage } from "../pages/auth/SignupPage";
import { SetPasswordPage } from "../pages/auth/SetPasswordPage";
import { Dashboard } from "../pages/overview/Dashboard";
import { ConfigPage } from "../pages/config/ConfigPage";
import { EmployeesList } from "../pages/employees/EmployeesList";
import { CreateTaskPage } from "../pages/tasks/CreateTaskPage";
import { EditTaskPage } from "../pages/tasks/EditTaskPage";
import { TaskListPage } from "../pages/tasks/TaskListPage";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path={ROUTES.LOGIN}
          element={
            <GuestOnly>
              <LoginPage />
            </GuestOnly>
          }
        />
        <Route
          path={ROUTES.SIGNUP}
          element={
            <GuestOnly>
              <SignupPage />
            </GuestOnly>
          }
        />
        <Route
          path={ROUTES.SET_PASSWORD}
          element={
            <GuestOnly>
              <SetPasswordPage />
            </GuestOnly>
          }
        />

        <Route element={<AppLayout />}>
          <Route path={ROUTES.OVERVIEW} element={<Dashboard />} />
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route
            path={ROUTES.TASKS}
            element={
              <RequireAuth>
                <TaskListPage />
              </RequireAuth>
            }
          />
          <Route
            path={ROUTES.TASKS_NEW}
            element={
              <RequireAuth>
                <CreateTaskPage />
              </RequireAuth>
            }
          />
          <Route
            path="/tasks/:id/edit"
            element={
              <RequireAuth>
                <EditTaskPage />
              </RequireAuth>
            }
          />
          <Route
            path={ROUTES.EMPLOYEES}
            element={
              <ProtectedRoute routeId="employees">
                <EmployeesList />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.CONFIG}
            element={
              <ProtectedRoute routeId="settings">
                <ConfigPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
