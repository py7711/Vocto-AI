export const summaryTemplateInputValues = ["none", "standard", "meeting", "study", "interview", "course_lecture", "podcast"] as const;
export const summaryTemplateValues = ["none", "standard", "meeting", "study", "interview"] as const;

export type SummaryTemplateInput = (typeof summaryTemplateInputValues)[number];
export type SummaryTemplate = (typeof summaryTemplateValues)[number];

export function normalizeSummaryTemplate(value: string | undefined | null): SummaryTemplate {
  if (value === "course_lecture") return "study";
  if (value === "podcast") return "standard";
  if (summaryTemplateValues.includes(value as SummaryTemplate)) return value as SummaryTemplate;
  return "standard";
}
