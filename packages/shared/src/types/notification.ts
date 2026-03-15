export interface NotificationLog {
  id: string;
  gymId: string;
  memberId: string | null;
  type: string;
  channel: 'whatsapp' | 'sms' | 'push' | 'email';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  title: string | null;
  body: string | null;
  metadata: Record<string, unknown> | null;
  sentAt: string | null;
  createdAt: string;
}

export interface BodyStat {
  id: string;
  memberId: string;
  recordedAt: string;
  weightKg: number | null;
  heightCm: number | null;
  bodyFatPct: number | null;
  chestCm: number | null;
  waistCm: number | null;
  hipsCm: number | null;
  bicepCm: number | null;
  thighCm: number | null;
  notes: string | null;
  recordedBy: string | null;
  createdAt: string;
}
