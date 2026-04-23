// ─── Mock Data for GymOS Demo ────────────────────────────────
// All data is fake. Indian names, ₹ amounts, Indian phone numbers.
// This file powers the entire demo — no backend needed.

export type MockMember = {
  id: string;
  memberCode: string;
  name: string;
  phone: string;
  email: string;
  avatarUrl: string | null;
  gender: 'Male' | 'Female';
  age: number;
  joinedAt: string;
  plan: string;
  planAmount: number;
  planStart: string;
  planEnd: string;
  status: 'active' | 'expiring' | 'expired';
  feesDue: number;
  lastCheckIn: string;
  totalVisits: number;
  thisMonthVisits: number;
  attendanceDays: number[];
  weight: number[];  // last 6 months
  bodyFat: number[]; // last 6 months
};

export type MockNotification = {
  id: string;
  title: string;
  message: string;
  type: 'fee_reminder' | 'general' | 'birthday' | 'inactivity' | 'promo';
  sentAt: string;
  sentTo: string;
  channel: 'whatsapp' | 'sms' | 'push';
  status: 'delivered' | 'failed' | 'pending';
};

export type MockFee = {
  id: string;
  memberId: string;
  memberName: string;
  memberCode: string;
  plan: string;
  amount: number;
  dueDate: string;
  status: 'due' | 'overdue' | 'paid';
  paidAt: string | null;
  method: 'cash' | 'upi' | 'online' | null;
};

export type MockCheckIn = {
  id: string;
  memberId: string;
  memberName: string;
  memberCode: string;
  checkedInAt: string;
  source: 'kiosk' | 'mobile';
};

// ─── Members ────────────────────────────────────────────────

