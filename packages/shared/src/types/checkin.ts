export interface CheckIn {
  id: string;
  memberId: string;
  gymId: string;
  checkedInAt: string;
  source: 'kiosk' | 'admin' | 'app';
  synced: boolean;
}

export interface CheckInResponse {
  checkIn: CheckIn;
  member: {
    id: string;
    memberCode: string;
    name: string;
    avatarUrl: string | null;
    phone: string;
  };
  subscription: {
    planName: string;
    startDate: string;
    endDate: string;
    daysRemaining: number;
    status: string;
  } | null;
  attendanceThisMonth: string[];
  totalVisits: number;
  feesDue: number;
  joinedAt: string;
}
