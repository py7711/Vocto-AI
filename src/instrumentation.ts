export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const {installProcessErrorHandlers, logInfo} = await import("@/lib/logger");
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
