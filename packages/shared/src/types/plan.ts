export interface MembershipPlan {
  id: string;
  gymId: string;
  name: string;
  durationDays: number;
  price: number;
  gstPercent: number;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface MemberSubscription {
  id: string;
  memberId: string;
  planId: string;
  gymId: string;
  startDate: string;
  endDate: string;
  status: string;
  amountPaid: number;
  createdAt: string;
  plan?: MembershipPlan;
}
