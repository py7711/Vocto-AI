"use client";

import {useEffect, useMemo, useState} from "react";
import {useLocale} from "next-intl";
import {ArrowLeft, ArrowRight, Eye, EyeOff, Mail} from "lucide-react";
import {BrandLogo} from "@/components/brand-logo";
import {getWorkspaceCopy} from "@/components/workspace/copy";
import {WorkspaceLanguageSwitcher} from "@/components/workspace/sidebar";
import {isLocale} from "@/lib/locales";

const authCopy = {
  zh: {
    signupTitle: "创建你的 Votxt 账号",
    signinTitle: "登录 Votxt",
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
    verifyResent: "验证邮件已发送，请检查你的收件箱。",
    verifyAlreadyDone: "你的邮箱已经完成验证，可以进入仪表盘继续使用。",
    goDashboard: "进入仪表盘",
    openVerifyLink: "打开验证链接",
    devVerifyHint: "当前未配置邮件服务，下面的开发验证链接可用于本地或测试环境。",
    resend: "重新发送验证邮件",
    backToSignin: "返回登录",
    missingEmail: "未收到邮件？请检查您的垃圾邮件文件夹。",
    signupHeading: "注册",
    signinHeading: "登录 Votxt",
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
    termsPrefix: "使用 Votxt 即表示你同意我们的",
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
    verifyResent: "Verification email sent. Please check your inbox.",
    verifyAlreadyDone: "Your email is already verified. You can continue to the dashboard.",
    goDashboard: "Open dashboard",
    openVerifyLink: "Open verification link",
    devVerifyHint: "Email delivery is not configured, so this development link is available for local or test environments.",
    resend: "Resend verification email",
    backToSignin: "Back to Sign In",
    missingEmail: "Didn't receive the email? Please check your spam folder.",
    signupHeading: "Sign up",
    signinHeading: "Sign In",
    google: "Continue with Google",
    signupDivider: "Or sign up with email",
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
    signinLink: "Sign In",
    forgotPassword: "Forgot your password?",
    termsPrefix: "By using Votxt, you agree to our",
    terms: "Terms of Service",
    and: "and",
    privacy: "Privacy Policy",
    registerError: "Registration failed.",
    loginError: "Login failed."
  },
  es: {
    signupTitle: "Crea tu cuenta de Votxt",
    signinTitle: "Iniciar sesión en Votxt",
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
    verifyResent: "Email de verificación enviado. Revisa tu bandeja de entrada.",
    verifyAlreadyDone: "Tu email ya está verificado. Puedes continuar al panel.",
    goDashboard: "Abrir panel",
    openVerifyLink: "Abrir enlace de verificación",
    devVerifyHint: "El envío de email no está configurado; este enlace sirve para entorno local o pruebas.",
    resend: "Reenviar email",
    backToSignin: "Volver al login",
    missingEmail: "¿No llegó el email? Revisa spam.",
    signupHeading: "Registro",
    signinHeading: "Iniciar sesión en Votxt",
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
    termsPrefix: "Al usar Votxt aceptas nuestros",
    terms: "Términos",
    and: "y",
    privacy: "Privacidad",
    registerError: "Error de registro.",
    loginError: "Error de inicio de sesión."
  },
  fr: {
    signupTitle: "Créez votre compte Votxt",
    signinTitle: "Connexion à Votxt",
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
    verifyResent: "Email de vérification envoyé. Vérifiez votre boîte de réception.",
    verifyAlreadyDone: "Votre email est déjà vérifié. Vous pouvez continuer.",
    goDashboard: "Ouvrir le tableau",
    openVerifyLink: "Ouvrir le lien",
    devVerifyHint: "L'envoi d'email n'est pas configuré ; ce lien sert en local ou test.",
    resend: "Renvoyer l'email",
    backToSignin: "Retour connexion",
    missingEmail: "Pas d'email ? Vérifiez les spams.",
    signupHeading: "Inscription",
    signinHeading: "Connexion à Votxt",
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
    termsPrefix: "En utilisant Votxt, vous acceptez nos",
    terms: "Conditions",
    and: "et",
    privacy: "Confidentialité",
    registerError: "Échec de l'inscription.",
    loginError: "Échec de connexion."
  },
  de: {
    signupTitle: "Erstelle dein Votxt-Konto",
    signinTitle: "Bei Votxt anmelden",
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
    verifyResent: "Bestätigungs-E-Mail gesendet. Prüfe deinen Posteingang.",
    verifyAlreadyDone: "Deine E-Mail ist bereits bestätigt. Du kannst zum Dashboard wechseln.",
    goDashboard: "Dashboard öffnen",
    openVerifyLink: "Bestätigungslink öffnen",
    devVerifyHint: "E-Mail-Versand ist nicht konfiguriert; dieser Link ist für lokale Tests verfügbar.",
    resend: "E-Mail erneut senden",
    backToSignin: "Zur Anmeldung",
    missingEmail: "Keine E-Mail? Prüfe den Spam-Ordner.",
    signupHeading: "Registrieren",
    signinHeading: "Bei Votxt anmelden",
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
    termsPrefix: "Mit der Nutzung von Votxt akzeptierst du unsere",
    terms: "Bedingungen",
    and: "und",
    privacy: "Datenschutz",
    registerError: "Registrierung fehlgeschlagen.",
    loginError: "Anmeldung fehlgeschlagen."
  },
  ja: {
    signupTitle: "Votxt アカウントを作成",
    signinTitle: "Votxt にログイン",
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
    verifyResent: "確認メールを送信しました。受信箱を確認してください。",
    verifyAlreadyDone: "メール確認はすでに完了しています。ダッシュボードへ進めます。",
    goDashboard: "ダッシュボードを開く",
    openVerifyLink: "確認リンクを開く",
    devVerifyHint: "メール送信未設定のため、ローカル/テスト用リンクを表示しています。",
    resend: "確認メールを再送",
    backToSignin: "ログインへ戻る",
    missingEmail: "届かない場合は迷惑メールを確認してください。",
    signupHeading: "登録",
    signinHeading: "Votxt にログイン",
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
    termsPrefix: "Votxt の利用により",
    terms: "利用規約",
    and: "と",
    privacy: "プライバシー",
    registerError: "登録に失敗しました。",
    loginError: "ログインに失敗しました。"
  },
  ko: {
    signupTitle: "Votxt 계정 만들기",
    signinTitle: "Votxt 로그인",
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
    verifyResent: "인증 메일을 보냈습니다. 받은편지함을 확인하세요.",
    verifyAlreadyDone: "이메일 인증이 이미 완료되었습니다. 대시보드로 이동할 수 있습니다.",
    goDashboard: "대시보드 열기",
    openVerifyLink: "인증 링크 열기",
    devVerifyHint: "메일 서비스가 설정되지 않아 로컬/테스트용 링크가 표시됩니다.",
    resend: "인증 메일 다시 보내기",
    backToSignin: "로그인으로 돌아가기",
    missingEmail: "메일이 없나요? 스팸함을 확인하세요.",
    signupHeading: "가입",
    signinHeading: "Votxt 로그인",
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
    termsPrefix: "Votxt를 사용하면",
    terms: "서비스 약관",
    and: "및",
    privacy: "개인정보 처리방침",
    registerError: "가입 실패.",
    loginError: "로그인 실패."
  },
  pt: {
    signupTitle: "Crie sua conta Votxt",
    signinTitle: "Entrar no Votxt",
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
    verifyResent: "Email de verificação enviado. Verifique sua caixa de entrada.",
    verifyAlreadyDone: "Seu email já foi verificado. Você pode continuar ao painel.",
    goDashboard: "Abrir painel",
    openVerifyLink: "Abrir link de verificação",
    devVerifyHint: "O envio de email não está configurado; este link serve para local ou teste.",
    resend: "Reenviar email",
    backToSignin: "Voltar ao login",
    missingEmail: "Não chegou? Verifique spam.",
    signupHeading: "Cadastro",
    signinHeading: "Entrar no Votxt",
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
    termsPrefix: "Ao usar Votxt, você aceita nossos",
    terms: "Termos",
    and: "e",
    privacy: "Privacidade",
    registerError: "Falha no cadastro.",
    loginError: "Falha no login."
  }
} as const;

