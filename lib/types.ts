// Role types
export const Role = {
  PARENT: "PARENT",
  TEACHER: "TEACHER",
} as const;

export type RoleType = typeof Role[keyof typeof Role];

// Appointment status types
export const AppointmentStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
} as const;

export type AppointmentStatusType = typeof AppointmentStatus[keyof typeof AppointmentStatus];

// Notice types
export const NoticeType = {
  NOTICE: "NOTICE",
  COMPLAINT: "COMPLAINT",
} as const;

export type NoticeTypeEnum = typeof NoticeType[keyof typeof NoticeType];
