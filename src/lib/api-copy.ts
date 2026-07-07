import "server-only";
import {isLocale, type Locale} from "@/lib/locales";

type AuthCopyKey =
  | "emailExists"
  | "invalidLogin"
  | "registerFailed"
  | "loginFailed"
  | "loginRequired"
  | "verifyInvalid"
  | "verifyFailed";

const authCopy: Record<Locale, Record<AuthCopyKey, string>> = {
  ar: {
    emailExists: "هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول.",
    invalidLogin: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    registerFailed: "فشل التسجيل.",
    loginFailed: "فشل تسجيل الدخول.",
    loginRequired: "يرجى تسجيل الدخول أولا.",
    verifyInvalid: "رابط التحقق من البريد الإلكتروني غير صالح أو منتهي الصلاحية.",
    verifyFailed: "فشل التحقق من البريد الإلكتروني."
  },
  de: {
    emailExists: "Diese E-Mail ist bereits registriert. Bitte melde dich an.",
    invalidLogin: "E-Mail oder Passwort ist falsch.",
    registerFailed: "Registrierung fehlgeschlagen.",
    loginFailed: "Anmeldung fehlgeschlagen.",
    loginRequired: "Bitte melde dich zuerst an.",
    verifyInvalid: "Der E-Mail-Bestätigungslink ist ungültig oder abgelaufen.",
    verifyFailed: "E-Mail-Bestätigung fehlgeschlagen."
  },
  en: {
    emailExists: "This email is already registered. Please sign in.",
    invalidLogin: "Email or password is incorrect.",
    registerFailed: "Registration failed.",
    loginFailed: "Login failed.",
    loginRequired: "Please sign in first.",
    verifyInvalid: "The email verification link is invalid or expired.",
    verifyFailed: "Email verification failed."
  },
  es: {
    emailExists: "Este correo ya está registrado. Inicia sesión.",
    invalidLogin: "El correo o la contraseña no son correctos.",
    registerFailed: "No se pudo registrar.",
    loginFailed: "No se pudo iniciar sesión.",
    loginRequired: "Inicia sesión primero.",
    verifyInvalid: "El enlace de verificación no es válido o ha caducado.",
    verifyFailed: "No se pudo verificar el correo."
  },
  fr: {
    emailExists: "Cette adresse e-mail est déjà inscrite. Connectez-vous.",
    invalidLogin: "L'e-mail ou le mot de passe est incorrect.",
    registerFailed: "Échec de l'inscription.",
    loginFailed: "Échec de la connexion.",
    loginRequired: "Connectez-vous d'abord.",
    verifyInvalid: "Le lien de vérification est invalide ou expiré.",
    verifyFailed: "Échec de la vérification de l'e-mail."
  },
  hu: {
    emailExists: "Ez az e-mail már regisztrálva van. Jelentkezz be.",
    invalidLogin: "Az e-mail cím vagy a jelszó hibás.",
    registerFailed: "A regisztráció sikertelen.",
    loginFailed: "A bejelentkezés sikertelen.",
    loginRequired: "Először jelentkezz be.",
    verifyInvalid: "Az e-mail ellenőrző link érvénytelen vagy lejárt.",
    verifyFailed: "Az e-mail ellenőrzése sikertelen."
  },
  id: {
    emailExists: "Email ini sudah terdaftar. Silakan masuk.",
    invalidLogin: "Email atau kata sandi salah.",
    registerFailed: "Pendaftaran gagal.",
    loginFailed: "Masuk gagal.",
    loginRequired: "Silakan masuk terlebih dahulu.",
    verifyInvalid: "Tautan verifikasi email tidak valid atau kedaluwarsa.",
    verifyFailed: "Verifikasi email gagal."
  },
  it: {
    emailExists: "Questa email è già registrata. Accedi.",
    invalidLogin: "Email o password non corretti.",
    registerFailed: "Registrazione non riuscita.",
    loginFailed: "Accesso non riuscito.",
    loginRequired: "Accedi prima di continuare.",
    verifyInvalid: "Il link di verifica email non è valido o è scaduto.",
    verifyFailed: "Verifica email non riuscita."
  },
  ja: {
    emailExists: "このメールアドレスは登録済みです。サインインしてください。",
    invalidLogin: "メールアドレスまたはパスワードが正しくありません。",
    registerFailed: "登録に失敗しました。",
    loginFailed: "ログインに失敗しました。",
    loginRequired: "先にサインインしてください。",
    verifyInvalid: "メール確認リンクが無効、または期限切れです。",
    verifyFailed: "メール確認に失敗しました。"
  },
  ko: {
    emailExists: "이미 등록된 이메일입니다. 로그인해 주세요.",
    invalidLogin: "이메일 또는 비밀번호가 올바르지 않습니다.",
    registerFailed: "가입에 실패했습니다.",
    loginFailed: "로그인에 실패했습니다.",
    loginRequired: "먼저 로그인해 주세요.",
    verifyInvalid: "이메일 인증 링크가 유효하지 않거나 만료되었습니다.",
    verifyFailed: "이메일 인증에 실패했습니다."
  },
  nl: {
    emailExists: "Dit e-mailadres is al geregistreerd. Log in.",
    invalidLogin: "E-mail of wachtwoord is onjuist.",
    registerFailed: "Registreren is mislukt.",
    loginFailed: "Inloggen is mislukt.",
    loginRequired: "Log eerst in.",
    verifyInvalid: "De e-mailverificatielink is ongeldig of verlopen.",
    verifyFailed: "E-mailverificatie is mislukt."
  },
  pl: {
    emailExists: "Ten adres e-mail jest już zarejestrowany. Zaloguj się.",
    invalidLogin: "Adres e-mail lub hasło jest nieprawidłowe.",
    registerFailed: "Rejestracja nie powiodła się.",
    loginFailed: "Logowanie nie powiodło się.",
    loginRequired: "Najpierw się zaloguj.",
    verifyInvalid: "Link weryfikacyjny jest nieprawidłowy lub wygasł.",
    verifyFailed: "Weryfikacja adresu e-mail nie powiodła się."
  },
  pt: {
    emailExists: "Este email já está registrado. Faça login.",
    invalidLogin: "Email ou senha incorretos.",
    registerFailed: "Falha no cadastro.",
    loginFailed: "Falha ao entrar.",
    loginRequired: "Faça login primeiro.",
    verifyInvalid: "O link de verificação de email é inválido ou expirou.",
    verifyFailed: "Falha na verificação do email."
  },
  ru: {
    emailExists: "Этот адрес уже зарегистрирован. Войдите в аккаунт.",
    invalidLogin: "Неверный адрес электронной почты или пароль.",
    registerFailed: "Не удалось зарегистрироваться.",
    loginFailed: "Не удалось войти.",
    loginRequired: "Сначала войдите в аккаунт.",
    verifyInvalid: "Ссылка подтверждения почты недействительна или истекла.",
    verifyFailed: "Не удалось подтвердить электронную почту."
  },
  th: {
    emailExists: "อีเมลนี้ลงทะเบียนแล้ว โปรดเข้าสู่ระบบ",
    invalidLogin: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
    registerFailed: "ลงทะเบียนไม่สำเร็จ",
    loginFailed: "เข้าสู่ระบบไม่สำเร็จ",
    loginRequired: "โปรดเข้าสู่ระบบก่อน",
    verifyInvalid: "ลิงก์ยืนยันอีเมลไม่ถูกต้องหรือหมดอายุแล้ว",
    verifyFailed: "ยืนยันอีเมลไม่สำเร็จ"
  },
  tr: {
    emailExists: "Bu e-posta zaten kayıtlı. Lütfen giriş yapın.",
    invalidLogin: "E-posta veya parola yanlış.",
    registerFailed: "Kayıt başarısız.",
    loginFailed: "Giriş başarısız.",
    loginRequired: "Lütfen önce giriş yapın.",
    verifyInvalid: "E-posta doğrulama bağlantısı geçersiz veya süresi dolmuş.",
    verifyFailed: "E-posta doğrulaması başarısız."
  },
  uk: {
    emailExists: "Цю адресу вже зареєстровано. Увійдіть.",
    invalidLogin: "Електронна пошта або пароль неправильні.",
    registerFailed: "Не вдалося зареєструватися.",
    loginFailed: "Не вдалося увійти.",
    loginRequired: "Спочатку увійдіть.",
    verifyInvalid: "Посилання для підтвердження пошти недійсне або протерміноване.",
    verifyFailed: "Не вдалося підтвердити електронну пошту."
  },
  vi: {
    emailExists: "Email này đã được đăng ký. Vui lòng đăng nhập.",
    invalidLogin: "Email hoặc mật khẩu không đúng.",
    registerFailed: "Đăng ký thất bại.",
    loginFailed: "Đăng nhập thất bại.",
    loginRequired: "Vui lòng đăng nhập trước.",
    verifyInvalid: "Liên kết xác minh email không hợp lệ hoặc đã hết hạn.",
    verifyFailed: "Xác minh email thất bại."
  },
  zh: {
    emailExists: "该邮箱已注册，请直接登录。",
    invalidLogin: "邮箱或密码不正确。",
    registerFailed: "注册失败。",
    loginFailed: "登录失败。",
    loginRequired: "请先登录。",
    verifyInvalid: "邮箱验证链接无效或已过期。",
    verifyFailed: "邮箱验证失败。"
  },
  "zh-TW": {
    emailExists: "此電子郵件已註冊，請直接登入。",
    invalidLogin: "電子郵件或密碼不正確。",
    registerFailed: "註冊失敗。",
    loginFailed: "登入失敗。",
    loginRequired: "請先登入。",
    verifyInvalid: "電子郵件驗證連結無效或已過期。",
    verifyFailed: "電子郵件驗證失敗。"
  }
};

export function authMessage(key: AuthCopyKey, locale?: string | null) {
  const candidate = locale ?? undefined;
  const normalizedLocale: Locale = isLocale(candidate) ? candidate : "en";
  return authCopy[normalizedLocale][key];
}
