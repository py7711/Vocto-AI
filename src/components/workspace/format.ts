import type {WorkspaceCopy} from "./copy";
import type {TaskListItem} from "./types";

export function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function formatDate(value: string, locale = "zh-CN") {
  return new Intl.DateTimeFormat(locale, {month: "2-digit", day: "2-digit"}).format(new Date(value));
}

export function formatDateTime(value: string | null | undefined, copy: WorkspaceCopy) {
  if (!value) return copy.periodUnset;
  return new Intl.DateTimeFormat(dateLocale(copy), {month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"}).format(new Date(value));
}

export function dateLocale(copy: WorkspaceCopy) {
  return copy.intlLocale;
}

export function formatTaskListDetail(task: TaskListItem, copy: WorkspaceCopy) {
  const parts = [];
  if (task.durationSeconds) parts.push(formatDuration(task.durationSeconds));
  if (task.speakerCount) parts.push(copy.speakers(task.speakerCount));
  if (task.provider) parts.push(task.provider);
  if (!["COMPLETED", "FAILED", "CANCELED"].includes(task.status)) parts.push(`${task.progress}%`);
  if (task.createdAt) parts.push(formatDate(task.createdAt, dateLocale(copy)));
  return parts.length ? parts.join(" · ") : task.statusMessage || copy.waiting;
}

export function taskDisplayName(task: TaskListItem, copy: WorkspaceCopy) {
  return task.originalName || (task.sourceType === "YOUTUBE" ? copy.youtubeTask : copy.unnamedTask);
}

export function translationPreview(content: any, copy: WorkspaceCopy) {
  // 翻译洞察由不同模型降级生成，字段可能略有差异，这里兼容常见文本字段。
  if (!content) return copy.translationGenerated;
  if (typeof content === "string") return content;
  if (typeof content.text === "string") return content.text;
  if (typeof content.translation === "string") return content.translation;
  if (Array.isArray(content.segments)) return content.segments.map((item: any) => item.text || item.translation).filter(Boolean).join(" ");
  return copy.translationGenerated;
}

export function truncateText(value: string, maxLength: number) {
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

export function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}
