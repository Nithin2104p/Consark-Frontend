import { useState, type FormEvent } from "react";
import { useSearchParams, Link, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { setPassword as authSetPassword } from "../../services/auth.service";
import "./LoginPage.css";

export function SetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.length < 6) {
      setErrors({ password: "Password must be at least 6 characters" });
      return;
    }
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      await authSetPassword({ token, password });
      toast.success("Password set successfully. You can now log in.");
      setSubmitted(true);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? "Failed to set password."
        : "Failed to set password.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="logo">C</div>
            <div>
              <strong>CONSARK</strong>
              <p className="small">Task Management</p>
            </div>
          </div>
          <p className="auth-success">Your password has been set.</p>
          <Link to="/" className="btn auth-submit">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="logo">C</div>
          <div>
            <strong>CONSARK</strong>
            <p className="small">Task Management</p>
          </div>
        </div>

        <h2 className="auth-title">Set Password</h2>
        <p className="auth-desc small">Create a password for your account.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="password">New Password</label>
            <div className="password-with-toggle">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password) ? "true" : undefined}
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="password-with-toggle">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmPassword) ? "true" : undefined}
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                onClick={() => setShowConfirmPassword((s) => !s)}
              >
                {showConfirmPassword ? "👁️" : "🙈"}
              </button>
            </div>
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className="btn auth-submit" disabled={submitting}>
            {submitting ? "Setting..." : "Set Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
