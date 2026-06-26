import {BadgeCheck, Brain, ChevronRight, Download, UploadCloud} from "lucide-react";
import clsx from "clsx";
import type {WorkspaceCopy} from "./copy";
import {plans} from "./copy";

export function ProductSections({t, copy, locale}: {t: (key: string) => string; copy: WorkspaceCopy; locale: string}) {
  const workflow = [
    [UploadCloud, t("workflowUpload"), t("workflowUploadText")],
    [Brain, t("workflowTranscribe"), t("workflowTranscribeText")],
    [Download, t("workflowExport"), t("workflowExportText")]
  ] as const;
  const useCases = copy.useCases;

  return (
    <>
      <section id="features" className="border-y border-ink/10 bg-white/50 px-4 py-16 md:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black tracking-tight text-ink">{t("workflowTitle")}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {workflow.map(([Icon, title, text], index) => (
              <article key={title} className="group rounded-2xl border border-ink/10 bg-paper/60 p-6 transition hover:-translate-y-0.5 hover:border-tide/25 hover:shadow-card">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-tide/10 text-tide transition group-hover:scale-105">
                    <Icon size={22} />
                  </span>
                  <span className="text-sm font-black text-ink/25">0{index + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/65">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black tracking-tight text-ink">{copy.whyTitle}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {useCases.map(([title, text]) => (
              <article key={title} className="rounded-2xl border border-ink/10 bg-white/70 p-6 transition hover:-translate-y-0.5 hover:border-ink/15 hover:shadow-card">
                <h3 className="text-lg font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/65">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="px-4 py-16 md:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black tracking-tight text-ink">{t("plansTitle")}</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-4">
            {plans.map((plan) => {
              const featured = plan.key === "standardPlan";
              return (
                <article
                  key={plan.key}
                  className={clsx(
                    "relative flex flex-col rounded-2xl p-6 transition hover:-translate-y-1",
                    featured
                      ? "border-2 border-tide bg-white shadow-glow"
                      : "border border-ink/10 bg-white/70 shadow-soft hover:shadow-card"
                  )}
                >
                  {featured ? <span className="chip-tide absolute -top-3 left-6">★ Popular</span> : null}
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-black">{t(plan.key)}</h3>
                    <BadgeCheck className="text-tide" size={19} />
                  </div>
                  <div className="mt-5 flex items-end gap-1">
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className="pb-1 text-sm text-ink/60">{t("perMonth")}</span>
                  </div>
                  <p className="mt-4 text-sm font-bold text-tide">{plan.minutes} {copy.minutesUnit}</p>
                  <p className="mt-2 flex-1 text-sm leading-6 text-ink/65">{copy.planDetails[plan.key as keyof typeof copy.planDetails]}</p>
                </article>
              );
            })}
          </div>
          <div className="mt-8">
            <a className="btn-primary" href={`/${locale}/pricing`}>{copy.viewFullPricing}</a>
          </div>
        </div>
      </section>

      <section id="faq" className="border-t border-ink/10 bg-white/50 px-4 py-16 md:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-black tracking-tight text-ink">{t("faqTitle")}</h2>
          <div className="mt-6 grid gap-3">
            {copy.homeFaqs.map(([question, answer]) => (
              <article key={question} className="rounded-2xl border border-ink/10 bg-paper/60 p-5 transition hover:border-ink/15">
                <h3 className="flex items-center gap-2 font-black">
                  <ChevronRight size={17} className="text-coral" />
                  {question}
                </h3>
                <p className="mt-2 pl-6 text-sm leading-6 text-ink/65">{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
