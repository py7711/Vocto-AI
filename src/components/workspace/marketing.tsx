"use client";

import {useMemo, useState} from "react";
import Image from "next/image";
import {
  BadgeCheck,
  Brain,
  CheckCircle2,
  ChevronDown,
  Download,
  FileAudio,
  Languages,
  Share2,
  Sparkles,
  Star,
  UploadCloud
} from "lucide-react";
import clsx from "clsx";
import {PricingAction} from "@/components/pricing-actions";
import {getBlogPosts} from "@/lib/blog";
import type {WorkspaceCopy} from "./copy";

type PaidPlan = "BASIC" | "STANDARD" | "PRO";
type PricingMode = "one-time" | "monthly" | "annual";

type PricingPlan = {
  name: string;
  price: string;
  priceSuffix: string;
  quota: string;
  cta: string;
  plan?: PaidPlan;
  popular?: boolean;
  previousPrice?: string;
  note?: string;
  features: string[];
};

const asset = (name: string) => `/uniscribe-assets/${name}`;

const converterLinks = [
  ["Speech to Text", "l/speech-to-text"],
  ["Voice to Text", "l/voice-to-text"],
  ["Audio to Text", "tools/audio-to-text"],
  ["Video to Text", "l/video-to-text"],
  ["Video Link to Text", "tools/video-link-to-text"],
  ["MP3 to Text", "l/mp3-to-text"],
  ["MP4 to Text", "l/mp4-to-text-converter"],
  ["FLAC to Text", "l/flac-to-text"],
  ["AMR to Text", "l/amr-to-text"],
  ["WMA to Text", "l/wma-to-text"],
  ["MKV to Text", "l/mkv-to-text"],
  ["WMV to Text", "l/wmv-to-text"]
] as const;

const workflow = [
  {
    title: "Upload or Paste",
    text: "Upload audio and video files from your local device or simply paste an online video link.",
    icon: UploadCloud
  },
  {
    title: "Transcribe to Text",
    text: "Click 'Transcribe' to convert audio or video into accurate, editable text.",
    icon: Brain
  },
  {
    title: "Export or Share",
    text: "Download Word, CSV, PDF, TXT, SRT, and VTT, or create a share link directly.",
    icon: Download
  }
] as const;

const featureBlocks = [
  {
    title: "Convert Audio & Video to Text in Seconds",
    text: "With AI technology, you can quickly turn your audio and video files into text in just a few minutes. It supports 87 languages and a range of common audio and video formats.",
    image: asset("transcription.png"),
    icon: FileAudio
  },
  {
    title: "Generate Summary, Mind Map, Key Points from Audio & Video",
    text: "Automatically create summaries, mind maps, key points, and questions from long recordings so reviews, research, and meetings are easier to understand.",
    image: asset("summary.png"),
    icon: Brain
  },
  {
    title: "Export Transcription or Share Link Directly",
    text: "Export transcription files in the format you need, or share a private link with clients, teammates, classmates, and collaborators.",
    image: asset("export.png"),
    icon: Share2
  }
] as const;

const languages = [
  ["German", "DE"],
  ["English", "EN"],
  ["Spanish", "ES"],
  ["French", "FR"],
  ["Italian", "IT"],
  ["Dutch", "NL"],
  ["Polish", "PL"],
  ["Portuguese", "PT"]
] as const;

const reviews = [
  ["AN", "Anikó", "Accurate transcription even in Hungarian, the best app in its league I have tried so far."],
  ["KA", "Karen", "It is exactly what I'm looking for. It is quick and simple with a nice vibe."],
  ["BR", "BrrGrrDelux", "I've used it several times since and the accuracy and quality have been amazing each time. Thank you!"],
  ["RE", "reem", "They did just like I wanted! Amazing, must try!"],
  ["LL", "Lucas Leone Dos Santos", "Praticidade e velocidade. There are small writing errors, but nothing that compromises the result."],
  ["JA", "Jason", "Easy to use. No extra steps. You did what you said you were going to do. Thank you."]
] as const;

const freeFeatures = [
  "120 minutes of transcription per month",
  "Each file can be up to 30 minutes long. Upload 1 file at a time.",
  "Limited to transcribe 3 files per day",
  "Basic transcription model (standard accuracy)",
  "Transcription available in 87 languages",
  "Word, CSV, PDF, TXT, SRT, VTT export formats"
];

