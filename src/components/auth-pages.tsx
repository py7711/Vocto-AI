"use client";

import {useEffect, useMemo, useState} from "react";
import {useLocale} from "next-intl";
import Image from "next/image";
import {ArrowLeft, ArrowRight, Eye, EyeOff, Mail} from "lucide-react";

const authCopy = {
  zh: {
    signupTitle: "创建你的 UniScribe 账号",
    signinTitle: "登录 UniScribe",
    signupSubtitle: "注册后进入仪表盘，管理转写任务、额度和导出资产。",
    signinSubtitle: "使用邮箱继续访问你的转写仪表盘。",
    signupCta: "注册并进入仪表盘",
    signinCta: "登录并进入仪表盘",
    switchToSignin: "已有账号？登录",
    switchToSignup: "没有账号？免费注册",
    securityEyebrow: "个人安全工作区",
    securityPoints: ["短期上传签名，媒体文件直传对象存储。", "额度、任务队列、AI 洞察、翻译和导出统一进入仪表盘。", "认证架构支持 OAuth、邮箱验证和 Stripe 订阅。"],
    verifyTitle: "验证您的邮箱",
    verifyText: (email: string) => `我们已向 ${email} 发送验证邮件。请点击邮件中的链接验证账号。`,
    verifyPending: "正在验证邮箱...",
    verifyPendingText: "请稍候，我们正在确认你的邮箱验证链接。",
    verifySuccess: "邮箱验证成功",
    verifySuccessText: "你的账号已经完成邮箱验证，可以进入仪表盘继续使用。",
    verifyFailed: "邮箱验证失败",
    goDashboard: "进入仪表盘",
    openVerifyLink: "打开验证链接",
    devVerifyHint: "当前未配置邮件服务，下面的开发验证链接可用于本地或测试环境。",
    resend: "重新发送验证邮件",
    backToSignin: "返回登录",
    missingEmail: "未收到邮件？请检查您的垃圾邮件文件夹。",
    signupHeading: "注册",
    signinHeading: "登录 UniScribe",
    google: "使用 Google 继续",
    signupDivider: "或使用邮箱注册",
    signinDivider: "或使用邮箱登录",
    email: "邮箱",
    emailLabel: "邮箱：",
    edit: "编辑",
    firstName: "名字",
    firstNamePlaceholder: "名字",
    lastName: "姓",
    lastNamePlaceholder: "姓氏",
    password: "密码",
    passwordPlaceholder: "请输入您的密码",
    togglePassword: "切换密码可见性",
    continue: "继续",
    registering: "注册中...",
    loginBusy: "登录中...",
    submitSignup: "使用邮箱注册",
    back: "返回",
    already: "已有账户？",
    signinLink: "登录",
    forgotPassword: "忘记密码？",
    termsPrefix: "使用 UniScribe 即表示你同意我们的",
    terms: "服务条款",
    and: "和",
    privacy: "隐私政策",
    registerError: "注册失败。",
    loginError: "登录失败。"
  },
  en: {
    signupTitle: "Sign Up",
    signinTitle: "Sign In",
    signupSubtitle: "Create an account to manage transcription jobs, quota, and export assets.",
    signinSubtitle: "Continue with email to open your transcription dashboard.",
    signupCta: "Create account and open dashboard",
    signinCta: "Sign In with Email",
    switchToSignin: "Already have an account? Sign in",
    switchToSignup: "Don't have an account? Sign Up",
    securityEyebrow: "Secure personal workspace",
    securityPoints: ["Short-lived upload signatures send media directly to object storage.", "Quota, queues, AI insights, translation, and exports live in one dashboard.", "Email login, Google sign in, verification, and subscription billing are supported."],
    verifyTitle: "Verify your email",
    verifyText: (email: string) => `We sent a verification email to ${email}. Open the link in that email to verify your account.`,
    verifyPending: "Verifying email...",
    verifyPendingText: "Please wait while we confirm your verification link.",
    verifySuccess: "Email verified",
    verifySuccessText: "Your account email is verified. You can continue to the dashboard.",
    verifyFailed: "Email verification failed",
    goDashboard: "Open dashboard",
    openVerifyLink: "Open verification link",
    devVerifyHint: "Email delivery is not configured, so this development link is available for local or test environments.",
    resend: "Resend verification email",
    backToSignin: "Back to sign in",
    missingEmail: "No email yet? Check your spam folder.",
    signupHeading: "Sign up",
    signinHeading: "Sign In",
    google: "Continue with Google",
    signupDivider: "or sign up with email",
    signinDivider: "or sign in with email",
    email: "Email",
    emailLabel: "Email:",
    edit: "Edit",
    firstName: "First name",
    firstNamePlaceholder: "First name",
    lastName: "Last name",
    lastNamePlaceholder: "Last name",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    togglePassword: "Toggle password visibility",
    continue: "Continue",
    registering: "Creating account...",
    loginBusy: "Signing in...",
    submitSignup: "Sign Up with Email",
    back: "Back",
    already: "Already have an account?",
    signinLink: "Sign in",
    forgotPassword: "Forgot your password?",
    termsPrefix: "By using UniScribe, you agree to our",
    terms: "Terms of Service",
    and: "and",
    privacy: "Privacy Policy",
    registerError: "Registration failed.",
    loginError: "Login failed."
  },
  es: {
    signupTitle: "Crea tu cuenta de UniScribe",
    signinTitle: "Iniciar sesión en UniScribe",
    signupSubtitle: "Gestiona transcripciones, cuota y exportaciones desde el panel.",
    signinSubtitle: "Continúa con email para abrir tu panel de transcripción.",
    signupCta: "Crear cuenta y abrir panel",
    signinCta: "Entrar al panel",
    switchToSignin: "¿Ya tienes cuenta? Inicia sesión",
    switchToSignup: "¿Sin cuenta? Regístrate gratis",
    securityEyebrow: "Workspace personal seguro",
    securityPoints: ["Subidas firmadas de corta duración hacia almacenamiento de objetos.", "Cuotas, cola, IA, traducción y exportaciones en un solo panel.", "Arquitectura lista para OAuth, verificación de email, Stripe y pagos de suscripción."],
    verifyTitle: "Verifica tu email",
    verifyText: (email: string) => `Enviamos un email de verificación a ${email}. Abre el enlace para verificar tu cuenta.`,
    verifyPending: "Verificando email...",
    verifyPendingText: "Espera mientras confirmamos el enlace de verificación.",
    verifySuccess: "Email verificado",
    verifySuccessText: "Tu email ya está verificado. Puedes continuar al panel.",
    verifyFailed: "No se pudo verificar el email",
    goDashboard: "Abrir panel",
    openVerifyLink: "Abrir enlace de verificación",
    devVerifyHint: "El envío de email no está configurado; este enlace sirve para entorno local o pruebas.",
    resend: "Reenviar email",
    backToSignin: "Volver al login",
    missingEmail: "¿No llegó el email? Revisa spam.",
    signupHeading: "Registro",
    signinHeading: "Iniciar sesión en UniScribe",
    google: "Continuar con Google",
    signupDivider: "o regístrate con email",
    signinDivider: "o entra con email",
    email: "Email",
    emailLabel: "Email:",
    edit: "Editar",
    firstName: "Nombre",
    firstNamePlaceholder: "Nombre",
    lastName: "Apellido",
    lastNamePlaceholder: "Apellido",
    password: "Contraseña",
    passwordPlaceholder: "Introduce tu contraseña",
    togglePassword: "Cambiar visibilidad de contraseña",
    continue: "Continuar",
    registering: "Creando cuenta...",
    loginBusy: "Entrando...",
    submitSignup: "Registrarse con email",
    back: "Volver",
    already: "¿Ya tienes cuenta?",
    signinLink: "Iniciar sesión",
    forgotPassword: "¿Olvidaste tu contraseña?",
    termsPrefix: "Al usar UniScribe aceptas nuestros",
    terms: "Términos",
    and: "y",
    privacy: "Privacidad",
    registerError: "Error de registro.",
    loginError: "Error de inicio de sesión."
  },
  fr: {
    signupTitle: "Créez votre compte UniScribe",
    signinTitle: "Connexion à UniScribe",
    signupSubtitle: "Gérez transcriptions, quota et exports dans le tableau de bord.",
    signinSubtitle: "Continuez par email pour ouvrir votre tableau de bord.",
    signupCta: "Créer le compte et ouvrir le tableau",
    signinCta: "Se connecter au tableau",
    switchToSignin: "Déjà un compte ? Se connecter",
    switchToSignup: "Pas de compte ? Inscription gratuite",
    securityEyebrow: "Espace personnel sécurisé",
    securityPoints: ["Signatures d'upload courtes vers stockage objet.", "Quota, file, IA, traduction et exports dans un seul tableau.", "Architecture prête pour OAuth, email, Stripe et paiement d’abonnement."],
    verifyTitle: "Vérifiez votre email",
    verifyText: (email: string) => `Nous avons envoyé un email de vérification à ${email}. Ouvrez le lien pour valider le compte.`,
    verifyPending: "Vérification en cours...",
    verifyPendingText: "Merci de patienter pendant la validation du lien.",
    verifySuccess: "Email vérifié",
    verifySuccessText: "Votre email est vérifié. Vous pouvez continuer.",
    verifyFailed: "Échec de vérification",
    goDashboard: "Ouvrir le tableau",
    openVerifyLink: "Ouvrir le lien",
    devVerifyHint: "L'envoi d'email n'est pas configuré ; ce lien sert en local ou test.",
    resend: "Renvoyer l'email",
    backToSignin: "Retour connexion",
    missingEmail: "Pas d'email ? Vérifiez les spams.",
    signupHeading: "Inscription",
    signinHeading: "Connexion à UniScribe",
    google: "Continuer avec Google",
    signupDivider: "ou inscription par email",
    signinDivider: "ou connexion par email",
    email: "Email",
    emailLabel: "Email :",
    edit: "Modifier",
    firstName: "Prénom",
    firstNamePlaceholder: "Prénom",
    lastName: "Nom",
    lastNamePlaceholder: "Nom",
    password: "Mot de passe",
    passwordPlaceholder: "Saisissez votre mot de passe",
    togglePassword: "Afficher ou masquer le mot de passe",
    continue: "Continuer",
    registering: "Création...",
    loginBusy: "Connexion...",
    submitSignup: "S'inscrire par email",
    back: "Retour",
    already: "Déjà un compte ?",
    signinLink: "Connexion",
    forgotPassword: "Mot de passe oublié ?",
    termsPrefix: "En utilisant UniScribe, vous acceptez nos",
    terms: "Conditions",
    and: "et",
    privacy: "Confidentialité",
    registerError: "Échec de l'inscription.",
    loginError: "Échec de connexion."
  },
  de: {
    signupTitle: "Erstelle dein UniScribe-Konto",
    signinTitle: "Bei UniScribe anmelden",
    signupSubtitle: "Verwalte Transkriptionen, Kontingent und Exporte im Dashboard.",
    signinSubtitle: "Mit E-Mail fortfahren und Dashboard öffnen.",
    signupCta: "Konto erstellen und Dashboard öffnen",
    signinCta: "Anmelden und Dashboard öffnen",
    switchToSignin: "Schon ein Konto? Anmelden",
    switchToSignup: "Noch kein Konto? Kostenlos registrieren",
    securityEyebrow: "Sicherer persönlicher Arbeitsbereich",
    securityPoints: ["Kurzlebige Upload-Signaturen für Objektspeicher.", "Kontingent, Warteschlange, KI, Übersetzung und Exporte in einem Dashboard.", "Bereit für OAuth, E-Mail-Verifizierung und Stripe-Abrechnung."],
    verifyTitle: "E-Mail bestätigen",
    verifyText: (email: string) => `Wir haben eine Bestätigung an ${email} gesendet. Öffne den Link, um dein Konto zu bestätigen.`,
    verifyPending: "E-Mail wird bestätigt...",
    verifyPendingText: "Bitte warten, wir prüfen den Bestätigungslink.",
    verifySuccess: "E-Mail bestätigt",
    verifySuccessText: "Deine E-Mail ist bestätigt. Du kannst zum Dashboard wechseln.",
    verifyFailed: "E-Mail-Bestätigung fehlgeschlagen",
    goDashboard: "Dashboard öffnen",
    openVerifyLink: "Bestätigungslink öffnen",
    devVerifyHint: "E-Mail-Versand ist nicht konfiguriert; dieser Link ist für lokale Tests verfügbar.",
    resend: "E-Mail erneut senden",
    backToSignin: "Zur Anmeldung",
    missingEmail: "Keine E-Mail? Prüfe den Spam-Ordner.",
    signupHeading: "Registrieren",
    signinHeading: "Bei UniScribe anmelden",
    google: "Mit Google fortfahren",
    signupDivider: "oder mit E-Mail registrieren",
    signinDivider: "oder mit E-Mail anmelden",
    email: "E-Mail",
    emailLabel: "E-Mail:",
    edit: "Bearbeiten",
    firstName: "Vorname",
    firstNamePlaceholder: "Vorname",
    lastName: "Nachname",
    lastNamePlaceholder: "Nachname",
    password: "Passwort",
    passwordPlaceholder: "Passwort eingeben",
    togglePassword: "Passwortsichtbarkeit umschalten",
    continue: "Weiter",
    registering: "Konto wird erstellt...",
    loginBusy: "Anmeldung...",
    submitSignup: "Mit E-Mail registrieren",
    back: "Zurück",
    already: "Schon ein Konto?",
    signinLink: "Anmelden",
    forgotPassword: "Passwort vergessen?",
    termsPrefix: "Mit der Nutzung von UniScribe akzeptierst du unsere",
    terms: "Bedingungen",
    and: "und",
    privacy: "Datenschutz",
    registerError: "Registrierung fehlgeschlagen.",
    loginError: "Anmeldung fehlgeschlagen."
  },
  ja: {
    signupTitle: "UniScribe アカウントを作成",
    signinTitle: "UniScribe にログイン",
    signupSubtitle: "文字起こし、クォータ、書き出しをダッシュボードで管理します。",
    signinSubtitle: "メールで続行してダッシュボードを開きます。",
    signupCta: "アカウント作成して開く",
    signinCta: "ログインして開く",
    switchToSignin: "アカウントをお持ちですか？ログイン",
    switchToSignup: "アカウントなし？無料登録",
    securityEyebrow: "安全な個人ワークスペース",
    securityPoints: ["短期アップロード署名でオブジェクトストレージへ直接送信。", "クォータ、キュー、AI、翻訳、書き出しを1つの画面で管理。", "OAuth、メール検証、Stripe、サブスクリプション決済に対応できる認証基盤。"],
    verifyTitle: "メールを確認してください",
    verifyText: (email: string) => `${email} に確認メールを送信しました。リンクを開いて確認してください。`,
    verifyPending: "メール確認中...",
    verifyPendingText: "確認リンクを検証しています。",
    verifySuccess: "メール確認済み",
    verifySuccessText: "メール確認が完了しました。ダッシュボードへ進めます。",
    verifyFailed: "メール確認に失敗しました",
    goDashboard: "ダッシュボードを開く",
    openVerifyLink: "確認リンクを開く",
    devVerifyHint: "メール送信未設定のため、ローカル/テスト用リンクを表示しています。",
    resend: "確認メールを再送",
    backToSignin: "ログインへ戻る",
    missingEmail: "届かない場合は迷惑メールを確認してください。",
    signupHeading: "登録",
    signinHeading: "UniScribe にログイン",
    google: "Google で続行",
    signupDivider: "またはメールで登録",
    signinDivider: "またはメールでログイン",
    email: "メール",
    emailLabel: "メール:",
    edit: "編集",
    firstName: "名",
    firstNamePlaceholder: "名",
    lastName: "姓",
    lastNamePlaceholder: "姓",
    password: "パスワード",
    passwordPlaceholder: "パスワードを入力",
    togglePassword: "パスワード表示切替",
    continue: "続行",
    registering: "作成中...",
    loginBusy: "ログイン中...",
    submitSignup: "メールで登録",
    back: "戻る",
    already: "すでにアカウントがありますか？",
    signinLink: "ログイン",
    forgotPassword: "パスワードをお忘れですか？",
    termsPrefix: "UniScribe の利用により",
    terms: "利用規約",
    and: "と",
    privacy: "プライバシー",
    registerError: "登録に失敗しました。",
    loginError: "ログインに失敗しました。"
  },
  ko: {
    signupTitle: "UniScribe 계정 만들기",
    signinTitle: "UniScribe 로그인",
    signupSubtitle: "전사 작업, 할당량, 내보내기를 대시보드에서 관리하세요.",
    signinSubtitle: "이메일로 계속해서 전사 대시보드를 엽니다.",
    signupCta: "계정 만들고 대시보드 열기",
    signinCta: "로그인하고 대시보드 열기",
    switchToSignin: "이미 계정이 있나요? 로그인",
    switchToSignup: "계정이 없나요? 무료 가입",
    securityEyebrow: "안전한 개인 워크스페이스",
    securityPoints: ["짧은 업로드 서명으로 미디어를 객체 저장소에 직접 전송합니다.", "할당량, 큐, AI, 번역, 내보내기를 하나의 대시보드에서 관리합니다.", "OAuth, 이메일 인증, Stripe, 구독 결제를 위한 인증 구조입니다."],
    verifyTitle: "이메일 인증",
    verifyText: (email: string) => `${email}로 인증 메일을 보냈습니다. 링크를 열어 계정을 인증하세요.`,
    verifyPending: "이메일 인증 중...",
    verifyPendingText: "인증 링크를 확인하는 중입니다.",
    verifySuccess: "이메일 인증 완료",
    verifySuccessText: "이메일 인증이 완료되었습니다. 대시보드로 이동할 수 있습니다.",
    verifyFailed: "이메일 인증 실패",
    goDashboard: "대시보드 열기",
    openVerifyLink: "인증 링크 열기",
    devVerifyHint: "메일 서비스가 설정되지 않아 로컬/테스트용 링크가 표시됩니다.",
    resend: "인증 메일 다시 보내기",
    backToSignin: "로그인으로 돌아가기",
    missingEmail: "메일이 없나요? 스팸함을 확인하세요.",
    signupHeading: "가입",
    signinHeading: "UniScribe 로그인",
    google: "Google로 계속",
    signupDivider: "또는 이메일로 가입",
    signinDivider: "또는 이메일로 로그인",
    email: "이메일",
    emailLabel: "이메일:",
    edit: "수정",
    firstName: "이름",
    firstNamePlaceholder: "이름",
    lastName: "성",
    lastNamePlaceholder: "성",
    password: "비밀번호",
    passwordPlaceholder: "비밀번호 입력",
    togglePassword: "비밀번호 표시 전환",
    continue: "계속",
    registering: "계정 생성 중...",
    loginBusy: "로그인 중...",
    submitSignup: "이메일로 가입",
    back: "뒤로",
    already: "이미 계정이 있나요?",
    signinLink: "로그인",
    forgotPassword: "비밀번호를 잊으셨나요?",
    termsPrefix: "UniScribe를 사용하면",
    terms: "서비스 약관",
    and: "및",
    privacy: "개인정보 처리방침",
    registerError: "가입 실패.",
    loginError: "로그인 실패."
  },
  pt: {
    signupTitle: "Crie sua conta UniScribe",
    signinTitle: "Entrar no UniScribe",
    signupSubtitle: "Gerencie transcrições, cota e exportações no painel.",
    signinSubtitle: "Continue com email para abrir seu painel de transcrição.",
    signupCta: "Criar conta e abrir painel",
    signinCta: "Entrar e abrir painel",
    switchToSignin: "Já tem conta? Entrar",
    switchToSignup: "Sem conta? Cadastre-se grátis",
    securityEyebrow: "Workspace pessoal seguro",
    securityPoints: ["Assinaturas curtas enviam mídia direto ao armazenamento.", "Cotas, fila, IA, tradução e exportações em um painel.", "Login por email, Google, verificação e cobrança de assinatura são compatíveis."],
    verifyTitle: "Verifique seu email",
    verifyText: (email: string) => `Enviamos um email de verificação para ${email}. Abra o link para verificar sua conta.`,
    verifyPending: "Verificando email...",
    verifyPendingText: "Aguarde enquanto confirmamos o link.",
    verifySuccess: "Email verificado",
    verifySuccessText: "Seu email foi verificado. Você pode continuar ao painel.",
    verifyFailed: "Falha na verificação",
    goDashboard: "Abrir painel",
    openVerifyLink: "Abrir link de verificação",
    devVerifyHint: "O envio de email não está configurado; este link serve para local ou teste.",
    resend: "Reenviar email",
    backToSignin: "Voltar ao login",
    missingEmail: "Não chegou? Verifique spam.",
    signupHeading: "Cadastro",
    signinHeading: "Entrar no UniScribe",
    google: "Continuar com Google",
    signupDivider: "ou cadastre-se com email",
    signinDivider: "ou entre com email",
    email: "Email",
    emailLabel: "Email:",
    edit: "Editar",
    firstName: "Nome",
    firstNamePlaceholder: "Nome",
    lastName: "Sobrenome",
    lastNamePlaceholder: "Sobrenome",
    password: "Senha",
    passwordPlaceholder: "Digite sua senha",
    togglePassword: "Alternar visibilidade da senha",
    continue: "Continuar",
    registering: "Criando conta...",
    loginBusy: "Entrando...",
    submitSignup: "Cadastrar com email",
    back: "Voltar",
    already: "Já tem conta?",
    signinLink: "Entrar",
    forgotPassword: "Esqueceu sua senha?",
    termsPrefix: "Ao usar UniScribe, você aceita nossos",
    terms: "Termos",
    and: "e",
    privacy: "Privacidade",
    registerError: "Falha no cadastro.",
    loginError: "Falha no login."
  }
} as const;

