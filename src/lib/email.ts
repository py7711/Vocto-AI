import "server-only";

import {env} from "@/lib/env";

type VerificationEmailInput = {
  to: string;
  name?: string | null;
  verificationUrl: string;
  locale?: string;
};

function buildEmailCopy(input: VerificationEmailInput) {
  const isZh = input.locale === "zh";
  const name = input.name || input.to;
  return {
    subject: isZh ? "验证你的 Votxt 邮箱" : "Verify your Votxt email",
    html: isZh
      ? `<p>${name}，你好：</p><p>请点击下面的链接完成 Votxt 邮箱验证：</p><p><a href="${input.verificationUrl}">${input.verificationUrl}</a></p><p>该链接 24 小时内有效。</p>`
      : `<p>Hello ${name},</p><p>Open the link below to verify your Votxt email:</p><p><a href="${input.verificationUrl}">${input.verificationUrl}</a></p><p>This link expires in 24 hours.</p>`,
    text: isZh
      ? `${name}，你好：\n请打开以下链接完成 Votxt 邮箱验证：\n${input.verificationUrl}\n该链接 24 小时内有效。`
      : `Hello ${name},\nOpen this link to verify your Votxt email:\n${input.verificationUrl}\nThis link expires in 24 hours.`
  };
}

export async function sendVerificationEmail(input: VerificationEmailInput) {
  const copy = buildEmailCopy(input);

  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    // 本地开发或未配置邮件服务时仍返回验证链接，便于前端和测试环境继续走完整流程。
    return {sent: false, verificationUrl: input.verificationUrl};
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: input.to,
      subject: copy.subject,
      html: copy.html,
      text: copy.text
    })
  });

  if (!response.ok) {
    throw new Error(`验证邮件发送失败：${response.status} ${await response.text()}`);
  }

  return {sent: true};
}
