import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { GuestOnly, ProtectedRoute, RequireAuth } from "../auth/ProtectedRoute";
import { AppLayout } from "../layout/AppLayout";
import { LoginPage } from "../pages/auth/LoginPage";
import { SignupPage } from "../pages/auth/SignupPage";
import { OverviewPage } from "../pages/OverviewPage";

import { SimplePage } from "../pages/SimplePage";
import { ConfigPage } from "../pages/config/ConfigPage";
import { CreateTaskPage } from "../pages/tasks/CreateTaskPage";
import { EditTaskPage } from "../pages/tasks/EditTaskPage";
import { TaskListPage } from "../pages/tasks/TaskListPage";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <GuestOnly>
              <LoginPage />
            </GuestOnly>
          }
        />

        <Route
          path="signup"
          element={
            <GuestOnly>
              <SignupPage />
            </GuestOnly>
          }
        />

        <Route element={<AppLayout />}>
          <Route
            index
            path="overview"
            element={
              <ProtectedRoute routeId="overview">
                <OverviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute routeId="overview">
                <OverviewPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="Goals"
            element={
              <RequireAuth>
                <TaskListPage />
              </RequireAuth>
            }
          />
          <Route
            path="Goals/new"
            element={
              <RequireAuth>
                <CreateTaskPage />
              </RequireAuth>
            }
          />
          <Route
            path="Goals/:id/edit"
            element={
              <RequireAuth>
                <EditTaskPage />
              </RequireAuth>
            }
          />
          <Route
            path="employees"
            element={
              <ProtectedRoute routeId="employees">
                <SimplePage titleKey="pages.employees.title" descriptionKey="pages.employees.description" />
              </ProtectedRoute>
            }
          />
          <Route
            path="projects"
            element={
              <ProtectedRoute routeId="projects">
                <SimplePage titleKey="pages.projects.title" descriptionKey="pages.projects.description" />
              </ProtectedRoute>
            }
          />

          <Route
            path="Goals"
            element={
              <ProtectedRoute routeId="Goals">
                <SimplePage titleKey="pages.Goals.title" descriptionKey="pages.Goals.description" />
              </ProtectedRoute>
            }
          />
          <Route
            path="config"
            element={
              <ProtectedRoute routeId="settings">
                <ConfigPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
