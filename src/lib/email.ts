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
  verifyButton: string;
  resetSubject: string;
  resetIntro: string;
  resetExpiry: string;
  resetButton: string;
  greeting: (name: string) => string;
};

const emailCopy: Record<Locale, EmailLocaleCopy> = {
  ar: {
    verifySubject: "تحقق من بريدك الإلكتروني في Votxt",
    verifyIntro: "انقر على الزر أدناه للتحقق من بريدك الإلكتروني في Votxt:",
    verifyExpiry: "تنتهي صلاحية هذا الرابط خلال 24 ساعة.",
    verifyButton: "تأكيد بريدك الإلكتروني",
    resetSubject: "إعادة تعيين كلمة مرور Votxt",
    resetIntro: "انقر على الزر أدناه لإعادة تعيين كلمة مرور Votxt:",
    resetExpiry: "تنتهي صلاحية هذا الرابط خلال ساعة واحدة. إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة.",
    resetButton: "إعادة تعيين كلمة المرور",
    greeting: (name) => `مرحباً ${name}،`
  },
  de: {
    verifySubject: "Bestatige deine Votxt-E-Mail",
    verifyIntro: "Klicke auf die Schaltflache unten, um deine Votxt-E-Mail zu bestatigen:",
    verifyExpiry: "Dieser Link ist 24 Stunden lang gultig.",
    verifyButton: "E-Mail bestatigen",
    resetSubject: "Setze dein Votxt-Passwort zuruck",
    resetIntro: "Klicke auf die Schaltflache unten, um dein Votxt-Passwort zuruckzusetzen:",
    resetExpiry: "Dieser Link ist 1 Stunde lang gultig. Falls du dies nicht angefordert hast, kannst du diese E-Mail ignorieren.",
    resetButton: "Passwort zurucksetzen",
    greeting: (name) => `Hallo ${name},`
  },
  en: {
    verifySubject: "Verify your Votxt email",
    verifyIntro: "Click the button below to verify your Votxt email:",
    verifyExpiry: "This link expires in 24 hours.",
    verifyButton: "Confirm your mail",
    resetSubject: "Reset your Votxt password",
    resetIntro: "Click the button below to reset your Votxt password:",
    resetExpiry: "This link expires in 1 hour. If you did not request it, you can ignore this email.",
    resetButton: "Reset password",
    greeting: (name) => `Hello ${name},`
  },
  es: {
    verifySubject: "Verifica tu correo de Votxt",
    verifyIntro: "Haz clic en el boton de abajo para verificar tu correo de Votxt:",
    verifyExpiry: "Este enlace vence en 24 horas.",
    verifyButton: "Confirmar tu correo",
    resetSubject: "Restablece tu contrasena de Votxt",
    resetIntro: "Haz clic en el boton de abajo para restablecer tu contrasena de Votxt:",
    resetExpiry: "Este enlace vence en 1 hora. Si no lo solicitaste, puedes ignorar este correo.",
    resetButton: "Restablecer contrasena",
    greeting: (name) => `Hola ${name},`
  },
  fr: {
    verifySubject: "Verifiez votre e-mail Votxt",
    verifyIntro: "Cliquez sur le bouton ci-dessous pour verifier votre e-mail Votxt :",
    verifyExpiry: "Ce lien expire dans 24 heures.",
    verifyButton: "Confirmer votre e-mail",
    resetSubject: "Reinitialisez votre mot de passe Votxt",
    resetIntro: "Cliquez sur le bouton ci-dessous pour reinitialiser votre mot de passe Votxt :",
    resetExpiry: "Ce lien expire dans 1 heure. Si vous n'etes pas a l'origine de cette demande, vous pouvez ignorer cet e-mail.",
    resetButton: "Reinitialiser le mot de passe",
    greeting: (name) => `Bonjour ${name},`
  },
  hu: {
    verifySubject: "Erositsd meg a Votxt e-mail-cimed",
    verifyIntro: "Kattints az alabbi gombra a Votxt e-mail-cimed megerositesehez:",
    verifyExpiry: "Ez a hivatkozas 24 oraig ervenyes.",
    verifyButton: "E-mail megerositese",
    resetSubject: "Allitsd vissza a Votxt jelszavad",
    resetIntro: "Kattints az alabbi gombra a Votxt jelszavad visszaallitasahoz:",
    resetExpiry: "Ez a hivatkozas 1 oraig ervenyes. Ha nem te kerted, hagyd figyelmen kivul ezt az e-mailt.",
    resetButton: "Jelszo visszaallitasa",
    greeting: (name) => `Szia ${name},`
  },
  id: {
    verifySubject: "Verifikasi email Votxt Anda",
    verifyIntro: "Klik tombol di bawah ini untuk memverifikasi email Votxt Anda:",
    verifyExpiry: "Tautan ini berlaku selama 24 jam.",
    verifyButton: "Konfirmasi email Anda",
    resetSubject: "Atur ulang kata sandi Votxt Anda",
    resetIntro: "Klik tombol di bawah ini untuk mengatur ulang kata sandi Votxt Anda:",
    resetExpiry: "Tautan ini berlaku selama 1 jam. Jika Anda tidak memintanya, Anda dapat mengabaikan email ini.",
    resetButton: "Atur ulang kata sandi",
    greeting: (name) => `Halo ${name},`
  },
  it: {
    verifySubject: "Verifica la tua email Votxt",
    verifyIntro: "Fai clic sul pulsante qui sotto per verificare la tua email Votxt:",
    verifyExpiry: "Questo link scade tra 24 ore.",
    verifyButton: "Conferma la tua email",
    resetSubject: "Reimposta la password Votxt",
    resetIntro: "Fai clic sul pulsante qui sotto per reimpostare la password Votxt:",
    resetExpiry: "Questo link scade tra 1 ora. Se non l'hai richiesto, puoi ignorare questa email.",
    resetButton: "Reimposta la password",
    greeting: (name) => `Ciao ${name},`
  },
  ja: {
    verifySubject: "Votxt のメールアドレスを確認してください",
    verifyIntro: "以下のボタンをクリックして、Votxt のメールアドレスを確認してください:",
    verifyExpiry: "このリンクの有効期限は24時間です。",
    verifyButton: "メールを確認",
    resetSubject: "Votxt のパスワードをリセット",
    resetIntro: "以下のボタンをクリックして、Votxt のパスワードをリセットしてください:",
    resetExpiry: "このリンクの有効期限は1時間です。心当たりがない場合は、このメールを無視してください。",
    resetButton: "パスワードをリセット",
    greeting: (name) => `${name} さん、こんにちは。`
  },
  ko: {
    verifySubject: "Votxt 이메일을 확인하세요",
    verifyIntro: "아래 버튼을 클릭하여 Votxt 이메일을 확인하세요:",
    verifyExpiry: "이 링크는 24시간 후 만료됩니다.",
    verifyButton: "이메일 확인",
    resetSubject: "Votxt 비밀번호 재설정",
    resetIntro: "아래 버튼을 클릭하여 Votxt 비밀번호를 재설정하세요:",
    resetExpiry: "이 링크는 1시간 후 만료됩니다. 요청하지 않았다면 이 이메일을 무시해도 됩니다.",
    resetButton: "비밀번호 재설정",
    greeting: (name) => `안녕하세요, ${name}님.`
  },
  nl: {
    verifySubject: "Verifieer je Votxt-e-mail",
    verifyIntro: "Klik op de knop hieronder om je Votxt-e-mail te verifieren:",
    verifyExpiry: "Deze link verloopt over 24 uur.",
    verifyButton: "E-mail bevestigen",
    resetSubject: "Stel je Votxt-wachtwoord opnieuw in",
    resetIntro: "Klik op de knop hieronder om je Votxt-wachtwoord opnieuw in te stellen:",
    resetExpiry: "Deze link verloopt over 1 uur. Als je dit niet hebt aangevraagd, kun je deze e-mail negeren.",
    resetButton: "Wachtwoord opnieuw instellen",
    greeting: (name) => `Hallo ${name},`
  },
  pl: {
    verifySubject: "Zweryfikuj adres e-mail Votxt",
    verifyIntro: "Kliknij ponizszy przycisk, aby zweryfikowac adres e-mail Votxt:",
    verifyExpiry: "Ten link wygasa za 24 godziny.",
    verifyButton: "Potwierdz e-mail",
    resetSubject: "Zresetuj haslo Votxt",
    resetIntro: "Kliknij ponizszy przycisk, aby zresetowac haslo Votxt:",
    resetExpiry: "Ten link wygasa za 1 godzine. Jesli to nie Ty wyslales prosbe, zignoruj te wiadomosc.",
    resetButton: "Zresetuj haslo",
    greeting: (name) => `Czesc ${name},`
  },
  pt: {
    verifySubject: "Verifique seu e-mail do Votxt",
    verifyIntro: "Clique no botao abaixo para verificar seu e-mail do Votxt:",
    verifyExpiry: "Este link expira em 24 horas.",
    verifyButton: "Confirmar seu e-mail",
    resetSubject: "Redefina sua senha do Votxt",
    resetIntro: "Clique no botao abaixo para redefinir sua senha do Votxt:",
    resetExpiry: "Este link expira em 1 hora. Se voce nao solicitou isso, pode ignorar este e-mail.",
    resetButton: "Redefinir senha",
    greeting: (name) => `Ola ${name},`
  },
  ru: {
    verifySubject: "Подтвердите адрес электронной почты Votxt",
    verifyIntro: "Нажмите кнопку ниже, чтобы подтвердить адрес электронной почты Votxt:",
    verifyExpiry: "Срок действия этой ссылки истекает через 24 часа.",
    verifyButton: "Подтвердить почту",
    resetSubject: "Сбросьте пароль Votxt",
    resetIntro: "Нажмите кнопку ниже, чтобы сбросить пароль Votxt:",
    resetExpiry: "Срок действия этой ссылки истекает через 1 час. Если вы не запрашивали сброс, просто проигнорируйте это письмо.",
    resetButton: "Сбросить пароль",
    greeting: (name) => `Здравствуйте, ${name}!`
  },
  th: {
    verifySubject: "ยืนยันอีเมล Votxt ของคุณ",
    verifyIntro: "คลิกปุ่มด้านล่างเพื่อยืนยันอีเมล Votxt ของคุณ:",
    verifyExpiry: "ลิงก์นี้จะหมดอายุใน 24 ชั่วโมง",
    verifyButton: "ยืนยันอีเมล",
    resetSubject: "รีเซ็ตรหัสผ่าน Votxt ของคุณ",
    resetIntro: "คลิกปุ่มด้านล่างเพื่อรีเซ็ตรหัสผ่าน Votxt ของคุณ:",
    resetExpiry: "ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง หากคุณไม่ได้ร้องขอ สามารถเพิกเฉยต่ออีเมลนี้ได้",
    resetButton: "รีเซ็ตรหัสผ่าน",
    greeting: (name) => `สวัสดี ${name},`
  },
  tr: {
    verifySubject: "Votxt e-postanizi dogrulayin",
    verifyIntro: "Votxt e-postanizi dogrulamak icin asagidaki dugmeye tiklayin:",
    verifyExpiry: "Bu baglanti 24 saat icinde sona erer.",
    verifyButton: "E-postani dogrula",
    resetSubject: "Votxt sifrenizi sifirlayin",
    resetIntro: "Votxt sifrenizi sifirlamak icin asagidaki dugmeye tiklayin:",
    resetExpiry: "Bu baglanti 1 saat icinde sona erer. Bunu siz istemediyseniz bu e-postayi yok sayabilirsiniz.",
    resetButton: "Sifreyi sifirla",
    greeting: (name) => `Merhaba ${name},`
  },
  uk: {
    verifySubject: "Підтвердьте адресу електронної пошти Votxt",
    verifyIntro: "Натисніть кнопку нижче, щоб підтвердити адресу електронної пошти Votxt:",
    verifyExpiry: "Термін дії цього посилання закінчується через 24 години.",
    verifyButton: "Підтвердити пошту",
    resetSubject: "Скиньте пароль Votxt",
    resetIntro: "Натисніть кнопку нижче, щоб скинути пароль Votxt:",
    resetExpiry: "Термін дії цього посилання закінчується через 1 годину. Якщо ви не надсилали запит, проігноруйте цей лист.",
    resetButton: "Скинути пароль",
    greeting: (name) => `Вітаємо, ${name}!`
  },
  vi: {
    verifySubject: "Xac minh email Votxt cua ban",
    verifyIntro: "Nhap vao nut ben duoi de xac minh email Votxt cua ban:",
    verifyExpiry: "Lien ket nay het han sau 24 gio.",
    verifyButton: "Xac nhan email",
    resetSubject: "Dat lai mat khau Votxt cua ban",
    resetIntro: "Nhap vao nut ben duoi de dat lai mat khau Votxt cua ban:",
    resetExpiry: "Lien ket nay het han sau 1 gio. Neu ban khong yeu cau, ban co the bo qua email nay.",
    resetButton: "Dat lai mat khau",
    greeting: (name) => `Xin chao ${name},`
  },
  zh: {
    verifySubject: "验证你的 Votxt 邮箱",
    verifyIntro: "请点击下面的按钮完成 Votxt 邮箱验证：",
    verifyExpiry: "该链接 24 小时内有效。",
    verifyButton: "确认邮箱并登录",
    resetSubject: "重置你的 Votxt 密码",
    resetIntro: "请点击下面的按钮重置你的 Votxt 密码：",
    resetExpiry: "该链接 1 小时内有效。如果不是你本人操作，可以忽略这封邮件。",
    resetButton: "重置密码",
    greeting: (name) => `${name}，你好：`
  },
  "zh-TW": {
    verifySubject: "驗證你的 Votxt 信箱",
    verifyIntro: "請點擊下面的按鈕完成 Votxt 信箱驗證：",
    verifyExpiry: "此連結 24 小時內有效。",
    verifyButton: "確認信箱並登入",
    resetSubject: "重設你的 Votxt 密碼",
    resetIntro: "請點擊下面的按鈕重設你的 Votxt 密碼：",
    resetExpiry: "此連結 1 小時內有效。如果不是你本人操作，可以忽略這封郵件。",
    resetButton: "重設密碼",
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

function renderEmailHtml({
  greeting,
  intro,
  expiry,
  buttonLabel,
  url,
  preheader
}: {
  greeting: string;
  intro: string;
  expiry: string;
  buttonLabel: string;
  url: string;
  preheader: string;
}) {
  const escapedGreeting = escapeHtml(greeting);
  const escapedIntro = escapeHtml(intro);
  const escapedExpiry = escapeHtml(expiry);
  const escapedButton = escapeHtml(buttonLabel);
  const escapedUrl = escapeHtml(url);
  const escapedPreheader = escapeHtml(preheader);

  // 邮件客户端兼容性优先：table 布局 + 内联样式；不暴露原始链接，仅通过按钮跳转。
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>votxt</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f5fb; -webkit-font-smoothing:antialiased;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent; visibility:hidden;">${escapedPreheader}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5fb;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="width:480px; max-width:480px; background-color:#ffffff; border:1px solid #ececf3; border-radius:16px; overflow:hidden; font-family:'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;">
            <tr>
              <td style="padding:36px 40px 0 40px;">
                <span style="font-size:26px; font-weight:800; letter-spacing:-1px; color:#101820;">vo<span style="color:#6467f2;">txt</span></span>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 0 40px;">
                <h1 style="margin:0; font-size:20px; line-height:28px; font-weight:700; color:#101820;">${escapedGreeting}</h1>
                <p style="margin:14px 0 0 0; font-size:15px; line-height:24px; color:#4b5563;">${escapedIntro}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 0 40px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" bgcolor="#6467f2" style="border-radius:10px;">
                      <a href="${escapedUrl}" target="_blank" style="display:inline-block; padding:14px 32px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:10px; background-color:#6467f2;">${escapedButton}</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 36px 40px;">
                <p style="margin:0; font-size:13px; line-height:20px; color:#9096a3;">${escapedExpiry}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px; background-color:#fafafe; border-top:1px solid #f0f0f6;">
                <p style="margin:0; font-size:12px; line-height:18px; color:#a7abb6;">&copy; votxt &middot; Convert audio &amp; video to text</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildLocalizedEmail(copy: EmailLocaleCopy, name: string, url: string, subject: string, intro: string, expiry: string, buttonLabel: string) {
  const greeting = copy.greeting(name);

  return {
    subject,
    html: renderEmailHtml({greeting, intro, expiry, buttonLabel, url, preheader: intro}),
    text: `${greeting}\n\n${intro}\n\n${buttonLabel}: ${url}\n\n${expiry}`
  };
}

function buildEmailCopy(input: VerificationEmailInput) {
  const copy = emailCopy[normalizeEmailLocale(input.locale)];
  const name = input.name || input.to;
  return buildLocalizedEmail(copy, name, input.verificationUrl, copy.verifySubject, copy.verifyIntro, copy.verifyExpiry, copy.verifyButton);
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
  return buildLocalizedEmail(copy, name, input.resetUrl, copy.resetSubject, copy.resetIntro, copy.resetExpiry, copy.resetButton);
}

export async function sendPasswordResetEmail(input: PasswordResetEmailInput) {
  const copy = buildPasswordResetCopy(input);

  if (!isEmailConfigured()) {
    return {sent: false, resetUrl: input.resetUrl};
  }

  await dispatchEmail({to: input.to, subject: copy.subject, html: copy.html, text: copy.text}, "密码重置邮件发送失败");

  return {sent: true};
}