const paidFeatures = [
  "Each file can be up to 10 hours long / 5 GB. Upload 50 files at a time.",
  "No daily file limit for transcription",
  "Premium transcription model (highest accuracy)",
  "Transcription available in 87 languages",
  "AI translation",
  "Word, CSV, PDF, TXT, SRT, VTT export formats",
  "Enhanced AI Insights",
  "YouTube transcription",
  "Speaker identification",
  "Automation-ready exports",
  "Bulk transcription",
  "No retention period for media files",
  "Priority email support"
];

const pricingModes: Record<PricingMode, {label: string; badge?: string; plans: PricingPlan[]}> = {
  "one-time": {
    label: "One-Time",
    plans: [
      {
        name: "Lite",
        price: "$12.9",
        priceSuffix: "One-time payment",
        quota: "300 minutes total transcription",
        cta: "Get started",
        features: ["90-day validity", ...paidFeatures]
      },
      {
        name: "Plus",
        price: "$19.9",
        priceSuffix: "One-time payment",
        quota: "600 minutes total transcription",
        cta: "Get started",
        popular: true,
        features: ["90-day validity", ...paidFeatures]
      }
    ]
  },
  monthly: {
    label: "Monthly",
    plans: [
      {name: "Free", price: "$0", priceSuffix: "/ month", quota: "No credit card required", cta: "Get started", features: freeFeatures},
      {name: "Basic", price: "$10", priceSuffix: "/ month", quota: "1200 minutes of transcription per month", cta: "Subscribe now", plan: "BASIC", features: ["$10 per 500 extra minutes", ...paidFeatures]},
      {name: "Standard", price: "$20", priceSuffix: "/ month", quota: "3000 minutes of transcription per month", cta: "Subscribe now", plan: "STANDARD", popular: true, features: ["$15 per 1000 extra minutes", ...paidFeatures]},
      {name: "Pro", price: "$30", priceSuffix: "/ month", quota: "6000 minutes of transcription per month", cta: "Subscribe now", plan: "PRO", features: ["$20 per 3000 extra minutes", ...paidFeatures]}
    ]
  },
  annual: {
    label: "Annual",
    badge: "Save 40%",
    plans: [
      {name: "Free", price: "$0", priceSuffix: "/ month", quota: "No credit card required", cta: "Get started", features: freeFeatures},
      {name: "Basic", price: "$6", previousPrice: "$10", note: "($72 / year, billed yearly)", priceSuffix: "/ month", quota: "1200 minutes of transcription per month", cta: "Subscribe now", plan: "BASIC", features: ["$10 per 500 extra minutes", ...paidFeatures]},
      {name: "Standard", price: "$12", previousPrice: "$20", note: "($144 / year, billed yearly)", priceSuffix: "/ month", quota: "3000 minutes of transcription per month", cta: "Subscribe now", plan: "STANDARD", popular: true, features: ["$15 per 1000 extra minutes", ...paidFeatures]},
      {name: "Pro", price: "$18", previousPrice: "$30", note: "($216 / year, billed yearly)", priceSuffix: "/ month", quota: "6000 minutes of transcription per month", cta: "Subscribe now", plan: "PRO", features: ["$20 per 3000 extra minutes", ...paidFeatures]}
    ]
  }
};

const faqs = [
  ["Can I try the service for free?", "Yes. The Free plan includes 120 minutes per month, up to 3 files per day, 30 minutes per file, standard transcription, translation, exports, and limited AI insights."],
  ["Which audio/video formats do you support?", "Audio formats include aac, amr, awb, flac, m4a, mka, mp2, mp3, oga, ogg, opus, wav, weba, webm, and wma. Video formats include 3gp, mkv, mov, mp4, mpg, ts, webm, and wmv."],
  ["Can I upload large files?", "Paid plans allow files up to 10 hours long and 5 GB, with up to 50 files uploaded at a time."],
  ["Can I export my transcript?", "Yes. UniScribe supports Word, CSV, PDF, TXT, SRT, and VTT export formats."],
  ["Which languages does UniScribe support for transcription?", "UniScribe supports transcription in 87 languages."],
  ["How soon can I expect my transcription results?", "Most files finish quickly. The exact time depends on file duration, size, provider, and queue load."],
  ["Are my payments secure with UniScribe?", "Payments are handled through secure checkout and subscription billing flows, with card and crypto payment support through Stripe."],
  ["How does UniScribe protect the confidentiality and security of my data?", "Media and transcription access is scoped to your account, and paid plans can avoid media retention limits."],
  ["When will I be billed?", "Subscription plans are billed monthly or yearly depending on the option you choose."],
  ["What happens if I cancel my subscription?", "You keep access for the paid period, and the subscription does not renew afterward."],
  ["Can I get a refund?", "Refund handling follows the refund policy linked from the footer."],
  ["How long are one-time packages valid for?", "One-time packages are valid for 90 days."],
  ["Can I purchase different one-time packages?", "Yes. You can buy one-time packages separately from subscriptions."],
  ["Can I subscribe after purchasing a one-time package?", "Yes. Subscription minutes and one-time package minutes can coexist."],
  ["If I have an active subscription but need more minutes, can I buy add-on minutes?", "Yes. Paid plans support add-on minutes when you need more capacity."],
  ["How do add-on minutes work?", "Add-on minutes extend your available transcription balance according to the package you buy."],
  ["If I have multiple plans, how are minutes deducted?", "Minutes are deducted according to the active balance and package priority."],
  ["What happens when I use up all minutes in my one-time package?", "You can buy another package, subscribe, or wait for subscription minutes to renew."],
  ["Can I purchase a new one-time package before my current one expires?", "Yes. You can purchase additional one-time minutes before an existing package is exhausted."],
  ["What's the difference between one-time packages and subscription plans?", "One-time packages add a fixed pool of minutes, while subscriptions renew monthly or yearly with plan benefits."]
] as const;

