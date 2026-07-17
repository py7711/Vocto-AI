type SummaryContent = {
  overview?: unknown;
  bullets?: unknown;
  takeaways?: unknown;
  insights?: unknown;
};

export function hasSummaryContent(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;

  const summary = value as SummaryContent;
  return Boolean(
    (typeof summary.overview === "string" && summary.overview.trim()) ||
    (Array.isArray(summary.bullets) && summary.bullets.length) ||
    (Array.isArray(summary.takeaways) && summary.takeaways.length) ||
    (Array.isArray(summary.insights) && summary.insights.length)
  );
}