export const MOCK_MEMBERS: MockMember[] = [
  {
    id: 'mem-001',
    memberCode: '1042',
    name: 'Rahul Kumar',
    phone: '+91 98765 43210',
    email: 'rahul.kumar@gmail.com',
    avatarUrl: null,
    gender: 'Male',
    age: 28,
    joinedAt: '2025-08-15',
    plan: '6 Month Premium',
    planAmount: 4500,
    planStart: '2026-01-01',
    planEnd: '2026-06-30',
    status: 'active',
    feesDue: 0,
    lastCheckIn: '2026-04-09T07:30:00',
    totalVisits: 142,
    thisMonthVisits: 7,
    attendanceDays: [1, 2, 3, 5, 6, 8, 9],
    weight: [82, 80, 78, 76, 75, 74],
    bodyFat: [24, 23, 22, 21, 20, 19],
  },
  {
    id: 'mem-002',
    memberCode: '2031',
    name: 'Priya Sharma',
    phone: '+91 87654 32109',
    email: 'priya.sharma@outlook.com',
    avatarUrl: null,
    gender: 'Female',
    age: 25,
    joinedAt: '2025-11-01',
    plan: '3 Month Basic',
    planAmount: 2500,
    planStart: '2026-02-01',
    planEnd: '2026-04-30',
    status: 'expiring',
    feesDue: 2500,
    lastCheckIn: '2026-04-08T18:15:00',
    totalVisits: 56,
    thisMonthVisits: 5,
    attendanceDays: [1, 3, 5, 7, 8],
    weight: [58, 57, 56, 55, 55, 54],
    bodyFat: [28, 27, 26, 25, 24, 23],
  },
  {
    id: 'mem-003',
    memberCode: '1078',
    name: 'Amit Patel',
    phone: '+91 99887 76543',
    email: 'amit.patel@gmail.com',
    avatarUrl: null,
    gender: 'Male',
    age: 32,
    joinedAt: '2025-06-10',
    plan: '12 Month Gold',
    planAmount: 8000,
    planStart: '2025-10-01',
    planEnd: '2026-09-30',
    status: 'active',
    feesDue: 0,
    lastCheckIn: '2026-04-09T06:00:00',
    totalVisits: 210,
    thisMonthVisits: 8,
    attendanceDays: [1, 2, 3, 4, 5, 7, 8, 9],
    weight: [90, 88, 86, 84, 83, 82],
    bodyFat: [26, 25, 24, 23, 22, 21],
  },
  {
    id: 'mem-004',
    memberCode: '1156',
    name: 'Sneha Reddy',
    phone: '+91 77665 54432',
    email: 'sneha.r@yahoo.com',
    avatarUrl: null,
    gender: 'Female',
    age: 22,
    joinedAt: '2026-01-15',
    plan: '1 Month Trial',
    planAmount: 999,
    planStart: '2026-03-15',
    planEnd: '2026-04-14',
    status: 'expiring',
    feesDue: 999,
    lastCheckIn: '2026-04-07T17:45:00',
    totalVisits: 18,
    thisMonthVisits: 4,
    attendanceDays: [1, 3, 5, 7],
    weight: [52, 52, 51, 51, 50, 50],
    bodyFat: [22, 22, 21, 21, 20, 20],
  },
  {
    id: 'mem-005',
    memberCode: '1203',
    name: 'Vikram Singh',
    phone: '+91 98112 33445',
    email: 'vikram.singh@gmail.com',
    avatarUrl: null,
    gender: 'Male',
    age: 35,
    joinedAt: '2025-03-20',
    plan: '12 Month Gold',
    planAmount: 8000,
    planStart: '2025-12-01',
    planEnd: '2026-11-30',
    status: 'active',
    feesDue: 0,
    lastCheckIn: '2026-04-08T06:30:00',
    totalVisits: 280,
    thisMonthVisits: 6,
    attendanceDays: [1, 2, 4, 5, 7, 8],
    weight: [95, 93, 91, 89, 88, 87],
    bodyFat: [28, 27, 26, 25, 24, 23],
  },
  {
    id: 'mem-006',
    memberCode: '1089',
    name: 'Ananya Gupta',
    phone: '+91 88997 76655',
    email: 'ananya.g@gmail.com',
    avatarUrl: null,
    gender: 'Female',
    age: 27,
    joinedAt: '2025-09-01',
    plan: '6 Month Premium',
    planAmount: 4500,
    planStart: '2025-12-01',
    planEnd: '2026-05-31',
    status: 'active',
    feesDue: 0,
    lastCheckIn: '2026-04-09T08:00:00',
    totalVisits: 98,
    thisMonthVisits: 7,
    attendanceDays: [1, 2, 3, 5, 6, 8, 9],
    weight: [62, 61, 60, 59, 58, 57],
    bodyFat: [25, 24, 23, 22, 21, 20],
  },
  {
    id: 'mem-007',
    memberCode: '2045',
    name: 'Ravi Verma',
    phone: '+91 70123 45678',
    email: 'ravi.verma@hotmail.com',
    avatarUrl: null,
    gender: 'Male',
    age: 40,
    joinedAt: '2025-04-05',
    plan: '3 Month Basic',
    planAmount: 2500,
    planStart: '2026-01-01',
    planEnd: '2026-03-31',
    status: 'expired',
    feesDue: 2500,
    lastCheckIn: '2026-03-25T19:00:00',
    totalVisits: 45,
    thisMonthVisits: 0,
    attendanceDays: [],
    weight: [88, 87, 87, 86, 86, 86],
    bodyFat: [30, 30, 29, 29, 29, 28],
  },
  {
    id: 'mem-008',
    memberCode: '1312',
    name: 'Kavita Joshi',
    phone: '+91 99001 12233',
    email: 'kavita.j@gmail.com',
    avatarUrl: null,
    gender: 'Female',
    age: 30,
    joinedAt: '2025-07-20',
    plan: '6 Month Premium',
    planAmount: 4500,
    planStart: '2026-01-01',
    planEnd: '2026-06-30',
    status: 'active',
    feesDue: 0,
    lastCheckIn: '2026-04-09T07:00:00',
    totalVisits: 165,
    thisMonthVisits: 9,
    attendanceDays: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    weight: [65, 64, 63, 62, 61, 60],
    bodyFat: [27, 26, 25, 24, 23, 22],
  },
  {
    id: 'mem-009',
    memberCode: '1455',
    name: 'Arjun Mehta',
    phone: '+91 88776 65544',
    email: 'arjun.m@gmail.com',
    avatarUrl: null,
    gender: 'Male',
    age: 26,
    joinedAt: '2025-12-01',
    plan: '3 Month Basic',
    planAmount: 2500,
    planStart: '2026-03-01',
    planEnd: '2026-05-31',
    status: 'active',
    feesDue: 0,
    lastCheckIn: '2026-04-08T20:30:00',
    totalVisits: 35,
    thisMonthVisits: 6,
    attendanceDays: [1, 2, 4, 5, 7, 8],
    weight: [75, 74, 73, 73, 72, 71],
    bodyFat: [20, 20, 19, 19, 18, 18],
  },
  {
    id: 'mem-010',
    memberCode: '1567',
    name: 'Deepika Nair',
    phone: '+91 70234 56789',
    email: 'deepika.n@gmail.com',
    avatarUrl: null,
    gender: 'Female',
    age: 24,
    joinedAt: '2026-02-14',
    plan: '1 Month Trial',
    planAmount: 999,
    planStart: '2026-03-14',
    planEnd: '2026-04-13',
    status: 'expired',
    feesDue: 999,
    lastCheckIn: '2026-04-05T16:00:00',
    totalVisits: 12,
    thisMonthVisits: 3,
    attendanceDays: [1, 3, 5],
    weight: [55, 55, 54, 54, 53, 53],
    bodyFat: [23, 23, 22, 22, 21, 21],
  },
  {
    id: 'mem-011',
    memberCode: '1678',
    name: 'Manish Tiwari',
    phone: '+91 98234 56780',
    email: 'manish.t@gmail.com',
    avatarUrl: null,
    gender: 'Male',
    age: 38,
    joinedAt: '2025-05-10',
    plan: '12 Month Gold',
    planAmount: 8000,
    planStart: '2025-08-01',
    planEnd: '2026-07-31',
    status: 'active',
    feesDue: 0,
    lastCheckIn: '2026-04-09T05:30:00',
    totalVisits: 245,
    thisMonthVisits: 9,
    attendanceDays: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    weight: [85, 84, 83, 82, 81, 80],
    bodyFat: [22, 22, 21, 21, 20, 20],
  },
  {
    id: 'mem-012',
    memberCode: '1890',
    name: 'Pooja Deshmukh',
    phone: '+91 77889 90011',
    email: 'pooja.d@yahoo.com',
    avatarUrl: null,
    gender: 'Female',
    age: 29,
    joinedAt: '2025-10-15',
    plan: '6 Month Premium',
    planAmount: 4500,
    planStart: '2026-01-15',
    planEnd: '2026-07-14',
    status: 'active',
    feesDue: 0,
    lastCheckIn: '2026-04-08T07:15:00',
    totalVisits: 78,
    thisMonthVisits: 5,
    attendanceDays: [1, 3, 5, 7, 8],
    weight: [60, 59, 58, 57, 57, 56],
    bodyFat: [26, 25, 24, 23, 23, 22],
  },
];

