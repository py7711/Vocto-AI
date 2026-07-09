import {appendFileSync, mkdirSync} from "node:fs";
import {EOL} from "node:os";
import {isAbsolute, join, relative} from "node:path";

type LogLevel = "debug" | "info" | "warn" | "error";

export type LogContext = {
  requestUrl?: string | URL | null;
  classPath?: string;
  functionName?: string;
  line?: number;
  column?: number;
  message?: string;
  meta?: Record<string, unknown>;
};

type StackLocation = {
  classPath: string;
  functionName: string;
  line: number;
  column?: number;
};

type LogEntry = {
  level: LogLevel;
  time: string;
  requestUrl: string;
  classPath: string;
  functionName: string;
  line: number;
  column?: number;
  message: string;
  errorDetail?: unknown;
  meta?: Record<string, unknown>;
};

const EAST_8_TIME_ZONE = "Asia/Shanghai";
const DEFAULT_REQUEST_URL = "unknown://request";
const originalConsole = {
  debug: console.debug.bind(console),
  info: console.info.bind(console),
  warn: console.warn.bind(console),
  error: console.error.bind(console)
};
const sensitiveQueryKeys = new Set([
  "access_token",
  "api_key",
  "code",
  "key",
  "password",
  "passwordCredential",
  "refresh_token",
  "secret",
  "state",
  "token"
]);

let processHandlersInstalled = false;

