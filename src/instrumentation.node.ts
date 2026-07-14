import {installProcessErrorHandlers, logInfo} from "@/lib/logger";

export function registerNodeInstrumentation() {
  const context = {
    service: "web" as const,
    requestUrl: "process://next-server",
    classPath: "src/instrumentation.ts",
    functionName: "register",
    line: 1
  };
  installProcessErrorHandlers(context);
  logInfo("Votxt web service logger initialized.", context);
}
