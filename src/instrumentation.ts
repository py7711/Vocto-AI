export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const {installProcessErrorHandlers} = await import("@/lib/logger");
  installProcessErrorHandlers({
    requestUrl: "process://next-server",
    classPath: "src/instrumentation.ts",
    functionName: "register",
    line: 1
  });
}
