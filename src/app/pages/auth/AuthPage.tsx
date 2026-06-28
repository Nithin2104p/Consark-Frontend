import { useMemo, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "../../auth/AuthContext";
import { validateLoginForm, validateSignupForm } from "../tasks/validation";
import "./LoginPage.css";

type Mode = "login" | "signup";

export function AuthPage() {
    const { login, signup } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";

    const initialMode: Mode = useMemo(() => {
        // If user hit /signup directly, render signup-only.
        if (location.pathname.endsWith("/signup")) return "signup";
        return "login";
    }, [location.pathname]);

    const [mode, setMode] = useState<Mode>(initialMode);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const payload =
            mode === "login"
                ? validateLoginForm({ email, password })
                : validateSignupForm({
                    firstName,
                    lastName: lastName || undefined,
                    email,
                    password,
                    confirmPassword,
                });


        if (!payload.valid || !payload.data) {
            setErrors(payload.errors ?? { form: "Please fix the highlighted fields." });
            return;
        }

        setErrors({});
        setSubmitting(true);

        try {
            if (mode === "login") {
                await login(payload.data);
                toast.success("Welcome back!");
            } else {
                await signup(payload.data);
                toast.success("Account created successfully!");
            }
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
                        className={mode === "login" ? "active" : ""}
                        onClick={() => {
                            setMode("login");
                            setErrors({});
                        }}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        className={mode === "signup" ? "active" : ""}
                        onClick={() => {
                            setMode("signup");
                            setErrors({});
                        }}
                    >
                        Sign up
                    </button>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    {mode === "signup" && (
                        <>
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
                        </>
                    )}


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
                                autoComplete={mode === "login" ? "current-password" : "new-password"}
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

                    {mode === "signup" && (
                        <div className="form-field">
                            <label htmlFor="confirmPassword">Confirm password</label>
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
                            {errors.confirmPassword && (
                                <span className="field-error">{errors.confirmPassword}</span>
                            )}
                        </div>
                    )}


                    {errors.form && <p className="field-error form-error">{errors.form}</p>}

                    <button type="submit" className="btn auth-submit" disabled={submitting}>
                        {submitting ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
                    </button>
                </form>

                <p className="auth-footer small">
                    By continuing you agree to CONSARK workspace policies.{" "}
                    <Link to="/">Back to home</Link>
                </p>

                {mode === "signup" && (
                    <p className="auth-footer small" style={{ marginTop: 10 }}>
                        Existing user?{" "}
                        <button
                            type="button"
                            className="link-button"
                            onClick={() => {
                                setMode("login");
                                setErrors({});
                            }}
                        >
                            Login
                        </button>
                    </p>
                )}
            </div>
        </div>
    );
}

