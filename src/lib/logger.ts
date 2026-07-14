import {appendFileSync, mkdirSync} from "node:fs";
import {isAbsolute, join, relative} from "node:path";
import {format as formatConsoleMessage, stripVTControlCharacters} from "node:util";
import pino, {type DestinationStream, type Logger} from "pino";

type LogLevel = "debug" | "info" | "warn" | "error";
type PinoLogLevel = LogLevel | "trace" | "fatal" | "silent";
type LogService = "web" | "worker";

export type LogContext = {
  service?: LogService;
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

type LogFields = {
  service: LogService;
  requestUrl: string;
  classPath: string;
  functionName: string;
  line: number;
  column?: number;
  errorDetail?: unknown;
  meta?: Record<string, unknown>;
};

const EAST_8_TIME_ZONE = "Asia/Shanghai";
const DEFAULT_LOG_DIR = "/logs";
const DEFAULT_LOG_LEVEL: PinoLogLevel = "debug";
const DEFAULT_REQUEST_URL = "unknown://request";
const originalConsole = {
  log: console.log.bind(console),
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
let consoleHandlersInstalled = false;

export const logger: Logger = pino({
  level: resolveLogLevel(),
  messageKey: "message",
  timestamp: () => `,"time":"${formatEast8Time()}"`,
  formatters: {
    level(label) {
      return {level: label};
    }
  }
}, createDailyFileDestination());

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

export function installConsoleLogger(context: LogContext = {}) {
  if (consoleHandlersInstalled) return;
  consoleHandlersInstalled = true;
  const consoleContext: LogContext = {
    service: context.service,
    requestUrl: context.requestUrl,
    meta: context.meta
  };

  console.log = (...args: unknown[]) => writeConsoleMethodLog("info", args, consoleContext);
  console.debug = (...args: unknown[]) => writeConsoleMethodLog("debug", args, consoleContext);
  console.info = (...args: unknown[]) => writeConsoleMethodLog("info", args, consoleContext);
  console.warn = (...args: unknown[]) => writeConsoleMethodLog("warn", args, consoleContext);
  console.error = (...args: unknown[]) => writeConsoleMethodLog("error", args, consoleContext);
}

export function installProcessErrorHandlers(context: LogContext = {}) {
  if (processHandlersInstalled || typeof process.on !== "function") return;
  processHandlersInstalled = true;
  installConsoleLogger(context);

  process.on("uncaughtExceptionMonitor", (error) => {
    logError(error, {
      ...context,
      requestUrl: context.requestUrl ?? "process://uncaughtException",
      message: context.message ?? "Uncaught exception"
    });
  });

  process.on("unhandledRejection", (reason) => {
    logError(reason, {
      ...context,
      requestUrl: context.requestUrl ?? "process://unhandledRejection",
      message: context.message ?? "Unhandled rejection"
    });
  });

  process.on("warning", (warning) => {
    logWarn(warning, {
      ...context,
      requestUrl: context.requestUrl ?? "process://warning",
      message: context.message ?? "Process warning"
    });
  });
}

function writeLog(level: LogLevel, messageOrError: unknown, context: LogContext) {
  const errorDetail = level === "error" || messageOrError instanceof Error ? serializeError(messageOrError) : undefined;
  const location = resolveLocation(messageOrError, context);
  const fields: LogFields = {
    service: resolveLogService(context),
    requestUrl: sanitizeRequestUrl(context.requestUrl),
    classPath: context.classPath ?? location.classPath,
    functionName: context.functionName ?? location.functionName,
    line: context.line ?? location.line,
    column: context.column ?? location.column,
    errorDetail,
    meta: context.meta ? serializeLogValue(context.meta) as Record<string, unknown> : undefined
  };

  logger[level](fields, sanitizeLogText(context.message ?? messageFrom(messageOrError)));
}

function writeConsoleMethodLog(level: LogLevel, args: unknown[], context: LogContext) {
  const message = formatConsoleMessage(...args);
  const primaryError = args.find((arg) => arg instanceof Error);
  writeLog(level, primaryError ?? message, {
    ...context,
    requestUrl: context.requestUrl ?? "console://global",
    message,
    meta: consoleMethodMeta(args, context.meta)
  });
}

function consoleMethodMeta(args: unknown[], baseMeta?: Record<string, unknown>) {
  const shouldIncludeArguments = args.length > 1 || args.some((arg) => typeof arg !== "string");
  if (!baseMeta && !shouldIncludeArguments) return undefined;
  return {
    ...baseMeta,
    ...(shouldIncludeArguments ? {consoleArguments: args.map((arg) => serializeLogValue(arg))} : {})
  };
}

function createDailyFileDestination(): DestinationStream {
  return {
    write(chunk) {
      writeLogFile(chunk);
      writeLogConsole(chunk);
    }
  };
}

function writeLogFile(chunk: string) {
  try {
    const logDir = resolveLogDir();
    mkdirSync(logDir, {recursive: true});
    appendFileSync(join(logDir, `${resolveLogFilePrefix(chunk)}-${formatEast8Date()}.log`), chunk.endsWith("\n") ? chunk : `${chunk}\n`, "utf8");
  } catch (writeError) {
    originalConsole.error("[logger] failed to write log file", writeError);
  }
}

function writeLogConsole(chunk: string) {
  if (process.env.LOG_TO_CONSOLE === "false") return;
  const output = chunk.endsWith("\n") ? chunk : `${chunk}\n`;
  try {
    const level = levelFromLogLine(chunk);
    if (level === "warn" || level === "error" || level === "fatal") {
      process.stderr.write(output);
      return;
    }
    process.stdout.write(output);
  } catch (writeError) {
    originalConsole.error("[logger] failed to write console log", writeError);
  }
}

function resolveLogDir() {
  const configured = process.env.LOG_DIR || DEFAULT_LOG_DIR;
  return isAbsolute(configured) ? configured : join(process.cwd(), configured);
}

function resolveLogLevel(): PinoLogLevel {
  const configured = process.env.LOG_LEVEL;
  if (configured && isPinoLogLevel(configured)) return configured;
  return DEFAULT_LOG_LEVEL;
}

function resolveLogService(context: LogContext): LogService {
  if (context.service) return context.service;
  const configured = process.env.LOG_SERVICE;
  if (configured === "web" || configured === "worker") return configured;
  const requestUrl = String(context.requestUrl ?? "");
  if (requestUrl.startsWith("worker://")) return "worker";
  return "web";
}

function resolveLogFilePrefix(line: string): LogService {
  try {
    const parsed = JSON.parse(line) as {service?: unknown; requestUrl?: unknown};
    if (parsed.service === "web" || parsed.service === "worker") return parsed.service;
    if (typeof parsed.requestUrl === "string" && parsed.requestUrl.startsWith("worker://")) return "worker";
  } catch {
    return process.env.LOG_SERVICE === "worker" ? "worker" : "web";
  }
  return process.env.LOG_SERVICE === "worker" ? "worker" : "web";
}

function isPinoLogLevel(value: string): value is PinoLogLevel {
  return value === "trace"
    || value === "debug"
    || value === "info"
    || value === "warn"
    || value === "error"
    || value === "fatal"
    || value === "silent";
}

function levelFromLogLine(line: string): PinoLogLevel | undefined {
  try {
    const parsed = JSON.parse(line) as {level?: unknown};
    return typeof parsed.level === "string" && isPinoLogLevel(parsed.level) ? parsed.level : undefined;
  } catch {
    return undefined;
  }
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
      && !classPath.includes("src/lib/api-logger.ts")
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
      name: sanitizeLogText(value.name),
      message: sanitizeLogText(value.message),
      stack: value.stack ? sanitizeLogText(value.stack) : undefined
    };
    const cause = (value as Error & {cause?: unknown}).cause;
    if (cause !== undefined) detail.cause = serializeLogValue(cause, seen);
    for (const key of Object.keys(value)) {
      detail[key] = serializeLogValue((value as unknown as Record<string, unknown>)[key], seen);
    }
    return detail;
  }
  return serializeLogValue(value, seen);
}

function serializeLogValue(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value instanceof Error) return serializeError(value, seen);
  if (typeof value === "string") return sanitizeLogText(value);
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (value instanceof URL) return value.toString();
  if (Array.isArray(value)) {
    if (seen.has(value)) return "[Circular]";
    seen.add(value);
    return value.map((item) => serializeLogValue(item, seen));
  }
  if (typeof value === "object" && value !== null) {
    if (seen.has(value)) return "[Circular]";
    seen.add(value);
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, serializeLogValue(item, seen)])
    );
  }
  return value;
}

function sanitizeLogText(value: string) {
  return stripVTControlCharacters(value);
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
  return JSON.stringify(serializeLogValue(value)) ?? String(value);
}