const authCopy20 = {
  ...authCopy,
  ar: {
    signupTitle: "إنشاء حساب Votxt",
    signinTitle: "تسجيل الدخول إلى Votxt",
    signupSubtitle: "أنشئ حسابا لإدارة مهام النسخ والرصيد وملفات التصدير.",
    signinSubtitle: "تابع بالبريد الإلكتروني لفتح لوحة النسخ.",
    signupCta: "إنشاء حساب وفتح اللوحة",
    signinCta: "تسجيل الدخول بالبريد الإلكتروني",
    switchToSignin: "لديك حساب؟ سجّل الدخول",
    switchToSignup: "ليس لديك حساب؟ سجّل مجانا",
    securityEyebrow: "مساحة عمل شخصية آمنة",
    securityPoints: ["توقيعات رفع قصيرة ترسل الوسائط مباشرة إلى التخزين.", "الحصة والمهام وميزات AI والترجمة والتصدير في لوحة واحدة.", "يدعم تسجيل البريد وGoogle والتحقق والفوترة."],
    verifyTitle: "تحقق من بريدك الإلكتروني",
    verifyText: (email: string) => `أرسلنا رسالة تحقق إلى ${email}. افتح الرابط للتحقق من حسابك.`,
    verifyPending: "جار التحقق من البريد...",
    verifyPendingText: "يرجى الانتظار بينما نتحقق من الرابط.",
    verifySuccess: "تم التحقق من البريد",
    verifySuccessText: "تم التحقق من بريد حسابك. يمكنك المتابعة إلى اللوحة.",
    verifyFailed: "فشل التحقق من البريد",
    verifyResent: "تم إرسال رسالة التحقق. تحقق من صندوق الوارد.",
    verifyAlreadyDone: "تم التحقق من بريدك بالفعل. يمكنك المتابعة إلى اللوحة.",
    goDashboard: "فتح اللوحة",
    openVerifyLink: "فتح رابط التحقق",
    devVerifyHint: "إرسال البريد غير مكوّن، لذلك يتوفر هذا الرابط للتطوير أو الاختبار.",
    resend: "إعادة إرسال رسالة التحقق",
    backToSignin: "العودة إلى تسجيل الدخول",
    missingEmail: "لم تصلك الرسالة؟ تحقق من مجلد الرسائل غير المرغوب فيها.",
    signupHeading: "التسجيل",
    signinHeading: "تسجيل الدخول",
    google: "المتابعة باستخدام Google",
    signupDivider: "أو التسجيل بالبريد الإلكتروني",
    signinDivider: "أو تسجيل الدخول بالبريد الإلكتروني",
    email: "البريد الإلكتروني",
    emailLabel: "البريد الإلكتروني:",
    edit: "تعديل",
    firstName: "الاسم الأول",
    firstNamePlaceholder: "الاسم الأول",
    lastName: "اسم العائلة",
    lastNamePlaceholder: "اسم العائلة",
    password: "كلمة المرور",
    passwordPlaceholder: "أدخل كلمة المرور",
    togglePassword: "إظهار أو إخفاء كلمة المرور",
    continue: "متابعة",
    registering: "جار إنشاء الحساب...",
    loginBusy: "جار تسجيل الدخول...",
    submitSignup: "التسجيل بالبريد الإلكتروني",
    back: "رجوع",
    already: "لديك حساب؟",
    signinLink: "تسجيل الدخول",
    forgotPassword: "نسيت كلمة المرور؟",
    termsPrefix: "باستخدام Votxt، فإنك توافق على",
    terms: "شروط الخدمة",
    and: "و",
    privacy: "سياسة الخصوصية",
    registerError: "فشل التسجيل.",
    loginError: "فشل تسجيل الدخول."
  },
  hu: {
    signupTitle: "Votxt-fiók létrehozása",
    signinTitle: "Bejelentkezés a Votxt-ba",
    signupSubtitle: "Hozz létre fiókot az átiratok, kvóta és exportok kezeléséhez.",
    signinSubtitle: "Folytasd e-maillel az átiratkezelő megnyitásához.",
    signupCta: "Fiók létrehozása és irányítópult megnyitása",
    signinCta: "Bejelentkezés e-maillel",
    switchToSignin: "Már van fiókod? Jelentkezz be",
    switchToSignup: "Nincs fiókod? Regisztrálj ingyen",
    securityEyebrow: "Biztonságos személyes munkaterület",
    securityPoints: ["Rövid életű feltöltési aláírások közvetlenül tárhelyre küldik a médiát.", "Kvóta, sorok, AI, fordítás és export egy irányítópulton.", "E-mail, Google, ellenőrzés és előfizetéses számlázás támogatott."],
    verifyTitle: "E-mail ellenőrzése",
    verifyText: (email: string) => `Ellenőrző e-mailt küldtünk ide: ${email}. Nyisd meg a linket a fiók ellenőrzéséhez.`,
    verifyPending: "E-mail ellenőrzése...",
    verifyPendingText: "Várj, amíg ellenőrizzük a linket.",
    verifySuccess: "E-mail ellenőrizve",
    verifySuccessText: "A fiókod e-mail címe ellenőrizve. Folytathatod az irányítópulton.",
    verifyFailed: "Az e-mail ellenőrzése sikertelen",
    verifyResent: "Ellenőrző e-mail elküldve. Nézd meg a beérkezőket.",
    verifyAlreadyDone: "Az e-mail címed már ellenőrizve van. Folytathatod.",
    goDashboard: "Irányítópult megnyitása",
    openVerifyLink: "Ellenőrző link megnyitása",
    devVerifyHint: "Az e-mail küldés nincs beállítva, ezért ez a fejlesztői link elérhető helyi vagy teszt környezethez.",
    resend: "Ellenőrző e-mail újraküldése",
    backToSignin: "Vissza a bejelentkezéshez",
    missingEmail: "Nem kaptad meg? Nézd meg a spam mappát.",
    signupHeading: "Regisztráció",
    signinHeading: "Bejelentkezés",
    google: "Folytatás Google-lel",
    signupDivider: "vagy regisztráció e-maillel",
    signinDivider: "vagy bejelentkezés e-maillel",
    email: "E-mail",
    emailLabel: "E-mail:",
    edit: "Szerkesztés",
    firstName: "Keresztnév",
    firstNamePlaceholder: "Keresztnév",
    lastName: "Vezetéknév",
    lastNamePlaceholder: "Vezetéknév",
    password: "Jelszó",
    passwordPlaceholder: "Add meg a jelszavad",
    togglePassword: "Jelszó láthatóságának váltása",
    continue: "Folytatás",
    registering: "Fiók létrehozása...",
    loginBusy: "Bejelentkezés...",
    submitSignup: "Regisztráció e-maillel",
    back: "Vissza",
    already: "Már van fiókod?",
    signinLink: "Bejelentkezés",
    forgotPassword: "Elfelejtetted a jelszót?",
    termsPrefix: "A Votxt használatával elfogadod a",
    terms: "Szolgáltatási feltételeket",
    and: "és",
    privacy: "Adatvédelmi irányelveket",
    registerError: "A regisztráció sikertelen.",
    loginError: "A bejelentkezés sikertelen."
  },
  id: {
    signupTitle: "Buat akun Votxt",
    signinTitle: "Masuk ke Votxt",
    signupSubtitle: "Buat akun untuk mengelola tugas transkripsi, kuota, dan aset ekspor.",
    signinSubtitle: "Lanjutkan dengan email untuk membuka dashboard transkripsi.",
    signupCta: "Buat akun dan buka dashboard",
    signinCta: "Masuk dengan email",
    switchToSignin: "Sudah punya akun? Masuk",
    switchToSignup: "Belum punya akun? Daftar gratis",
    securityEyebrow: "Workspace pribadi yang aman",
    securityPoints: ["Tanda tangan unggah singkat mengirim media langsung ke penyimpanan.", "Kuota, antrean, AI, terjemahan, dan ekspor ada di satu dashboard.", "Email, Google, verifikasi, dan penagihan langganan didukung."],
    verifyTitle: "Verifikasi email Anda",
    verifyText: (email: string) => `Kami mengirim email verifikasi ke ${email}. Buka tautan tersebut untuk memverifikasi akun.`,
    verifyPending: "Memverifikasi email...",
    verifyPendingText: "Mohon tunggu saat kami mengonfirmasi tautan verifikasi.",
    verifySuccess: "Email terverifikasi",
    verifySuccessText: "Email akun Anda sudah terverifikasi. Anda dapat melanjutkan ke dashboard.",
    verifyFailed: "Verifikasi email gagal",
    verifyResent: "Email verifikasi dikirim. Periksa kotak masuk Anda.",
    verifyAlreadyDone: "Email Anda sudah terverifikasi. Anda dapat melanjutkan ke dashboard.",
    goDashboard: "Buka dashboard",
    openVerifyLink: "Buka tautan verifikasi",
    devVerifyHint: "Pengiriman email belum dikonfigurasi, jadi tautan pengembangan ini tersedia untuk lokal atau pengujian.",
    resend: "Kirim ulang email verifikasi",
    backToSignin: "Kembali ke masuk",
    missingEmail: "Tidak menerima email? Periksa folder spam.",
    signupHeading: "Daftar",
    signinHeading: "Masuk",
    google: "Lanjutkan dengan Google",
    signupDivider: "atau daftar dengan email",
    signinDivider: "atau masuk dengan email",
    email: "Email",
    emailLabel: "Email:",
    edit: "Edit",
    firstName: "Nama depan",
    firstNamePlaceholder: "Nama depan",
    lastName: "Nama belakang",
    lastNamePlaceholder: "Nama belakang",
    password: "Kata sandi",
    passwordPlaceholder: "Masukkan kata sandi",
    togglePassword: "Alihkan visibilitas kata sandi",
    continue: "Lanjutkan",
    registering: "Membuat akun...",
    loginBusy: "Masuk...",
    submitSignup: "Daftar dengan email",
    back: "Kembali",
    already: "Sudah punya akun?",
    signinLink: "Masuk",
    forgotPassword: "Lupa kata sandi?",
    termsPrefix: "Dengan menggunakan Votxt, Anda menyetujui",
    terms: "Ketentuan Layanan",
    and: "dan",
    privacy: "Kebijakan Privasi",
    registerError: "Pendaftaran gagal.",
    loginError: "Masuk gagal."
  },
  it: {
    signupTitle: "Crea il tuo account Votxt",
    signinTitle: "Accedi a Votxt",
    signupSubtitle: "Crea un account per gestire trascrizioni, quota ed esportazioni.",
    signinSubtitle: "Continua con email per aprire il dashboard di trascrizione.",
    signupCta: "Crea account e apri dashboard",
    signinCta: "Accedi con email",
    switchToSignin: "Hai già un account? Accedi",
    switchToSignup: "Non hai un account? Registrati gratis",
    securityEyebrow: "Workspace personale sicuro",
    securityPoints: ["Firme di upload brevi inviano i media direttamente allo storage.", "Quota, code, AI, traduzione ed esportazioni in un dashboard.", "Email, Google, verifica e fatturazione abbonamenti supportati."],
    verifyTitle: "Verifica la tua email",
    verifyText: (email: string) => `Abbiamo inviato un'email di verifica a ${email}. Apri il link per verificare l'account.`,
    verifyPending: "Verifica email...",
    verifyPendingText: "Attendi mentre confermiamo il link di verifica.",
    verifySuccess: "Email verificata",
    verifySuccessText: "L'email del tuo account è verificata. Puoi continuare al dashboard.",
    verifyFailed: "Verifica email non riuscita",
    verifyResent: "Email di verifica inviata. Controlla la posta.",
    verifyAlreadyDone: "La tua email è già verificata. Puoi continuare al dashboard.",
    goDashboard: "Apri dashboard",
    openVerifyLink: "Apri link di verifica",
    devVerifyHint: "L'invio email non è configurato; questo link di sviluppo è disponibile per ambienti locali o di test.",
    resend: "Reinvia email di verifica",
    backToSignin: "Torna all'accesso",
    missingEmail: "Non hai ricevuto l'email? Controlla lo spam.",
    signupHeading: "Registrati",
    signinHeading: "Accedi",
    google: "Continua con Google",
    signupDivider: "o registrati con email",
    signinDivider: "o accedi con email",
    email: "Email",
    emailLabel: "Email:",
    edit: "Modifica",
    firstName: "Nome",
    firstNamePlaceholder: "Nome",
    lastName: "Cognome",
    lastNamePlaceholder: "Cognome",
    password: "Password",
    passwordPlaceholder: "Inserisci la password",
    togglePassword: "Mostra o nascondi password",
    continue: "Continua",
    registering: "Creazione account...",
    loginBusy: "Accesso...",
    submitSignup: "Registrati con email",
    back: "Indietro",
    already: "Hai già un account?",
    signinLink: "Accedi",
    forgotPassword: "Password dimenticata?",
    termsPrefix: "Usando Votxt accetti i nostri",
    terms: "Termini di servizio",
    and: "e",
    privacy: "Informativa privacy",
    registerError: "Registrazione non riuscita.",
    loginError: "Accesso non riuscito."
  },
  nl: {
    signupTitle: "Maak je Votxt-account",
    signinTitle: "Inloggen bij Votxt",
    signupSubtitle: "Maak een account om transcriptietaken, quota en exports te beheren.",
    signinSubtitle: "Ga verder met e-mail om je transcriptiedashboard te openen.",
    signupCta: "Account maken en dashboard openen",
    signinCta: "Inloggen met e-mail",
    switchToSignin: "Heb je al een account? Log in",
    switchToSignup: "Geen account? Gratis registreren",
    securityEyebrow: "Veilige persoonlijke workspace",
    securityPoints: ["Kortlevende uploadhandtekeningen sturen media rechtstreeks naar opslag.", "Quota, wachtrijen, AI, vertaling en exports staan in één dashboard.", "E-mail, Google, verificatie en abonnementsfacturatie worden ondersteund."],
    verifyTitle: "Verifieer je e-mail",
    verifyText: (email: string) => `We hebben een verificatiemail gestuurd naar ${email}. Open de link om je account te verifiëren.`,
    verifyPending: "E-mail verifiëren...",
    verifyPendingText: "Even geduld terwijl we je verificatielink controleren.",
    verifySuccess: "E-mail geverifieerd",
    verifySuccessText: "Je account-e-mail is geverifieerd. Je kunt doorgaan naar het dashboard.",
    verifyFailed: "E-mailverificatie mislukt",
    verifyResent: "Verificatiemail verzonden. Controleer je inbox.",
    verifyAlreadyDone: "Je e-mail is al geverifieerd. Je kunt doorgaan naar het dashboard.",
    goDashboard: "Dashboard openen",
    openVerifyLink: "Verificatielink openen",
    devVerifyHint: "E-mailbezorging is niet geconfigureerd, dus deze ontwikkellink is beschikbaar voor lokaal of testgebruik.",
    resend: "Verificatiemail opnieuw sturen",
    backToSignin: "Terug naar inloggen",
    missingEmail: "Geen e-mail ontvangen? Controleer je spammap.",
    signupHeading: "Registreren",
    signinHeading: "Inloggen",
    google: "Doorgaan met Google",
    signupDivider: "of registreer met e-mail",
    signinDivider: "of log in met e-mail",
    email: "E-mail",
    emailLabel: "E-mail:",
    edit: "Bewerken",
    firstName: "Voornaam",
    firstNamePlaceholder: "Voornaam",
    lastName: "Achternaam",
    lastNamePlaceholder: "Achternaam",
    password: "Wachtwoord",
    passwordPlaceholder: "Voer je wachtwoord in",
    togglePassword: "Wachtwoord tonen of verbergen",
    continue: "Doorgaan",
    registering: "Account maken...",
    loginBusy: "Inloggen...",
    submitSignup: "Registreren met e-mail",
    back: "Terug",
    already: "Heb je al een account?",
    signinLink: "Inloggen",
    forgotPassword: "Wachtwoord vergeten?",
    termsPrefix: "Door Votxt te gebruiken ga je akkoord met onze",
    terms: "Servicevoorwaarden",
    and: "en",
    privacy: "Privacyverklaring",
    registerError: "Registreren mislukt.",
    loginError: "Inloggen mislukt."
  },
  pl: {
    signupTitle: "Utwórz konto Votxt",
    signinTitle: "Zaloguj się do Votxt",
    signupSubtitle: "Utwórz konto, aby zarządzać transkrypcjami, limitem i eksportami.",
    signinSubtitle: "Kontynuuj przez e-mail, aby otworzyć panel transkrypcji.",
    signupCta: "Utwórz konto i otwórz panel",
    signinCta: "Zaloguj się e-mailem",
    switchToSignin: "Masz już konto? Zaloguj się",
    switchToSignup: "Nie masz konta? Zarejestruj się za darmo",
    securityEyebrow: "Bezpieczna osobista przestrzeń pracy",
    securityPoints: ["Krótkotrwałe podpisy przesyłania wysyłają media bezpośrednio do magazynu.", "Limity, kolejki, AI, tłumaczenia i eksporty są w jednym panelu.", "Obsługiwane są e-mail, Google, weryfikacja i rozliczenia subskrypcji."],
    verifyTitle: "Zweryfikuj e-mail",
    verifyText: (email: string) => `Wysłaliśmy wiadomość weryfikacyjną na ${email}. Otwórz link, aby zweryfikować konto.`,
    verifyPending: "Weryfikacja e-maila...",
    verifyPendingText: "Poczekaj, potwierdzamy link weryfikacyjny.",
    verifySuccess: "E-mail zweryfikowany",
    verifySuccessText: "E-mail konta został zweryfikowany. Możesz przejść do panelu.",
    verifyFailed: "Weryfikacja e-maila nie powiodła się",
    verifyResent: "Wiadomość weryfikacyjna wysłana. Sprawdź skrzynkę.",
    verifyAlreadyDone: "Twój e-mail jest już zweryfikowany. Możesz przejść do panelu.",
    goDashboard: "Otwórz panel",
    openVerifyLink: "Otwórz link weryfikacyjny",
    devVerifyHint: "Wysyłka e-maili nie jest skonfigurowana, więc ten link deweloperski jest dostępny lokalnie lub testowo.",
    resend: "Wyślij e-mail ponownie",
    backToSignin: "Wróć do logowania",
    missingEmail: "Nie dostałeś wiadomości? Sprawdź spam.",
    signupHeading: "Rejestracja",
    signinHeading: "Logowanie",
    google: "Kontynuuj z Google",
    signupDivider: "lub zarejestruj się e-mailem",
    signinDivider: "lub zaloguj się e-mailem",
    email: "E-mail",
    emailLabel: "E-mail:",
    edit: "Edytuj",
    firstName: "Imię",
    firstNamePlaceholder: "Imię",
    lastName: "Nazwisko",
    lastNamePlaceholder: "Nazwisko",
    password: "Hasło",
    passwordPlaceholder: "Wpisz hasło",
    togglePassword: "Pokaż lub ukryj hasło",
    continue: "Kontynuuj",
    registering: "Tworzenie konta...",
    loginBusy: "Logowanie...",
    submitSignup: "Zarejestruj e-mailem",
    back: "Wstecz",
    already: "Masz już konto?",
    signinLink: "Zaloguj się",
    forgotPassword: "Nie pamiętasz hasła?",
    termsPrefix: "Korzystając z Votxt, akceptujesz",
    terms: "Warunki korzystania",
    and: "oraz",
    privacy: "Politykę prywatności",
    registerError: "Rejestracja nie powiodła się.",
    loginError: "Logowanie nie powiodło się."
  },
  ru: {
    signupTitle: "Создайте аккаунт Votxt",
    signinTitle: "Вход в Votxt",
    signupSubtitle: "Создайте аккаунт, чтобы управлять расшифровками, лимитами и экспортами.",
    signinSubtitle: "Продолжите с e-mail, чтобы открыть панель расшифровок.",
    signupCta: "Создать аккаунт и открыть панель",
    signinCta: "Войти по e-mail",
    switchToSignin: "Уже есть аккаунт? Войти",
    switchToSignup: "Нет аккаунта? Зарегистрироваться бесплатно",
    securityEyebrow: "Безопасное личное рабочее пространство",
    securityPoints: ["Короткие подписи загрузки отправляют медиа прямо в хранилище.", "Лимиты, очереди, AI, перевод и экспорты доступны в одной панели.", "Поддерживаются e-mail, Google, подтверждение и подписочная оплата."],
    verifyTitle: "Подтвердите e-mail",
    verifyText: (email: string) => `Мы отправили письмо подтверждения на ${email}. Откройте ссылку, чтобы подтвердить аккаунт.`,
    verifyPending: "Подтверждаем e-mail...",
    verifyPendingText: "Подождите, пока мы проверяем ссылку подтверждения.",
    verifySuccess: "E-mail подтвержден",
    verifySuccessText: "E-mail аккаунта подтвержден. Можно перейти в панель.",
    verifyFailed: "Не удалось подтвердить e-mail",
    verifyResent: "Письмо подтверждения отправлено. Проверьте почту.",
    verifyAlreadyDone: "Ваш e-mail уже подтвержден. Можно перейти в панель.",
    goDashboard: "Открыть панель",
    openVerifyLink: "Открыть ссылку подтверждения",
    devVerifyHint: "Доставка e-mail не настроена, поэтому эта ссылка доступна для локальной или тестовой среды.",
    resend: "Отправить письмо снова",
    backToSignin: "Назад ко входу",
    missingEmail: "Не получили письмо? Проверьте папку спама.",
    signupHeading: "Регистрация",
    signinHeading: "Вход",
    google: "Продолжить с Google",
    signupDivider: "или зарегистрироваться по e-mail",
    signinDivider: "или войти по e-mail",
    email: "E-mail",
    emailLabel: "E-mail:",
    edit: "Изменить",
    firstName: "Имя",
    firstNamePlaceholder: "Имя",
    lastName: "Фамилия",
    lastNamePlaceholder: "Фамилия",
    password: "Пароль",
    passwordPlaceholder: "Введите пароль",
    togglePassword: "Показать или скрыть пароль",
    continue: "Продолжить",
    registering: "Создаем аккаунт...",
    loginBusy: "Входим...",
    submitSignup: "Зарегистрироваться по e-mail",
    back: "Назад",
    already: "Уже есть аккаунт?",
    signinLink: "Войти",
    forgotPassword: "Забыли пароль?",
    termsPrefix: "Используя Votxt, вы соглашаетесь с",
    terms: "Условиями обслуживания",
    and: "и",
    privacy: "Политикой конфиденциальности",
    registerError: "Регистрация не удалась.",
    loginError: "Вход не удался."
  },
  th: {
    signupTitle: "สร้างบัญชี Votxt",
    signinTitle: "เข้าสู่ระบบ Votxt",
    signupSubtitle: "สร้างบัญชีเพื่อจัดการงานถอดเสียง โควตา และไฟล์ส่งออก",
    signinSubtitle: "ดำเนินการต่อด้วยอีเมลเพื่อเปิดแดชบอร์ดการถอดเสียง",
    signupCta: "สร้างบัญชีและเปิดแดชบอร์ด",
    signinCta: "เข้าสู่ระบบด้วยอีเมล",
    switchToSignin: "มีบัญชีแล้ว? เข้าสู่ระบบ",
    switchToSignup: "ยังไม่มีบัญชี? สมัครฟรี",
    securityEyebrow: "พื้นที่ทำงานส่วนตัวที่ปลอดภัย",
    securityPoints: ["ลายเซ็นอัปโหลดระยะสั้นส่งสื่อไปยังที่เก็บโดยตรง", "โควตา คิว AI การแปล และการส่งออกอยู่ในแดชบอร์ดเดียว", "รองรับอีเมล Google การยืนยัน และการเรียกเก็บเงินสมาชิก"],
    verifyTitle: "ยืนยันอีเมลของคุณ",
    verifyText: (email: string) => `เราส่งอีเมลยืนยันไปที่ ${email} แล้ว เปิดลิงก์เพื่อยืนยันบัญชี`,
    verifyPending: "กำลังยืนยันอีเมล...",
    verifyPendingText: "โปรดรอสักครู่ขณะเรายืนยันลิงก์",
    verifySuccess: "ยืนยันอีเมลแล้ว",
    verifySuccessText: "อีเมลบัญชีของคุณได้รับการยืนยันแล้ว คุณสามารถไปที่แดชบอร์ดได้",
    verifyFailed: "ยืนยันอีเมลไม่สำเร็จ",
    verifyResent: "ส่งอีเมลยืนยันแล้ว โปรดตรวจสอบกล่องจดหมาย",
    verifyAlreadyDone: "อีเมลของคุณได้รับการยืนยันแล้ว คุณสามารถไปที่แดชบอร์ดได้",
    goDashboard: "เปิดแดชบอร์ด",
    openVerifyLink: "เปิดลิงก์ยืนยัน",
    devVerifyHint: "ยังไม่ได้ตั้งค่าการส่งอีเมล ลิงก์สำหรับพัฒนานี้จึงใช้ได้ในเครื่องหรือสภาพแวดล้อมทดสอบ",
    resend: "ส่งอีเมลยืนยันอีกครั้ง",
    backToSignin: "กลับไปเข้าสู่ระบบ",
    missingEmail: "ไม่ได้รับอีเมล? ตรวจสอบโฟลเดอร์สแปม",
    signupHeading: "สมัคร",
    signinHeading: "เข้าสู่ระบบ",
    google: "ดำเนินการต่อด้วย Google",
    signupDivider: "หรือสมัครด้วยอีเมล",
    signinDivider: "หรือเข้าสู่ระบบด้วยอีเมล",
    email: "อีเมล",
    emailLabel: "อีเมล:",
    edit: "แก้ไข",
    firstName: "ชื่อ",
    firstNamePlaceholder: "ชื่อ",
    lastName: "นามสกุล",
    lastNamePlaceholder: "นามสกุล",
    password: "รหัสผ่าน",
    passwordPlaceholder: "ป้อนรหัสผ่าน",
    togglePassword: "สลับการแสดงรหัสผ่าน",
    continue: "ดำเนินการต่อ",
    registering: "กำลังสร้างบัญชี...",
    loginBusy: "กำลังเข้าสู่ระบบ...",
    submitSignup: "สมัครด้วยอีเมล",
    back: "กลับ",
    already: "มีบัญชีแล้ว?",
    signinLink: "เข้าสู่ระบบ",
    forgotPassword: "ลืมรหัสผ่าน?",
    termsPrefix: "การใช้ Votxt หมายความว่าคุณยอมรับ",
    terms: "ข้อกำหนดการให้บริการ",
    and: "และ",
    privacy: "นโยบายความเป็นส่วนตัว",
    registerError: "ลงทะเบียนไม่สำเร็จ",
    loginError: "เข้าสู่ระบบไม่สำเร็จ"
  },
  tr: {
    signupTitle: "Votxt hesabını oluştur",
    signinTitle: "Votxt'a giriş yap",
    signupSubtitle: "Transkripsiyon işleri, kota ve dışa aktarımları yönetmek için hesap oluştur.",
    signinSubtitle: "Transkripsiyon panelini açmak için e-posta ile devam et.",
    signupCta: "Hesap oluştur ve paneli aç",
    signinCta: "E-posta ile giriş yap",
    switchToSignin: "Hesabın var mı? Giriş yap",
    switchToSignup: "Hesabın yok mu? Ücretsiz kaydol",
    securityEyebrow: "Güvenli kişisel çalışma alanı",
    securityPoints: ["Kısa süreli yükleme imzaları medyayı doğrudan depolamaya gönderir.", "Kota, kuyruklar, AI, çeviri ve dışa aktarımlar tek panelde.", "E-posta, Google, doğrulama ve abonelik faturalaması desteklenir."],
    verifyTitle: "E-postanı doğrula",
    verifyText: (email: string) => `${email} adresine doğrulama e-postası gönderdik. Hesabını doğrulamak için bağlantıyı aç.`,
    verifyPending: "E-posta doğrulanıyor...",
    verifyPendingText: "Doğrulama bağlantını kontrol ederken lütfen bekle.",
    verifySuccess: "E-posta doğrulandı",
    verifySuccessText: "Hesap e-postan doğrulandı. Panele devam edebilirsin.",
    verifyFailed: "E-posta doğrulaması başarısız",
    verifyResent: "Doğrulama e-postası gönderildi. Gelen kutunu kontrol et.",
    verifyAlreadyDone: "E-postan zaten doğrulandı. Panele devam edebilirsin.",
    goDashboard: "Paneli aç",
    openVerifyLink: "Doğrulama bağlantısını aç",
    devVerifyHint: "E-posta gönderimi yapılandırılmadı, bu geliştirme bağlantısı yerel veya test ortamı için kullanılabilir.",
    resend: "Doğrulama e-postasını yeniden gönder",
    backToSignin: "Girişe dön",
    missingEmail: "E-posta gelmedi mi? Spam klasörünü kontrol et.",
    signupHeading: "Kayıt ol",
    signinHeading: "Giriş yap",
    google: "Google ile devam et",
    signupDivider: "veya e-posta ile kaydol",
    signinDivider: "veya e-posta ile giriş yap",
    email: "E-posta",
    emailLabel: "E-posta:",
    edit: "Düzenle",
    firstName: "Ad",
    firstNamePlaceholder: "Ad",
    lastName: "Soyad",
    lastNamePlaceholder: "Soyad",
    password: "Parola",
    passwordPlaceholder: "Parolanı gir",
    togglePassword: "Parola görünürlüğünü değiştir",
    continue: "Devam",
    registering: "Hesap oluşturuluyor...",
    loginBusy: "Giriş yapılıyor...",
    submitSignup: "E-posta ile kaydol",
    back: "Geri",
    already: "Hesabın var mı?",
    signinLink: "Giriş yap",
    forgotPassword: "Parolanı mı unuttun?",
    termsPrefix: "Votxt'ı kullanarak",
    terms: "Hizmet Şartları",
    and: "ve",
    privacy: "Gizlilik Politikası",
    registerError: "Kayıt başarısız.",
    loginError: "Giriş başarısız."
  },
  uk: {
    signupTitle: "Створіть акаунт Votxt",
    signinTitle: "Увійти в Votxt",
    signupSubtitle: "Створіть акаунт, щоб керувати транскрипціями, лімітом і експортами.",
    signinSubtitle: "Продовжте з e-mail, щоб відкрити панель транскрипцій.",
    signupCta: "Створити акаунт і відкрити панель",
    signinCta: "Увійти через e-mail",
    switchToSignin: "Вже маєте акаунт? Увійдіть",
    switchToSignup: "Немає акаунта? Зареєструйтеся безкоштовно",
    securityEyebrow: "Безпечний особистий робочий простір",
    securityPoints: ["Короткі підписи завантаження надсилають медіа прямо в сховище.", "Ліміти, черги, AI, переклад і експорти доступні в одній панелі.", "Підтримуються e-mail, Google, підтвердження та оплата підписки."],
    verifyTitle: "Підтвердьте e-mail",
    verifyText: (email: string) => `Ми надіслали лист підтвердження на ${email}. Відкрийте посилання, щоб підтвердити акаунт.`,
    verifyPending: "Підтверджуємо e-mail...",
    verifyPendingText: "Зачекайте, доки ми перевіримо посилання.",
    verifySuccess: "E-mail підтверджено",
    verifySuccessText: "E-mail акаунта підтверджено. Можна перейти до панелі.",
    verifyFailed: "Не вдалося підтвердити e-mail",
    verifyResent: "Лист підтвердження надіслано. Перевірте пошту.",
    verifyAlreadyDone: "Ваш e-mail уже підтверджено. Можна перейти до панелі.",
    goDashboard: "Відкрити панель",
    openVerifyLink: "Відкрити посилання підтвердження",
    devVerifyHint: "Доставку e-mail не налаштовано, тому це тестове посилання доступне для локального або тестового середовища.",
    resend: "Надіслати лист ще раз",
    backToSignin: "Повернутися до входу",
    missingEmail: "Не отримали листа? Перевірте спам.",
    signupHeading: "Реєстрація",
    signinHeading: "Вхід",
    google: "Продовжити з Google",
    signupDivider: "або зареєструйтеся через e-mail",
    signinDivider: "або увійдіть через e-mail",
    email: "E-mail",
    emailLabel: "E-mail:",
    edit: "Редагувати",
    firstName: "Ім'я",
    firstNamePlaceholder: "Ім'я",
    lastName: "Прізвище",
    lastNamePlaceholder: "Прізвище",
    password: "Пароль",
    passwordPlaceholder: "Введіть пароль",
    togglePassword: "Показати або приховати пароль",
    continue: "Продовжити",
    registering: "Створення акаунта...",
    loginBusy: "Вхід...",
    submitSignup: "Зареєструватися через e-mail",
    back: "Назад",
    already: "Вже маєте акаунт?",
    signinLink: "Увійти",
    forgotPassword: "Забули пароль?",
    termsPrefix: "Використовуючи Votxt, ви погоджуєтесь із",
    terms: "Умовами надання послуг",
    and: "та",
    privacy: "Політикою приватності",
    registerError: "Реєстрація не вдалася.",
    loginError: "Вхід не вдався."
  },
  vi: {
    signupTitle: "Tạo tài khoản Votxt",
    signinTitle: "Đăng nhập Votxt",
    signupSubtitle: "Tạo tài khoản để quản lý tác vụ chép lời, hạn mức và tệp xuất.",
    signinSubtitle: "Tiếp tục bằng email để mở dashboard chép lời.",
    signupCta: "Tạo tài khoản và mở dashboard",
    signinCta: "Đăng nhập bằng email",
    switchToSignin: "Đã có tài khoản? Đăng nhập",
    switchToSignup: "Chưa có tài khoản? Đăng ký miễn phí",
    securityEyebrow: "Không gian làm việc cá nhân an toàn",
    securityPoints: ["Chữ ký tải lên ngắn hạn gửi media trực tiếp tới lưu trữ.", "Hạn mức, hàng đợi, AI, dịch và xuất nằm trong một dashboard.", "Hỗ trợ email, Google, xác minh và thanh toán thuê bao."],
    verifyTitle: "Xác minh email của bạn",
    verifyText: (email: string) => `Chúng tôi đã gửi email xác minh tới ${email}. Mở liên kết để xác minh tài khoản.`,
    verifyPending: "Đang xác minh email...",
    verifyPendingText: "Vui lòng chờ trong khi chúng tôi xác nhận liên kết.",
    verifySuccess: "Email đã xác minh",
    verifySuccessText: "Email tài khoản của bạn đã được xác minh. Bạn có thể tiếp tục tới dashboard.",
    verifyFailed: "Xác minh email thất bại",
    verifyResent: "Email xác minh đã được gửi. Vui lòng kiểm tra hộp thư.",
    verifyAlreadyDone: "Email của bạn đã được xác minh. Bạn có thể tiếp tục tới dashboard.",
    goDashboard: "Mở dashboard",
    openVerifyLink: "Mở liên kết xác minh",
    devVerifyHint: "Chưa cấu hình gửi email, nên liên kết phát triển này dùng cho môi trường cục bộ hoặc thử nghiệm.",
    resend: "Gửi lại email xác minh",
    backToSignin: "Quay lại đăng nhập",
    missingEmail: "Chưa nhận được email? Kiểm tra thư rác.",
    signupHeading: "Đăng ký",
    signinHeading: "Đăng nhập",
    google: "Tiếp tục với Google",
    signupDivider: "hoặc đăng ký bằng email",
    signinDivider: "hoặc đăng nhập bằng email",
    email: "Email",
    emailLabel: "Email:",
    edit: "Sửa",
    firstName: "Tên",
    firstNamePlaceholder: "Tên",
    lastName: "Họ",
    lastNamePlaceholder: "Họ",
    password: "Mật khẩu",
    passwordPlaceholder: "Nhập mật khẩu",
    togglePassword: "Hiện hoặc ẩn mật khẩu",
    continue: "Tiếp tục",
    registering: "Đang tạo tài khoản...",
    loginBusy: "Đang đăng nhập...",
    submitSignup: "Đăng ký bằng email",
    back: "Quay lại",
    already: "Đã có tài khoản?",
    signinLink: "Đăng nhập",
    forgotPassword: "Quên mật khẩu?",
    termsPrefix: "Khi dùng Votxt, bạn đồng ý với",
    terms: "Điều khoản dịch vụ",
    and: "và",
    privacy: "Chính sách quyền riêng tư",
    registerError: "Đăng ký thất bại.",
    loginError: "Đăng nhập thất bại."
  },
  "zh-TW": {
    signupTitle: "建立你的 Votxt 帳號",
    signinTitle: "登入 Votxt",
    signupSubtitle: "註冊後進入儀表板，管理轉寫任務、額度和匯出資產。",
    signinSubtitle: "使用電子郵件繼續存取你的轉寫儀表板。",
    signupCta: "註冊並進入儀表板",
    signinCta: "使用電子郵件登入",
    switchToSignin: "已有帳號？登入",
    switchToSignup: "沒有帳號？免費註冊",
    securityEyebrow: "個人安全工作區",
    securityPoints: ["短期上傳簽章，媒體檔案直傳物件儲存。", "額度、任務佇列、AI 洞察、翻譯和匯出統一進入儀表板。", "支援電子郵件、Google、驗證與訂閱付款。"],
    verifyTitle: "驗證你的電子郵件",
    verifyText: (email: string) => `我們已向 ${email} 傳送驗證郵件。請開啟郵件中的連結驗證帳號。`,
    verifyPending: "正在驗證電子郵件...",
    verifyPendingText: "請稍候，我們正在確認你的驗證連結。",
    verifySuccess: "電子郵件已驗證",
    verifySuccessText: "你的帳號電子郵件已完成驗證，可以繼續前往儀表板。",
    verifyFailed: "電子郵件驗證失敗",
    verifyResent: "驗證郵件已傳送，請檢查收件匣。",
    verifyAlreadyDone: "你的電子郵件已完成驗證，可以繼續前往儀表板。",
    goDashboard: "開啟儀表板",
    openVerifyLink: "開啟驗證連結",
    devVerifyHint: "目前未設定郵件服務，下方開發驗證連結可用於本機或測試環境。",
    resend: "重新傳送驗證郵件",
    backToSignin: "返回登入",
    missingEmail: "未收到郵件？請檢查垃圾郵件資料夾。",
    signupHeading: "註冊",
    signinHeading: "登入",
    google: "使用 Google 繼續",
    signupDivider: "或使用電子郵件註冊",
    signinDivider: "或使用電子郵件登入",
    email: "電子郵件",
    emailLabel: "電子郵件：",
    edit: "編輯",
    firstName: "名字",
    firstNamePlaceholder: "名字",
    lastName: "姓氏",
    lastNamePlaceholder: "姓氏",
    password: "密碼",
    passwordPlaceholder: "請輸入密碼",
    togglePassword: "切換密碼可見性",
    continue: "繼續",
    registering: "註冊中...",
    loginBusy: "登入中...",
    submitSignup: "使用電子郵件註冊",
    back: "返回",
    already: "已有帳號？",
    signinLink: "登入",
    forgotPassword: "忘記密碼？",
    termsPrefix: "使用 Votxt 即表示你同意我們的",
    terms: "服務條款",
    and: "和",
    privacy: "隱私權政策",
    registerError: "註冊失敗。",
    loginError: "登入失敗。"
  }
} as const;

