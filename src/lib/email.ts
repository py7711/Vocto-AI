import "server-only";

import nodemailer, {type Transporter} from "nodemailer";
import {env} from "@/lib/env";
import {isLocale, type Locale} from "@/lib/locales";

type VerificationEmailInput = {
  to: string;
  name?: string | null;
  verificationUrl: string;
  locale?: string;
};

type PasswordResetEmailInput = {
  to: string;
  name?: string | null;
  resetUrl: string;
  locale?: string;
};

type EmailLocaleCopy = {
  verifySubject: string;
  verifyIntro: string;
  verifyExpiry: string;
  resetSubject: string;
  resetIntro: string;
  resetExpiry: string;
  greeting: (name: string) => string;
};

const emailCopy: Record<Locale, EmailLocaleCopy> = {
  ar: {
    verifySubject: "تحقق من بريدك الإلكتروني في UniScribe",
    verifyIntro: "افتح الرابط أدناه للتحقق من بريدك الإلكتروني في UniScribe:",
    verifyExpiry: "تنتهي صلاحية هذا الرابط خلال 24 ساعة.",
    resetSubject: "إعادة تعيين كلمة مرور UniScribe",
    resetIntro: "افتح الرابط أدناه لإعادة تعيين كلمة مرور UniScribe:",
    resetExpiry: "تنتهي صلاحية هذا الرابط خلال ساعة واحدة. إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة.",
    greeting: (name) => `مرحباً ${name}،`
  },
  de: {
    verifySubject: "Bestatige deine UniScribe-E-Mail",
    verifyIntro: "Offne den Link unten, um deine UniScribe-E-Mail zu bestatigen:",
    verifyExpiry: "Dieser Link ist 24 Stunden lang gultig.",
    resetSubject: "Setze dein UniScribe-Passwort zuruck",
    resetIntro: "Offne den Link unten, um dein UniScribe-Passwort zuruckzusetzen:",
    resetExpiry: "Dieser Link ist 1 Stunde lang gultig. Falls du dies nicht angefordert hast, kannst du diese E-Mail ignorieren.",
    greeting: (name) => `Hallo ${name},`
  },
  en: {
    verifySubject: "Verify your UniScribe email",
    verifyIntro: "Open the link below to verify your UniScribe email:",
    verifyExpiry: "This link expires in 24 hours.",
    resetSubject: "Reset your UniScribe password",
    resetIntro: "Open the link below to reset your UniScribe password:",
    resetExpiry: "This link expires in 1 hour. If you did not request it, you can ignore this email.",
    greeting: (name) => `Hello ${name},`
  },
  es: {
    verifySubject: "Verifica tu correo de UniScribe",
    verifyIntro: "Abre el enlace de abajo para verificar tu correo de UniScribe:",
    verifyExpiry: "Este enlace vence en 24 horas.",
    resetSubject: "Restablece tu contrasena de UniScribe",
    resetIntro: "Abre el enlace de abajo para restablecer tu contrasena de UniScribe:",
    resetExpiry: "Este enlace vence en 1 hora. Si no lo solicitaste, puedes ignorar este correo.",
    greeting: (name) => `Hola ${name},`
  },
  fr: {
    verifySubject: "Verifiez votre e-mail UniScribe",
    verifyIntro: "Ouvrez le lien ci-dessous pour verifier votre e-mail UniScribe :",
    verifyExpiry: "Ce lien expire dans 24 heures.",
    resetSubject: "Reinitialisez votre mot de passe UniScribe",
    resetIntro: "Ouvrez le lien ci-dessous pour reinitialiser votre mot de passe UniScribe :",
    resetExpiry: "Ce lien expire dans 1 heure. Si vous n'etes pas a l'origine de cette demande, vous pouvez ignorer cet e-mail.",
    greeting: (name) => `Bonjour ${name},`
  },
  hu: {
    verifySubject: "Erositsd meg a UniScribe e-mail-cimed",
    verifyIntro: "Nyisd meg az alabbi hivatkozast a UniScribe e-mail-cimed megerositesehez:",
    verifyExpiry: "Ez a hivatkozas 24 oraig ervenyes.",
    resetSubject: "Allitsd vissza a UniScribe jelszavad",
    resetIntro: "Nyisd meg az alabbi hivatkozast a UniScribe jelszavad visszaallitasahoz:",
    resetExpiry: "Ez a hivatkozas 1 oraig ervenyes. Ha nem te kerted, hagyd figyelmen kivul ezt az e-mailt.",
    greeting: (name) => `Szia ${name},`
  },
  id: {
    verifySubject: "Verifikasi email UniScribe Anda",
    verifyIntro: "Buka tautan di bawah ini untuk memverifikasi email UniScribe Anda:",
    verifyExpiry: "Tautan ini berlaku selama 24 jam.",
    resetSubject: "Atur ulang kata sandi UniScribe Anda",
    resetIntro: "Buka tautan di bawah ini untuk mengatur ulang kata sandi UniScribe Anda:",
    resetExpiry: "Tautan ini berlaku selama 1 jam. Jika Anda tidak memintanya, Anda dapat mengabaikan email ini.",
    greeting: (name) => `Halo ${name},`
  },
  it: {
    verifySubject: "Verifica la tua email UniScribe",
    verifyIntro: "Apri il link qui sotto per verificare la tua email UniScribe:",
    verifyExpiry: "Questo link scade tra 24 ore.",
    resetSubject: "Reimposta la password UniScribe",
    resetIntro: "Apri il link qui sotto per reimpostare la password UniScribe:",
    resetExpiry: "Questo link scade tra 1 ora. Se non l'hai richiesto, puoi ignorare questa email.",
    greeting: (name) => `Ciao ${name},`
  },
  ja: {
    verifySubject: "UniScribe のメールアドレスを確認してください",
    verifyIntro: "以下のリンクを開いて、UniScribe のメールアドレスを確認してください:",
    verifyExpiry: "このリンクの有効期限は24時間です。",
    resetSubject: "UniScribe のパスワードをリセット",
    resetIntro: "以下のリンクを開いて、UniScribe のパスワードをリセットしてください:",
    resetExpiry: "このリンクの有効期限は1時間です。心当たりがない場合は、このメールを無視してください。",
    greeting: (name) => `${name} さん、こんにちは。`
  },
  ko: {
    verifySubject: "UniScribe 이메일을 확인하세요",
    verifyIntro: "아래 링크를 열어 UniScribe 이메일을 확인하세요:",
    verifyExpiry: "이 링크는 24시간 후 만료됩니다.",
    resetSubject: "UniScribe 비밀번호 재설정",
    resetIntro: "아래 링크를 열어 UniScribe 비밀번호를 재설정하세요:",
    resetExpiry: "이 링크는 1시간 후 만료됩니다. 요청하지 않았다면 이 이메일을 무시해도 됩니다.",
    greeting: (name) => `안녕하세요, ${name}님.`
  },
  nl: {
    verifySubject: "Verifieer je UniScribe-e-mail",
    verifyIntro: "Open de onderstaande link om je UniScribe-e-mail te verifieren:",
    verifyExpiry: "Deze link verloopt over 24 uur.",
    resetSubject: "Stel je UniScribe-wachtwoord opnieuw in",
    resetIntro: "Open de onderstaande link om je UniScribe-wachtwoord opnieuw in te stellen:",
    resetExpiry: "Deze link verloopt over 1 uur. Als je dit niet hebt aangevraagd, kun je deze e-mail negeren.",
    greeting: (name) => `Hallo ${name},`
  },
  pl: {
    verifySubject: "Zweryfikuj adres e-mail UniScribe",
    verifyIntro: "Otworz ponizszy link, aby zweryfikowac adres e-mail UniScribe:",
    verifyExpiry: "Ten link wygasa za 24 godziny.",
    resetSubject: "Zresetuj haslo UniScribe",
    resetIntro: "Otworz ponizszy link, aby zresetowac haslo UniScribe:",
    resetExpiry: "Ten link wygasa za 1 godzine. Jesli to nie Ty wyslales prosbe, zignoruj te wiadomosc.",
    greeting: (name) => `Czesc ${name},`
  },
  pt: {
    verifySubject: "Verifique seu e-mail do UniScribe",
    verifyIntro: "Abra o link abaixo para verificar seu e-mail do UniScribe:",
    verifyExpiry: "Este link expira em 24 horas.",
    resetSubject: "Redefina sua senha do UniScribe",
    resetIntro: "Abra o link abaixo para redefinir sua senha do UniScribe:",
    resetExpiry: "Este link expira em 1 hora. Se voce nao solicitou isso, pode ignorar este e-mail.",
    greeting: (name) => `Ola ${name},`
  },
  ru: {
    verifySubject: "Подтвердите адрес электронной почты UniScribe",
    verifyIntro: "Откройте ссылку ниже, чтобы подтвердить адрес электронной почты UniScribe:",
    verifyExpiry: "Срок действия этой ссылки истекает через 24 часа.",
    resetSubject: "Сбросьте пароль UniScribe",
    resetIntro: "Откройте ссылку ниже, чтобы сбросить пароль UniScribe:",
    resetExpiry: "Срок действия этой ссылки истекает через 1 час. Если вы не запрашивали сброс, просто проигнорируйте это письмо.",
    greeting: (name) => `Здравствуйте, ${name}!`
  },
  th: {
    verifySubject: "ยืนยันอีเมล UniScribe ของคุณ",
    verifyIntro: "เปิดลิงก์ด้านล่างเพื่อยืนยันอีเมล UniScribe ของคุณ:",
    verifyExpiry: "ลิงก์นี้จะหมดอายุใน 24 ชั่วโมง",
    resetSubject: "รีเซ็ตรหัสผ่าน UniScribe ของคุณ",
    resetIntro: "เปิดลิงก์ด้านล่างเพื่อรีเซ็ตรหัสผ่าน UniScribe ของคุณ:",
    resetExpiry: "ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง หากคุณไม่ได้ร้องขอ สามารถเพิกเฉยต่ออีเมลนี้ได้",
    greeting: (name) => `สวัสดี ${name},`
  },
  tr: {
    verifySubject: "UniScribe e-postanizi dogrulayin",
    verifyIntro: "UniScribe e-postanizi dogrulamak icin asagidaki baglantiyi acin:",
    verifyExpiry: "Bu baglanti 24 saat icinde sona erer.",
    resetSubject: "UniScribe sifrenizi sifirlayin",
    resetIntro: "UniScribe sifrenizi sifirlamak icin asagidaki baglantiyi acin:",
    resetExpiry: "Bu baglanti 1 saat icinde sona erer. Bunu siz istemediyseniz bu e-postayi yok sayabilirsiniz.",
    greeting: (name) => `Merhaba ${name},`
  },
  uk: {
    verifySubject: "Підтвердьте адресу електронної пошти UniScribe",
    verifyIntro: "Відкрийте посилання нижче, щоб підтвердити адресу електронної пошти UniScribe:",
    verifyExpiry: "Термін дії цього посилання закінчується через 24 години.",
    resetSubject: "Скиньте пароль UniScribe",
    resetIntro: "Відкрийте посилання нижче, щоб скинути пароль UniScribe:",
    resetExpiry: "Термін дії цього посилання закінчується через 1 годину. Якщо ви не надсилали запит, проігноруйте цей лист.",
    greeting: (name) => `Вітаємо, ${name}!`
  },
  vi: {
    verifySubject: "Xac minh email UniScribe cua ban",
    verifyIntro: "Mo lien ket ben duoi de xac minh email UniScribe cua ban:",
    verifyExpiry: "Lien ket nay het han sau 24 gio.",
    resetSubject: "Dat lai mat khau UniScribe cua ban",
    resetIntro: "Mo lien ket ben duoi de dat lai mat khau UniScribe cua ban:",
    resetExpiry: "Lien ket nay het han sau 1 gio. Neu ban khong yeu cau, ban co the bo qua email nay.",
    greeting: (name) => `Xin chao ${name},`
  },
  zh: {
    verifySubject: "验证你的 UniScribe 邮箱",
    verifyIntro: "请点击下面的链接完成 UniScribe 邮箱验证：",
    verifyExpiry: "该链接 24 小时内有效。",
    resetSubject: "重置你的 UniScribe 密码",
    resetIntro: "请点击下面的链接重置你的 UniScribe 密码：",
    resetExpiry: "该链接 1 小时内有效。如果不是你本人操作，可以忽略这封邮件。",
    greeting: (name) => `${name}，你好：`
  },
  "zh-TW": {
    verifySubject: "驗證你的 UniScribe 信箱",
    verifyIntro: "請點擊下面的連結完成 UniScribe 信箱驗證：",
    verifyExpiry: "此連結 24 小時內有效。",
    resetSubject: "重設你的 UniScribe 密碼",
    resetIntro: "請點擊下面的連結重設你的 UniScribe 密碼：",
    resetExpiry: "此連結 1 小時內有效。如果不是你本人操作，可以忽略這封郵件。",
    greeting: (name) => `${name}，你好：`
  }
};