export function formatEast8Date(date = new Date()) {
  const parts = east8Parts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function formatEast8Time(date = new Date()) {
  const parts = east8Parts(date);
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}.${parts.fractionalSecond}+08:00`;
}

export function logError(error: unknown, context: LogContext = {}) {
  writeLog("error", error, context);
}

export function logWarn(messageOrError: unknown, context: LogContext = {}) {
  writeLog("warn", messageOrError, context);
}

export function logInfo(message: string, context: LogContext = {}) {
  writeLog("info", message, context);
}

export function logDebug(message: string, context: LogContext = {}) {
  writeLog("debug", message, context);
}

export function installProcessErrorHandlers(context: LogContext = {}) {
  if (processHandlersInstalled || typeof process.on !== "function") return;
  processHandlersInstalled = true;

  process.on("uncaughtExceptionMonitor", (error) => {
    logError(error, {
      ...context,
      requestUrl: context.requestUrl ?? "process://uncaughtException",
      message: context.message ?? "Uncaught exception"
    });
  });
}

function writeLog(level: LogLevel, messageOrError: unknown, context: LogContext) {
  const now = new Date();
  const errorDetail = level === "error" || messageOrError instanceof Error ? serializeError(messageOrError) : undefined;
  const location = resolveLocation(messageOrError, context);
  const entry: LogEntry = {
    level,
    time: formatEast8Time(now),
    requestUrl: sanitizeRequestUrl(context.requestUrl),
    classPath: context.classPath ?? location.classPath,
    functionName: context.functionName ?? location.functionName,
    line: context.line ?? location.line,
    column: context.column ?? location.column,
    message: context.message ?? messageFrom(messageOrError),
    errorDetail,
    meta: context.meta
  };
  const line = safeJsonStringify(entry);

  try {
    const logDir = resolveLogDir();
    mkdirSync(logDir, {recursive: true});
    appendFileSync(join(logDir, `${formatEast8Date(now)}.log`), `${line}${EOL}`, "utf8");
  } catch (writeError) {
    originalConsole.error("[logger] failed to write log file", writeError);
  }

  if (process.env.LOG_TO_CONSOLE !== "false") {
    originalConsole[level](line);
  }
}

function resolveLogDir() {
  const configured = process.env.LOG_DIR || "logs";
  return isAbsolute(configured) ? configured : join(process.cwd(), configured);
}

function east8Parts(date: Date) {
  const formattedParts = new Intl.DateTimeFormat("en-US", {
    timeZone: EAST_8_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
    hourCycle: "h23"
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => formattedParts.find((part) => part.type === type)?.value ?? "";
  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    hour: value("hour"),
    minute: value("minute"),
    second: value("second"),
    fractionalSecond: value("fractionalSecond") || String(date.getMilliseconds()).padStart(3, "0")
  };
}

function resolveLocation(messageOrError: unknown, context: LogContext): StackLocation {
  if (context.classPath && context.functionName && typeof context.line === "number") {
    return {
      classPath: context.classPath,
      functionName: context.functionName,
      line: context.line,
      column: context.column
    };
  }

  const errorStack = messageOrError instanceof Error ? messageOrError.stack : undefined;
  const location = findProjectStackLocation(errorStack) ?? findProjectStackLocation(new Error().stack);
  return location ?? {
    classPath: "unknown",
    functionName: "unknown",
    line: 0
  };
}

function findProjectStackLocation(stack?: string) {
  if (!stack) return undefined;
  const parsed = stack.split("\n").map(parseStackLine).filter(Boolean) as StackLocation[];
  const projectFrame = parsed.find((frame) => {
    const classPath = frame.classPath.replace(/\\/g, "/");
    return !classPath.includes("node_modules/")
      && !classPath.includes("src/lib/logger.ts")
      && !classPath.startsWith("node:");
  });
  return projectFrame ?? parsed[0];
}

function parseStackLine(line: string): StackLocation | undefined {
  const trimmed = line.trim();
  const match = trimmed.match(/^at\s+(?:(.*?)\s+\()?(.+?):(\d+):(\d+)\)?$/);
  if (!match) return undefined;
  const [, rawFunctionName, rawPath, rawLine, rawColumn] = match;
  return {
    classPath: normalizeClassPath(rawPath),
    functionName: normalizeFunctionName(rawFunctionName),
    line: Number(rawLine),
    column: Number(rawColumn)
  };
}

function normalizeClassPath(rawPath: string) {
  const cwd = process.cwd().replace(/\\/g, "/");
  const withoutProtocol = rawPath
    .replace(/^file:\/\//, "")
    .replace(/^webpack-internal:\/\/\/\(rsc\)\/\.\//, "")
    .replace(/^webpack-internal:\/\/\/\.\//, "")
    .replace(/^webpack:\/\/_N_E\/\.\//, "")
    .replace(/\\/g, "/");

  if (withoutProtocol.startsWith(`${cwd}/`)) {
    return relative(cwd, withoutProtocol).replace(/\\/g, "/");
  }

  const srcIndex = withoutProtocol.indexOf("/src/");
  if (srcIndex >= 0) return withoutProtocol.slice(srcIndex + 1);

  return withoutProtocol;
}

function normalizeFunctionName(rawFunctionName?: string) {
  const name = rawFunctionName?.replace(/^async\s+/, "").trim();
  return name || "anonymous";
}

function messageFrom(messageOrError: unknown) {
  if (messageOrError instanceof Error) return messageOrError.message;
  if (typeof messageOrError === "string") return messageOrError;
  return safeJsonStringify(messageOrError);
}

function serializeError(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value instanceof Error) {
    if (seen.has(value)) return "[Circular Error]";
    seen.add(value);
    const detail: Record<string, unknown> = {
      name: value.name,
      message: value.message,
      stack: value.stack
    };
    const cause = (value as Error & {cause?: unknown}).cause;
    if (cause !== undefined) detail.cause = serializeError(cause, seen);
    for (const key of Object.keys(value)) {
      detail[key] = serializeError((value as unknown as Record<string, unknown>)[key], seen);
    }
    return detail;
  }
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "object" && value !== null) {
    if (seen.has(value)) return "[Circular]";
    seen.add(value);
  }
  return value;
}

function sanitizeRequestUrl(url: LogContext["requestUrl"]) {
  if (!url) return DEFAULT_REQUEST_URL;
  const value = String(url);
  try {
    const parsed = new URL(value);
    for (const key of Array.from(parsed.searchParams.keys())) {
      if (sensitiveQueryKeys.has(key)) parsed.searchParams.set(key, "[redacted]");
    }
    return parsed.toString();
  } catch {
    return value || DEFAULT_REQUEST_URL;
  }
}

function safeJsonStringify(value: unknown) {
  const seen = new WeakSet<object>();
  return JSON.stringify(value, (_key, current) => {
    if (typeof current === "bigint") return current.toString();
    if (current instanceof Error) return serializeError(current);
    if (typeof current === "object" && current !== null) {
      if (seen.has(current)) return "[Circular]";
      seen.add(current);
    }
    return current;
  });
}
