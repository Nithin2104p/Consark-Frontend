import { useMemo, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../../auth/AuthContext";
import {
  getUserCompaniesByEmail,
} from "../../services/auth.service";
import { validateLoginForm, validateSignupForm, type LoginFormData } from "../tasks/validation";
import "./LoginPage.css";

type Mode = "login" | "signup";
type LoginStep = "email" | "company" | "password";

type CompanyOption = {
  _id: string;
  name: string;
  [key: string]: unknown;
};

export function AuthPage() {
  const { login: authLogin, signup: authSignup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const initialMode: Mode = useMemo(() => {
    if (location.pathname.endsWith("/signup")) return "signup";
    return "login";
  }, [location.pathname]);

  const [mode, setMode] = useState<Mode>(initialMode);
  const [loginStep, setLoginStep] = useState<LoginStep>("email");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");

  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyOption | null>(null);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const resetLoginState = () => {
    setLoginStep("email");
    setEmail("");
    setPassword("");
    setCompanies([]);
    setSelectedCompany(null);
    setErrors({});
  };

  const handleModeChange = (next: Mode) => {
    setMode(next);
    setErrors({});
    if (next === "login") {
      resetLoginState();
    }
  };

  const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: "Enter a valid email address" });
      return;
    }

    setErrors({});
    setLoadingCompanies(true);

    try {
      const list = await getUserCompaniesByEmail(email);
      setCompanies(list);

      if (list.length === 0) {
        setErrors({ email: "No companies found for this email" });
        return;
      }

      if (list.length === 1) {
        setSelectedCompany(list[0]);
        setLoginStep("password");
      } else {
        setLoginStep("company");
      }
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? "Failed to load companies."
        : "Failed to load companies.";
      setErrors({ form: message });
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleCompanySelect = (company: CompanyOption) => {
    setSelectedCompany(company);
    setLoginStep("password");
  };

  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = validateLoginForm({ email, password });
    if (!payload.valid || !payload.data) {
      setErrors(payload.errors ?? { form: "Please fix the highlighted fields." });
      return;
    }

    if (!termsAccepted) {
      setErrors({ form: "Please accept the terms and conditions" });
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      await authLogin({
        ...payload.data,
        companyId: selectedCompany!._id,
      } as LoginFormData & { companyId: string });
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? "Authentication failed."
        : "Authentication failed.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = validateSignupForm({
      firstName,
      lastName: lastName || undefined,
      email,
      password,
      confirmPassword,
      companyName,
    });

    if (!payload.valid || !payload.data) {
      setErrors(payload.errors ?? { form: "Please fix the highlighted fields." });
      return;
    }

    if (!termsAccepted) {
      setErrors({ form: "Please accept the terms and conditions" });
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      await authSignup(payload.data);
      toast.success("Account created successfully!");
      navigate(from, { replace: true });
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? "Authentication failed."
        : "Authentication failed.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const isLogin = mode === "login";

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

        <div className="auth-tabs">
          <button
            type="button"
            className={isLogin ? "active" : ""}
            onClick={() => handleModeChange("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={!isLogin ? "active" : ""}
            onClick={() => handleModeChange("signup")}
          >
            Sign up
          </button>
        </div>

        {isLogin && (
          <>
            {loginStep === "email" && (
              <form onSubmit={handleEmailSubmit} noValidate>
                <div className="form-field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email) ? "true" : undefined}
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>

                {errors.form && <p className="field-error form-error">{errors.form}</p>}

                <button type="submit" className="btn auth-submit" disabled={loadingCompanies}>
                  {loadingCompanies ? "Loading..." : "Continue"}
                </button>
              </form>
            )}

            {loginStep === "company" && (
              <div className="auth-step">
                <p className="small" style={{ marginBottom: 12 }}>
                  Select your company
                </p>
                <div className="company-list">
                  {companies.map((company) => (
                    <button
                      type="button"
                      key={company._id}
                      className="company-option"
                      onClick={() => handleCompanySelect(company)}
                    >
                      {company.name}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ marginTop: 12 }}
                  onClick={() => {
                    setLoginStep("email");
                    setCompanies([]);
                    setErrors({});
                  }}
                >
                  Back
                </button>
              </div>
            )}

            {loginStep === "password" && selectedCompany && (
              <form onSubmit={handleLoginSubmit} noValidate>
                <div className="form-field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    aria-invalid={Boolean(errors.email) ? "true" : undefined}
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="password">Password</label>
                  <div className="password-with-toggle">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      aria-invalid={Boolean(errors.password) ? "true" : undefined}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((s) => !s)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.password && <span className="field-error">{errors.password}</span>}
                </div>

                <div className="form-field">
                  <p className="field-label">Company</p>
                  <div className="company-display">{selectedCompany.name}</div>
                </div>

                <p className="small" style={{ marginBottom: 12, color: "var(--text-dim)" }}>
                  Signing in to <strong>{selectedCompany.name}</strong>
                </p>

                <label className="auth-terms">
                  <input type="checkbox" required checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                  <span>By continuing you agree to CONSARK workspace policies</span>
                </label>

                <button type="submit" className="btn auth-submit" disabled={submitting}>
                  {submitting ? "Signing in..." : "Sign in"}
                </button>
              </form>
            )}
          </>
        )}

        {!isLogin && (
          <form onSubmit={handleSignupSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="firstName">First name</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Nithin"
                aria-invalid={Boolean(errors.firstName) ? "true" : undefined}
              />
              {errors.firstName && <span className="field-error">{errors.firstName}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="lastName">Last name</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="optional"
                aria-invalid={Boolean(errors.lastName) ? "true" : undefined}
              />
              {errors.lastName && <span className="field-error">{errors.lastName}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="companyName">Company name</label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Corp"
                aria-invalid={Boolean(errors.companyName) ? "true" : undefined}
              />
              {errors.companyName && <span className="field-error">{errors.companyName}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={Boolean(errors.email) ? "true" : undefined}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
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
                      {showPassword ? "Hide" : "Show"}
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
                      aria-label={
                        showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                      }
                      onClick={() => setShowConfirmPassword((s) => !s)}
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
              </div>
              {errors.confirmPassword && (
                <span className="field-error">{errors.confirmPassword}</span>
              )}
            </div>

            {errors.form && <p className="field-error form-error">{errors.form}</p>}

            <button type="submit" className="btn auth-submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create account"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
