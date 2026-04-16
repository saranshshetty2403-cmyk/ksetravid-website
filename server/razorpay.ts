/**
 * Razorpay helper — wraps the Razorpay Node SDK.
 * Keys are read from env at call-time so the module loads safely
 * even when keys are not yet configured (returns null).
 */
import Razorpay from "razorpay";
import crypto from "crypto";

function getRazorpay(): Razorpay | null {
  const keyId = process.env.KSETRAVID_RAZORPAY_KEY_ID;
  const keySecret = process.env.KSETRAVID_RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

/** Create a Razorpay order and return the order ID + public key */
export async function createRazorpayOrder(amountInPaise: number, receipt: string) {
  const rzp = getRazorpay();
  if (!rzp) throw new Error("Razorpay is not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");

  const order = await rzp.orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt,
    payment_capture: true,
  });

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.KSETRAVID_RAZORPAY_KEY_ID!,
  };
}

/** Verify the Razorpay payment signature — call this after the frontend reports success */
export function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  const keySecret = process.env.KSETRAVID_RAZORPAY_KEY_SECRET;
  if (!keySecret) return false;
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto.createHmac("sha256", keySecret).update(body).digest("hex");
  return expectedSignature === razorpaySignature;
}

/** Verify webhook signature from Razorpay */
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.KSETRAVID_RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return expectedSignature === signature;
}

export function isRazorpayConfigured(): boolean {
  return !!(process.env.KSETRAVID_RAZORPAY_KEY_ID && process.env.KSETRAVID_RAZORPAY_KEY_SECRET);
}
