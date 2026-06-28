import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getGoalstats } from "../../services/task.service";
import { ErrorState } from "../../components/ErrorState";
import { LoadingState } from "../../components/LoadingState";
import { GoalstatCards } from "../../components/TaskStatCards";
import "./TasksPage.css";

export function TaskDashboardPage() {
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await getGoalstats();
      setStats(next);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? "Failed to load dashboard."
        : "Failed to load dashboard.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    void (async () => {
      await loadStats();
    })();
  }, []);


  return (
    <div className="Goals-page">
      <div className="Goals-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-desc muted">Overview of your task workload</p>
        </div>
        <Link to="/Goals/new" className="btn">
          Create Task
        </Link>
      </div>

      {loading && <LoadingState message="Loading dashboard..." />}
      {!loading && error && <ErrorState message={error} onRetry={loadStats} />}
      {!loading && !error && (
        <>
          <GoalstatCards {...stats} />
          <div className="card dashboard-actions">
            <h3>Quick actions</h3>
            <div className="quick-links">
              <Link to="/Goals" className="btn btn-secondary">
                View all Goals
              </Link>
              <Link to="/Goals/new" className="btn">
                Add new task
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