// ─── Kiosk Lookup ──────────────────────────────────────────

export function lookupMemberByCode(code: string): MockMember | null {
  return MOCK_MEMBERS.find((m) => m.memberCode === code) || null;
}

// ─── Fees ──────────────────────────────────────────────────

export const MOCK_FEES: MockFee[] = [
  {
    id: 'fee-001', memberId: 'mem-002', memberName: 'Priya Sharma', memberCode: '2031',
    plan: '3 Month Basic', amount: 2500, dueDate: '2026-04-01', status: 'due', paidAt: null, method: null,
  },
  {
    id: 'fee-002', memberId: 'mem-004', memberName: 'Sneha Reddy', memberCode: '1156',
    plan: '1 Month Trial', amount: 999, dueDate: '2026-04-14', status: 'due', paidAt: null, method: null,
  },
  {
    id: 'fee-003', memberId: 'mem-007', memberName: 'Ravi Verma', memberCode: '2045',
    plan: '3 Month Basic', amount: 2500, dueDate: '2026-03-31', status: 'overdue', paidAt: null, method: null,
  },
  {
    id: 'fee-004', memberId: 'mem-010', memberName: 'Deepika Nair', memberCode: '1567',
    plan: '1 Month Trial', amount: 999, dueDate: '2026-04-13', status: 'overdue', paidAt: null, method: null,
  },
  {
    id: 'fee-005', memberId: 'mem-001', memberName: 'Rahul Kumar', memberCode: '1042',
    plan: '6 Month Premium', amount: 4500, dueDate: '2026-01-01', status: 'paid', paidAt: '2025-12-28', method: 'upi',
  },
  {
    id: 'fee-006', memberId: 'mem-003', memberName: 'Amit Patel', memberCode: '1078',
    plan: '12 Month Gold', amount: 8000, dueDate: '2025-10-01', status: 'paid', paidAt: '2025-09-28', method: 'cash',
  },
  {
    id: 'fee-007', memberId: 'mem-005', memberName: 'Vikram Singh', memberCode: '1203',
    plan: '12 Month Gold', amount: 8000, dueDate: '2025-12-01', status: 'paid', paidAt: '2025-11-30', method: 'online',
  },
  {
    id: 'fee-008', memberId: 'mem-006', memberName: 'Ananya Gupta', memberCode: '1089',
    plan: '6 Month Premium', amount: 4500, dueDate: '2025-12-01', status: 'paid', paidAt: '2025-11-29', method: 'upi',
  },
  {
    id: 'fee-009', memberId: 'mem-008', memberName: 'Kavita Joshi', memberCode: '1312',
    plan: '6 Month Premium', amount: 4500, dueDate: '2026-01-01', status: 'paid', paidAt: '2025-12-30', method: 'cash',
  },
  {
    id: 'fee-010', memberId: 'mem-009', memberName: 'Arjun Mehta', memberCode: '1455',
    plan: '3 Month Basic', amount: 2500, dueDate: '2026-03-01', status: 'paid', paidAt: '2026-02-28', method: 'upi',
  },
  {
    id: 'fee-011', memberId: 'mem-011', memberName: 'Manish Tiwari', memberCode: '1678',
    plan: '12 Month Gold', amount: 8000, dueDate: '2025-08-01', status: 'paid', paidAt: '2025-07-30', method: 'online',
  },
  {
    id: 'fee-012', memberId: 'mem-012', memberName: 'Pooja Deshmukh', memberCode: '1890',
    plan: '6 Month Premium', amount: 4500, dueDate: '2026-01-15', status: 'paid', paidAt: '2026-01-14', method: 'cash',
  },
];

