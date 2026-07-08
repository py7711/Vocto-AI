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
    verifySubject: "تحقق من بريدك الإلكتروني في Votxt",
    verifyIntro: "افتح الرابط أدناه للتحقق من بريدك الإلكتروني في Votxt:",
    verifyExpiry: "تنتهي صلاحية هذا الرابط خلال 24 ساعة.",
    resetSubject: "إعادة تعيين كلمة مرور Votxt",
    resetIntro: "افتح الرابط أدناه لإعادة تعيين كلمة مرور Votxt:",
    resetExpiry: "تنتهي صلاحية هذا الرابط خلال ساعة واحدة. إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة.",
    greeting: (name) => `مرحباً ${name}،`
  },
  de: {
    verifySubject: "Bestatige deine Votxt-E-Mail",
    verifyIntro: "Offne den Link unten, um deine Votxt-E-Mail zu bestatigen:",
    verifyExpiry: "Dieser Link ist 24 Stunden lang gultig.",
    resetSubject: "Setze dein Votxt-Passwort zuruck",
    resetIntro: "Offne den Link unten, um dein Votxt-Passwort zuruckzusetzen:",
    resetExpiry: "Dieser Link ist 1 Stunde lang gultig. Falls du dies nicht angefordert hast, kannst du diese E-Mail ignorieren.",
    greeting: (name) => `Hallo ${name},`
  },
  en: {
    verifySubject: "Verify your Votxt email",
    verifyIntro: "Open the link below to verify your Votxt email:",
    verifyExpiry: "This link expires in 24 hours.",
    resetSubject: "Reset your Votxt password",
    resetIntro: "Open the link below to reset your Votxt password:",
    resetExpiry: "This link expires in 1 hour. If you did not request it, you can ignore this email.",
    greeting: (name) => `Hello ${name},`
  },
  es: {
    verifySubject: "Verifica tu correo de Votxt",
    verifyIntro: "Abre el enlace de abajo para verificar tu correo de Votxt:",
    verifyExpiry: "Este enlace vence en 24 horas.",
    resetSubject: "Restablece tu contrasena de Votxt",
    resetIntro: "Abre el enlace de abajo para restablecer tu contrasena de Votxt:",
    resetExpiry: "Este enlace vence en 1 hora. Si no lo solicitaste, puedes ignorar este correo.",
    greeting: (name) => `Hola ${name},`
  },
  fr: {
    verifySubject: "Verifiez votre e-mail Votxt",
    verifyIntro: "Ouvrez le lien ci-dessous pour verifier votre e-mail Votxt :",
    verifyExpiry: "Ce lien expire dans 24 heures.",
    resetSubject: "Reinitialisez votre mot de passe Votxt",
    resetIntro: "Ouvrez le lien ci-dessous pour reinitialiser votre mot de passe Votxt :",
    resetExpiry: "Ce lien expire dans 1 heure. Si vous n'etes pas a l'origine de cette demande, vous pouvez ignorer cet e-mail.",
    greeting: (name) => `Bonjour ${name},`
  },
  hu: {
    verifySubject: "Erositsd meg a Votxt e-mail-cimed",
    verifyIntro: "Nyisd meg az alabbi hivatkozast a Votxt e-mail-cimed megerositesehez:",
    verifyExpiry: "Ez a hivatkozas 24 oraig ervenyes.",
    resetSubject: "Allitsd vissza a Votxt jelszavad",
    resetIntro: "Nyisd meg az alabbi hivatkozast a Votxt jelszavad visszaallitasahoz:",
    resetExpiry: "Ez a hivatkozas 1 oraig ervenyes. Ha nem te kerted, hagyd figyelmen kivul ezt az e-mailt.",
    greeting: (name) => `Szia ${name},`
  },
  id: {
    verifySubject: "Verifikasi email Votxt Anda",
    verifyIntro: "Buka tautan di bawah ini untuk memverifikasi email Votxt Anda:",
    verifyExpiry: "Tautan ini berlaku selama 24 jam.",
    resetSubject: "Atur ulang kata sandi Votxt Anda",
    resetIntro: "Buka tautan di bawah ini untuk mengatur ulang kata sandi Votxt Anda:",
    resetExpiry: "Tautan ini berlaku selama 1 jam. Jika Anda tidak memintanya, Anda dapat mengabaikan email ini.",
    greeting: (name) => `Halo ${name},`
  },
  it: {
    verifySubject: "Verifica la tua email Votxt",
    verifyIntro: "Apri il link qui sotto per verificare la tua email Votxt:",
    verifyExpiry: "Questo link scade tra 24 ore.",
    resetSubject: "Reimposta la password Votxt",
    resetIntro: "Apri il link qui sotto per reimpostare la password Votxt:",
    resetExpiry: "Questo link scade tra 1 ora. Se non l'hai richiesto, puoi ignorare questa email.",
    greeting: (name) => `Ciao ${name},`
  },
  ja: {
    verifySubject: "Votxt のメールアドレスを確認してください",
    verifyIntro: "以下のリンクを開いて、Votxt のメールアドレスを確認してください:",
    verifyExpiry: "このリンクの有効期限は24時間です。",
    resetSubject: "Votxt のパスワードをリセット",
    resetIntro: "以下のリンクを開いて、Votxt のパスワードをリセットしてください:",
    resetExpiry: "このリンクの有効期限は1時間です。心当たりがない場合は、このメールを無視してください。",
    greeting: (name) => `${name} さん、こんにちは。`
  },
  ko: {
    verifySubject: "Votxt 이메일을 확인하세요",
    verifyIntro: "아래 링크를 열어 Votxt 이메일을 확인하세요:",
    verifyExpiry: "이 링크는 24시간 후 만료됩니다.",
    resetSubject: "Votxt 비밀번호 재설정",
    resetIntro: "아래 링크를 열어 Votxt 비밀번호를 재설정하세요:",
    resetExpiry: "이 링크는 1시간 후 만료됩니다. 요청하지 않았다면 이 이메일을 무시해도 됩니다.",
    greeting: (name) => `안녕하세요, ${name}님.`
  },
  nl: {
    verifySubject: "Verifieer je Votxt-e-mail",
    verifyIntro: "Open de onderstaande link om je Votxt-e-mail te verifieren:",
    verifyExpiry: "Deze link verloopt over 24 uur.",
    resetSubject: "Stel je Votxt-wachtwoord opnieuw in",
    resetIntro: "Open de onderstaande link om je Votxt-wachtwoord opnieuw in te stellen:",
    resetExpiry: "Deze link verloopt over 1 uur. Als je dit niet hebt aangevraagd, kun je deze e-mail negeren.",
    greeting: (name) => `Hallo ${name},`
  },
  pl: {
    verifySubject: "Zweryfikuj adres e-mail Votxt",
    verifyIntro: "Otworz ponizszy link, aby zweryfikowac adres e-mail Votxt:",
    verifyExpiry: "Ten link wygasa za 24 godziny.",
    resetSubject: "Zresetuj haslo Votxt",
    resetIntro: "Otworz ponizszy link, aby zresetowac haslo Votxt:",
    resetExpiry: "Ten link wygasa za 1 godzine. Jesli to nie Ty wyslales prosbe, zignoruj te wiadomosc.",
    greeting: (name) => `Czesc ${name},`
  },
  pt: {
    verifySubject: "Verifique seu e-mail do Votxt",
    verifyIntro: "Abra o link abaixo para verificar seu e-mail do Votxt:",
    verifyExpiry: "Este link expira em 24 horas.",
    resetSubject: "Redefina sua senha do Votxt",
    resetIntro: "Abra o link abaixo para redefinir sua senha do Votxt:",
    resetExpiry: "Este link expira em 1 hora. Se voce nao solicitou isso, pode ignorar este e-mail.",
    greeting: (name) => `Ola ${name},`
  },
  ru: {
    verifySubject: "Подтвердите адрес электронной почты Votxt",
    verifyIntro: "Откройте ссылку ниже, чтобы подтвердить адрес электронной почты Votxt:",
    verifyExpiry: "Срок действия этой ссылки истекает через 24 часа.",
    resetSubject: "Сбросьте пароль Votxt",
    resetIntro: "Откройте ссылку ниже, чтобы сбросить пароль Votxt:",
    resetExpiry: "Срок действия этой ссылки истекает через 1 час. Если вы не запрашивали сброс, просто проигнорируйте это письмо.",
    greeting: (name) => `Здравствуйте, ${name}!`
  },
  th: {
    verifySubject: "ยืนยันอีเมล Votxt ของคุณ",
    verifyIntro: "เปิดลิงก์ด้านล่างเพื่อยืนยันอีเมล Votxt ของคุณ:",
    verifyExpiry: "ลิงก์นี้จะหมดอายุใน 24 ชั่วโมง",
    resetSubject: "รีเซ็ตรหัสผ่าน Votxt ของคุณ",
    resetIntro: "เปิดลิงก์ด้านล่างเพื่อรีเซ็ตรหัสผ่าน Votxt ของคุณ:",
    resetExpiry: "ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง หากคุณไม่ได้ร้องขอ สามารถเพิกเฉยต่ออีเมลนี้ได้",
    greeting: (name) => `สวัสดี ${name},`
  },
  tr: {
    verifySubject: "Votxt e-postanizi dogrulayin",
    verifyIntro: "Votxt e-postanizi dogrulamak icin asagidaki baglantiyi acin:",
    verifyExpiry: "Bu baglanti 24 saat icinde sona erer.",
    resetSubject: "Votxt sifrenizi sifirlayin",
    resetIntro: "Votxt sifrenizi sifirlamak icin asagidaki baglantiyi acin:",
    resetExpiry: "Bu baglanti 1 saat icinde sona erer. Bunu siz istemediyseniz bu e-postayi yok sayabilirsiniz.",
    greeting: (name) => `Merhaba ${name},`
  },
  uk: {
    verifySubject: "Підтвердьте адресу електронної пошти Votxt",
    verifyIntro: "Відкрийте посилання нижче, щоб підтвердити адресу електронної пошти Votxt:",
    verifyExpiry: "Термін дії цього посилання закінчується через 24 години.",
    resetSubject: "Скиньте пароль Votxt",
    resetIntro: "Відкрийте посилання нижче, щоб скинути пароль Votxt:",
    resetExpiry: "Термін дії цього посилання закінчується через 1 годину. Якщо ви не надсилали запит, проігноруйте цей лист.",
    greeting: (name) => `Вітаємо, ${name}!`
  },
  vi: {
    verifySubject: "Xac minh email Votxt cua ban",
    verifyIntro: "Mo lien ket ben duoi de xac minh email Votxt cua ban:",
    verifyExpiry: "Lien ket nay het han sau 24 gio.",
    resetSubject: "Dat lai mat khau Votxt cua ban",
    resetIntro: "Mo lien ket ben duoi de dat lai mat khau Votxt cua ban:",
    resetExpiry: "Lien ket nay het han sau 1 gio. Neu ban khong yeu cau, ban co the bo qua email nay.",
    greeting: (name) => `Xin chao ${name},`
  },
  zh: {
    verifySubject: "验证你的 Votxt 邮箱",
    verifyIntro: "请点击下面的链接完成 Votxt 邮箱验证：",
    verifyExpiry: "该链接 24 小时内有效。",
    resetSubject: "重置你的 Votxt 密码",
    resetIntro: "请点击下面的链接重置你的 Votxt 密码：",
    resetExpiry: "该链接 1 小时内有效。如果不是你本人操作，可以忽略这封邮件。",
    greeting: (name) => `${name}，你好：`
  },
  "zh-TW": {
    verifySubject: "驗證你的 Votxt 信箱",
    verifyIntro: "請點擊下面的連結完成 Votxt 信箱驗證：",
    verifyExpiry: "此連結 24 小時內有效。",
    resetSubject: "重設你的 Votxt 密碼",
    resetIntro: "請點擊下面的連結重設你的 Votxt 密碼：",
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