function normalizeEmailLocale(locale: string | undefined): Locale {
  return isLocale(locale) ? locale : "en";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildLocalizedEmail(copy: EmailLocaleCopy, name: string, url: string, subject: string, intro: string, expiry: string) {
  const escapedUrl = escapeHtml(url);
  const greeting = copy.greeting(name);
  const escapedGreeting = escapeHtml(greeting);

  return {
    subject,
    html: `<p>${escapedGreeting}</p><p>${escapeHtml(intro)}</p><p><a href="${escapedUrl}">${escapedUrl}</a></p><p>${escapeHtml(expiry)}</p>`,
    text: `${greeting}\n${intro}\n${url}\n${expiry}`
  };
}

function buildEmailCopy(input: VerificationEmailInput) {
  const copy = emailCopy[normalizeEmailLocale(input.locale)];
  const name = input.name || input.to;
  return buildLocalizedEmail(copy, name, input.verificationUrl, copy.verifySubject, copy.verifyIntro, copy.verifyExpiry);
}

type OutgoingEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

let smtpTransporter: Transporter | null = null;

// 要求账号密码齐全才视为可用的 SMTP 配置，避免密码未填时以匿名连接方式发起真实请求并报错。
function isSmtpConfigured() {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD);
}

function getSmtpTransporter(): Transporter | null {
  if (!isSmtpConfigured()) {
    return null;
  }

  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {user: env.SMTP_USER, pass: env.SMTP_PASSWORD}
    });
  }

  return smtpTransporter;
}

