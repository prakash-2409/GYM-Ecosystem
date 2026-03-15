export interface Member {
  id: string;
  userId: string;
  gymId: string;
  memberCode: string;
  name: string;
  phone: string;
  email: string | null;
  avatarUrl: string | null;
  dateOfBirth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  emergencyPhone: string | null;
  bloodGroup: string | null;
  joinedAt: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MemberWithStatus extends Member {
  activeSubscription: MemberSubscriptionSummary | null;
  lastCheckIn: string | null;
  feesDue: number;
  totalVisits: number;
}

export interface MemberSubscriptionSummary {
  id: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: string;
  daysRemaining: number;
}
