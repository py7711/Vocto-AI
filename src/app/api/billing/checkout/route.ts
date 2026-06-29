import {NextResponse} from "next/server";
import {z} from "zod";
import {getCurrentUser} from "@/lib/auth";
import {createCheckoutSession, createStripeCustomer, type BillingPlan} from "@/lib/billing";
import {env} from "@/lib/env";
import {prisma} from "@/lib/prisma";

const checkoutSchema = z.object({
  plan: z.enum(["BASIC", "STANDARD", "PRO"]),
  successPath: z.string().max(240).optional(),
  cancelPath: z.string().max(240).optional()
});

function normalizeReturnPath(path: string | undefined, fallback: string) {
  if (!path) return fallback;
  // 只允许站内路径，避免恶意前端把支付完成后的用户重定向到外部站点。
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) return fallback;
  return path;
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({error: "请先登录后再升级套餐。"}, {status: 401});
    }

    const input = checkoutSchema.parse(await request.json());
    const subscription = user.subscriptions?.[0];
    let stripeCustomerId = subscription?.stripeCustomerId ?? null;

    // 一个 UniScribe 用户对应一个 Stripe Customer，后续升级、降级、开票都复用该客户记录。
    if (!stripeCustomerId) {
      const customer = await createStripeCustomer({email: user.email, name: user.name, userId: user.id});
      stripeCustomerId = customer.id;
      if (subscription) {
        await prisma.subscription.update({where: {id: subscription.id}, data: {stripeCustomerId}});
      } else {
        await prisma.subscription.create({
          data: {
            userId: user.id,
            stripeCustomerId,
            plan: "FREE",
            status: "ACTIVE",
            monthlyMinuteQuota: 120,
            remainingMinutes: 120,
            maxSingleFileMinutes: 30
          }
        });
      }
    }

    const appUrl = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
    const successPath = normalizeReturnPath(input.successPath, "/zh/dashboard?checkout=success");
    const cancelPath = normalizeReturnPath(input.cancelPath, "/zh/pricing?checkout=cancel");
    // 支付会话只返回 URL，浏览器端负责跳转到 Stripe 托管支付页。
    const session = await createCheckoutSession({
      customerId: stripeCustomerId,
      userId: user.id,
      plan: input.plan as BillingPlan,
      successUrl: `${appUrl}${successPath}`,
      cancelUrl: `${appUrl}${cancelPath}`
    });

    return NextResponse.json({url: session.url});
  } catch (error) {
    const message = error instanceof Error ? error.message : "无法创建 Stripe 支付会话。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
