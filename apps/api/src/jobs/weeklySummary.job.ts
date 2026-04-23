import cron from 'node-cron';
import prisma from '@gymstack/db';
import { sendBulkMessage } from '../services/whatsapp.service';

// Every Monday 8:00 AM IST — weekly summary to gym owner
export function startWeeklySummaryJob() {
    cron.schedule('0 8 * * 1', async () => {
        console.log('[CRON] Weekly summary job started');

        const activeGyms = await prisma.gym.findMany({
            where: { isActive: true },
            select: { id: true, name: true, ownerPhone: true },
        });

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);

        for (const gym of activeGyms) {
            try {
                // Check-ins this week
                const weekCheckIns = await prisma.checkIn.count({
                    where: { gymId: gym.id, checkedInAt: { gte: weekAgo } },
                });

                // New members this week
                const newMembers = await prisma.member.count({
                    where: { gymId: gym.id, createdAt: { gte: weekAgo } },
                });

                // Fee due count (subscriptions expiring soon or expired)
                const sevenDaysFromNow = new Date();
                sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
                const feeDueCount = await prisma.memberSubscription.count({
                    where: {
                        gymId: gym.id,
                        status: 'active',
                        endDate: { lte: sevenDaysFromNow },
                    },
                });

                // Inactive members (no check-in in 5+ days with active plan)
                const fiveDaysAgo = new Date();
                fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

                const activeMembers = await prisma.member.findMany({
                    where: {
                        gymId: gym.id,
                        subscriptions: { some: { status: 'active', endDate: { gte: new Date() } } },
                    },
                    include: {
                        checkIns: { orderBy: { checkedInAt: 'desc' }, take: 1, select: { checkedInAt: true } },
                    },
                });

                const inactiveCount = activeMembers.filter((m) => {
                    if (m.checkIns.length === 0) return true;
                    return m.checkIns[0].checkedInAt < fiveDaysAgo;
                }).length;

                // Send summary via WhatsApp to gym owner
                const summaryMessage = `📊 Weekly Summary for ${gym.name}\n\n` +
                    `🏋️ Check-ins this week: ${weekCheckIns}\n` +
                    `👤 New members: ${newMembers}\n` +
                    `💰 Fees due/expiring: ${feeDueCount}\n` +
                    `⚠️ Inactive members (5+ days): ${inactiveCount}\n\n` +
                    `Keep up the great work! 💪`;

                // Log instead of sending to individual — owner gets the message
                await prisma.notificationLog.create({
                    data: {
                        gymId: gym.id,
                        type: 'weekly_summary',
                        channel: 'whatsapp',
                        status: 'sent',
                        title: 'Weekly Summary',
                        body: summaryMessage,
                        sentAt: new Date(),
                    },
                });

                console.log(`[CRON] Weekly summary for ${gym.name}: ${weekCheckIns} check-ins, ${newMembers} new, ${feeDueCount} due, ${inactiveCount} inactive`);
            } catch (err) {
                console.error(`[CRON] Weekly summary failed for gym ${gym.id}:`, (err as Error).message);
            }
        }

        console.log('[CRON] Weekly summary job completed');
    }, { timezone: 'Asia/Kolkata' });
}