function SectionTitle({title, text}: {title: string; text?: string}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">{title}</h2>
      {text ? <p className="mt-4 text-base leading-7 text-slate-500">{text}</p> : null}
    </div>
  );
}

function StarRow() {
  return (
    <span className="inline-flex items-center gap-0.5 text-[#00b87a]">
      {Array.from({length: 5}).map((_, index) => (
        <Star key={index} size={17} className="fill-current" />
      ))}
    </span>
  );
}

export function ProductSections({locale}: {t: (key: string) => string; copy: WorkspaceCopy; locale: string}) {
  const [pricingMode, setPricingMode] = useState<PricingMode>("one-time");
  const [openFaq, setOpenFaq] = useState(0);
  const posts = useMemo(() => getBlogPosts(locale).slice(0, 6), [locale]);
  const activePricing = pricingModes[pricingMode];

  return (
    <>
      <section id="features" className="border-y border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle title="How to Convert Audio & Video to Text?" />
        <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-3">
          {workflow.map((item, index) => (
            <article key={item.title} className="relative rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <item.icon size={26} />
              </span>
              <h3 className="mt-5 text-xl font-semibold text-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">{item.text}</p>
              {index < workflow.length - 1 ? (
                <Image src={asset("arrow.svg")} alt="arrow" width={81} height={16} className="absolute -right-10 top-12 hidden w-20 md:block" />
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle title="More Audio&Video to Text Converters" />
        <div className="mx-auto mt-8 flex max-w-5xl flex-wrap justify-center gap-3">
          {converterLinks.map(([label, href]) => (
            <a key={label} href={`/${locale}/${href}`} className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary">
              {label}
            </a>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-12">
          {featureBlocks.map((item, index) => (
            <article key={item.title} className={clsx("grid gap-8 lg:grid-cols-2 lg:items-center", index % 2 === 1 && "lg:[&>div:first-child]:order-2")}>
              <div>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
                  <item.icon size={24} />
                </span>
                <h2 className="mt-5 text-3xl font-bold leading-tight text-ink">{item.title}</h2>
                <p className="mt-4 text-base leading-7 text-slate-500">{item.text}</p>
                <a href={`/${locale}/auth/signin`} className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90">
                  Start for Free
                  <Sparkles size={16} />
                </a>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-2xl">
                <Image src={item.image} alt={item.title} width={1440} height={960} className="h-auto w-full" sizes="(min-width: 1024px) 50vw, 100vw" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle title="Supported Languages" text="Below are the main languages we support for transcription and subtitles" />
        <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {languages.map(([name, code]) => (
            <a key={name} href={`/${locale}/languages/transcribe-${name.toLowerCase()}-audio`} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary">
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">{code}</span>
                <span className="font-semibold">{name}</span>
              </span>
              <Languages size={18} className="text-slate-400" />
            </a>
          ))}
        </div>
        <div className="mt-7 text-center">
          <a href={`/${locale}/languages`} className="inline-flex items-center rounded-md border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:text-primary">
            See all languages
          </a>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle
          title="What Our Users Say"
          text="UniScribe has helped people transcribe 52,272,840 minutes of audio and video, from short voice notes to long-form recordings."
        />
        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold">
          <span>Excellent</span>
          <StarRow />
          <span>4.8 out of 5 on Trustpilot</span>
        </div>
        <div className="mx-auto mt-10 columns-1 gap-5 md:columns-2 lg:columns-3">
          {reviews.map(([initials, name, text]) => (
            <a key={`${initials}-${name}`} href="https://www.trustpilot.com/review/uniscribe.co" className="mb-5 inline-block w-full break-inside-avoid rounded-lg border border-slate-200 bg-card p-6 text-left shadow-sm transition hover:shadow-md">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">{initials}</span>
                <div>
                  <p className="font-semibold text-ink">{name}</p>
                  <StarRow />
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{text}</p>
            </a>
          ))}
        </div>
      </section>

      <section id="subscription-price" className="px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle title="Affordable Pricing" text="Effortlessly transcribe audio and video, saving you time and helping you focus on what matters" />
        <div role="tablist" aria-label="Billing options" className="mx-auto mt-8 grid w-fit grid-cols-3 gap-1 rounded-lg border border-slate-200 bg-white p-1 text-sm font-medium shadow-sm">
          {(Object.keys(pricingModes) as PricingMode[]).map((mode) => {
            const option = pricingModes[mode];
            const active = pricingMode === mode;
            return (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setPricingMode(mode)}
                className={clsx("rounded-sm px-3 py-1.5 transition", active ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100 hover:text-ink")}
              >
                {option.label}
                {option.badge ? <span className={active ? "ml-1 text-white/80" : "ml-1 text-primary"}>{option.badge}</span> : null}
              </button>
            );
          })}
        </div>
        <div className={clsx("mx-auto mt-8 grid max-w-7xl gap-4", pricingMode === "one-time" ? "md:max-w-3xl md:grid-cols-2" : "lg:grid-cols-4")}>
          {activePricing.plans.map((plan) => (
            <article key={plan.name} className={clsx("relative flex flex-col rounded-lg bg-card p-6 shadow-sm transition hover:-translate-y-1", plan.popular ? "border-2 border-primary shadow-glow" : "border border-slate-200 hover:shadow-md")}>
              {plan.popular ? <span className="absolute -top-3 left-5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">Most popular</span> : null}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-ink">{plan.name}</h3>
                  <p className="mt-2 text-sm leading-5 text-slate-500">{plan.name === "Free" ? "Great for trials and individual projects." : plan.name === "Standard" ? "The best balance for growing needs." : "Perfect for regular users and daily tasks."}</p>
                </div>
                <BadgeCheck className="shrink-0 text-primary" size={21} />
              </div>
              <div className="mt-5">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="ml-2 text-sm text-slate-500">{plan.priceSuffix}</span>
              </div>
              {plan.previousPrice ? (
                <p className="mt-2 text-sm font-medium text-slate-500">
                  <span className="line-through">{plan.previousPrice}</span>
                  {plan.note ? <span className="ml-2">{plan.note}</span> : null}
                </p>
              ) : null}
              <p className="mt-4 text-sm font-semibold text-primary">{plan.quota}</p>
              <div className="mt-5 grid flex-1 gap-2">
                {plan.features.slice(0, pricingMode === "one-time" ? 11 : 13).map((feature) => (
                  <p key={feature} className="flex items-start gap-2 text-sm leading-5 text-slate-600">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" />
                    {feature}
                  </p>
                ))}
              </div>
              <PricingAction plan={plan.plan} label={plan.cta} mode={pricingMode} />
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="border-y border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle title="Frequently Asked Questions" />
        <div className="mx-auto mt-8 max-w-4xl divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {faqs.map(([question, answer], index) => {
            const active = openFaq === index;
            return (
              <article key={question}>
                <button type="button" onClick={() => setOpenFaq(active ? -1 : index)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-medium transition hover:bg-slate-50 md:text-lg" aria-expanded={active}>
                  <span>{question}</span>
                  <ChevronDown size={18} className={clsx("shrink-0 transition", active && "rotate-180")} />
                </button>
                {active ? <p className="px-5 pb-5 text-sm leading-6 text-slate-600">{answer}</p> : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle title="Best Practices for Audio & Video Transcription" />
        <div className="mx-auto mt-10 grid max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <a key={post.slug} href={`/${locale}/blog/${post.slug}`} className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary/10 via-white to-[#00b87a]/10">
                <Image src={post.coverImage} alt={post.coverAlt} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
              </div>
              <div className="p-5">
                <p className="text-sm text-slate-500">{post.date}</p>
                <h3 className="mt-2 text-lg font-semibold leading-snug text-ink transition group-hover:text-primary">{post.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{post.excerpt}</p>
              </div>
            </a>
          ))}
        </div>
        <div className="mt-9 text-center">
          <a href={`/${locale}/blog`} className="inline-flex items-center rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-white transition hover:bg-primary/90">
            Show More
          </a>
        </div>
      </section>
    </>
  );
}
