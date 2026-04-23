import crypto from 'crypto';
import Razorpay from 'razorpay';
import { env } from '../config/env';

let razorpayInstance: Razorpay | null = null;

function getRazorpayClient(): Razorpay {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay is not configured for this environment');
  }

  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  }

  return razorpayInstance;
}

export function getRazorpayKeyId(): string {
  if (!env.RAZORPAY_KEY_ID) {
    throw new Error('Razorpay key ID is missing');
  }
  return env.RAZORPAY_KEY_ID;
}

export async function createOrder(input: {
  amountPaise: number;
  receipt: string;
  notes?: Record<string, string>;
}) {
  const client = getRazorpayClient();

  return client.orders.create({
    amount: input.amountPaise,
    currency: 'INR',
    receipt: input.receipt,
    notes: input.notes,
  });
}

export async function fetchOrder(orderId: string) {
  const client = getRazorpayClient();
  return client.orders.fetch(orderId);
}

export function verifyPaymentSignature(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  if (!env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay key secret is missing');
  }

  const payload = `${input.razorpayOrderId}|${input.razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'utf8'),
    Buffer.from(input.razorpaySignature, 'utf8'),
  );
}
