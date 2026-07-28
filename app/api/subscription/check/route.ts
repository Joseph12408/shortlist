import { NextResponse } from "next/server";
import { getEntitlementWithSync } from "@/lib/subscription-server";

/**
 * Authoritative subscription check.
 *
 * Queries the payment providers and repairs stale Clerk metadata, so the
 * cheap `getEntitlement()` fast path used by the paid routes stays correct.
 */
export async function GET() {
    try {
        const { isPro } = await getEntitlementWithSync();
        return NextResponse.json({ isPro });
    } catch (err) {
        console.error("[SUBSCRIPTION CHECK] Error checking subscription:", err);
        return NextResponse.json({ isPro: false, error: "Internal error" });
    }
}
