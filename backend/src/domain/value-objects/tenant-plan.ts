export const TENANT_PLANS = ['FREE', 'PRO'] as const;

export type TenantPlan = (typeof TENANT_PLANS)[number];
