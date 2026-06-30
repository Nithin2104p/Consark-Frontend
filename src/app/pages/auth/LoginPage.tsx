import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../../auth/AuthContext";
import { getUserCompaniesByEmail, type CompanyDto } from "../../services/auth.service";
import { validateLoginForm, validateSignupForm, type LoginFormData } from "../tasks/validation";
import { useTranslation } from "../../hooks/useTranslation";
import { EMAIL_REGEX, PASSWORD_PLACEHOLDER } from "../../constants/auth";
import { DEFAULT_POST_AUTH_PATH } from "../../constants/routes";
import "./LoginPage.css";

type Mode = "login" | "signup";
type LoginStep = "email" | "company" | "password";

type LoginPageProps = {
  defaultMode?: Mode;
};

export function LoginPage({ defaultMode = "login" }: LoginPageProps) {
  const { t } = useTranslation();
  const { login: authLogin, signup: authSignup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? DEFAULT_POST_AUTH_PATH;

  const [mode, setMode] = useState<Mode>(defaultMode);
  const [loginStep, setLoginStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyDto | null>(null);
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
    if (next === "login") resetLoginState();
  };

  const handleEmailSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !EMAIL_REGEX.test(email)) {
      setErrors({ email: t("auth.login.invalidEmail") });
      return;
    }

    setErrors({});
    setLoadingCompanies(true);

    try {
      const list = await getUserCompaniesByEmail(email);
      setCompanies(list);

      if (list.length === 0) {
        setErrors({ email: t("auth.login.noCompanies") });
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
        ? (err.response?.data as { message?: string })?.message ?? t("auth.errors.loadCompaniesFailed")
        : t("auth.errors.loadCompaniesFailed");
      setErrors({ form: message });
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleCompanySelect = (company: CompanyDto) => {
    setSelectedCompany(company);
    setLoginStep("password");
  };

  const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const payload = validateLoginForm({ email, password });
    if (!payload.valid || !payload.data) {
      setErrors(payload.errors ?? { form: t("auth.login.fixFields") });
      return;
    }

    if (!termsAccepted) {
      setErrors({ form: t("auth.login.acceptTerms") });
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      await authLogin({
        ...payload.data,
        companyId: selectedCompany!._id,
      } as LoginFormData & { companyId: string });
      toast.success(t("auth.login.welcomeBack"));
      navigate(from, { replace: true });
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? t("auth.login.authFailed")
        : t("auth.login.authFailed");
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
      setErrors(payload.errors ?? { form: t("auth.login.fixFields") });
      return;
    }

    if (!termsAccepted) {
      setErrors({ form: t("auth.login.acceptTerms") });
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      await authSignup(payload.data);
      toast.success(t("auth.signup.success"));
      navigate(from, { replace: true });
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? t("auth.login.authFailed")
        : t("auth.login.authFailed");
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
          <div className="logo">{t("brand.consarkInitial")}</div>
          <div>
            <strong>{t("brand.consarkName")}</strong>
            <p className="small">{t("brand.tagline")}</p>
          </div>
        </div>

        <div className="auth-tabs">
          <button type="button" className={isLogin ? "active" : ""} onClick={() => handleModeChange("login")}>
            {t("auth.login.tab")}
          </button>
          <button type="button" className={!isLogin ? "active" : ""} onClick={() => handleModeChange("signup")}>
            {t("auth.signup.tab")}
          </button>
        </div>

        {isLogin && (
          <>
            {loginStep === "email" && (
              <form onSubmit={handleEmailSubmit} noValidate>
                <div className="form-field">
                  <label htmlFor="email">{t("auth.login.email")}</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("auth.login.emailPlaceholder")}
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email) ? "true" : undefined}
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>
                {errors.form && <p className="field-error form-error">{errors.form}</p>}
                <button type="submit" className="btn auth-submit" disabled={loadingCompanies}>
                  {loadingCompanies ? t("common.loading") : t("common.continue")}
                </button>
              </form>
            )}

            {loginStep === "company" && (
              <div className="auth-step">
                <p className="small" style={{ marginBottom: 12 }}>
                  {t("auth.login.selectCompany")}
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
                  {t("common.back")}
                </button>
              </div>
            )}

            {loginStep === "password" && selectedCompany && (
              <form onSubmit={handleLoginSubmit} noValidate>
                <div className="form-field">
                  <label htmlFor="email">{t("auth.login.email")}</label>
                  <input id="email" type="email" value={email} disabled />
                </div>

                <div className="form-field">
                  <label htmlFor="password">{t("auth.login.password")}</label>
                  <div className="password-with-toggle">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={PASSWORD_PLACEHOLDER}
                      autoComplete="current-password"
                      aria-invalid={Boolean(errors.password) ? "true" : undefined}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      aria-label={showPassword ? t("common.hidePassword") : t("common.showPassword")}
                      onClick={() => setShowPassword((s) => !s)}
                    >
                      {showPassword ? t("common.hide") : t("common.show")}
                    </button>
                  </div>
                  {errors.password && <span className="field-error">{errors.password}</span>}
                </div>

                <div className="form-field">
                  <p className="field-label">{t("auth.login.company")}</p>
                  <div className="company-display">{selectedCompany.name}</div>
                </div>

                <p className="small" style={{ marginBottom: 12, color: "var(--text-dim)" }}>
                  {t("auth.login.signingInTo", { company: selectedCompany.name })}
                </p>

                {errors.form && <p className="field-error form-error">{errors.form}</p>}

                <label className="auth-terms">
                  <input type="checkbox" required checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                  <span>{t("auth.login.terms")}</span>
                </label>

                <button type="submit" className="btn auth-submit" disabled={submitting}>
                  {submitting ? t("auth.login.submitting") : t("auth.login.submit")}
                </button>
              </form>
            )}
          </>
        )}

        {!isLogin && (
          <form onSubmit={handleSignupSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="firstName">{t("auth.signup.firstName")}</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t("auth.signup.firstNamePlaceholder")}
                aria-invalid={Boolean(errors.firstName) ? "true" : undefined}
              />
              {errors.firstName && <span className="field-error">{errors.firstName}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="lastName">{t("auth.signup.lastName")}</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t("auth.signup.lastNamePlaceholder")}
                aria-invalid={Boolean(errors.lastName) ? "true" : undefined}
              />
              {errors.lastName && <span className="field-error">{errors.lastName}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="companyName">{t("auth.signup.companyName")}</label>
              <input
                id="companyName"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder={t("auth.signup.companyPlaceholder")}
                aria-invalid={Boolean(errors.companyName) ? "true" : undefined}
              />
              {errors.companyName && <span className="field-error">{errors.companyName}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="email">{t("auth.login.email")}</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.login.emailPlaceholder")}
                autoComplete="email"
                aria-invalid={Boolean(errors.email) ? "true" : undefined}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="password">{t("auth.login.password")}</label>
              <div className="password-with-toggle">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={PASSWORD_PLACEHOLDER}
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.password) ? "true" : undefined}
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPassword ? t("common.hidePassword") : t("common.showPassword")}
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? t("common.hide") : t("common.show")}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="confirmPassword">{t("auth.signup.confirmPassword")}</label>
              <div className="password-with-toggle">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={PASSWORD_PLACEHOLDER}
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.confirmPassword) ? "true" : undefined}
                />
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showConfirmPassword ? t("common.hideConfirmPassword") : t("common.showConfirmPassword")}
                  onClick={() => setShowConfirmPassword((s) => !s)}
                >
                  {showConfirmPassword ? t("common.hide") : t("common.show")}
                </button>
              </div>
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>

            {errors.form && <p className="field-error form-error">{errors.form}</p>}

            <label className="auth-terms">
              <input type="checkbox" required checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
              <span>{t("auth.login.terms")}</span>
            </label>

            <button type="submit" className="btn auth-submit" disabled={submitting}>
              {submitting ? t("auth.signup.submitting") : t("auth.signup.submit")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