// ─── Check-ins (today) ─────────────────────────────────────

export const MOCK_TODAY_CHECKINS: MockCheckIn[] = [
  { id: 'ci-001', memberId: 'mem-011', memberName: 'Manish Tiwari', memberCode: '1678', checkedInAt: '2026-04-09T05:30:00', source: 'kiosk' },
  { id: 'ci-002', memberId: 'mem-003', memberName: 'Amit Patel', memberCode: '1078', checkedInAt: '2026-04-09T06:00:00', source: 'mobile' },
  { id: 'ci-003', memberId: 'mem-008', memberName: 'Kavita Joshi', memberCode: '1312', checkedInAt: '2026-04-09T07:00:00', source: 'kiosk' },
  { id: 'ci-004', memberId: 'mem-001', memberName: 'Rahul Kumar', memberCode: '1042', checkedInAt: '2026-04-09T07:30:00', source: 'kiosk' },
  { id: 'ci-005', memberId: 'mem-006', memberName: 'Ananya Gupta', memberCode: '1089', checkedInAt: '2026-04-09T08:00:00', source: 'mobile' },
];

// ─── Notifications ──────────────────────────────────────────

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: 'notif-001', title: 'Fee Reminder', message: 'Hi Priya, your 3 Month Basic plan fee of ₹2,500 is due on 1st April. Please visit the gym to renew.',
    type: 'fee_reminder', sentAt: '2026-04-01T09:00:00', sentTo: 'Priya Sharma', channel: 'whatsapp', status: 'delivered',
  },
  {
    id: 'notif-002', title: 'Fee Overdue', message: 'Hi Ravi, your subscription expired on 31st March. Renew today to continue your fitness journey!',
    type: 'fee_reminder', sentAt: '2026-04-02T10:00:00', sentTo: 'Ravi Verma', channel: 'sms', status: 'delivered',
  },
  {
    id: 'notif-003', title: 'Happy Birthday! 🎂', message: 'Happy Birthday Sneha! Wishing you a fit and healthy year ahead. Enjoy a complimentary protein shake today!',
    type: 'birthday', sentAt: '2026-04-05T08:00:00', sentTo: 'Sneha Reddy', channel: 'whatsapp', status: 'delivered',
  },
  {
    id: 'notif-004', title: 'We miss you!', message: 'Hi Deepika, we noticed you havent visited in 4 days. Your body is calling — come back stronger! 💪',
    type: 'inactivity', sentAt: '2026-04-06T08:00:00', sentTo: 'Deepika Nair', channel: 'push', status: 'delivered',
  },
  {
    id: 'notif-005', title: 'Summer Offer 🌞', message: 'Upgrade to 6 Month Premium and get 15% off! Offer valid till 15th April.',
    type: 'promo', sentAt: '2026-04-07T11:00:00', sentTo: 'All Members', channel: 'whatsapp', status: 'delivered',
  },
  {
    id: 'notif-006', title: 'New Batch Added', message: 'Early Morning 5 AM batch now available! Limited slots. Register at the front desk.',
    type: 'general', sentAt: '2026-04-08T09:00:00', sentTo: 'All Members', channel: 'push', status: 'pending',
  },
  {
    id: 'notif-007', title: 'Fee Reminder', message: 'Hi Sneha, your 1 Month Trial expires on 14th April. Upgrade to Premium for ₹4,500.',
    type: 'fee_reminder', sentAt: '2026-04-08T10:00:00', sentTo: 'Sneha Reddy', channel: 'whatsapp', status: 'failed',
  },
];

