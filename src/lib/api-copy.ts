import "server-only";

type AuthCopyKey =
  | "emailExists"
  | "invalidLogin"
  | "registerFailed"
  | "loginFailed"
  | "verifyInvalid"
  | "verifyFailed";

const authCopy: Record<"zh" | "en", Record<AuthCopyKey, string>> = {
  zh: {
    emailExists: "该邮箱已注册，请直接登录。",
    invalidLogin: "邮箱或密码不正确。",
    registerFailed: "注册失败。",
    loginFailed: "登录失败。",
    verifyInvalid: "邮箱验证链接无效或已过期。",
    verifyFailed: "邮箱验证失败。"
  },
  en: {
    emailExists: "This email is already registered. Please sign in.",
    invalidLogin: "Email or password is incorrect.",
    registerFailed: "Registration failed.",
    loginFailed: "Login failed.",
    verifyInvalid: "The email verification link is invalid or expired.",
    verifyFailed: "Email verification failed."
  }
};

export function authMessage(key: AuthCopyKey, locale?: string | null) {
  return locale?.startsWith("zh") ? authCopy.zh[key] : authCopy.en[key];
}

