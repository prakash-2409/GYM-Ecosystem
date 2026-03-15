export const PlanDurations = {
  MONTHLY: 30,
  QUARTERLY: 90,
  HALF_YEARLY: 180,
  ANNUAL: 365,
} as const;

export type PlanDuration = (typeof PlanDurations)[keyof typeof PlanDurations];

export const SubscriptionStatus = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  FROZEN: 'frozen',
} as const;

export type SubscriptionStatusType =
  (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const PaymentMethods = {
  CASH: 'cash',
  UPI: 'upi',
  CARD: 'card',
  NETBANKING: 'netbanking',
  RAZORPAY: 'razorpay',
} as const;

export type PaymentMethod =
  (typeof PaymentMethods)[keyof typeof PaymentMethods];

export const SaasPlanTiers = {
  STARTER: { name: 'Starter', priceMonthly: 799, maxMembers: 100, maxStaff: 3 },
  PRO: { name: 'Pro', priceMonthly: 1499, maxMembers: 500, maxStaff: 10 },
  ENTERPRISE: { name: 'Enterprise', priceMonthly: 2499, maxMembers: null, maxStaff: null },
} as const;

export const TRIAL_DAYS = 14;
export const GRACE_PERIOD_DAYS = 3;
export const DEFAULT_GST_PERCENT = 18;
