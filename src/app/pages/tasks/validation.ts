import { z, type ZodIssue } from "zod";

export const taskFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(120, "Title must not exceed 120 characters"),
  description: z
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .optional()
    .default(""),
  priority: z.enum(["Low", "Medium", "High"], { message: "Please select a priority" }),
  status: z.enum(["Open", "In Progress", "Completed"], { message: "Please select a status" }),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;

export function validateTaskForm(
  data: unknown
): { valid: boolean; data?: TaskFormData; errors?: Record<string, string> } {
  try {
    const parsed = taskFormSchema.parse(data);
    return { valid: true, data: parsed };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      err.issues.forEach((issue: ZodIssue) => {
        const path = issue.path.join(".");
        errors[path] = issue.message;
      });
      return { valid: false, errors };
    }
    return { valid: false, errors: { form: "Validation failed" } };
  }
}

export const loginFormSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

export function validateLoginForm(
  data: unknown
): { valid: boolean; data?: LoginFormData; errors?: Record<string, string> } {
  try {
    const parsed = loginFormSchema.parse(data);
    return { valid: true, data: parsed };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      err.issues.forEach((issue: ZodIssue) => {
        errors[issue.path.join(".")] = issue.message;
      });
      return { valid: false, errors };
    }
    return { valid: false, errors: { form: "Validation failed" } };
  }
}

export const signupFormSchema = z
  .object({
    firstName: z.string().min(1, "First name is required").max(80, "First name must not exceed 80 characters"),
    lastName: z
      .string()
      .max(80, "Last name must not exceed 80 characters")
      .optional()
      .or(z.literal(""))
      .transform((v) => (v === "" ? undefined : v)),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupFormSchema>;

export function validateSignupForm(
  data: unknown
): { valid: boolean; data?: SignupFormData; errors?: Record<string, string> } {
  try {
    const parsed = signupFormSchema.parse(data);
    return { valid: true, data: parsed };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      err.issues.forEach((issue: ZodIssue) => {
        errors[issue.path.join(".")] = issue.message;
      });
      return { valid: false, errors };
    }
    return { valid: false, errors: { form: "Validation failed" } };
  }
}