function getAuthCopy(locale: string) {
  return isLocale(locale) && locale in authCopy20 ? authCopy20[locale as keyof typeof authCopy20] : authCopy20.en;
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
    termsPrefix: "使用 Votxt 即表示你同意我们的",
    terms: "服务条款",
    and: "和",
    privacy: "隐私政策",
    devResetHint: "当前未配置邮件服务，下面的开发重置链接可用于本地或测试环境。",
    openResetLink: "打开重置链接",
    resetTitle: "设置新密码",
    resetSubtitle: "输入新的 Votxt 密码。",
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
    termsPrefix: "By using Votxt, you agree to our",
    terms: "Terms of Service",
    and: "and",
    privacy: "Privacy Policy",
    devResetHint: "Email delivery is not configured, so this development reset link is available for local or test environments.",
    openResetLink: "Open reset link",
    resetTitle: "Reset Password",
    resetSubtitle: "Enter your new password below",
    confirmPassword: "Confirm New Password",
    resetCta: "Reset Password",
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
    termsPrefix: "Al usar Votxt aceptas nuestros",
    terms: "Términos",
    and: "y",
    privacy: "Privacidad",
    devResetHint: "El envío de email no está configurado; este enlace de restablecimiento sirve para local o pruebas.",
    openResetLink: "Abrir enlace",
    resetTitle: "Define una nueva contraseña",
    resetSubtitle: "Introduce una nueva contraseña para Votxt.",
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
    termsPrefix: "En utilisant Votxt, vous acceptez nos",
    terms: "Conditions",
    and: "et",
    privacy: "Confidentialité",
    devResetHint: "L'envoi d'email n'est pas configuré ; ce lien de réinitialisation sert en local ou test.",
    openResetLink: "Ouvrir le lien",
    resetTitle: "Définir un nouveau mot de passe",
    resetSubtitle: "Saisissez un nouveau mot de passe Votxt.",
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
    termsPrefix: "Mit Votxt akzeptierst du unsere",
    terms: "Nutzungsbedingungen",
    and: "und",
    privacy: "Datenschutzrichtlinie",
    devResetHint: "E-Mail-Versand ist nicht konfiguriert; dieser Reset-Link ist für lokale Tests verfügbar.",
    openResetLink: "Reset-Link öffnen",
    resetTitle: "Neues Passwort festlegen",
    resetSubtitle: "Gib ein neues Votxt-Passwort ein.",
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
    termsPrefix: "Votxt の利用により",
    terms: "利用規約",
    and: "と",
    privacy: "プライバシーポリシー",
    devResetHint: "メール配信が未設定のため、ローカル/テスト用リンクを表示しています。",
    openResetLink: "リセットリンクを開く",
    resetTitle: "新しいパスワードを設定",
    resetSubtitle: "Votxt の新しいパスワードを入力してください。",
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
    termsPrefix: "Votxt를 사용하면",
    terms: "서비스 약관",
    and: "및",
    privacy: "개인정보 처리방침",
    devResetHint: "이메일 전송이 설정되지 않아 로컬/테스트용 재설정 링크를 표시합니다.",
    openResetLink: "재설정 링크 열기",
    resetTitle: "새 비밀번호 설정",
    resetSubtitle: "Votxt 새 비밀번호를 입력하세요.",
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
    termsPrefix: "Ao usar Votxt você aceita nossos",
    terms: "Termos",
    and: "e",
    privacy: "Privacidade",
    devResetHint: "O envio de email não está configurado; este link serve para ambiente local ou testes.",
    openResetLink: "Abrir link",
    resetTitle: "Definir nova senha",
    resetSubtitle: "Digite uma nova senha para Votxt.",
    confirmPassword: "Confirmar senha",
    resetCta: "Atualizar senha",
    resetting: "Atualizando...",
    resetSuccess: "Sua senha foi atualizada. Você pode continuar.",
    resetInvalid: "Este link é inválido ou expirou.",
    mismatch: "As senhas não coincidem."
  }
} as const;

