export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 6;
export const PASSWORD_PLACEHOLDER = "••••••••";

export const AUTH_ERROR_CODES = {
  NO_TOKEN: "AUTH_NO_TOKEN",
  SET_PASSWORD_FAILED: "AUTH_SET_PASSWORD_FAILED",
  LOAD_COMPANIES_FAILED: "AUTH_LOAD_COMPANIES_FAILED",
} as const;
