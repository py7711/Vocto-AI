export type AuthCallbackSearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function authCallbackDestination(locale: string, searchParams?: AuthCallbackSearchParams) {
  // 兼容旧 OAuth/邮件回调页：不同供应商可能传 token、code 或 URL hash 里的 access_token。
  // 当前页面统一读取 token，因此这里先把历史参数归一化到同一个查询字段。
  const type = firstParam(searchParams?.type);
  const token = firstParam(searchParams?.token);
  const code = firstParam(searchParams?.code);
  const error = firstParam(searchParams?.error);
  const hashToken = firstParam(searchParams?.access_token);
  const params = new URLSearchParams();

  if (token || code || hashToken) {
    params.set("token", token || code || hashToken || "");
  }

  if (error) {
    // 第三方回调失败时回到登录页展示错误，而不是落到仪表盘造成“已登录”的错觉。
    params.set("error", error);
    return `/${locale}/auth/signin?${params.toString()}`;
  }

  if (type === "recovery" || type === "PASSWORD_RECOVERY") {
    // Supabase/旧端可能用 recovery 或 PASSWORD_RECOVERY 标识重置密码。
    return `/${locale}/auth/reset-password${params.toString() ? `?${params.toString()}` : ""}`;
  }

  if (type === "email_verification" || type === "signup" || token) {
    // 没有 type 但带 token 的旧邮件链接默认按邮箱验证处理。
    return `/${locale}/auth/verify-email${params.toString() ? `?${params.toString()}` : ""}`;
  }

  return `/${locale}/dashboard`;
}
