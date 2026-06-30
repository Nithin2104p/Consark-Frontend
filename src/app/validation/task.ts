import { z, type ZodIssue } from "zod";
import type { TFunction } from "i18next";
import { TASK_PRIORITIES, TASK_STATUSES } from "../types/task";
import { ASSIGNEE_SELF } from "../constants/task";

function zodErrorsToRecord(err: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  err.issues.forEach((issue: ZodIssue) => {
    errors[issue.path.join(".")] = issue.message;
  });
  return errors;
}

export function createTaskFormSchema(t: TFunction) {
  return z.object({
    title: z
      .string()
      .min(3, t("validation.task.titleMin"))
      .max(120, t("validation.task.titleMax")),
    description: z.string().max(1000, t("validation.task.descriptionMax")).optional().default(""),
    priority: z.enum(TASK_PRIORITIES, { message: t("validation.task.priorityRequired") }),
    status: z.enum(TASK_STATUSES, { message: t("validation.task.statusRequired") }),
    assignedTo: z.string().optional().default(ASSIGNEE_SELF),
  });
}

export type TaskFormData = z.infer<ReturnType<typeof createTaskFormSchema>>;

export function validateTaskForm(
  t: TFunction,
  data: unknown
): { valid: boolean; data?: TaskFormData; errors?: Record<string, string> } {
  try {
    const parsed = createTaskFormSchema(t).parse(data);
    return { valid: true, data: parsed };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { valid: false, errors: zodErrorsToRecord(err) };
    }
    return { valid: false, errors: { form: t("validation.failed") } };
  }
}
