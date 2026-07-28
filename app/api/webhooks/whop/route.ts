
import { NextRequest } from "next/server";
import { createClerkClient } from "@clerk/nextjs/server";
import { verifyWhopSignature } from "@/lib/whop-signature";

// Initialize Clerk Backend client
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const requestBodyText = await request.text();

    // Verify the webhook signature
    const webhookSecret = process.env.WHOP_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[WHOP WEBHOOK] Missing WHOP_WEBHOOK_SECRET");
      return new Response("Server misconfigured", { status: 500 });
    }

    const signatureHeader =
      request.headers.get("x-whop-signature") ??
      request.headers.get("whop-signature");

    if (!verifyWhopSignature(requestBodyText, signatureHeader, webhookSecret)) {
      console.error("[WHOP WEBHOOK] Invalid or missing signature, request rejected");
      return new Response("Invalid signature", { status: 401 });
    }

    // Parse the webhook payload
    let payload: any;
    try {
      payload = JSON.parse(requestBodyText);
    } catch {
      console.error("[WHOP WEBHOOK] Failed to parse JSON body");
      return new Response("Invalid JSON", { status: 400 });
    }

    console.log("[WHOP WEBHOOK] Received event:", payload.type || payload.action);

    // Handle membership events
    const eventType = payload.type || payload.action;
    const data = payload.data;

    if (
      eventType === "membership.activated" ||
      eventType === "membership.went_valid"
    ) {
      await handleMembershipActivated(data);
    } else if (
      eventType === "membership.cancelled" ||
      eventType === "membership.went_invalid" ||
      eventType === "membership.expired"
    ) {
      await handleMembershipDeactivated(data);
    } else if (eventType === "payment.succeeded") {
      console.log("[WHOP WEBHOOK] Payment succeeded:", data?.id);
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("[WHOP WEBHOOK] Processing failed:", err);
    return new Response("Webhook processing error", { status: 500 });
  }
}

async function handleMembershipActivated(membership: any) {
  const email = membership?.email || membership?.user?.email;
  console.log("[WHOP WEBHOOK] Membership activated for email:", email);

  if (!email) {
    console.error("[WHOP WEBHOOK] No email found in membership data. Full data:", JSON.stringify(membership));
    return;
  }

  try {
    // Find the Clerk user by email
    const users = await clerk.users.getUserList({
      emailAddress: [email],
    });

    if (users.data.length === 0) {
      console.error("[WHOP WEBHOOK] No Clerk user found for email:", email);
      return;
    }

    const clerkUser = users.data[0];

    // Set isPro = true in publicMetadata
    await clerk.users.updateUserMetadata(clerkUser.id, {
      publicMetadata: {
        ...clerkUser.publicMetadata,
        isPro: true,
        whopMembershipId: membership?.id,
        proPlanActivatedAt: new Date().toISOString(),
      },
    });

    console.log("[WHOP WEBHOOK] ✅ Pro status activated for user:", clerkUser.id, "email:", email);
  } catch (error) {
    console.error("[WHOP WEBHOOK] Failed to update Clerk user:", error);
  }
}

async function handleMembershipDeactivated(membership: any) {
  const email = membership?.email || membership?.user?.email;
  console.log("[WHOP WEBHOOK] Membership deactivated for email:", email);

  if (!email) {
    console.error("[WHOP WEBHOOK] No email found in membership data");
    return;
  }

  try {
    const users = await clerk.users.getUserList({
      emailAddress: [email],
    });

    if (users.data.length === 0) {
      console.error("[WHOP WEBHOOK] No Clerk user found for email:", email);
      return;
    }

    const clerkUser = users.data[0];

    // Set isPro = false in publicMetadata
    await clerk.users.updateUserMetadata(clerkUser.id, {
      publicMetadata: {
        ...clerkUser.publicMetadata,
        isPro: false,
        proDeactivatedAt: new Date().toISOString(),
      },
    });

    console.log("[WHOP WEBHOOK] ❌ Pro status deactivated for user:", clerkUser.id, "email:", email);
  } catch (error) {
    console.error("[WHOP WEBHOOK] Failed to update Clerk user:", error);
  }
}