function getAuthCopy(locale: string) {
  return authCopy[locale as keyof typeof authCopy] ?? authCopy.en;
}

const forgotCopy = {
  zh: {
    title: "重置密码",
    subtitle: "输入你的账号邮箱，我们会发送重置密码链接。",
    email: "邮箱",
    placeholder: "请输入你的邮箱",
    cta: "发送重置链接",
    sending: "发送中...",
    sent: "如果该邮箱已注册，你将收到一封重置密码邮件。",
    back: "返回登录",
    termsPrefix: "使用 UniScribe 即表示你同意我们的",
    terms: "服务条款",
    and: "和",
    privacy: "隐私政策",
    devResetHint: "当前未配置邮件服务，下面的开发重置链接可用于本地或测试环境。",
    openResetLink: "打开重置链接",
    resetTitle: "设置新密码",
    resetSubtitle: "输入新的 UniScribe 密码。",
    confirmPassword: "确认密码",
    resetCta: "更新密码",
    resetting: "更新中...",
    resetSuccess: "密码已更新。你可以继续进入仪表盘。",
    resetInvalid: "重置链接无效或已过期。",
    mismatch: "两次输入的密码不一致。"
  },
  en: {
    title: "Forgot Password",
    subtitle: "Enter your email to reset your password",
    email: "Email",
    placeholder: "Enter your email",
    cta: "Send Reset Link",
    sending: "Sending...",
    sent: "If that email is registered, you will receive a password reset email.",
    back: "Back to Sign In",
    termsPrefix: "By using UniScribe, you agree to our",
    terms: "Terms of Service",
    and: "and",
    privacy: "Privacy Policy",
    devResetHint: "Email delivery is not configured, so this development reset link is available for local or test environments.",
    openResetLink: "Open reset link",
    resetTitle: "Set a new password",
    resetSubtitle: "Enter a new password for your UniScribe account.",
    confirmPassword: "Confirm password",
    resetCta: "Update password",
    resetting: "Updating...",
    resetSuccess: "Your password has been updated. You can continue to the dashboard.",
    resetInvalid: "This reset link is invalid or expired.",
    mismatch: "Passwords do not match."
  },
  es: {
    title: "Restablecer contraseña",
    subtitle: "Introduce tu email y te enviaremos un enlace para restablecerla.",
    email: "Email",
    placeholder: "Introduce tu email",
    cta: "Enviar enlace",
    sending: "Enviando...",
    sent: "Si ese email está registrado, recibirás un enlace de restablecimiento.",
    back: "Volver al inicio de sesión",
    termsPrefix: "Al usar UniScribe aceptas nuestros",
    terms: "Términos",
    and: "y",
    privacy: "Privacidad",
    devResetHint: "El envío de email no está configurado; este enlace de restablecimiento sirve para local o pruebas.",
    openResetLink: "Abrir enlace",
    resetTitle: "Define una nueva contraseña",
    resetSubtitle: "Introduce una nueva contraseña para UniScribe.",
    confirmPassword: "Confirmar contraseña",
    resetCta: "Actualizar contraseña",
    resetting: "Actualizando...",
    resetSuccess: "Tu contraseña se actualizó. Puedes continuar al panel.",
    resetInvalid: "El enlace no es válido o expiró.",
    mismatch: "Las contraseñas no coinciden."
  },
  fr: {
    title: "Réinitialiser le mot de passe",
    subtitle: "Saisissez votre email et nous vous enverrons un lien de réinitialisation.",
    email: "Email",
    placeholder: "Saisissez votre email",
    cta: "Envoyer le lien",
    sending: "Envoi...",
    sent: "Si cet email est inscrit, vous recevrez un lien de réinitialisation.",
    back: "Retour connexion",
    termsPrefix: "En utilisant UniScribe, vous acceptez nos",
    terms: "Conditions",
    and: "et",
    privacy: "Confidentialité",
    devResetHint: "L'envoi d'email n'est pas configuré ; ce lien de réinitialisation sert en local ou test.",
    openResetLink: "Ouvrir le lien",
    resetTitle: "Définir un nouveau mot de passe",
    resetSubtitle: "Saisissez un nouveau mot de passe UniScribe.",
    confirmPassword: "Confirmer le mot de passe",
    resetCta: "Mettre à jour",
    resetting: "Mise à jour...",
    resetSuccess: "Votre mot de passe est mis à jour. Vous pouvez continuer.",
    resetInvalid: "Ce lien est invalide ou expiré.",
    mismatch: "Les mots de passe ne correspondent pas."
  },
  de: {
    title: "Passwort zurücksetzen",
    subtitle: "Gib deine E-Mail ein und wir senden dir einen Link zum Zurücksetzen.",
    email: "E-Mail",
    placeholder: "E-Mail eingeben",
    cta: "Link senden",
    sending: "Senden...",
    sent: "Falls diese E-Mail registriert ist, erhältst du einen Link.",
    back: "Zur Anmeldung",
    termsPrefix: "Mit UniScribe akzeptierst du unsere",
    terms: "Nutzungsbedingungen",
    and: "und",
    privacy: "Datenschutzrichtlinie",
    devResetHint: "E-Mail-Versand ist nicht konfiguriert; dieser Reset-Link ist für lokale Tests verfügbar.",
    openResetLink: "Reset-Link öffnen",
    resetTitle: "Neues Passwort festlegen",
    resetSubtitle: "Gib ein neues UniScribe-Passwort ein.",
    confirmPassword: "Passwort bestätigen",
    resetCta: "Passwort aktualisieren",
    resetting: "Aktualisieren...",
    resetSuccess: "Dein Passwort wurde aktualisiert. Du kannst fortfahren.",
    resetInvalid: "Dieser Link ist ungültig oder abgelaufen.",
    mismatch: "Passwörter stimmen nicht überein."
  },
  ja: {
    title: "パスワードをリセット",
    subtitle: "アカウントのメールアドレスにリセットリンクを送信します。",
    email: "メール",
    placeholder: "メールアドレスを入力",
    cta: "リセットリンクを送信",
    sending: "送信中...",
    sent: "登録済みの場合、リセット用メールが届きます。",
    back: "ログインへ戻る",
    termsPrefix: "UniScribe の利用により",
    terms: "利用規約",
    and: "と",
    privacy: "プライバシーポリシー",
    devResetHint: "メール配信が未設定のため、ローカル/テスト用リンクを表示しています。",
    openResetLink: "リセットリンクを開く",
    resetTitle: "新しいパスワードを設定",
    resetSubtitle: "UniScribe の新しいパスワードを入力してください。",
    confirmPassword: "パスワード確認",
    resetCta: "パスワード更新",
    resetting: "更新中...",
    resetSuccess: "パスワードが更新されました。続行できます。",
    resetInvalid: "リンクが無効または期限切れです。",
    mismatch: "パスワードが一致しません。"
  },
  ko: {
    title: "비밀번호 재설정",
    subtitle: "계정 이메일로 비밀번호 재설정 링크를 보내드립니다.",
    email: "이메일",
    placeholder: "이메일 입력",
    cta: "재설정 링크 보내기",
    sending: "전송 중...",
    sent: "등록된 이메일이면 재설정 메일을 받게 됩니다.",
    back: "로그인으로 돌아가기",
    termsPrefix: "UniScribe를 사용하면",
    terms: "서비스 약관",
    and: "및",
    privacy: "개인정보 처리방침",
    devResetHint: "이메일 전송이 설정되지 않아 로컬/테스트용 재설정 링크를 표시합니다.",
    openResetLink: "재설정 링크 열기",
    resetTitle: "새 비밀번호 설정",
    resetSubtitle: "UniScribe 새 비밀번호를 입력하세요.",
    confirmPassword: "비밀번호 확인",
    resetCta: "비밀번호 업데이트",
    resetting: "업데이트 중...",
    resetSuccess: "비밀번호가 업데이트되었습니다. 계속 진행할 수 있습니다.",
    resetInvalid: "링크가 잘못되었거나 만료되었습니다.",
    mismatch: "비밀번호가 일치하지 않습니다."
  },
  pt: {
    title: "Redefinir senha",
    subtitle: "Informe seu email e enviaremos um link de redefinição.",
    email: "Email",
    placeholder: "Digite seu email",
    cta: "Enviar link",
    sending: "Enviando...",
    sent: "Se esse email estiver cadastrado, você receberá um link.",
    back: "Voltar ao login",
    termsPrefix: "Ao usar UniScribe você aceita nossos",
    terms: "Termos",
    and: "e",
    privacy: "Privacidade",
    devResetHint: "O envio de email não está configurado; este link serve para ambiente local ou testes.",
    openResetLink: "Abrir link",
    resetTitle: "Definir nova senha",
    resetSubtitle: "Digite uma nova senha para UniScribe.",
    confirmPassword: "Confirmar senha",
    resetCta: "Atualizar senha",
    resetting: "Atualizando...",
    resetSuccess: "Sua senha foi atualizada. Você pode continuar.",
    resetInvalid: "Este link é inválido ou expirou.",
    mismatch: "As senhas não coincidem."
  }
} as const;