// ─── Dashboard Stats ────────────────────────────────────────

export const MOCK_DASHBOARD_STATS = {
  totalMembers: 148,
  activeMembers: 112,
  todayCheckIns: 5,
  monthlyRevenue: 185000,
  overdueCount: 4,
  newThisMonth: 8,
  avgCheckInsPerDay: 32,
  popularPlan: '6 Month Premium',
};

// ─── Revenue Chart Data (monthly) ───────────────────────────

export const MOCK_REVENUE_CHART = [
  { month: 'Nov', revenue: 145000 },
  { month: 'Dec', revenue: 162000 },
  { month: 'Jan', revenue: 178000 },
  { month: 'Feb', revenue: 156000 },
  { month: 'Mar', revenue: 192000 },
  { month: 'Apr', revenue: 185000 },
];

// ─── Plan Distribution ─────────────────────────────────────

export const MOCK_PLAN_DISTRIBUTION = [
  { name: '1 Month Trial', members: 22, color: '#F59E0B' },
  { name: '3 Month Basic', members: 38, color: '#3B82F6' },
  { name: '6 Month Premium', members: 52, color: '#8B5CF6' },
  { name: '12 Month Gold', members: 36, color: '#10B981' },
];

// ─── Member App (Mobile PWA) Mock Data ──────────────────────

export const MEMBER_APP_USER = MOCK_MEMBERS[0]; // Rahul Kumar

