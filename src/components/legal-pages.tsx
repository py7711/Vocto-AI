"use client";

import {useLocale} from "next-intl";
import {FileText, ShieldCheck} from "lucide-react";
import {PageHero, SiteFooter, SiteHeader} from "@/components/site-shell";

const legalCopy = {
  zh: {
    terms: {
      eyebrow: "服务条款",
      title: "UniScribe 服务条款",
      description: "这些条款说明个人账号、订阅、转写任务、分享链接和内容使用边界。",
      sections: [
        ["账号与安全", "你需要对个人账号和密码负责。请勿共享登录凭证，发现异常登录后应立即修改密码并联系支持。"],
        ["媒体与转写任务", "你应确保上传、粘贴链接或录音的内容拥有合法处理权。UniScribe 会按任务配置调用转写、AI 洞察和翻译服务商，并在失败时自动降级。"],
        ["订阅与额度", "免费和付费套餐包含不同的月度分钟数、单文件限制和队列权益。任务创建会预留额度，完成后按实际时长结算，失败会释放预留额度。"],
        ["个人功能", "公开分享链接用于个人内容分发，是只读页面，请谨慎分发给外部人员。"],
        ["可接受使用", "不得使用 UniScribe 处理违法内容、侵犯他人权益的素材、恶意自动化请求或规避平台限制的任务。"]
      ]
    },
    privacy: {
      eyebrow: "隐私政策",
      title: "UniScribe 隐私政策",
      description: "本政策说明 UniScribe 如何处理账号信息、媒体文件、转写文本、AI 洞察、支付信息和个人使用记录。",
      sections: [
        ["我们处理的数据", "UniScribe 会处理账号邮箱、名称、头像、登录状态、订阅信息、上传媒体 URL、转写文本、AI 洞察、导出文件和用量流水。"],
        ["媒体与服务商", "为了完成转写、摘要和翻译，UniScribe 会把必要的媒体或文本发送给已配置的 Groq、Deepgram、AssemblyAI、DeepSeek、Gemini、DeepL 等服务商。"],
        ["安全措施", "上传使用短期预签名 URL，登录使用 httpOnly Cookie，分享令牌只保存哈希，不保存明文。"],
        ["个人数据控制", "用户可以管理自己的任务、分享链接、导出文件和订阅。后续会提供更细的删除和数据导出能力。"],
        ["联系与删除", "如需删除账号、任务或个人数据，可联系支持处理。删除请求会按照适用的数据保留、备份和安全政策执行。"]
      ]
    }
  },
  en: {
    terms: {
      eyebrow: "Terms",
      title: "Terms of Service",
      description: "Last updated: Oct 9, 2024",
      sections: [
        ["Account Terms", "When we say Company, we, our, or us, we are referring to VanCode LLC. You are responsible for maintaining the security of your account, for all activity under your account, and for using the Services only for lawful purposes. Accounts registered by bots or other automated methods are not permitted."],
        ["Payment, Refunds, and Plan Changes", "Paid services may include trials, upgrades, subscriptions, taxes, and plan changes. Fees are charged according to the selected plan. Purchases are generally non-refundable unless otherwise stated, and paid subscriptions can be cancelled from your account."],
        ["Cancellation and Termination", "You are responsible for properly cancelling your account. After cancellation, account content becomes inaccessible and may be deleted from active systems and backups according to the retention policy. We may suspend or terminate accounts that violate these terms."],
        ["Uptime and Security", "Services are provided on an as-is and as-available basis. UniScribe takes uptime, backups, redundancy, and encryption seriously, and uses third-party vendors and hosting partners to operate the service."],
        ["Copyright and Content Ownership", "You retain ownership of materials you upload. Content posted through the Services must comply with copyright law, and the UniScribe name, look, feel, HTML, CSS, JavaScript, and visual design elements may not be copied without permission."],
        ["Features and Bugs", "We design UniScribe with care, but every product has limitations and bugs. Features may change as the service evolves."],
        ["Liability", "Your use of the Services is at your sole risk. These terms include limitations of liability to the extent permitted by law."]
      ]
    },
    privacy: {
      eyebrow: "Privacy",
      title: "UniScribe Privacy Policy",
      description: "Effective June 8, 2025",
      sections: [
        ["Introduction", "Your privacy is critically important to us. This policy explains how VanCode LLC, UniScribe, we, or us collects, uses, and shares personal information when you use our services."],
        ["Information We Collect", "We collect account information, user input such as audio, video, YouTube links and text, communications information, payment details processed by Stripe, usage information, device information, approximate location, cookies, and information from platforms our services rely on."],
        ["How We Use Information", "We use personal information to set up accounts, provide transcription and AI services, analyze and improve the product, communicate with you, send product news, and remember preferences through cookies."],
        ["Third Parties", "UniScribe relies on selected third parties such as cloud providers, support providers, AI service providers, analytics providers, and payment processors. These parties receive information needed to provide their services."],
        ["Security", "UniScribe maintains physical, administrative, and technical safeguards to protect the confidentiality, integrity, and availability of personal information, while recognizing that internet transmission carries inherent risks."],
        ["International Transfers and Retention", "Our services operate in the United States. Personal information may be transferred and stored there. We keep information as long as necessary for the purposes in this policy or as required by law."],
        ["Deletion and Rights", "When you delete your account or a transcription, associated data is removed according to the deletion policy. Depending on your location, you may have rights to access, correct, delete, or restrict processing of personal information."],
        ["Children and Updates", "The services are not aimed at children under 13. We may update this policy and will make updated versions available on this page."],
        ["Contact", "Questions about privacy, your data, or your rights can be sent to hi@uniscribe.co."]
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
      <section className="mx-auto grid max-w-4xl gap-4 px-4 py-12 md:px-8">
        {copy.sections.map(([heading, body]) => (
          <article key={heading} className="border-b border-ink/10 bg-transparent py-6">
            <h2 className="flex items-center gap-2 text-xl font-black text-ink"><Icon size={19} className="text-tide" />{heading}</h2>
            <p className="mt-3 text-sm leading-7 text-ink/70">{body}</p>
          </article>
        ))}
      </section>
      <SiteFooter />
    </main>
  );
}
