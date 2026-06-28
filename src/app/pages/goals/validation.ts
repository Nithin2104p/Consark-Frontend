import { z, type ZodIssue } from "zod";

export const goalFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must not exceed 100 characters"),
  owner: z.string().min(1, "Please select a goal owner"),
  description: z.string().max(500, "Description must not exceed 500 characters").optional().default(""),
  level: z.enum(["individual", "team", "org"]),
  visibility: z.enum(["private", "public", "team", "custom"]),
  dueDate: z.string().optional().default(""),
});

export type GoalFormData = z.infer<typeof goalFormSchema>;

export function validateGoalForm(data: unknown): { valid: boolean; data?: GoalFormData; errors?: Record<string, string> } {
  try {
    const parsed = goalFormSchema.parse(data);
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