export const MEMBER_APP_NOTIFICATIONS = [
  { id: 'mn-001', title: 'Check-in Confirmed ✅', message: 'Welcome back, Rahul! Your check-in at 7:30 AM has been recorded.', time: '2 hours ago', read: true },
  { id: 'mn-002', title: 'Summer Offer 🌞', message: 'Upgrade to 12 Month Gold and save ₹6,000! Offer ends 15 Apr.', time: '1 day ago', read: false },
  { id: 'mn-003', title: 'Workout Updated', message: 'Coach Suresh has updated your workout plan for this week.', time: '2 days ago', read: true },
  { id: 'mn-004', title: 'Monthly Progress 📊', message: 'You lost 1 kg this month! Keep pushing. 💪', time: '3 days ago', read: true },
  { id: 'mn-005', title: 'New Batch Available', message: 'Early morning 5 AM batch now open. Limited slots!', time: '5 days ago', read: false },
];

// ─── Quick Actions / Stats for Member App ───────────────────

export const MEMBER_APP_STATS = {
  streak: 7,
  thisMonthVisits: 7,
  totalVisits: 142,
  daysRemaining: 82,
  nextBillingDate: '30 Jun 2026',
  plan: '6 Month Premium',
  planAmount: 4500,
};

// ─── Scheduler Mock Data ──────────────────────────────────────

export const MOCK_EXERCISES = [
  { id: 'ex-1', name: 'Barbell Bench Press', muscleGroup: 'Chest' },
  { id: 'ex-2', name: 'Incline Dumbbell Press', muscleGroup: 'Chest' },
  { id: 'ex-3', name: 'Push Ups', muscleGroup: 'Chest' },
  { id: 'ex-4', name: 'Cable Crossovers', muscleGroup: 'Chest' },
  { id: 'ex-5', name: 'Pull Ups', muscleGroup: 'Back' },
  { id: 'ex-6', name: 'Barbell Rows', muscleGroup: 'Back' },
  { id: 'ex-7', name: 'Lat Pulldowns', muscleGroup: 'Back' },
  { id: 'ex-8', name: 'Deadlifts', muscleGroup: 'Back' },
  { id: 'ex-9', name: 'Overhead Press', muscleGroup: 'Shoulders' },
  { id: 'ex-10', name: 'Lateral Raises', muscleGroup: 'Shoulders' },
  { id: 'ex-11', name: 'Barbell Squats', muscleGroup: 'Legs' },
  { id: 'ex-12', name: 'Leg Press', muscleGroup: 'Legs' },
  { id: 'ex-13', name: 'Leg Extensions', muscleGroup: 'Legs' },
  { id: 'ex-14', name: 'Romanian Deadlifts', muscleGroup: 'Legs' },
  { id: 'ex-15', name: 'Calf Raises', muscleGroup: 'Legs' },
  { id: 'ex-16', name: 'Barbell Curls', muscleGroup: 'Biceps' },
  { id: 'ex-17', name: 'Hammer Curls', muscleGroup: 'Biceps' },
  { id: 'ex-18', name: 'Tricep Pushdowns', muscleGroup: 'Triceps' },
  { id: 'ex-19', name: 'Overhead Tricep Extension', muscleGroup: 'Triceps' },
  { id: 'ex-20', name: 'Crunches', muscleGroup: 'Core' },
  { id: 'ex-21', name: 'Planks', muscleGroup: 'Core' },
];