const forgotCopy20 = {
  ...forgotCopy,
  ar: {
    title: "نسيت كلمة المرور",
    subtitle: "أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور.",
    email: "البريد الإلكتروني",
    placeholder: "أدخل بريدك الإلكتروني",
    cta: "إرسال رابط إعادة التعيين",
    sending: "جار الإرسال...",
    sent: "إذا كان هذا البريد مسجلا، فستتلقى رسالة لإعادة تعيين كلمة المرور.",
    back: "العودة إلى تسجيل الدخول",
    termsPrefix: "باستخدام Votxt، فإنك توافق على",
    terms: "شروط الخدمة",
    and: "و",
    privacy: "سياسة الخصوصية",
    devResetHint: "إرسال البريد غير مكوّن، لذلك يتوفر رابط إعادة التعيين هذا للتطوير أو الاختبار.",
    openResetLink: "فتح رابط إعادة التعيين",
    resetTitle: "إعادة تعيين كلمة المرور",
    resetSubtitle: "أدخل كلمة مرور Votxt الجديدة.",
    confirmPassword: "تأكيد كلمة المرور الجديدة",
    resetCta: "تحديث كلمة المرور",
    resetting: "جار التحديث...",
    resetSuccess: "تم تحديث كلمة المرور. يمكنك المتابعة إلى اللوحة.",
    resetInvalid: "رابط إعادة التعيين غير صالح أو منتهي الصلاحية.",
    mismatch: "كلمتا المرور غير متطابقتين."
  },
  hu: {
    title: "Elfelejtett jelszó",
    subtitle: "Add meg az e-mail címed a jelszó visszaállításához.",
    email: "E-mail",
    placeholder: "Add meg az e-mail címed",
    cta: "Visszaállító link küldése",
    sending: "Küldés...",
    sent: "Ha ez az e-mail regisztrálva van, kapsz egy jelszó-visszaállító e-mailt.",
    back: "Vissza a bejelentkezéshez",
    termsPrefix: "A Votxt használatával elfogadod a",
    terms: "Szolgáltatási feltételeket",
    and: "és",
    privacy: "Adatvédelmi irányelveket",
    devResetHint: "Az e-mail küldés nincs beállítva, ezért ez a fejlesztői visszaállító link elérhető helyi vagy teszt környezethez.",
    openResetLink: "Visszaállító link megnyitása",
    resetTitle: "Jelszó visszaállítása",
    resetSubtitle: "Add meg az új Votxt-jelszavad.",
    confirmPassword: "Új jelszó megerősítése",
    resetCta: "Jelszó frissítése",
    resetting: "Frissítés...",
    resetSuccess: "A jelszavad frissült. Folytathatod az irányítópulton.",
    resetInvalid: "Ez a visszaállító link érvénytelen vagy lejárt.",
    mismatch: "A jelszavak nem egyeznek."
  },
  id: {
    title: "Lupa Kata Sandi",
    subtitle: "Masukkan email untuk mengatur ulang kata sandi Anda.",
    email: "Email",
    placeholder: "Masukkan email Anda",
    cta: "Kirim tautan reset",
    sending: "Mengirim...",
    sent: "Jika email tersebut terdaftar, Anda akan menerima email reset kata sandi.",
    back: "Kembali ke masuk",
    termsPrefix: "Dengan menggunakan Votxt, Anda menyetujui",
    terms: "Ketentuan Layanan",
    and: "dan",
    privacy: "Kebijakan Privasi",
    devResetHint: "Pengiriman email belum dikonfigurasi, jadi tautan reset pengembangan ini tersedia untuk lokal atau pengujian.",
    openResetLink: "Buka tautan reset",
    resetTitle: "Reset Kata Sandi",
    resetSubtitle: "Masukkan kata sandi Votxt baru Anda.",
    confirmPassword: "Konfirmasi kata sandi baru",
    resetCta: "Perbarui kata sandi",
    resetting: "Memperbarui...",
    resetSuccess: "Kata sandi Anda telah diperbarui. Anda dapat melanjutkan ke dashboard.",
    resetInvalid: "Tautan reset ini tidak valid atau kedaluwarsa.",
    mismatch: "Kata sandi tidak cocok."
  },
  it: {
    title: "Password dimenticata",
    subtitle: "Inserisci la tua email per reimpostare la password.",
    email: "Email",
    placeholder: "Inserisci la tua email",
    cta: "Invia link di reset",
    sending: "Invio...",
    sent: "Se l'email è registrata, riceverai un messaggio per reimpostare la password.",
    back: "Torna all'accesso",
    termsPrefix: "Usando Votxt accetti i nostri",
    terms: "Termini di servizio",
    and: "e",
    privacy: "Informativa privacy",
    devResetHint: "L'invio email non è configurato; questo link di reset è disponibile per ambienti locali o di test.",
    openResetLink: "Apri link di reset",
    resetTitle: "Reimposta password",
    resetSubtitle: "Inserisci la nuova password Votxt.",
    confirmPassword: "Conferma nuova password",
    resetCta: "Aggiorna password",
    resetting: "Aggiornamento...",
    resetSuccess: "La password è stata aggiornata. Puoi continuare al dashboard.",
    resetInvalid: "Questo link di reset non è valido o è scaduto.",
    mismatch: "Le password non coincidono."
  },
  nl: {
    title: "Wachtwoord vergeten",
    subtitle: "Voer je e-mail in om je wachtwoord opnieuw in te stellen.",
    email: "E-mail",
    placeholder: "Voer je e-mail in",
    cta: "Resetlink sturen",
    sending: "Versturen...",
    sent: "Als dit e-mailadres geregistreerd is, ontvang je een wachtwoordresetmail.",
    back: "Terug naar inloggen",
    termsPrefix: "Door Votxt te gebruiken ga je akkoord met onze",
    terms: "Servicevoorwaarden",
    and: "en",
    privacy: "Privacyverklaring",
    devResetHint: "E-mailbezorging is niet geconfigureerd, dus deze ontwikkelresetlink is beschikbaar voor lokaal of testgebruik.",
    openResetLink: "Resetlink openen",
    resetTitle: "Wachtwoord resetten",
    resetSubtitle: "Voer je nieuwe Votxt-wachtwoord in.",
    confirmPassword: "Nieuw wachtwoord bevestigen",
    resetCta: "Wachtwoord bijwerken",
    resetting: "Bijwerken...",
    resetSuccess: "Je wachtwoord is bijgewerkt. Je kunt doorgaan naar het dashboard.",
    resetInvalid: "Deze resetlink is ongeldig of verlopen.",
    mismatch: "Wachtwoorden komen niet overeen."
  },
  pl: {
    title: "Nie pamiętasz hasła",
    subtitle: "Wpisz e-mail, aby zresetować hasło.",
    email: "E-mail",
    placeholder: "Wpisz e-mail",
    cta: "Wyślij link resetowania",
    sending: "Wysyłanie...",
    sent: "Jeśli ten e-mail jest zarejestrowany, otrzymasz wiadomość resetowania hasła.",
    back: "Wróć do logowania",
    termsPrefix: "Korzystając z Votxt, akceptujesz",
    terms: "Warunki korzystania",
    and: "oraz",
    privacy: "Politykę prywatności",
    devResetHint: "Wysyłka e-maili nie jest skonfigurowana, więc ten link resetowania jest dostępny lokalnie lub testowo.",
    openResetLink: "Otwórz link resetowania",
    resetTitle: "Resetuj hasło",
    resetSubtitle: "Wpisz nowe hasło Votxt.",
    confirmPassword: "Potwierdź nowe hasło",
    resetCta: "Zaktualizuj hasło",
    resetting: "Aktualizowanie...",
    resetSuccess: "Hasło zostało zaktualizowane. Możesz przejść do panelu.",
    resetInvalid: "Ten link resetowania jest nieprawidłowy lub wygasł.",
    mismatch: "Hasła nie są zgodne."
  },
  ru: {
    title: "Забыли пароль",
    subtitle: "Введите e-mail, чтобы сбросить пароль.",
    email: "E-mail",
    placeholder: "Введите e-mail",
    cta: "Отправить ссылку сброса",
    sending: "Отправка...",
    sent: "Если этот e-mail зарегистрирован, вы получите письмо для сброса пароля.",
    back: "Назад ко входу",
    termsPrefix: "Используя Votxt, вы соглашаетесь с",
    terms: "Условиями обслуживания",
    and: "и",
    privacy: "Политикой конфиденциальности",
    devResetHint: "Доставка e-mail не настроена, поэтому эта ссылка сброса доступна для локальной или тестовой среды.",
    openResetLink: "Открыть ссылку сброса",
    resetTitle: "Сброс пароля",
    resetSubtitle: "Введите новый пароль Votxt.",
    confirmPassword: "Подтвердите новый пароль",
    resetCta: "Обновить пароль",
    resetting: "Обновление...",
    resetSuccess: "Пароль обновлен. Можно перейти в панель.",
    resetInvalid: "Эта ссылка сброса недействительна или истекла.",
    mismatch: "Пароли не совпадают."
  },
  th: {
    title: "ลืมรหัสผ่าน",
    subtitle: "ป้อนอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน",
    email: "อีเมล",
    placeholder: "ป้อนอีเมลของคุณ",
    cta: "ส่งลิงก์รีเซ็ต",
    sending: "กำลังส่ง...",
    sent: "หากอีเมลนี้ลงทะเบียนแล้ว คุณจะได้รับอีเมลรีเซ็ตรหัสผ่าน",
    back: "กลับไปเข้าสู่ระบบ",
    termsPrefix: "การใช้ Votxt หมายความว่าคุณยอมรับ",
    terms: "ข้อกำหนดการให้บริการ",
    and: "และ",
    privacy: "นโยบายความเป็นส่วนตัว",
    devResetHint: "ยังไม่ได้ตั้งค่าการส่งอีเมล ลิงก์รีเซ็ตสำหรับพัฒนานี้จึงใช้ได้ในเครื่องหรือสภาพแวดล้อมทดสอบ",
    openResetLink: "เปิดลิงก์รีเซ็ต",
    resetTitle: "รีเซ็ตรหัสผ่าน",
    resetSubtitle: "ป้อนรหัสผ่าน Votxt ใหม่ของคุณ",
    confirmPassword: "ยืนยันรหัสผ่านใหม่",
    resetCta: "อัปเดตรหัสผ่าน",
    resetting: "กำลังอัปเดต...",
    resetSuccess: "อัปเดตรหัสผ่านแล้ว คุณสามารถไปที่แดชบอร์ดได้",
    resetInvalid: "ลิงก์รีเซ็ตนี้ไม่ถูกต้องหรือหมดอายุแล้ว",
    mismatch: "รหัสผ่านไม่ตรงกัน"
  },
  tr: {
    title: "Parolamı Unuttum",
    subtitle: "Parolanı sıfırlamak için e-postanı gir.",
    email: "E-posta",
    placeholder: "E-postanı gir",
    cta: "Sıfırlama bağlantısı gönder",
    sending: "Gönderiliyor...",
    sent: "Bu e-posta kayıtlıysa parola sıfırlama e-postası alacaksın.",
    back: "Girişe dön",
    termsPrefix: "Votxt'ı kullanarak",
    terms: "Hizmet Şartları",
    and: "ve",
    privacy: "Gizlilik Politikası",
    devResetHint: "E-posta gönderimi yapılandırılmadı, bu geliştirme sıfırlama bağlantısı yerel veya test ortamı için kullanılabilir.",
    openResetLink: "Sıfırlama bağlantısını aç",
    resetTitle: "Parolayı sıfırla",
    resetSubtitle: "Yeni Votxt parolanı gir.",
    confirmPassword: "Yeni parolayı onayla",
    resetCta: "Parolayı güncelle",
    resetting: "Güncelleniyor...",
    resetSuccess: "Parolan güncellendi. Panele devam edebilirsin.",
    resetInvalid: "Bu sıfırlama bağlantısı geçersiz veya süresi dolmuş.",
    mismatch: "Parolalar eşleşmiyor."
  },
  uk: {
    title: "Забули пароль",
    subtitle: "Введіть e-mail, щоб скинути пароль.",
    email: "E-mail",
    placeholder: "Введіть e-mail",
    cta: "Надіслати посилання скидання",
    sending: "Надсилання...",
    sent: "Якщо цей e-mail зареєстровано, ви отримаєте лист для скидання пароля.",
    back: "Повернутися до входу",
    termsPrefix: "Використовуючи Votxt, ви погоджуєтесь із",
    terms: "Умовами надання послуг",
    and: "та",
    privacy: "Політикою приватності",
    devResetHint: "Доставку e-mail не налаштовано, тому це посилання скидання доступне для локального або тестового середовища.",
    openResetLink: "Відкрити посилання скидання",
    resetTitle: "Скинути пароль",
    resetSubtitle: "Введіть новий пароль Votxt.",
    confirmPassword: "Підтвердьте новий пароль",
    resetCta: "Оновити пароль",
    resetting: "Оновлення...",
    resetSuccess: "Пароль оновлено. Можна перейти до панелі.",
    resetInvalid: "Це посилання скидання недійсне або протерміноване.",
    mismatch: "Паролі не збігаються."
  },
  vi: {
    title: "Quên mật khẩu",
    subtitle: "Nhập email để đặt lại mật khẩu.",
    email: "Email",
    placeholder: "Nhập email của bạn",
    cta: "Gửi liên kết đặt lại",
    sending: "Đang gửi...",
    sent: "Nếu email đó đã đăng ký, bạn sẽ nhận được email đặt lại mật khẩu.",
    back: "Quay lại đăng nhập",
    termsPrefix: "Khi dùng Votxt, bạn đồng ý với",
    terms: "Điều khoản dịch vụ",
    and: "và",
    privacy: "Chính sách quyền riêng tư",
    devResetHint: "Chưa cấu hình gửi email, nên liên kết đặt lại này dùng cho môi trường cục bộ hoặc thử nghiệm.",
    openResetLink: "Mở liên kết đặt lại",
    resetTitle: "Đặt lại mật khẩu",
    resetSubtitle: "Nhập mật khẩu Votxt mới.",
    confirmPassword: "Xác nhận mật khẩu mới",
    resetCta: "Cập nhật mật khẩu",
    resetting: "Đang cập nhật...",
    resetSuccess: "Mật khẩu của bạn đã được cập nhật. Bạn có thể tiếp tục tới dashboard.",
    resetInvalid: "Liên kết đặt lại này không hợp lệ hoặc đã hết hạn.",
    mismatch: "Mật khẩu không khớp."
  },
  "zh-TW": {
    title: "重設密碼",
    subtitle: "輸入你的帳號電子郵件，我們會傳送重設密碼連結。",
    email: "電子郵件",
    placeholder: "請輸入電子郵件",
    cta: "傳送重設連結",
    sending: "傳送中...",
    sent: "如果此電子郵件已註冊，你將收到密碼重設郵件。",
    back: "返回登入",
    termsPrefix: "使用 Votxt 即表示你同意我們的",
    terms: "服務條款",
    and: "和",
    privacy: "隱私權政策",
    devResetHint: "目前未設定郵件服務，下方開發重設連結可用於本機或測試環境。",
    openResetLink: "開啟重設連結",
    resetTitle: "設定新密碼",
    resetSubtitle: "輸入新的 Votxt 密碼。",
    confirmPassword: "確認新密碼",
    resetCta: "更新密碼",
    resetting: "更新中...",
    resetSuccess: "密碼已更新。你可以繼續前往儀表板。",
    resetInvalid: "此重設連結無效或已過期。",
    mismatch: "兩次輸入的密碼不一致。"
  }
} as const;

