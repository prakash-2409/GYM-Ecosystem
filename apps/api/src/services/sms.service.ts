import { env } from '../config/env';
import prisma from '@gymstack/db';

// ─── MSG91 Client ─────────────────────────────────────

const MSG91_BASE = 'https://control.msg91.com/api/v5';

async function msg91Request(endpoint: string, body: Record<string, unknown>) {
    if (!env.MSG91_AUTH_KEY || env.NODE_ENV === 'development') {
        console.log('[SMS DRY-RUN]', endpoint, JSON.stringify(body, null, 2));
        return { type: 'success', message: 'dry-run' };
    }

    const res = await fetch(`${MSG91_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            authkey: env.MSG91_AUTH_KEY,
        },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`MSG91 error: ${res.status} ${text}`);
    }

    return res.json();
}

// ─── OTP Functions ────────────────────────────────────

export async function sendOTP(phone: string): Promise<{ type: string }> {
    const cleanPhone = phone.startsWith('+91')
        ? phone.slice(1)
        : phone.startsWith('91')
            ? phone
            : `91${phone}`;

    return msg91Request('/otp', {
        template_id: env.MSG91_OTP_TEMPLATE_ID,
        mobile: cleanPhone,
        otp_length: 6,
        otp_expiry: 10, // minutes
    });
}

export async function verifyOTP(phone: string, otp: string): Promise<{ type: string; message: string }> {
    const cleanPhone = phone.startsWith('+91')
        ? phone.slice(1)
        : phone.startsWith('91')
            ? phone
            : `91${phone}`;

    if (!env.MSG91_AUTH_KEY || env.NODE_ENV === 'development') {
        // In development, accept "123456" as the OTP
        if (otp === '123456') {
            return { type: 'success', message: 'OTP verified (dev mode)' };
        }
        return { type: 'error', message: 'Invalid OTP (dev mode — use 123456)' };
    }

    const res = await fetch(`${MSG91_BASE}/otp/verify?mobile=${cleanPhone}&otp=${otp}`, {
        method: 'GET',
        headers: { authkey: env.MSG91_AUTH_KEY },
    });

    return res.json();
}

// ─── Generic SMS ──────────────────────────────────────

export async function sendSMS(phone: string, message: string): Promise<{ type: string }> {
    const cleanPhone = phone.startsWith('+91')
        ? phone.slice(1)
        : phone.startsWith('91')
            ? phone
            : `91${phone}`;

    return msg91Request('/flow/', {
        sender: env.MSG91_SENDER_ID,
        route: '4', // transactional
        country: '91',
        sms: [{ message, to: [cleanPhone] }],
    });
}

// ─── Fallback: WhatsApp → SMS ─────────────────────────

export async function sendWithFallback(
    memberId: string,
    type: string,
    sendWhatsApp: () => Promise<void>,
): Promise<'whatsapp' | 'sms'> {
    try {
        await sendWhatsApp();
        return 'whatsapp';
    } catch (waError) {
        console.warn(`WhatsApp failed for member ${memberId}, falling back to SMS:`, (waError as Error).message);

        // Wait 5 minutes before SMS fallback
        await new Promise((resolve) => setTimeout(resolve, 5 * 60 * 1000));

        const member = await prisma.member.findUnique({
            where: { id: memberId },
            include: { user: { select: { phone: true } } },
        });

        if (!member) throw new Error('Member not found for SMS fallback');

        // Get the failed notification to get the message body
        const lastLog = await prisma.notificationLog.findFirst({
            where: { memberId, type, channel: 'whatsapp', status: 'failed' },
            orderBy: { createdAt: 'desc' },
        });

        if (lastLog?.body) {
            await sendSMS(member.user.phone, lastLog.body);

            await prisma.notificationLog.create({
                data: {
                    gymId: member.gymId,
                    memberId,
                    type,
                    channel: 'sms',
                    status: 'sent',
                    title: lastLog.title,
                    body: lastLog.body,
                    sentAt: new Date(),
                },
            });
        }

        return 'sms';
    }
}
