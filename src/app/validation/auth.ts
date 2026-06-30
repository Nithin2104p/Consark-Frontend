import { z, type ZodIssue } from "zod";
import type { TFunction } from "i18next";
import { MIN_PASSWORD_LENGTH } from "../constants/auth";

function zodErrorsToRecord(err: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  err.issues.forEach((issue: ZodIssue) => {
    errors[issue.path.join(".")] = issue.message;
  });
  return errors;
}

export function createLoginFormSchema(t: TFunction) {
  return z.object({
    email: z.string().email(t("validation.auth.invalidEmail")),
    password: z.string().min(MIN_PASSWORD_LENGTH, t("validation.auth.passwordMin")),
  });
}

export type LoginFormData = z.infer<ReturnType<typeof createLoginFormSchema>>;

export function validateLoginForm(
  t: TFunction,
  data: unknown
): { valid: boolean; data?: LoginFormData; errors?: Record<string, string> } {
  try {
    const parsed = createLoginFormSchema(t).parse(data);
    return { valid: true, data: parsed };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { valid: false, errors: zodErrorsToRecord(err) };
    }
    return { valid: false, errors: { form: t("validation.failed") } };
  }
}

export function createSignupFormSchema(t: TFunction) {
  return z
    .object({
      firstName: z
        .string()
        .min(1, t("validation.auth.firstNameRequired"))
        .max(80, t("validation.auth.firstNameMax")),
      lastName: z
        .string()
        .max(80, t("validation.auth.lastNameMax"))
        .optional()
        .or(z.literal(""))
        .transform((v) => (v === "" ? undefined : v)),
      email: z.string().email(t("validation.auth.invalidEmail")),
      password: z.string().min(MIN_PASSWORD_LENGTH, t("validation.auth.passwordMin")),
      confirmPassword: z.string().min(MIN_PASSWORD_LENGTH, t("validation.auth.confirmPasswordMin")),
      companyName: z
        .string()
        .min(1, t("validation.auth.companyRequired"))
        .max(120, t("validation.auth.companyMax")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("validation.auth.passwordMismatch"),
      path: ["confirmPassword"],
    });
}

export type SignupFormData = z.infer<ReturnType<typeof createSignupFormSchema>>;

export function validateSignupForm(
  t: TFunction,
  data: unknown
): { valid: boolean; data?: SignupFormData; errors?: Record<string, string> } {
  try {
    const parsed = createSignupFormSchema(t).parse(data);
    return { valid: true, data: parsed };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { valid: false, errors: zodErrorsToRecord(err) };
    }
    return { valid: false, errors: { form: t("validation.failed") } };
  }
}

export function validateEmployeeForm(
  t: TFunction,
  data: { firstName: string; email: string }
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.firstName.trim()) errors.firstName = t("validation.employee.firstNameRequired");
  if (!data.email.trim()) errors.email = t("validation.employee.emailRequired");
  return errors;
}
