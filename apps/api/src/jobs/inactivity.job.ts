import cron from 'node-cron';
import prisma from '@gymstack/db';
import { sendInactivityNudge } from '../services/whatsapp.service';
import { sendToMember } from '../services/fcm.service';

// Daily 8:00 AM IST — members inactive for 5+ days
export function startInactivityJob() {
    cron.schedule('0 8 * * *', async () => {
        console.log('[CRON] Inactivity nudge job started');

        const activeGyms = await prisma.gym.findMany({ where: { isActive: true }, select: { id: true } });
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        for (const gym of activeGyms) {
            try {
                // Get members with active plans
                const activeMembers = await prisma.member.findMany({
                    where: {
                        gymId: gym.id,
                        subscriptions: { some: { status: 'active', endDate: { gte: new Date() } } },
                    },
                    select: { id: true },
                });

                for (const member of activeMembers) {
                    // Check last check-in
                    const lastCheckIn = await prisma.checkIn.findFirst({
                        where: { memberId: member.id },
                        orderBy: { checkedInAt: 'desc' },
                        select: { checkedInAt: true },
                    });

                    if (!lastCheckIn || lastCheckIn.checkedInAt < fiveDaysAgo) {
                        // Check if nudged in last 3 days
                        const recentNudge = await prisma.notificationLog.findFirst({
                            where: {
                                memberId: member.id,
                                type: 'inactivity_nudge',
                                createdAt: { gte: threeDaysAgo },
                            },
                        });

                        if (!recentNudge) {
                            const daysMissed = lastCheckIn
                                ? Math.floor((Date.now() - lastCheckIn.checkedInAt.getTime()) / (1000 * 60 * 60 * 24))
                                : 999;

                            try {
                                // Send WhatsApp
                                await sendInactivityNudge(member.id, daysMissed);
                            } catch (err) {
                                console.error(`[CRON] WhatsApp inactivity failed:`, (err as Error).message);
                            }

                            try {
                                // Send FCM push
                                await sendToMember(
                                    member.id,
                                    'We miss you! 💪',
                                    `It's been ${daysMissed} days since your last visit. Come back stronger!`,
                                    { type: 'inactivity_nudge' },
                                );
                            } catch (err) {
                                console.error(`[CRON] FCM inactivity failed:`, (err as Error).message);
                            }
                        }
                    }
                }
            } catch (err) {
                console.error(`[CRON] Inactivity job failed for gym ${gym.id}:`, (err as Error).message);
            }
        }

        console.log('[CRON] Inactivity nudge job completed');
    }, { timezone: 'Asia/Kolkata' });
}