function getForgotCopy(locale: string) {
  return isLocale(locale) && locale in forgotCopy20 ? forgotCopy20[locale as keyof typeof forgotCopy20] : forgotCopy20.en;
}

function AuthLocaleControl({locale}: {locale: string}) {
  return (
    <div className="fixed right-4 top-4 z-40 w-36 sm:w-44">
      <WorkspaceLanguageSwitcher locale={locale} copy={getWorkspaceCopy(locale)} placement="below" />
    </div>
  );
}

async function createPasswordCredential(password: string, legacy = false) {
  const brand = legacy ? ["uni", "scribe"].join("") : "votxt";
  const bytes = new TextEncoder().encode(`${brand}-password-v1:${password}`);
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
    <main className="min-h-screen bg-white">
      <AuthLocaleControl locale={locale} />
      <section className="mx-auto grid min-h-screen w-[286px] content-center">
        <div className="animate-fade-up" style={{position: "relative", top: "-12px"}}>
          <div className="mb-10 flex justify-center">
            <a href={`/${locale}`} className="transition-opacity hover:opacity-90" aria-label="Votxt home">
              <BrandLogo alt="Votxt" className="h-[42px] w-[180px] object-contain" />
            </a>
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
    <div className="my-4 flex h-5 items-center gap-3 text-sm leading-5 text-[rgb(2,8,23)]">
      <span className="h-px flex-1 bg-slate-200" />
      {label}
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

function GoogleButton({locale, label, nextPath}: {locale: string; label: string; nextPath?: string | null}) {
  const nextParam = nextPath ? `&next=${encodeURIComponent(nextPath)}` : "";
  const oauthUrl = `/api/auth/google/start?locale=${locale}${nextParam}`;
  return (
    <button type="button" onClick={() => { window.location.href = oauthUrl; }} className="focus-ring mt-4 flex h-[52px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-md border-2 border-slate-200 bg-white px-4 py-6 text-base font-medium text-[rgb(2,8,23)] ring-offset-background transition-colors hover:bg-slate-50">
      <GoogleMark />
      {label}
    </button>
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
      <h1 className="text-center text-2xl font-semibold leading-8 text-[rgb(2,8,23)]">{text.signupTitle}</h1>
      <GoogleButton locale={locale} label={text.google} />
      <Divider label={text.signupDivider} />
      {step === "email" ? (
        <>
          <label className="block">
            <span className="block text-sm font-medium leading-5 text-[rgb(2,8,23)]">{text.email}</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="focus-ring mt-2 flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-5 text-[rgb(2,8,23)] outline-none"
              placeholder={text.email}
            />
          </label>
          <button type="button" onClick={() => setStep("profile")} disabled={!email.includes("@")} className="focus-ring mt-4 inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-violet px-4 py-2 text-sm font-medium text-white ring-offset-background transition-colors hover:bg-violet/90 disabled:cursor-not-allowed disabled:opacity-50">
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
      <p className="mt-4 text-center text-sm leading-5 text-slate-500">{text.already} <a className="text-violet hover:underline" href={`/${locale}/auth/signin`}>{text.signinLink}</a></p>
      <p className="mx-auto mt-4 max-w-[286px] text-center text-xs leading-4 text-slate-500">{text.termsPrefix} <a className="text-violet underline hover:text-violet/80" href={`/${locale}/terms-of-service`}>{text.terms}</a> {text.and} <a className="text-violet underline hover:text-violet/80" href={`/${locale}/privacy-policy`}>{text.privacy}</a>.</p>
    </div>
  );
}

export function VerifyEmailPage() {
  const locale = useLocale();
  const text = getAuthCopy(locale);
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "failed">("idle");
  const [message, setMessage] = useState<string>("");
  const [resendBusy, setResendBusy] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendUrl, setResendUrl] = useState<string | null>(null);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setStatus("idle");
      setMessage("");
      return;
    }

    setStatus("pending");
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

  async function resendVerification() {
    setResendBusy(true);
    setResendMessage(null);
    setResendUrl(null);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({locale})
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? text.verifyFailed);
      if (data.alreadyVerified) {
        setStatus("success");
        setResendMessage(text.verifyAlreadyDone);
      } else {
        setResendMessage(text.verifyResent);
        setResendUrl(data.verificationUrl ?? null);
      }
    } catch (cause) {
      setResendMessage(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setResendBusy(false);
    }
  }

  const isIdle = status === "idle";
  const title = isIdle ? text.verifyTitle : status === "pending" ? text.verifyPending : status === "success" ? text.verifySuccess : text.verifyFailed;
  const description = isIdle
    ? text.verifyPendingText
    : status === "success"
      ? text.verifySuccessText
      : status === "pending"
        ? text.verifyPendingText
        : message;

  return (
    <main className="grid min-h-screen place-items-center bg-white">
      <AuthLocaleControl locale={locale} />
      <section className="animate-fade-up h-[480px] w-[384px] rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto w-[286px]">
          <div className="flex justify-center">
            <a href={`/${locale}`} className="block transition-opacity hover:opacity-90" aria-label="Votxt home">
              <BrandLogo alt="Votxt" className="h-[42px] w-[180px] object-contain" />
            </a>
          </div>
          <Mail className="mx-auto mt-10 text-violet" size={48} />
          <h2 className="mt-4 text-2xl font-semibold leading-8 text-[rgb(2,8,23)]">{title}</h2>
          <p className="mt-4 text-sm font-normal leading-5 text-slate-500">{description}</p>
          {status === "success" ? (
            <a href={`/${locale}/dashboard`} className="focus-ring mt-4 inline-flex h-10 w-full items-center justify-center rounded-md bg-violet px-4 py-2 text-sm font-medium leading-5 text-white transition-colors hover:bg-violet/90">
              {text.goDashboard}
            </a>
          ) : (
            <>
              <button type="button" onClick={resendVerification} disabled={resendBusy} className="focus-ring mt-4 inline-flex h-10 w-full items-center justify-center rounded-md bg-violet px-4 py-2 text-sm font-medium leading-5 text-white transition-colors hover:bg-violet/90 disabled:cursor-not-allowed disabled:opacity-50">
                {text.resend}
              </button>
              <a href={`/${locale}/auth/signin`} className="focus-ring inline-flex h-10 w-full items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium leading-5 text-violet transition-colors hover:bg-slate-50">
                ← {text.backToSignin}
              </a>
            </>
          )}
          {resendMessage ? <p className="mt-3 text-sm font-normal leading-5 text-slate-500">{resendMessage}</p> : null}
          {resendUrl ? <a href={resendUrl} className="mt-2 block break-all text-sm leading-5 text-violet hover:underline">{text.openVerifyLink}</a> : null}
          <p className="mt-4 text-sm font-normal leading-5 text-slate-500">{text.missingEmail}</p>
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
    <main className="min-h-screen bg-white">
      <AuthLocaleControl locale={locale} />
      <section className="mx-auto grid min-h-screen w-[286px] content-center">
        <div className="animate-fade-up" style={{position: "relative", top: "-12px"}}>
          <div className="mb-10 flex justify-center">
            <a href={`/${locale}`} className="transition-opacity hover:opacity-90" aria-label="Votxt home">
              <BrandLogo alt="Votxt" className="h-[42px] w-[180px] object-contain" />
            </a>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold leading-8 text-[rgb(2,8,23)]">{text.title}</h1>
            <p className="mx-auto mt-2 text-base leading-6 text-[rgb(2,8,23)]">{text.subtitle}</p>
          </div>
          <form onSubmit={submit} className="mt-4">
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="focus-ring flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-5 text-[rgb(2,8,23)] outline-none" placeholder={text.email} required />
            {sent ? <p className="mt-4 rounded-md border border-violet/20 bg-violet/10 px-3 py-2 text-sm leading-5 text-violet">{text.sent}</p> : null}
            {resetUrl ? (
              <div className="mt-4 rounded-md border border-violet/20 bg-violet/5 p-3">
                <p className="text-sm leading-5 text-slate-600">{text.devResetHint}</p>
                <a href={resetUrl} className="mt-2 inline-flex break-all text-sm text-violet hover:underline">{text.openResetLink}</a>
              </div>
            ) : null}
            {error ? <p className="mt-4 rounded-md border border-coral/25 bg-coral/10 px-3 py-2 text-sm text-coral">{error}</p> : null}
            <button type="submit" disabled={busy || !email.includes("@")} className="focus-ring mt-4 inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-violet px-4 py-2 text-sm font-medium text-white ring-offset-background transition-colors hover:bg-violet/90 disabled:cursor-not-allowed disabled:opacity-50">
              {busy ? text.sending : text.cta}
            </button>
            <a className="mt-4 block text-center text-sm leading-5 text-violet hover:underline" href={`/${locale}/auth/signin`}>
              {text.back}
            </a>
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
    <main className="min-h-screen bg-white">
      <AuthLocaleControl locale={locale} />
      <section className="mx-auto grid min-h-screen w-[286px] content-center">
        <div className="animate-fade-up" style={{position: "relative", top: "-12px"}}>
          <div className="mb-10 flex justify-center">
            <a href={`/${locale}`} className="transition-opacity hover:opacity-90" aria-label="Votxt home">
              <BrandLogo alt="Votxt" className="h-[42px] w-[180px] object-contain" />
            </a>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold leading-8 text-[rgb(2,8,23)]">{text.resetTitle}</h1>
            <p className="mx-auto mt-2 text-base leading-6 text-[rgb(2,8,23)]">{text.resetSubtitle}</p>
          </div>
          <form onSubmit={submit} className="mt-4">
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="focus-ring flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-5 text-[rgb(2,8,23)] outline-none" placeholder={getAuthCopy(locale).password} required />
            <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="focus-ring mt-4 flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-5 text-[rgb(2,8,23)] outline-none" placeholder={text.confirmPassword} required />
            {message ? <p className={status === "success" ? "mt-4 rounded-md border border-violet/20 bg-violet/10 px-3 py-2 text-sm leading-5 text-violet" : "mt-4 rounded-md border border-coral/25 bg-coral/10 px-3 py-2 text-sm text-coral"}>{message}</p> : null}
            {status === "success" ? (
              <a href={`/${locale}/dashboard`} className="focus-ring mt-4 inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-violet px-4 py-2 text-sm font-medium text-white ring-offset-background transition-colors hover:bg-violet/90">
                {getAuthCopy(locale).goDashboard}
              </a>
            ) : (
              <button type="submit" disabled={busy || password.length < 8 || confirmPassword.length < 8} className="focus-ring mt-4 inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-violet px-4 py-2 text-sm font-medium text-white ring-offset-background transition-colors hover:bg-violet/90 disabled:cursor-not-allowed disabled:opacity-50">
                {busy ? text.resetting : text.resetCta}
              </button>
            )}
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
      const legacyPasswordCredential = await createPasswordCredential(password, true);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email: trimmedEmail, passwordCredential, legacyPasswordCredential, locale})
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
      <h1 className="mt-4 text-center text-2xl font-semibold leading-8 text-[rgb(2,8,23)]">{copy.title}</h1>
      <GoogleButton locale={locale} label={text.google} nextPath={nextPath} />
      <Divider label={text.signinDivider} />
      <label className="block pt-1">
        <span className="block text-sm font-medium leading-5 text-[rgb(2,8,23)]">{text.email}</span>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="focus-ring mt-2 flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-5 text-[rgb(2,8,23)] outline-none" placeholder={text.email} autoComplete="email" required />
      </label>
      <label className="mt-4 block pt-1">
        <span className="block text-sm font-medium leading-5 text-[rgb(2,8,23)]">{text.password}</span>
        <div className="mt-2 flex h-10 rounded-md border border-slate-200 bg-white">
          <input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} className="focus-ring min-w-0 flex-1 rounded-md px-3 py-2 pr-1 text-sm leading-5 outline-none" placeholder={text.passwordPlaceholder} autoComplete="current-password" required />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="focus-ring grid w-10 place-items-center text-slate-500" aria-label={text.togglePassword}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </label>
      {error ? <p className="mt-4 animate-fade-in rounded-lg border border-coral/30 bg-coral/10 px-3 py-2 text-sm font-bold text-coral">{error}</p> : null}
      <button disabled={busy || !canSubmit} className="focus-ring mt-4 inline-flex h-10 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-violet px-4 py-2 text-sm font-medium text-white ring-offset-background transition-colors hover:bg-violet/90 disabled:cursor-not-allowed disabled:opacity-50">
        {busy ? text.loginBusy : copy.cta}
      </button>
      <a className="mt-4 flex h-6 items-center justify-center text-center text-sm leading-[17px] text-violet hover:underline" href={`/${locale}/auth/forgot-password`}>{text.forgotPassword}</a>
      <p className="mt-4 text-center text-sm leading-5 text-slate-500">
        <a className="text-violet hover:underline" href={copy.switchHref}>{copy.switchText}</a>
      </p>
      <p className="mx-auto mt-4 max-w-[286px] text-center text-xs leading-4 text-slate-500">{text.termsPrefix} <a className="text-violet underline hover:text-violet/80" href={`/${locale}/terms-of-service`}>{text.terms}</a> {text.and} <a className="text-violet underline hover:text-violet/80" href={`/${locale}/privacy-policy`}>{text.privacy}</a>.</p>
    </form>
  );
}