export const MOCK_TEMPLATES = [
  {
    id: 'tpl-1',
    name: 'Beginner Fat Loss — Month 1',
    goal: 'Fat Loss',
    daysPerWeek: 3,
    usersCount: 23,
    lastUpdated: '2026-03-25T10:00:00',
    days: [
      {
        id: 'd-1',
        name: 'Full Body A',
        exercises: [
          { id: 'e-1', exercise: MOCK_EXERCISES[10], sets: 3, reps: '10-12', rest: '60s' }, // Squats
          { id: 'e-2', exercise: MOCK_EXERCISES[0], sets: 3, reps: '10-12', rest: '60s' }, // Bench
          { id: 'e-3', exercise: MOCK_EXERCISES[6], sets: 3, reps: '12-15', rest: '45s' }, // Lat pull
        ]
      },
      {
        id: 'd-2',
        name: 'Active Recovery / Cardio',
        exercises: []
      },
      {
        id: 'd-3',
        name: 'Full Body B',
        exercises: [
          { id: 'e-4', exercise: MOCK_EXERCISES[11], sets: 3, reps: '12-15', rest: '60s' }, // Leg press
          { id: 'e-5', exercise: MOCK_EXERCISES[8], sets: 3, reps: '10-12', rest: '60s' }, // OHP
          { id: 'e-6', exercise: MOCK_EXERCISES[5], sets: 3, reps: '10-12', rest: '60s' }, // Rows
        ]
      }
    ],
    diet: {
      morning: 'Oats with protein powder and almond milk',
      preWorkout: 'Banana and black coffee',
      postWorkout: 'Whey protein shake and 2 egg whites',
      night: 'Grilled chicken breast, broccoli, and quinoa'
    },
    coachNotes: 'Focus on form, not the weight. Stay hydrated!'
  },
  {
    id: 'tpl-2',
    name: 'Intermediate Bulk — Phase 1',
    goal: 'Muscle Gain',
    daysPerWeek: 4,
    usersCount: 14,
    lastUpdated: '2026-04-01T14:30:00',
    days: [
      { id: 'd-1', name: 'Upper Body', exercises: [
        { id: 'e-1', exercise: MOCK_EXERCISES[0], sets: 4, reps: '8-10', rest: '90s' },
        { id: 'e-2', exercise: MOCK_EXERCISES[5], sets: 4, reps: '8-10', rest: '90s' },
      ]},
      { id: 'd-2', name: 'Lower Body', exercises: [
        { id: 'e-3', exercise: MOCK_EXERCISES[10], sets: 4, reps: '8-10', rest: '90s' },
        { id: 'e-4', exercise: MOCK_EXERCISES[13], sets: 4, reps: '10-12', rest: '90s' },
      ]},
      { id: 'd-3', name: 'Rest', exercises: [] },
      { id: 'd-4', name: 'Upper Body (Hypertrophy)', exercises: [
        { id: 'e-5', exercise: MOCK_EXERCISES[1], sets: 3, reps: '12-15', rest: '60s' },
        { id: 'e-6', exercise: MOCK_EXERCISES[6], sets: 3, reps: '12-15', rest: '60s' },
      ]},
      { id: 'd-5', name: 'Lower Body (Hypertrophy)', exercises: [
        { id: 'e-7', exercise: MOCK_EXERCISES[11], sets: 3, reps: '15-20', rest: '60s' },
        { id: 'e-8', exercise: MOCK_EXERCISES[12], sets: 3, reps: '15-20', rest: '60s' },
      ]}
    ],
    diet: {
      morning: '4 whole eggs, 2 slices whole wheat toast, spinach',
      preWorkout: 'Greek yogurt with berries and honey',
      postWorkout: 'Protein shake and a large meal with rice and chicken',
      night: 'Cottage cheese and peanut butter'
    },
    coachNotes: 'Push the intensity on Hypertrophy days.'
  },
  {
    id: 'tpl-3',
    name: 'Advanced Cut — Week 1-4',
    goal: 'Fat Loss',
    daysPerWeek: 5,
    usersCount: 8,
    lastUpdated: '2026-04-05T09:15:00',
    days: [],
    diet: { morning: '', preWorkout: '', postWorkout: '', night: '' },
    coachNotes: 'Strict diet adherence required.'
  },
  {
    id: 'tpl-4',
    name: 'Senior Low Impact',
    goal: 'Maintenance',
    daysPerWeek: 3,
    usersCount: 5,
    lastUpdated: '2025-11-20T11:00:00',
    days: [],
    diet: { morning: '', preWorkout: '', postWorkout: '', night: '' },
    coachNotes: 'Keep movements slow and controlled.'
  }
];

export const MOCK_MEMBER_PLANS: Record<string, typeof MOCK_TEMPLATES[0]> = {
  'mem-001': {
    ...MOCK_TEMPLATES[0],
    id: 'assigned-1',
    name: 'Rahul’s April Plan',
  }
};
