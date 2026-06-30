import { useState, type FormEvent } from "react";
import { useSearchParams, Link, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setPassword as authSetPassword } from "../../services/auth.service";
import { useTranslation } from "../../hooks/useTranslation";
import { getApiErrorMessage } from "../../utils/apiError";
import { MIN_PASSWORD_LENGTH, PASSWORD_PLACEHOLDER } from "../../constants/auth";
import { ROUTES } from "../../constants/routes";
import "./LoginPage.css";

export function SetPasswordPage() {
  const { t } = useTranslation();
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
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrors({ password: t("auth.setPassword.minLength") });
      return;
    }
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: t("auth.setPassword.mismatch") });
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      await authSetPassword({ token, password });
      toast.success(t("auth.setPassword.successToast"));
      setSubmitted(true);
    } catch (err) {
      toast.error(getApiErrorMessage(err, t("auth.errors.setPasswordFailed")));
    } finally {
      setSubmitting(false);
    }
  };

  const brandBlock = (
    <div className="auth-brand">
      <div className="logo">{t("brand.consarkInitial")}</div>
      <div>
        <strong>{t("brand.consarkName")}</strong>
        <p className="small">{t("brand.tagline")}</p>
      </div>
    </div>
  );

  if (submitted) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          {brandBlock}
          <p className="auth-success">{t("auth.setPassword.successMessage")}</p>
          <Link to={ROUTES.LOGIN} className="btn auth-submit">
            {t("auth.setPassword.goToLogin")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {brandBlock}

        <h2 className="auth-title">{t("auth.setPassword.title")}</h2>
        <p className="auth-desc small">{t("auth.setPassword.description")}</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="password">{t("auth.setPassword.newPassword")}</label>
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
            <label htmlFor="confirmPassword">{t("auth.setPassword.confirmPassword")}</label>
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

          <button type="submit" className="btn auth-submit" disabled={submitting}>
            {submitting ? t("auth.setPassword.submitting") : t("auth.setPassword.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
