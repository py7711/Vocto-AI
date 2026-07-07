export const summaryTemplateInputValues = ["none", "standard", "meeting", "study", "interview", "course_lecture", "podcast"] as const;
export const summaryTemplateValues = ["none", "standard", "meeting", "study", "interview"] as const;

export type SummaryTemplateInput = (typeof summaryTemplateInputValues)[number];
export type SummaryTemplate = (typeof summaryTemplateValues)[number];

// 免费用户可用的摘要模板，其余模板均需要开通付费会员。
export const freeSummaryTemplateInputValues = ["none", "standard"] as const;
export const proSummaryTemplateInputValues = ["meeting", "study", "interview", "course_lecture", "podcast"] as const;

// 详情页下拉框展示的模板选项：value 对应后端模板输入，label 为界面文案，pro 标记是否需要会员。
export const summaryTemplateChoices: ReadonlyArray<{value: SummaryTemplateInput; label: string; pro: boolean}> = [
  {value: "none", label: "Off", pro: false},
  {value: "standard", label: "General", pro: false},
  {value: "meeting", label: "Meeting", pro: true},
  {value: "course_lecture", label: "Course", pro: true},
  {value: "interview", label: "Interview", pro: true},
  {value: "podcast", label: "Podcast", pro: true}
];

export function isSummaryTemplateInput(value: string | undefined | null): value is SummaryTemplateInput {
  return summaryTemplateInputValues.includes(value as SummaryTemplateInput);
}

// 判断某个模板是否属于会员专享。未知模板按需要会员处理，避免绕过限制。
export function summaryTemplateRequiresMembership(value: string | undefined | null): boolean {
  if (!value) return false;
  if (freeSummaryTemplateInputValues.includes(value as (typeof freeSummaryTemplateInputValues)[number])) return false;
  return true;
}

export function normalizeSummaryTemplate(value: string | undefined | null): SummaryTemplate {
  if (value === "course_lecture") return "study";
  if (value === "podcast") return "standard";
  if (summaryTemplateValues.includes(value as SummaryTemplate)) return value as SummaryTemplate;
  return "standard";
}
