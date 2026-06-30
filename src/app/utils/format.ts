export function formatDate(
  value: string | undefined,
  fallback: string,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, options ?? { year: "numeric", month: "short", day: "numeric" });
}

export function formatUserName(user: { firstName?: string; lastName?: string; email: string }): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.email;
}
