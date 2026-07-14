import {isLocale, type Locale} from "@/lib/locales";
import {buildPrivateMetadata} from "@/lib/seo";

type AuthMetadataKey = "signup" | "signin" | "forgot" | "reset" | "verify" | "appsumo";

const authMetadataTitles: Record<Locale, Record<AuthMetadataKey, string>> = {
  en: {signup: "Sign Up", signin: "Sign In", forgot: "Forgot Password", reset: "Reset Password", verify: "Verify Email", appsumo: "Activate AppSumo"},
  id: {signup: "Daftar", signin: "Masuk", forgot: "Lupa Kata Sandi", reset: "Reset Kata Sandi", verify: "Verifikasi Email", appsumo: "Aktifkan AppSumo"},
  ru: {signup: "Регистрация", signin: "Вход", forgot: "Забыли пароль", reset: "Сброс пароля", verify: "Подтверждение email", appsumo: "Активировать AppSumo"},
  es: {signup: "Registrarse", signin: "Iniciar sesión", forgot: "Restablecer contraseña", reset: "Nueva contraseña", verify: "Verificar email", appsumo: "Activar AppSumo"},
  vi: {signup: "Đăng ký", signin: "Đăng nhập", forgot: "Quên mật khẩu", reset: "Đặt lại mật khẩu", verify: "Xác minh email", appsumo: "Kích hoạt AppSumo"},
  ar: {signup: "التسجيل", signin: "تسجيل الدخول", forgot: "نسيت كلمة المرور", reset: "إعادة تعيين كلمة المرور", verify: "تأكيد البريد الإلكتروني", appsumo: "تفعيل AppSumo"},
  pt: {signup: "Cadastrar", signin: "Entrar", forgot: "Redefinir senha", reset: "Nova senha", verify: "Verificar email", appsumo: "Ativar AppSumo"},
  fr: {signup: "Inscription", signin: "Connexion", forgot: "Mot de passe oublié", reset: "Nouveau mot de passe", verify: "Vérifier l'email", appsumo: "Activer AppSumo"},
  zh: {signup: "注册", signin: "登录", forgot: "重置密码", reset: "设置新密码", verify: "验证邮箱", appsumo: "激活 AppSumo"},
  "zh-TW": {signup: "註冊", signin: "登入", forgot: "重設密碼", reset: "設定新密碼", verify: "驗證電子郵件", appsumo: "啟用 AppSumo"},
  de: {signup: "Registrieren", signin: "Anmelden", forgot: "Passwort zurücksetzen", reset: "Neues Passwort", verify: "E-Mail bestätigen", appsumo: "AppSumo aktivieren"},
  it: {signup: "Registrati", signin: "Accedi", forgot: "Password dimenticata", reset: "Reimposta password", verify: "Verifica email", appsumo: "Attiva AppSumo"},
  th: {signup: "สมัคร", signin: "เข้าสู่ระบบ", forgot: "ลืมรหัสผ่าน", reset: "รีเซ็ตรหัสผ่าน", verify: "ยืนยันอีเมล", appsumo: "เปิดใช้งาน AppSumo"},
  uk: {signup: "Реєстрація", signin: "Вхід", forgot: "Забули пароль", reset: "Скинути пароль", verify: "Підтвердження email", appsumo: "Активувати AppSumo"},
  tr: {signup: "Kayıt ol", signin: "Giriş yap", forgot: "Parolamı Unuttum", reset: "Parolayı sıfırla", verify: "E-postayı doğrula", appsumo: "AppSumo etkinleştir"},
  ja: {signup: "登録", signin: "ログイン", forgot: "パスワードをリセット", reset: "新しいパスワード", verify: "メールを確認", appsumo: "AppSumo を有効化"},
  nl: {signup: "Registreren", signin: "Inloggen", forgot: "Wachtwoord vergeten", reset: "Wachtwoord resetten", verify: "E-mail verifiëren", appsumo: "AppSumo activeren"},
  pl: {signup: "Rejestracja", signin: "Logowanie", forgot: "Nie pamiętasz hasła", reset: "Resetuj hasło", verify: "Zweryfikuj email", appsumo: "Aktywuj AppSumo"},
  ko: {signup: "가입", signin: "로그인", forgot: "비밀번호 재설정", reset: "새 비밀번호", verify: "이메일 확인", appsumo: "AppSumo 활성화"},
  hu: {signup: "Regisztráció", signin: "Bejelentkezés", forgot: "Elfelejtett jelszó", reset: "Jelszó visszaállítása", verify: "E-mail megerősítése", appsumo: "AppSumo aktiválása"}
};

export function authMetadata(locale: string, key: AuthMetadataKey) {
  const safeLocale = isLocale(locale) ? locale : "en";
  const pathByKey: Record<AuthMetadataKey, string> = {
    appsumo: "/auth/appsumo",
    forgot: "/auth/forgot-password",
    reset: "/auth/reset-password",
    signin: "/auth/signin",
    signup: "/auth/signup",
    verify: "/auth/verify-email"
  };
  return buildPrivateMetadata(authMetadataTitles[safeLocale][key], safeLocale, pathByKey[key]);
}