function getForgotCopy(locale: string) {
  return forgotCopy[locale as keyof typeof forgotCopy] ?? forgotCopy.en;
}

async function createPasswordCredential(password: string) {
  const bytes = new TextEncoder().encode(`uniscribe-password-v1:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `sha256:${hash}`;
}

export function AuthPage({mode}: {mode: "signin" | "signup"}) {
  const locale = useLocale();
  const text = getAuthCopy(locale);
  const [showPassword, setShowPassword] = useState(false);
  const [signupStep, setSignupStep] = useState<"email" | "profile" | "verify">("email");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [nextPath, setNextPath] = useState<string | null>(null);
  const isSignup = mode === "signup";

  useEffect(() => {
    const requestedNext = new URLSearchParams(window.location.search).get("next");
    if (requestedNext?.startsWith("/") && !requestedNext.startsWith("//")) {
      setNextPath(requestedNext);
    }
  }, []);

  const copy = useMemo(
    () => ({
      title: isSignup ? text.signupTitle : text.signinTitle,
      subtitle: isSignup ? text.signupSubtitle : text.signinSubtitle,
      cta: isSignup ? text.signupCta : text.signinCta,
      switchText: isSignup ? text.switchToSignin : text.switchToSignup,
      switchHref: `/${locale}/auth/${isSignup ? "signin" : "signup"}`
    }),
    [isSignup, locale, text]
  );

  return (
    <main className="min-h-screen bg-lavender px-4 py-10 md:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-64px)] max-w-md content-center">
        <div className="animate-fade-up rounded-xl border border-ink/10 bg-white px-6 py-8 shadow-lifted md:px-10 md:py-10">
          <div className="mb-8 flex justify-center">
            <Image src="/uniscribe-logo.svg" alt="UniScribe" width={172} height={42} priority />
          </div>
          {isSignup ? (
            <SignupCard
              locale={locale}
              email={email}
              setEmail={setEmail}
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              password={password}
              setPassword={setPassword}
              step={signupStep}
              setStep={setSignupStep}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              busy={busy}
              setBusy={setBusy}
              error={error}
              setError={setError}
              text={text}
              verificationUrl={verificationUrl}
              setVerificationUrl={setVerificationUrl}
            />
          ) : (
            <SigninCard
              locale={locale}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              copy={copy}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              busy={busy}
              setBusy={setBusy}
              error={error}
              setError={setError}
              text={text}
              nextPath={nextPath}
            />
          )}
        </div>
      </section>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v2.96h3.88c2.27-2.09 3.54-5.18 3.54-8.83Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.88-2.96c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.05A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.33A7.22 7.22 0 0 1 4.9 12c0-.81.13-1.6.37-2.33V6.62H1.26A12 12 0 0 0 0 12c0 1.94.46 3.77 1.26 5.38l4.01-3.05Z" />
      <path fill="#EA4335" d="M12 4.71c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.13 15.23 0 12 0A12 12 0 0 0 1.26 6.62l4.01 3.05C6.22 6.82 8.87 4.71 12 4.71Z" />
    </svg>
  );
}

function Divider({label}: {label: string}) {
  return (
    <div className="my-5 flex items-center gap-4 text-sm font-bold text-ink/45">
      <span className="h-px flex-1 bg-ink/12" />
      {label}
      <span className="h-px flex-1 bg-ink/12" />
    </div>
  );
}

function GoogleButton({locale, label, nextPath}: {locale: string; label: string; nextPath?: string | null}) {
  const nextParam = nextPath ? `&next=${encodeURIComponent(nextPath)}` : "";
  return (
    <a href={`/api/auth/google/start?locale=${locale}${nextParam}`} className="focus-ring mt-6 flex min-h-[56px] w-full items-center justify-center gap-5 rounded-lg border border-ink/15 bg-white px-6 py-3 text-lg font-black text-ink transition hover:border-violet/30 hover:bg-lavender/35">
      <GoogleMark />
      {label}
    </a>
  );
}

function SignupCard({
  locale,
  email,
  setEmail,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  password,
  setPassword,
  step,
  setStep,
  showPassword,
  setShowPassword,
  busy,
  setBusy,
  error,
  setError,
  text,
  verificationUrl,
  setVerificationUrl
}: {
  locale: string;
  email: string;
  setEmail: (value: string) => void;
  firstName: string;
  setFirstName: (value: string) => void;
  lastName: string;
  setLastName: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  step: "email" | "profile" | "verify";
  setStep: (value: "email" | "profile" | "verify") => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  busy: boolean;
  setBusy: (value: boolean) => void;
  error: string | null;
  setError: (value: string | null) => void;
  text: ReturnType<typeof getAuthCopy>;
  verificationUrl: string | null;
  setVerificationUrl: (value: string | null) => void;
}) {
  async function submitRegister() {
    setBusy(true);
    setError(null);
    try {
      const passwordCredential = await createPasswordCredential(password);
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, firstName, lastName, passwordCredential, locale})
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? text.registerError);
      setVerificationUrl(data.verificationUrl ?? null);
      setStep("verify");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  if (step === "verify") {
    return (
      <div className="text-center">
        <Mail className="mx-auto text-violet" size={58} />
        <h2 className="mt-8 text-3xl font-black text-ink">{text.verifyTitle}</h2>
        <p className="mx-auto mt-4 max-w-sm text-base leading-7 text-ink/58">{text.verifyText(email)}</p>
        <a href={`/${locale}/dashboard`} className="focus-ring mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-violet px-5 py-4 text-lg font-black text-white shadow-soft transition hover:bg-violetDark">
          {text.goDashboard}
        </a>
        {verificationUrl ? (
          <div className="mt-5 rounded-lg border border-violet/20 bg-violet/5 p-4 text-left">
            <p className="text-sm font-bold leading-6 text-ink/65">{text.devVerifyHint}</p>
            <a href={verificationUrl} className="mt-3 inline-flex break-all text-sm font-black text-violet">{text.openVerifyLink}</a>
          </div>
        ) : null}
        <a href={`/${locale}/auth/signin`} className="focus-ring mt-0 flex w-full items-center justify-center gap-2 rounded-lg border border-ink/15 px-5 py-4 text-lg font-black text-violet">
          <ArrowLeft size={19} />
          {text.backToSignin}
        </a>
        <p className="mt-8 text-sm font-bold text-ink/50">{text.missingEmail}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-center text-3xl font-black text-ink">{text.signupHeading}</h1>
      <GoogleButton locale={locale} label={text.google} />
      <Divider label={text.signupDivider} />
      {step === "email" ? (
        <>
          <label className="block">
            <span className="mb-2 block text-sm font-black">{text.email}</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="focus-ring w-full rounded-md border border-ink/15 px-4 py-3 text-base"
              placeholder="Enter your email"
            />
          </label>
          <button type="button" onClick={() => setStep("profile")} disabled={!email.includes("@")} className="focus-ring mt-6 w-full rounded-md bg-violet px-5 py-3 text-base font-black text-white shadow-soft transition hover:bg-violetDark disabled:opacity-45">
            {text.continue}
          </button>
        </>
      ) : (
        <>
          <div className="mb-6 rounded-lg bg-ink/[0.03] p-4 ring-1 ring-ink/5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-ink/50">{text.emailLabel}</p>
                <p className="break-words text-lg font-black">{email}</p>
              </div>
              <button type="button" onClick={() => setStep("email")} className="font-black text-violet">{text.edit}</button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-base font-black">{text.firstName}</span>
              <input value={firstName} onChange={(event) => setFirstName(event.target.value)} className="focus-ring w-full rounded-lg border border-ink/15 px-4 py-4 text-lg" placeholder={text.firstNamePlaceholder} />
            </label>
            <label>
              <span className="mb-2 block text-base font-black">{text.lastName}</span>
              <input value={lastName} onChange={(event) => setLastName(event.target.value)} className="focus-ring w-full rounded-lg border border-ink/15 px-4 py-4 text-lg" placeholder={text.lastNamePlaceholder} />
            </label>
          </div>
          <label className="mt-5 block">
            <span className="mb-2 block text-base font-black">{text.password}</span>
            <div className="flex rounded-lg border border-ink/15">
              <input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} className="focus-ring min-w-0 flex-1 px-4 py-4 text-lg outline-none" placeholder={text.passwordPlaceholder} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus-ring px-4" aria-label={text.togglePassword}>
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </label>
          {error ? <p className="mt-4 animate-fade-in rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm font-bold text-coral">{error}</p> : null}
          <button type="button" onClick={submitRegister} disabled={busy || password.length < 8} className="focus-ring mt-6 w-full rounded-lg bg-violet px-5 py-4 text-lg font-black text-white shadow-soft transition hover:bg-violetDark disabled:opacity-45">
            {busy ? text.registering : text.submitSignup}
          </button>
          <button type="button" onClick={() => setStep("email")} className="mx-auto mt-6 block text-lg font-black text-ink/55">{text.back}</button>
        </>
      )}
      <p className="mt-6 text-center text-sm text-ink/55">{text.already} <a className="font-black text-violet" href={`/${locale}/auth/signin`}>{text.signinLink}</a></p>
      <p className="mx-auto mt-6 max-w-sm text-center text-xs leading-5 text-ink/55">{text.termsPrefix} <a className="font-bold text-violet" href={`/${locale}/terms-of-service`}>{text.terms}</a> {text.and} <a className="font-bold text-violet" href={`/${locale}/privacy-policy`}>{text.privacy}</a>.</p>
    </div>
  );
}

export function VerifyEmailPage() {
  const locale = useLocale();
  const text = getAuthCopy(locale);
  const [status, setStatus] = useState<"pending" | "success" | "failed">("pending");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setStatus("failed");
      setMessage(text.verifyFailed);
      return;
    }

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({token, locale})
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error ?? text.verifyFailed);
        setStatus("success");
      })
      .catch((cause) => {
        setStatus("failed");
        setMessage(cause instanceof Error ? cause.message : String(cause));
      });
  }, [locale, text]);

  return (
    <main className="min-h-screen bg-lavender px-4 py-10 md:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-64px)] max-w-xl content-center">
        <div className="animate-fade-up rounded-xl border border-ink/10 bg-white p-8 text-center shadow-lifted md:p-12">
          <div className="mb-12 flex justify-center">
            <Image src="/uniscribe-logo.svg" alt="UniScribe" width={190} height={52} priority />
          </div>
          <Mail className="mx-auto text-violet" size={68} />
          <h1 className="mt-8 text-3xl font-black text-ink">
            {status === "pending" ? text.verifyPending : status === "success" ? text.verifySuccess : text.verifyFailed}
          </h1>
          <p className="mt-4 text-base leading-7 text-ink/60">{status === "success" ? text.verifySuccessText : status === "pending" ? text.verifyPendingText : message}</p>
          <a href={`/${locale}/dashboard`} className="focus-ring mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-violet px-5 py-4 text-lg font-black text-white shadow-soft transition hover:bg-violetDark">
            {text.signinCta}
            <ArrowRight size={18} />
          </a>
        </div>
      </section>
    </main>
  );
}

export function ForgotPasswordPage() {
  const locale = useLocale();
  const text = getForgotCopy(locale);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, locale})
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? text.sent);
      setResetUrl(data.resetUrl ?? null);
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-lavender px-4 py-10 md:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-64px)] max-w-md content-center">
        <div className="animate-fade-up rounded-xl border border-ink/10 bg-white px-6 py-8 shadow-lifted md:px-10 md:py-10">
          <div className="mb-8 flex justify-center">
            <Image src="/uniscribe-logo.svg" alt="UniScribe" width={172} height={42} priority />
          </div>
          <form onSubmit={submit}>
            <h1 className="text-center text-3xl font-black text-ink">{text.title}</h1>
            <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-6 text-ink/58">{text.subtitle}</p>
            <label className="mt-6 block">
              <span className="mb-2 block text-sm font-black">{text.email}</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="focus-ring w-full rounded-md border border-ink/15 px-4 py-3 text-base" placeholder={text.placeholder} required />
            </label>
            {sent ? <p className="mt-4 rounded-lg border border-violet/20 bg-violet/10 px-3 py-2 text-sm font-bold leading-6 text-violet">{text.sent}</p> : null}
            {resetUrl ? (
              <div className="mt-4 rounded-lg border border-violet/20 bg-violet/5 p-4">
                <p className="text-sm font-bold leading-6 text-ink/65">{text.devResetHint}</p>
                <a href={resetUrl} className="mt-3 inline-flex break-all text-sm font-black text-violet">{text.openResetLink}</a>
              </div>
            ) : null}
            {error ? <p className="mt-4 rounded-lg border border-coral/25 bg-coral/10 px-3 py-2 text-sm font-bold text-coral">{error}</p> : null}
            <button disabled={busy || !email.includes("@")} className="focus-ring mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-violet px-5 py-3 text-base font-black text-white shadow-soft transition hover:bg-violetDark disabled:opacity-45">
              {busy ? text.sending : text.cta}
              <ArrowRight size={18} />
            </button>
            <a className="mt-4 flex items-center justify-center gap-2 text-sm font-black text-violet" href={`/${locale}/auth/signin`}>
              <ArrowLeft size={16} />
              {text.back}
            </a>
            <p className="mx-auto mt-6 max-w-sm text-center text-xs leading-5 text-ink/55">{text.termsPrefix} <a className="font-bold text-violet" href={`/${locale}/terms-of-service`}>{text.terms}</a> {text.and} <a className="font-bold text-violet" href={`/${locale}/privacy-policy`}>{text.privacy}</a>.</p>
          </form>
        </div>
      </section>
    </main>
  );
}

export function ResetPasswordPage() {
  const locale = useLocale();
  const text = getForgotCopy(locale);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "failed">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setStatus("failed");
      setMessage(text.resetInvalid);
      return;
    }
    if (password !== confirmPassword) {
      setStatus("failed");
      setMessage(text.mismatch);
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({token, password, locale})
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? text.resetInvalid);
      setStatus("success");
      setMessage(text.resetSuccess);
    } catch (cause) {
      setStatus("failed");
      setMessage(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-lavender px-4 py-10 md:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-64px)] max-w-md content-center">
        <div className="animate-fade-up rounded-xl border border-ink/10 bg-white px-6 py-8 shadow-lifted md:px-10 md:py-10">
          <div className="mb-8 flex justify-center">
            <Image src="/uniscribe-logo.svg" alt="UniScribe" width={172} height={42} priority />
          </div>
          <form onSubmit={submit}>
            <h1 className="text-center text-3xl font-black text-ink">{text.resetTitle}</h1>
            <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-6 text-ink/58">{text.resetSubtitle}</p>
            <label className="mt-6 block">
              <span className="mb-2 block text-sm font-black">{text.resetTitle}</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="focus-ring w-full rounded-md border border-ink/15 px-4 py-3 text-base" placeholder="New password" required />
            </label>
            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-black">{text.confirmPassword}</span>
              <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="focus-ring w-full rounded-md border border-ink/15 px-4 py-3 text-base" placeholder={text.confirmPassword} required />
            </label>
            {message ? <p className={status === "success" ? "mt-4 rounded-lg border border-violet/20 bg-violet/10 px-3 py-2 text-sm font-bold leading-6 text-violet" : "mt-4 rounded-lg border border-coral/25 bg-coral/10 px-3 py-2 text-sm font-bold text-coral"}>{message}</p> : null}
            {status === "success" ? (
              <a href={`/${locale}/dashboard`} className="focus-ring mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-violet px-5 py-3 text-base font-black text-white shadow-soft transition hover:bg-violetDark">
                {getAuthCopy(locale).goDashboard}
                <ArrowRight size={18} />
              </a>
            ) : (
              <button disabled={busy || password.length < 8 || confirmPassword.length < 8} className="focus-ring mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-violet px-5 py-3 text-base font-black text-white shadow-soft transition hover:bg-violetDark disabled:opacity-45">
                {busy ? text.resetting : text.resetCta}
                <ArrowRight size={18} />
              </button>
            )}
            <a className="mt-4 flex items-center justify-center gap-2 text-sm font-black text-violet" href={`/${locale}/auth/signin`}>
              <ArrowLeft size={16} />
              {text.back}
            </a>
          </form>
        </div>
      </section>
    </main>
  );
}

function SigninCard({
  locale,
  showPassword,
  setShowPassword,
  copy,
  email,
  setEmail,
  password,
  setPassword,
  busy,
  setBusy,
  error,
  setError,
  text,
  nextPath
}: {
  locale: string;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  copy: {title: string; cta: string; switchText: string; switchHref: string};
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  busy: boolean;
  setBusy: (value: boolean) => void;
  error: string | null;
  setError: (value: string | null) => void;
  text: ReturnType<typeof getAuthCopy>;
  nextPath: string | null;
}) {
  const trimmedEmail = email.trim();
  const canSubmit = Boolean(trimmedEmail && password.trim());

  async function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!canSubmit) return;

    setBusy(true);
    try {
      const passwordCredential = await createPasswordCredential(password);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email: trimmedEmail, passwordCredential, locale})
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? text.loginError);
      window.location.href = nextPath ?? `/${locale}/dashboard`;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submitLogin}>
      <h1 className="text-center text-3xl font-black text-ink">{copy.title}</h1>
      <GoogleButton locale={locale} label={text.google} nextPath={nextPath} />
      <Divider label={text.signinDivider} />
      <label className="block">
        <span className="mb-2 block text-sm font-black">{text.email}</span>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="focus-ring w-full rounded-md border border-ink/15 px-4 py-3 text-base" placeholder="Enter your email" autoComplete="email" required />
      </label>
      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-black">{text.password}</span>
        <div className="flex rounded-md border border-ink/15">
          <input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className="focus-ring min-w-0 flex-1 px-4 py-3 text-base outline-none" placeholder={text.passwordPlaceholder} autoComplete="current-password" required />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus-ring px-4" aria-label={text.togglePassword}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </label>
      {error ? <p className="mt-4 animate-fade-in rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm font-bold text-coral">{error}</p> : null}
      <button disabled={busy || !canSubmit} className="focus-ring mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-violet px-5 py-3 text-base font-black text-white shadow-soft transition hover:bg-violetDark disabled:cursor-not-allowed disabled:opacity-45">
        {busy ? text.loginBusy : copy.cta}
        <ArrowRight size={18} />
      </button>
      <a className="mt-4 block text-center text-sm font-black text-violet" href={`/${locale}/auth/forgot-password`}>{text.forgotPassword}</a>
      <p className="mt-5 text-center text-sm text-ink/55">
        <a className="font-black text-violet" href={copy.switchHref}>{copy.switchText}</a>
      </p>
      <p className="mx-auto mt-6 max-w-sm text-center text-xs leading-5 text-ink/55">{text.termsPrefix} <a className="font-bold text-violet" href={`/${locale}/terms-of-service`}>{text.terms}</a> {text.and} <a className="font-bold text-violet" href={`/${locale}/privacy-policy`}>{text.privacy}</a>.</p>
    </form>
  );
}
