import { waitUntil } from "@vercel/functions";
import type { Payment } from "@whop/sdk/resources.js";
import { NextRequest } from "next/server";
import { Whop } from "@whop/sdk";

// Initialize Whop SDK
const whopsdk = new Whop({
  apiKey: process.env.WHOP_API_KEY,
  webhookKey: process.env.WHOP_WEBHOOK_SECRET ? btoa(process.env.WHOP_WEBHOOK_SECRET) : "",
});

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const requestBodyText = await request.text();
    const headers = Object.fromEntries(request.headers);
    const webhookData = whopsdk.webhooks.unwrap(requestBodyText, { headers });

    if (webhookData.type === "payment.succeeded") {
      waitUntil(handlePaymentSucceeded(webhookData.data));
    } else if (webhookData.type === "membership.activated") {
      waitUntil(handleMembershipActivated(webhookData.data));
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook processing failed:", err);
    return new Response("Invalid Webhook", { status: 400 });
  }
}

async function handlePaymentSucceeded(payment: Payment) {
  console.log("[WHOP PAYMENT SUCCEEDED]", payment.id);
  // Optional: Add to DB or analytics
}

async function handleMembershipActivated(membership: any) {
  console.log("[WHOP MEMBERSHIP ACTIVATED]", membership.id);
  // Need to update the user's Pro status in DB/Clerk based on membership user email or id
  // For example, if membership has email, we can update Clerk user metadata
}
