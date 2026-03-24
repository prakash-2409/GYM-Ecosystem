export interface Payment {
  id: string;
  memberId: string;
  gymId: string;
  subscriptionId: string | null;
  amount: number;
  gstAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  razorpayPaymentId: string | null;
  razorpayOrderId: string | null;
  upiRef: string | null;
  invoiceNumber: string;
  invoiceUrl: string | null;
  notes: string | null;
  paidAt: string;
  createdAt: string;
}

export interface CollectFeeRequest {
  memberId: string;
  subscriptionId?: string;
  amount: number;
  paymentMethod: string;
  upiRef?: string;
  notes?: string;
}

export interface CreateRazorpayOrderRequest {
  memberId?: string;
}

export interface CreateRazorpayOrderResponse {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  memberId: string;
  memberName: string;
  memberPhone: string;
  gymName: string;
  description: string;
}

export interface VerifyRazorpayPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}
