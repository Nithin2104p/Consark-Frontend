export type NotificationChannel = "EMAIL" | "SMS" | "Whatsapp" | "Slack" | "Teams";

export const NOTIFICATION_CHANNELS: NotificationChannel[] = [
  "EMAIL",
  "SMS",
  "Whatsapp",
  "Slack",
  "Teams",
];

export const DEFAULT_ENABLED_CHANNELS: Record<NotificationChannel, boolean> = {
  EMAIL: true,
  SMS: false,
  Whatsapp: false,
  Slack: false,
  Teams: false,
};

export const VISIBLE_PERMISSIONS = [
  "Goals:create",
  "Goals:view",
  "approvals:view",
  "approvals:edit",
] as const;
