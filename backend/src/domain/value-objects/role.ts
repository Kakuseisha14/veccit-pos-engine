export const ROLES = ['SUPER_ADMIN', 'TENANT_ADMIN', 'CASHIER'] as const;

export type Role = (typeof ROLES)[number];

export const isRole = (value: string): value is Role =>
  (ROLES as readonly string[]).includes(value);