function isEmailConfigured() {
  return Boolean(env.EMAIL_FROM) && (isSmtpConfigured() || Boolean(env.RESEND_API_KEY));
}

async function dispatchEmail(message: OutgoingEmail, failureLabel: string) {
  const transporter = getSmtpTransporter();

  // SMTP（如 Spacemail）优先；未配置 SMTP_HOST 时回退到 Resend REST API。
  if (transporter) {
    try {
      await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(`${failureLabel}：SMTP 发送失败 - ${reason}`);
    }
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text
    })
  });

  if (!response.ok) {
    throw new Error(`${failureLabel}：${response.status} ${await response.text()}`);
  }
}

export async function sendVerificationEmail(input: VerificationEmailInput) {
  const copy = buildEmailCopy(input);

  if (!isEmailConfigured()) {
    // 本地开发或未配置邮件服务时仍返回验证链接，便于前端和测试环境继续走完整流程。
    return {sent: false, verificationUrl: input.verificationUrl};
  }

  await dispatchEmail({to: input.to, subject: copy.subject, html: copy.html, text: copy.text}, "验证邮件发送失败");

  return {sent: true};
}

function buildPasswordResetCopy(input: PasswordResetEmailInput) {
  const copy = emailCopy[normalizeEmailLocale(input.locale)];
  const name = input.name || input.to;
  return buildLocalizedEmail(copy, name, input.resetUrl, copy.resetSubject, copy.resetIntro, copy.resetExpiry);
}

export async function sendPasswordResetEmail(input: PasswordResetEmailInput) {
  const copy = buildPasswordResetCopy(input);

  if (!isEmailConfigured()) {
    return {sent: false, resetUrl: input.resetUrl};
  }

  await dispatchEmail({to: input.to, subject: copy.subject, html: copy.html, text: copy.text}, "密码重置邮件发送失败");

  return {sent: true};
}
