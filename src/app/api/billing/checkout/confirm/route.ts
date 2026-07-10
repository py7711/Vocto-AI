import {NextResponse} from "next/server";
import {z} from "zod";
import {getCurrentUser} from "@/lib/auth";
import {logApiError} from "@/lib/api-logger";
import {billingActionCopy, normalizeBillingLocale} from "@/lib/billing-copy";
import {retrieveCheckoutSession} from "@/lib/billing";
import {reconcilePaidCheckoutSession} from "@/lib/billing-reconcile";

export const dynamic = "force-dynamic";

const confirmSchema = z.object({
  sessionId: z.string().min(8).max(255),
  locale: z.string().min(2).max(16).optional()
});

export async function POST(request: Request) {
  let responseLocale = normalizeBillingLocale(null);
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({error: billingActionCopy[responseLocale].loginRequired}, {status: 401});
    }

    const input = confirmSchema.parse(await request.json());
    responseLocale = normalizeBillingLocale(input.locale ?? user.locale);
    const session = await retrieveCheckoutSession(input.sessionId);
    const result = await reconcilePaidCheckoutSession(session, {expectedUserId: user.id});

    return NextResponse.json(result);
  } catch (error) {
    logApiError(error, request, {route: "/api/billing/checkout/confirm"});
    return NextResponse.json({error: billingActionCopy[responseLocale].checkoutError}, {status: 502});
  }
}
