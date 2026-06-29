import type {WorkspaceCopy} from "./copy";
import type {TaskListItem} from "./types";

export function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function formatDateTime(value: string | null | undefined, copy: WorkspaceCopy) {
  if (!value) return copy.periodUnset;
  return new Intl.DateTimeFormat(dateLocale(copy), {month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"}).format(new Date(value));
}

function dateLocale(copy: WorkspaceCopy) {
  return copy.intlLocale;
}

export function taskDisplayName(task: TaskListItem, copy: WorkspaceCopy) {
  return task.originalName || (task.sourceType === "YOUTUBE" ? copy.youtubeTask : copy.unnamedTask);
}

export function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}
