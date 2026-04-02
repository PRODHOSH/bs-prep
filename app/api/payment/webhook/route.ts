import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex")

  const expectedBuf = Buffer.from(expected)
  const signatureBuf = Buffer.from(signature)

  if (expectedBuf.length !== signatureBuf.length) {
    return false
  }

  return crypto.timingSafeEqual(expectedBuf, signatureBuf)
}

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!webhookSecret) {
      return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
    }

    const signature = request.headers.get("x-razorpay-signature") || ""
    if (!signature) {
      return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 })
    }

    const payload = await request.text()
    if (!payload || payload.length > 200000) {
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 })
    }

    if (!verifyWebhookSignature(payload, signature, webhookSecret)) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
    }

    const event = JSON.parse(payload) as {
      event?: string
      payload?: {
        payment?: {
          entity?: {
            order_id?: string
            id?: string
            status?: string
          }
        }
      }
    }

    const eventName = typeof event.event === "string" ? event.event : ""
    const paymentEntity = event.payload?.payment?.entity
    const orderId = typeof paymentEntity?.order_id === "string" ? paymentEntity.order_id : ""
    const paymentId = typeof paymentEntity?.id === "string" ? paymentEntity.id : ""

    if (!orderId && !paymentId) {
      return NextResponse.json({ received: true })
    }

    const supabase = createServiceRoleClient()

    if (eventName === "payment.captured" || eventName === "order.paid") {
      await supabase
        .from("payment_orders")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .or(`razorpay_order_id.eq.${orderId},razorpay_payment_id.eq.${paymentId}`)
    }

    if (eventName === "payment.failed") {
      await supabase
        .from("payment_orders")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .or(`razorpay_order_id.eq.${orderId},razorpay_payment_id.eq.${paymentId}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Razorpay webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
