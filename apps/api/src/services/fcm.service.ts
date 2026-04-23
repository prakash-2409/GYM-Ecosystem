import prisma from '@gymstack/db';
import { env } from '../config/env';

// ─── Firebase Admin (lazy initialized) ────────────────

interface FirebaseMessage {
    token: string;
    notification: { title: string; body: string };
    data: Record<string, string>;
    android: { priority: 'high'; notification: { channelId: string; sound: string } };
}

let firebaseAccessToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken(): Promise<string> {
    if (firebaseAccessToken && Date.now() < tokenExpiresAt) {
        return firebaseAccessToken;
    }

    if (!env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
        throw new Error('Firebase credentials not configured');
    }

    // Use Google Auth Library for service account token
    const { GoogleAuth } = await import('google-auth-library');
    const auth = new GoogleAuth({
        credentials: {
            client_email: env.FIREBASE_CLIENT_EMAIL,
            private_key: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });

    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    firebaseAccessToken = tokenResponse.token || null;
    tokenExpiresAt = Date.now() + 50 * 60 * 1000; // refresh 10 min before expiry

    if (!firebaseAccessToken) throw new Error('Failed to get Firebase access token');
    return firebaseAccessToken;
}

async function sendFCMMessage(message: FirebaseMessage) {
    if (!env.FIREBASE_PROJECT_ID || env.NODE_ENV === 'development') {
        console.log('[FCM DRY-RUN]', JSON.stringify(message, null, 2));
        return { name: 'dry-run' };
    }

    const token = await getAccessToken();
    const url = `https://fcm.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/messages:send`;

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
    });

    if (!res.ok) {
        const text = await res.text();
        // If token is invalid/expired, remove it from DB
        if (res.status === 404 || text.includes('UNREGISTERED')) {
            await prisma.user.updateMany({
                where: { fcmToken: message.token },
                data: { fcmToken: null },
            });
        }
        throw new Error(`FCM error: ${res.status} ${text}`);
    }

    return res.json();
}

// ─── Notification Types ───────────────────────────────

export type NotificationType =
    | 'workout_updated'
    | 'diet_updated'
    | 'fee_reminder'
    | 'inactivity_nudge'
    | 'plan_expiry'
    | 'birthday_wish'
    | 'checkin_success';

// ─── Public Functions ─────────────────────────────────

export async function sendToMember(
    memberId: string,
    title: string,
    body: string,
    data: { type: NotificationType;[key: string]: string },
) {
    const member = await prisma.member.findUnique({
        where: { id: memberId },
        include: {
            user: { select: { fcmToken: true } },
            gym: { select: { id: true } },
        },
    });

    if (!member) throw new Error('Member not found');
    if (!member.user.fcmToken) {
        // No FCM token — log but don't fail
        console.warn(`No FCM token for member ${memberId}, skipping push`);
        return null;
    }

    try {
        const result = await sendFCMMessage({
            token: member.user.fcmToken,
            notification: { title, body },
            data: { ...data, memberId, gymId: member.gymId },
            android: {
                priority: 'high',
                notification: { channelId: 'gymstack_default', sound: 'default' },
            },
        });

        // Log the push notification
        await prisma.notificationLog.create({
            data: {
                gymId: member.gymId,
                memberId,
                type: data.type,
                channel: 'push',
                status: 'sent',
                title,
                body,
                metadata: data,
                sentAt: new Date(),
            },
        });

        return result;
    } catch (err) {
        await prisma.notificationLog.create({
            data: {
                gymId: member.gymId,
                memberId,
                type: data.type,
                channel: 'push',
                status: 'failed',
                title,
                body,
                metadata: { error: (err as Error).message, ...data },
            },
        });
        throw err;
    }
}

export async function sendToGym(
    gymId: string,
    title: string,
    body: string,
    data: { type: NotificationType;[key: string]: string },
) {
    // Get all members with FCM tokens for this gym
    const members = await prisma.member.findMany({
        where: { gymId },
        include: { user: { select: { id: true, fcmToken: true } } },
    });

    const membersWithTokens = members.filter((m) => m.user.fcmToken);

    let sent = 0;
    let failed = 0;

    for (const member of membersWithTokens) {
        try {
            await sendFCMMessage({
                token: member.user.fcmToken!,
                notification: { title, body },
                data: { ...data, memberId: member.id, gymId },
                android: {
                    priority: 'high',
                    notification: { channelId: 'gymstack_default', sound: 'default' },
                },
            });
            sent++;
        } catch {
            failed++;
        }
    }

    // Bulk log
    if (membersWithTokens.length > 0) {
        await prisma.notificationLog.createMany({
            data: membersWithTokens.map((m) => ({
                gymId,
                memberId: m.id,
                type: data.type,
                channel: 'push' as const,
                status: 'sent' as const,
                title,
                body,
                sentAt: new Date(),
            })),
        });
    }

    return { total: membersWithTokens.length, sent, failed };
}

export async function saveFCMToken(userId: string, fcmToken: string) {
    await prisma.user.update({
        where: { id: userId },
        data: { fcmToken },
    });
}
