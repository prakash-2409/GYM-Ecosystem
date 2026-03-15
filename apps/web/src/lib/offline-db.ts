import Dexie, { type EntityTable } from 'dexie';

interface CachedMember {
  id: string;
  memberCode: string;
  name: string;
  avatarUrl: string | null;
  planName: string | null;
  planExpiry: string | null;
  feesDue: number;
  joinedAt: string;
}

interface OfflineCheckIn {
  id?: number;
  memberCode: string;
  timestamp: string;
  synced: boolean;
}

const db = new Dexie('GymStackKiosk') as Dexie & {
  cachedMembers: EntityTable<CachedMember, 'id'>;
  offlineCheckIns: EntityTable<OfflineCheckIn, 'id'>;
};

db.version(1).stores({
  cachedMembers: 'id, memberCode',
  offlineCheckIns: '++id, memberCode, synced',
});

export { db };
export type { CachedMember, OfflineCheckIn };
