import { z, type ZodIssue } from "zod";

export const approvalFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must not exceed 100 characters"),
  type: z.string().min(1, "Please select a request type"),
  description: z.string().max(500, "Description must not exceed 500 characters").optional().default(""),
  approver: z.string().min(1, "Please select an approver"),
});

export type ApprovalFormData = z.infer<typeof approvalFormSchema>;

export function validateApprovalForm(
  data: unknown
): { valid: boolean; data?: ApprovalFormData; errors?: Record<string, string> } {
  try {
    const parsed = approvalFormSchema.parse(data);
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
