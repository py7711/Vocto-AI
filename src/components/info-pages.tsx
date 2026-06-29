"use client";

import {useLocale} from "next-intl";
import {BadgeCheck, Handshake, ShieldCheck} from "lucide-react";
import {PageHero, SiteFooter, SiteHeader} from "@/components/site-shell";

const infoCopy = {
  en: {
    security: {
      eyebrow: "Security",
      title: "Security & Privacy",
      description: "Learn how we protect your data and ensure your privacy with industry-leading security measures, encryption, and strict data handling policies.",
      sections: [
        ["How does UniScribe keep my data secure?", "All transcripts and media files are encrypted at rest. Access to your files is limited to you, the account owner, unless you choose to share them."],
        ["Is my data private and confidential?", "Yes. Unless you choose to share files or transcripts, only you can access or modify them."],
        ["Is my data secure during transmission?", "UniScribe enforces secure encrypted HTTPS connections for data transfers to your browser and between internal services."],
        ["How is my payment information protected?", "Payments are processed by Stripe. UniScribe does not store your credit card information on its servers."],
        ["How is my data encrypted?", "Files are encrypted at rest using trusted industry-standard encryption such as AES-256."],
        ["Where is my data stored?", "Primary infrastructure is hosted on Microsoft Azure in the United States, with Cloudflare used for performance and protection."],
        ["How is my data used for AI training?", "UniScribe does not use your data for AI training without explicit consent. Files and transcripts are used to provide the service you requested."],
        ["Can I export my data?", "Yes. You can export transcripts in supported document, subtitle, and text formats whenever you need a copy."],
        ["How can I delete my data?", "You can delete account data and transcription data from your account. Deleted data is removed from active systems according to the retention policy."],
        ["What if I have more questions?", "Contact hi@uniscribe.co for privacy or security questions."]
      ]
    },
    affiliate: {
      eyebrow: "Affiliate",
      title: "UniScribe Affiliate Program",
      description: "Earn 30% commission by introducing UniScribe to people who need fast, accurate transcription and AI notes for audio and video.",
      sections: [
        ["Built for partners with relevant audiences", "UniScribe is useful for teams and individuals who turn recordings, meetings, interviews, lectures, podcasts, and videos into usable documents."],
        ["Join the program", "Create your affiliate account in Rewardful and get your unique UniScribe referral link."],
        ["Share UniScribe", "Promote audio and video transcription, summaries, mind maps, and export workflows to your audience."],
        ["Earn commission", "Receive 30% commission on referred customer payments within the first 12 months."],
        ["Clear rules before you promote", "Rewardful manages referral links, conversion tracking, commission calculations, refund adjustments, and affiliate dashboard access."]
      ]
    }
  },
  zh: {
    security: {
      eyebrow: "安全",
      title: "UniScribe 安全说明",
      description: "说明 UniScribe 如何保护账号、上传、转写文本、分享链接和支付流程。",
      sections: [
        ["账号保护", "邮箱会话使用安全 Cookie，Google 登录仅用于账号认证，用户数据隔离在个人工作台内。"],
        ["上传与媒体处理", "上传流程使用短期签名 URL，转写结果默认归属账号，只有主动创建分享链接后才会公开只读访问。"],
        ["分享链接安全", "公开转写链接是只读页面，分享令牌在服务端以哈希形式保存，不保存可直接复用的明文。"],
        ["服务商边界", "转写、AI 洞察和翻译服务商只接收完成当前任务所需的媒体或文本。"]
      ]
    },
    affiliate: {
      eyebrow: "联盟计划",
      title: "UniScribe 联盟计划",
      description: "把 UniScribe 推荐给需要快速音视频转写的创作者、研究者、学生、记者和团队。",
      sections: [
        ["适合人群", "适合教育者、创作者、工具评测者、社群运营者、顾问和内容工作流作者。"],
        ["可推荐功能", "UniScribe 支持音视频上传、公开视频链接转写、发言人识别、摘要、翻译、字幕和文档导出。"],
        ["受众场景", "播客剪辑、课程团队、访谈研究、YouTube 创作者、内容复用团队和无障碍字幕流程都适合推荐。"],
        ["开始方式", "准备一篇评测、工作流指南或工具对比页面，引导读者访问 UniScribe 价格页或免费注册流程。"]
      ]
    }
  }
} as const;

export function InfoPage({type}: {type: "security" | "affiliate"}) {
  const locale = useLocale();
  const copy = (locale === "zh" ? infoCopy.zh : infoCopy.en)[type];
  const Icon = type === "security" ? ShieldCheck : Handshake;
  const affiliateStats = [
    ["Commission", "30%", "On referred customer payments"],
    ["Duration", "12 months", "Commission window per customer"],
    ["Attribution", "Rewardful", "Referral links, conversions, refunds, and payout tracking"]
  ] as const;
  const affiliateFaqs = [
    ["Who is a good fit?", "Creators, educators, agencies, tool directories, and communities that reach people who work with audio, video, meetings, interviews, podcasts, courses, or research content."],
    ["How are referrals tracked?", "Rewardful tracks referred visitors through your affiliate link and connects eligible Stripe payments to your affiliate account."],
    ["What happens after a refund?", "Refunded payments are adjusted in Rewardful, so unpaid commissions are removed or reduced before payout."],
    ["Can I use my own link for self-referrals?", "No. The program is intended for genuine referrals from your audience, clients, or community."]
  ] as const;

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <PageHero {...copy} />
      {type === "affiliate" ? (
        <section className="mx-auto max-w-5xl px-4 pt-12 md:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {affiliateStats.map(([label, value, detail]) => (
              <article key={label} className="rounded-2xl border border-violet/15 bg-white p-6 shadow-soft">
                <p className="text-sm font-black uppercase tracking-wide text-ink/45">{label}</p>
                <p className="mt-2 text-3xl font-black text-violet">{value}</p>
                <p className="mt-2 text-sm leading-6 text-ink/65">{detail}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      <section className="mx-auto grid max-w-5xl gap-4 px-4 py-12 md:px-8">
        {copy.sections.map(([heading, body]) => (
          <article key={heading} className="rounded-2xl border border-ink/10 bg-white/75 p-6 shadow-soft transition hover:border-ink/15">
            <h2 className="flex items-center gap-2 text-xl font-black text-ink"><Icon size={19} className="text-tide" />{heading}</h2>
            <p className="mt-3 text-sm leading-7 text-ink/70">{body}</p>
          </article>
        ))}
        {type === "affiliate" ? (
          <>
            <div className="rounded-2xl border border-violet/15 bg-lavender p-6">
              <BadgeCheck className="text-violet" size={24} />
              <p className="mt-3 text-sm font-bold leading-7 text-ink/70">Create your Rewardful affiliate account, get your link, and start sharing UniScribe with people who work with audio and video.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href="https://uniscribe.getrewardful.com" className="btn-primary">Join the affiliate program</a>
                <a href="https://uniscribe.getrewardful.com/login" className="btn-outline">Affiliate login</a>
              </div>
            </div>
            <div className="mt-6">
              <h2 className="text-3xl font-black tracking-tight text-ink">Ready to become a UniScribe affiliate?</h2>
              <div className="mt-5 grid gap-3">
                {affiliateFaqs.map(([question, answer]) => (
                  <article key={question} className="rounded-xl border border-ink/10 bg-white p-5 shadow-soft">
                    <h3 className="font-black text-ink">{question}</h3>
                    <p className="mt-2 text-sm leading-6 text-ink/65">{answer}</p>
                  </article>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </section>
      <SiteFooter />
    </main>
  );
}
