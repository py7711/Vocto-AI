export const TASK_STATUS_MESSAGE_MAX_LENGTH = 1024;

export function fitTaskStatusMessage(message: string) {
  return Array.from(message).slice(0, TASK_STATUS_MESSAGE_MAX_LENGTH).join("");
}
