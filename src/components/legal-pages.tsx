"use client";

import {useLocale} from "next-intl";
import {FileText, ShieldCheck} from "lucide-react";
import {PageHero, SiteFooter, SiteHeader} from "@/components/site-shell";

const legalCopy = {
  zh: {
    terms: {
      eyebrow: "服务条款",
      title: "Votxt 服务条款",
      description: "这些条款说明账号、订阅、转写任务、企业 API、Webhook、分享链接和内容使用边界。",
      sections: [
        ["账号与安全", "你需要对账号、密码、API Key 和团队成员权限负责。请勿共享登录凭证，API Key 泄露后应立即吊销并重新创建。"],
        ["媒体与转写任务", "你应确保上传、粘贴链接或录音的内容拥有合法处理权。Votxt 会按任务配置调用转写、AI 洞察和翻译服务商，并在失败时自动降级。"],
        ["订阅与额度", "免费和付费套餐包含不同的月度分钟数、单文件限制和队列权益。任务创建会预留额度，完成后按实际时长结算，失败会释放预留额度。"],
        ["企业功能", "团队成员、API Key、Webhook、审计日志和分享链接用于企业协作。公开分享链接是只读页面，请谨慎分发给外部人员。"],
        ["可接受使用", "不得使用 Votxt 处理违法内容、侵犯他人权益的素材、恶意自动化请求或规避平台限制的任务。"]
      ]
    },
    privacy: {
      eyebrow: "隐私政策",
      title: "Votxt 隐私政策",
      description: "本政策说明 Votxt 如何处理账号信息、媒体文件、转写文本、AI 洞察、支付信息和企业日志。",
      sections: [
        ["我们处理的数据", "Votxt 会处理账号邮箱、名称、头像、登录状态、订阅信息、上传媒体 URL、转写文本、AI 洞察、导出文件、API Key 前缀、Webhook 投递记录和审计日志。"],
        ["媒体与服务商", "为了完成转写、摘要和翻译，Votxt 会把必要的媒体或文本发送给已配置的 Groq、Deepgram、AssemblyAI、DeepSeek、Gemini、DeepL 等服务商。"],
        ["安全措施", "上传使用短期预签名 URL，登录使用 httpOnly Cookie，API Key、分享 Token、Webhook 密钥只保存哈希，不保存明文。"],
        ["企业控制", "团队管理员可以查看成员、API Key、Webhook、分享链接和审计日志。数据保留期可通过团队配置扩展。"],
        ["联系与删除", "如需删除账号、任务或企业数据，应由团队所有者提交请求；生产环境应结合 DPA、区域化存储和备份策略执行。"]
      ]
    }
  },
  en: {
    terms: {
      eyebrow: "Terms",
      title: "Votxt Terms of Service",
      description: "These terms cover accounts, subscriptions, transcription jobs, enterprise APIs, webhooks, share links, and acceptable use.",
      sections: [
        ["Accounts and security", "You are responsible for your account, password, API keys, and team permissions. Revoke leaked API keys immediately."],
        ["Media and jobs", "You must have the right to process uploaded files, links, and recordings. Votxt may call configured transcription, AI, and translation providers."],
        ["Subscriptions and quota", "Plans include different monthly minutes, file limits, and queue priority. Jobs reserve quota, settle on completion, and release quota on failure."],
        ["Enterprise features", "Members, API keys, webhooks, audit logs, and share links support team workflows. Public share links are read-only and should be distributed carefully."],
        ["Acceptable use", "Do not use Votxt for illegal content, rights-infringing media, malicious automation, or attempts to bypass platform limits."]
      ]
    },
    privacy: {
      eyebrow: "Privacy",
      title: "Votxt Privacy Policy",
      description: "This policy explains how Votxt handles account data, media files, transcripts, AI insights, billing records, and enterprise logs.",
      sections: [
        ["Data we process", "Votxt processes account email, name, avatar, session state, subscription data, media URLs, transcripts, AI insights, exports, API key prefixes, webhook deliveries, and audit logs."],
        ["Media and providers", "To complete transcription, summarization, and translation, Votxt may send necessary media or text to configured providers such as Groq, Deepgram, AssemblyAI, DeepSeek, Gemini, and DeepL."],
        ["Security measures", "Uploads use short-lived signed URLs, sessions use httpOnly cookies, and API keys, share tokens, and webhook secrets are stored only as hashes."],
        ["Enterprise controls", "Team admins can manage members, API keys, webhooks, share links, and audit logs. Retention can be extended through team configuration."],
        ["Deletion", "Account, task, or enterprise data deletion should be requested by a team owner and handled with production backup, DPA, and regional storage policies."]
      ]
    }
  }
} as const;

export function LegalPage({type}: {type: "terms" | "privacy"}) {
  const locale = useLocale();
  const copy = (locale === "zh" ? legalCopy.zh : legalCopy.en)[type];
  const Icon = type === "privacy" ? ShieldCheck : FileText;

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <PageHero {...copy} />
      <section className="mx-auto grid max-w-5xl gap-4 px-4 py-12 md:px-8">
        {copy.sections.map(([heading, body]) => (
          <article key={heading} className="rounded-2xl border border-ink/10 bg-white/75 p-6 shadow-soft transition hover:border-ink/15">
            <h2 className="flex items-center gap-2 text-xl font-black text-ink"><Icon size={19} className="text-tide" />{heading}</h2>
            <p className="mt-3 text-sm leading-7 text-ink/70">{body}</p>
          </article>
        ))}
      </section>
      <SiteFooter />
    </main>
  );
}
