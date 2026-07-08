"use client";

import type {ReactNode} from "react";
import {useEffect, useMemo, useState} from "react";
import {useLocale} from "next-intl";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Cloud,
  Copy,
  CreditCard,
  Check,
  ChevronDown,
  Globe2,
  KeyRound,
  Languages,
  LockKeyhole,
  Mail,
  Pencil,
  Plus,
  RefreshCcw,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
  X
} from "lucide-react";
import clsx from "clsx";
import {PricingAction} from "@/components/pricing-actions";
import {getWorkspaceCopy} from "@/components/workspace/copy";
import {DashboardPricingOverlay} from "@/components/workspace/Workspace";
import {WorkspaceLanguageSwitcher, WorkspaceSidebar} from "@/components/workspace/sidebar";
import {isLocale, type Locale} from "@/lib/locales";
import type {CurrentUser, FolderItem, UsageSnapshot} from "@/components/workspace/types";

type DriveConnectionState = {
  connected: boolean;
  connection?: {
    email?: string | null;
    expiresAt?: string;
    updatedAt?: string;
  } | null;
};

type ApiKeyItem = {
  id: string;
  name: string;
  keyPrefix: string;
  status: string;
  lastUsedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
};

const tabs = [
  {id: "profile", icon: UserRound},
  {id: "security", icon: ShieldCheck},
  {id: "usage", icon: CreditCard},
  {id: "preferences", icon: Languages},
  {id: "api", icon: KeyRound},
  {id: "notifications", icon: Bell},
  {id: "integrations", icon: Cloud},
  {id: "danger", icon: AlertTriangle}
] as const;

type TabId = (typeof tabs)[number]["id"];
type SettingsAddonPack = "ADDON_BASIC" | "ADDON_STANDARD" | "ADDON_PRO";
type ApiKeyStatus = "ACTIVE" | "REVOKED";
type PreferenceOption = {
  label: string;
  description?: string;
  value?: string;
};

type SettingsCopy = {
  tabs: Record<TabId, string>;
  common: {
    addon: string;
    beta: string;
    buyNow: string;
    cancel: string;
    close: string;
    connect: string;
    connected: string;
    copy: string;
    delete: string;
    disconnect: string;
    disconnecting: string;
    folders: string;
    never: string;
    notConnected: string;
    notSet: string;
    opening: string;
    popular: string;
    save: string;
    saving: string;
    upgradePlan: string;
    uncategorized: string;
  };
  shell: {
    back: string;
    sectionsAria: string;
    subtitle: string;
    title: string;
  };
  profile: {
    avatarAlt: string;
    defaultUser: string;
    description: string;
    firstName: string;
    lastName: string;
    title: string;
    updated: string;
  };
  security: {
    changeEmailTitle: string;
    confirmPassword: string;
    currentEmail: (email: string) => string;
    description: string;
    emailPassword: string;
    emailPlaceholder: string;
    emailUpdated: string;
    googleSignIn: string;
    identityHint: string;
    linked: string;
    newPassword: string;
    noMethodsDescription: string;
    noMethodsTitle: string;
    openVerificationLink: string;
    passwordMismatch: string;
    passwordNotSet: string;
    passwordPending: string;
    passwordSet: string;
    passwordUpdated: string;
    setPassword: string;
    setPasswordDescription: string;
    setPasswordTitle: string;
    signInMethods: string;
    title: string;
    updateEmail: string;
  };
  usage: {
    billingPortalUnavailable: string;
    buyMoreDescription: string;
    buyMoreTitle: string;
    description: string;
    manageBilling: string;
    packs: Record<SettingsAddonPack, {description: string; name: string; quota: string}>;
    planNames: Record<"BASIC" | "FREE" | "PRO" | "STANDARD", string>;
    resetsOn: (date: string) => string;
    title: string;
    total: (value: number) => string;
    upgradeNow: string;
    used: (value: number) => string;
  };
  preferences: {
    description: string;
    interfaceLanguage: string;
    interfaceLanguageDescription: string;
    searchPlaceholder: string;
    timeZone: string;
    timeZoneDescription: string;
    timeZoneUpdated: string;
    title: string;
  };
  api: {
    actions: string;
    apiKeyCreated: string;
    apiKeyRenamed: string;
    apiKeyReset: string;
    apiKeyRevoked: string;
    apiTokenCopied: string;
    copyTokenNow: string;
    createApiKey: string;
    creating: string;
    description: string;
    fullKeyNotice: string;
    keyName: string;
    keyNamePlaceholder: string;
    loading: string;
    lockedDescription: string;
    lockedTitle: string;
    name: string;
    newToken: string;
    noKeysDescription: string;
    noKeysTitle: string;
    productionKeyDefault: string;
    renameAria: string;
    resetAria: string;
    revokeAria: string;
    status: string;
    statuses: Record<ApiKeyStatus, string>;
    title: string;
    viewDocs: string;
    createdLastUsed: (created: string, lastUsed: string) => string;
  };
  notifications: {
    description: string;
    productUpdatesDescription: string;
    productUpdatesTitle: string;
    quotaResetDescription: string;
    quotaResetTitle: string;
    successDescription: string;
    successTitle: string;
    title: string;
  };
  integrations: {
    connectedFallback: string;
    description: string;
    disconnected: string;
    disconnectError: string;
    driveDescription: string;
    driveName: string;
    title: string;
  };
  danger: {
    confirmationLabel: string;
    deleteAccount: string;
    deleteBullets: string[];
    deleteDescription: string;
    deleteFailed: string;
    dialogIntro: string;
    dialogTitle: string;
    title: string;
    typeDeletePlaceholder: string;
    warning: string;
  };
  apiDialogs: {
    renameDescription: (name: string) => string;
    renameTitle: string;
    resetDescription: (name: string) => string;
    resetTitle: string;
    revokeDescription: (name: string) => string;
    revokeTitle: string;
  };
  errors: {
    createApiKey: string;
    createFolder: string;
    deleteFolder: string;
    renameApiKey: string;
    renameFolder: string;
    resetApiKey: string;
    revokeApiKey: string;
    updateAccount: string;
    updateLanguage: string;
  };
};

type DeepPartial<T> = {
  [Key in keyof T]?: T[Key] extends (...args: any[]) => unknown
    ? T[Key]
    : T[Key] extends Array<infer Item>
      ? Array<Item>
      : T[Key] extends object
        ? DeepPartial<T[Key]>
        : T[Key];
};

const usageAddonPacks: Array<{
  addon: SettingsAddonPack;
  price: string;
  highlight?: boolean;
}> = [
  {addon: "ADDON_BASIC", price: "$10"},
  {addon: "ADDON_STANDARD", price: "$15", highlight: true},
  {addon: "ADDON_PRO", price: "$20"}
];

const languageOptions: PreferenceOption[] = [
  {label: "English", value: "en"},
  {label: "Bahasa Indonesia", description: "Indonesia", value: "id"},
  {label: "Русский", description: "Россия", value: "ru"},
  {label: "Español", description: "España", value: "es"},
  {label: "Tiếng Việt", description: "Việt Nam", value: "vi"},
  {label: "العربية", description: "العالم العربي", value: "ar"},
  {label: "Português", description: "Portugal / Brasil", value: "pt"},
  {label: "Français", description: "France", value: "fr"},
  {label: "简体中文", description: "中国大陆", value: "zh"},
  {label: "繁體中文", description: "台灣 / 香港", value: "zh-TW"},
  {label: "Deutsch", description: "Deutschland", value: "de"},
  {label: "Italiano", description: "Italia", value: "it"},
  {label: "ไทย", description: "ประเทศไทย", value: "th"},
  {label: "Українська", description: "Україна", value: "uk"},
  {label: "Türkçe", description: "Türkiye", value: "tr"},
  {label: "日本語", description: "日本", value: "ja"},
  {label: "Nederlands", description: "Nederland", value: "nl"},
  {label: "Polski", description: "Polska", value: "pl"},
  {label: "한국어", description: "대한민국", value: "ko"},
  {label: "Magyar", description: "Magyarország", value: "hu"}
];

function safeTimeZoneOptions(): PreferenceOption[] {
  if (typeof Intl.supportedValuesOf === "function") {
    return Intl.supportedValuesOf("timeZone").map((zone) => ({label: zone.replace(/_/g, " "), value: zone}));
  }
  return [
    "Africa/Abidjan",
    "America/New York",
    "America/Los Angeles",
    "Asia/Hong Kong",
    "Asia/Shanghai",
    "Asia/Singapore",
    "Asia/Tokyo",
    "Australia/Sydney",
    "Europe/Berlin",
    "Europe/London",
    "Europe/Paris",
    "Pacific/Auckland"
  ].map((zone) => ({label: zone.replace(/_/g, " "), value: zone}));
}

const timeZoneOptions = safeTimeZoneOptions();

const settingsCopyEn: SettingsCopy = {
  tabs: {
    profile: "Profile",
    security: "Account Security",
    usage: "Usage",
    preferences: "Preferences",
    api: "API Keys",
    notifications: "Notifications",
    integrations: "Integrations",
    danger: "Danger Zone"
  },
  common: {
    addon: "Add-on",
    beta: "Beta",
    buyNow: "Buy now",
    cancel: "Cancel",
    close: "Close",
    connect: "Connect",
    connected: "Connected",
    copy: "Copy",
    delete: "Delete",
    disconnect: "Disconnect",
    disconnecting: "Disconnecting...",
    folders: "Folders",
    never: "Never",
    notConnected: "Not Connected",
    notSet: "Not set",
    opening: "Opening...",
    popular: "Popular",
    save: "Save",
    saving: "Saving...",
    upgradePlan: "Upgrade Plan",
    uncategorized: "Uncategorized"
  },
  shell: {
    back: "Back",
    sectionsAria: "Settings sections",
    subtitle: "Manage your account settings and preferences",
    title: "Settings"
  },
  profile: {
    avatarAlt: "Avatar",
    defaultUser: "Votxt user",
    description: "Manage your personal information",
    firstName: "First Name",
    lastName: "Last Name",
    title: "Profile",
    updated: "Profile has been updated."
  },
  security: {
    changeEmailTitle: "Change Email Login Address",
    confirmPassword: "Confirm Password",
    currentEmail: (email) => `Current email login address: ${email}`,
    description: "Manage your sign-in methods, email, and password security.",
    emailPassword: "Email + Password",
    emailPlaceholder: "Enter a new email login address",
    emailUpdated: "Email login address has been updated. Please verify the new address.",
    googleSignIn: "Google Sign-In",
    identityHint: "Google email is managed by Google. Email login address is managed here.",
    linked: "Linked",
    newPassword: "New Password",
    noMethodsDescription: "Please refresh this page or add an email login address below.",
    noMethodsTitle: "No sign-in methods detected.",
    openVerificationLink: "Open verification link",
    passwordMismatch: "Passwords do not match.",
    passwordNotSet: "Password not set",
    passwordPending: "Email identity is linked, but password is not set yet.",
    passwordSet: "Password set",
    passwordUpdated: "Password has been updated.",
    setPassword: "Set Password",
    setPasswordDescription: "Set a password to complete email login setup.",
    setPasswordTitle: "Set or Change Password",
    signInMethods: "Sign-in methods",
    title: "Account Security",
    updateEmail: "Update Email"
  },
  usage: {
    billingPortalUnavailable: "Billing portal is available after a paid subscription is connected.",
    buyMoreDescription: "Add-on minutes are credited to your active plan after checkout.",
    buyMoreTitle: "Buy more transcription minutes",
    description: "View your account usage and remaining credits",
    manageBilling: "Manage Billing",
    packs: {
      ADDON_BASIC: {description: "A focused top-up for smaller overflow work.", name: "Basic", quota: "500 extra minutes"},
      ADDON_STANDARD: {description: "Best value for regular paid-account overages.", name: "Standard", quota: "1000 extra minutes"},
      ADDON_PRO: {description: "High-volume minutes for intense project bursts.", name: "Pro", quota: "3000 extra minutes"}
    },
    planNames: {
      BASIC: "Basic",
      FREE: "Free",
      PRO: "Pro",
      STANDARD: "Standard"
    },
    resetsOn: (date) => `Resets on ${date}`,
    title: "Usage",
    total: (value) => `Total: ${value}`,
    upgradeNow: "Upgrade Now",
    used: (value) => `Used: ${value}`
  },
  preferences: {
    description: "Manage your application preferences",
    interfaceLanguage: "Interface Language",
    interfaceLanguageDescription: "Choose your preferred language for the application interface",
    searchPlaceholder: "Search",
    timeZone: "Time Zone",
    timeZoneDescription: "Select your time zone",
    timeZoneUpdated: "Time zone preference has been updated.",
    title: "Preferences"
  },
  api: {
    actions: "Actions",
    apiKeyCreated: "API key created. Copy the token now because it will only be shown once.",
    apiKeyRenamed: "API key renamed.",
    apiKeyReset: "API key reset. Copy the new token now because it will only be shown once.",
    apiKeyRevoked: "API key revoked.",
    apiTokenCopied: "API token copied.",
    copyTokenNow: "Copy this token now. It will not be shown again.",
    createApiKey: "Create API Key",
    creating: "Creating...",
    description: "Manage your API keys for accessing the Votxt API",
    fullKeyNotice: "Full API keys are shown once after creation or reset. Store the token securely before leaving this page.",
    keyName: "Key Name",
    keyNamePlaceholder: "Production API Key",
    loading: "Loading API keys...",
    lockedDescription: "Upgrade your plan to access API management features",
    lockedTitle: "API access requires an active subscription or LTD plan",
    name: "Name",
    newToken: "New API token",
    noKeysDescription: "Create a key to connect automation clients to the Votxt API.",
    noKeysTitle: "No API keys yet",
    productionKeyDefault: "Default API Key",
    renameAria: "Rename API key",
    resetAria: "Reset API key",
    revokeAria: "Revoke API key",
    status: "Status",
    statuses: {
      ACTIVE: "Active",
      REVOKED: "Revoked"
    },
    title: "API Key Management",
    viewDocs: "View API Documentation",
    createdLastUsed: (created, lastUsed) => `Created ${created} · Last used ${lastUsed}`
  },
  notifications: {
    description: "Manage your email notification preferences",
    productUpdatesDescription: "Receive notifications about product updates and new features",
    productUpdatesTitle: "Product Updates and New Features",
    quotaResetDescription: "Receive notifications when your transcription quota is reset",
    quotaResetTitle: "Transcription Quota Reset Notifications",
    successDescription: "Receive notifications when your audio transcription is complete",
    successTitle: "Transcription Success Notifications",
    title: "Email Notifications"
  },
  integrations: {
    connectedFallback: "Google Drive connected",
    description: "Manage your connections with third-party cloud storage and services",
    disconnected: "Google Drive disconnected.",
    disconnectError: "Unable to disconnect Google Drive.",
    driveDescription: "Import audio and video files directly from your Google Drive.",
    driveName: "Google Drive",
    title: "Integrations"
  },
  danger: {
    confirmationLabel: "To confirm, type DELETE below:",
    deleteAccount: "Delete Account",
    deleteBullets: [
      "All your data will be permanently deleted",
      "You will lose access to all your transcriptions",
      "Your subscription will be canceled (if applicable)",
      "Your account cannot be recovered",
      "Your email will no longer be able to create a new account"
    ],
    deleteDescription: "Permanently delete your account and all data",
    deleteFailed: "Unable to delete account.",
    dialogIntro: "Are you sure you want to delete your account? This action cannot be undone.",
    dialogTitle: "Delete Account",
    title: "Danger Zone",
    typeDeletePlaceholder: "Type DELETE here",
    warning: "Actions that cannot be undone"
  },
  apiDialogs: {
    renameDescription: (name) => `Enter a new name for "${name}".`,
    renameTitle: "Rename API Key",
    resetDescription: (name) => `Reset "${name}"? Existing clients using the old token will stop working.`,
    resetTitle: "Reset API Key",
    revokeDescription: (name) => `Revoke "${name}"? This cannot be undone.`,
    revokeTitle: "Revoke API Key"
  },
  errors: {
    createApiKey: "Unable to create API key.",
    createFolder: "Unable to create folder.",
    deleteFolder: "Unable to delete folder.",
    renameApiKey: "Unable to rename API key.",
    renameFolder: "Unable to rename folder.",
    resetApiKey: "Unable to reset API key.",
    revokeApiKey: "Unable to revoke API key.",
    updateAccount: "Unable to update account settings.",
    updateLanguage: "Unable to update interface language."
  }
};

const settingsCopyOverrides: Record<Locale, DeepPartial<SettingsCopy>> = {
  en: {},
  id: {
    tabs: {profile: "Profil", security: "Keamanan Akun", usage: "Pemakaian", preferences: "Preferensi", api: "Kunci API", notifications: "Notifikasi", integrations: "Integrasi", danger: "Zona Berbahaya"},
    common: {cancel: "Batal", close: "Tutup", connect: "Hubungkan", connected: "Terhubung", copy: "Salin", delete: "Hapus", disconnect: "Putuskan", disconnecting: "Memutuskan...", never: "Tidak pernah", notConnected: "Belum terhubung", notSet: "Belum diatur", opening: "Membuka...", popular: "Populer", save: "Simpan", saving: "Menyimpan...", upgradePlan: "Tingkatkan Paket"},
    shell: {back: "Kembali", sectionsAria: "Bagian pengaturan", subtitle: "Kelola pengaturan dan preferensi akun Anda", title: "Pengaturan"},
    profile: {description: "Kelola informasi pribadi Anda", firstName: "Nama depan", lastName: "Nama belakang", title: "Profil", updated: "Profil telah diperbarui."},
    security: {description: "Kelola metode masuk, email, dan keamanan kata sandi.", title: "Keamanan Akun"},
    usage: {description: "Lihat pemakaian akun dan kredit tersisa", title: "Pemakaian"},
    preferences: {description: "Kelola preferensi aplikasi Anda", interfaceLanguage: "Bahasa Antarmuka", timeZone: "Zona Waktu", title: "Preferensi"},
    api: {title: "Manajemen Kunci API"},
    notifications: {description: "Kelola preferensi notifikasi email Anda", title: "Notifikasi Email"},
    integrations: {title: "Integrasi"},
    danger: {deleteAccount: "Hapus Akun", title: "Zona Berbahaya", warning: "Tindakan yang tidak dapat dibatalkan"}
  },
  ru: {
    tabs: {profile: "Профиль", security: "Безопасность аккаунта", usage: "Использование", preferences: "Настройки", api: "API-ключи", notifications: "Уведомления", integrations: "Интеграции", danger: "Опасная зона"},
    common: {cancel: "Отмена", close: "Закрыть", connect: "Подключить", connected: "Подключено", copy: "Копировать", delete: "Удалить", disconnect: "Отключить", disconnecting: "Отключение...", never: "Никогда", notConnected: "Не подключено", notSet: "Не задано", opening: "Открытие...", popular: "Популярно", save: "Сохранить", saving: "Сохранение...", upgradePlan: "Обновить план"},
    shell: {back: "Назад", sectionsAria: "Разделы настроек", subtitle: "Управляйте настройками и предпочтениями аккаунта", title: "Настройки"},
    profile: {description: "Управляйте личной информацией", firstName: "Имя", lastName: "Фамилия", title: "Профиль", updated: "Профиль обновлен."},
    security: {description: "Управляйте способами входа, email и паролем.", title: "Безопасность аккаунта"},
    usage: {description: "Просматривайте использование аккаунта и остаток кредитов", title: "Использование"},
    preferences: {description: "Управляйте предпочтениями приложения", interfaceLanguage: "Язык интерфейса", timeZone: "Часовой пояс", title: "Настройки"},
    api: {title: "Управление API-ключами"},
    notifications: {description: "Управляйте email-уведомлениями", title: "Email-уведомления"},
    integrations: {title: "Интеграции"},
    danger: {deleteAccount: "Удалить аккаунт", title: "Опасная зона", warning: "Действия, которые нельзя отменить"}
  },
  es: {
    tabs: {profile: "Perfil", security: "Seguridad de la cuenta", usage: "Uso", preferences: "Preferencias", api: "Claves API", notifications: "Notificaciones", integrations: "Integraciones", danger: "Zona de peligro"},
    common: {cancel: "Cancelar", close: "Cerrar", connect: "Conectar", connected: "Conectado", copy: "Copiar", delete: "Eliminar", disconnect: "Desconectar", disconnecting: "Desconectando...", never: "Nunca", notConnected: "No conectado", notSet: "No configurado", opening: "Abriendo...", popular: "Popular", save: "Guardar", saving: "Guardando...", upgradePlan: "Mejorar plan"},
    shell: {back: "Atrás", sectionsAria: "Secciones de configuración", subtitle: "Gestiona la configuración y preferencias de tu cuenta", title: "Configuración"},
    profile: {description: "Gestiona tu información personal", firstName: "Nombre", lastName: "Apellido", title: "Perfil", updated: "El perfil se ha actualizado."},
    security: {description: "Gestiona métodos de inicio de sesión, email y contraseña.", title: "Seguridad de la cuenta"},
    usage: {description: "Consulta el uso de tu cuenta y los créditos restantes", title: "Uso"},
    preferences: {description: "Gestiona las preferencias de la aplicación", interfaceLanguage: "Idioma de la interfaz", timeZone: "Zona horaria", title: "Preferencias"},
    api: {title: "Gestión de claves API"},
    notifications: {description: "Gestiona tus preferencias de notificaciones por email", title: "Notificaciones por email"},
    integrations: {title: "Integraciones"},
    danger: {deleteAccount: "Eliminar cuenta", title: "Zona de peligro", warning: "Acciones que no se pueden deshacer"}
  },
  vi: {
    tabs: {profile: "Hồ sơ", security: "Bảo mật tài khoản", usage: "Sử dụng", preferences: "Tùy chọn", api: "Khóa API", notifications: "Thông báo", integrations: "Tích hợp", danger: "Vùng nguy hiểm"},
    common: {cancel: "Hủy", close: "Đóng", connect: "Kết nối", connected: "Đã kết nối", copy: "Sao chép", delete: "Xóa", disconnect: "Ngắt kết nối", disconnecting: "Đang ngắt...", never: "Chưa bao giờ", notConnected: "Chưa kết nối", notSet: "Chưa đặt", opening: "Đang mở...", popular: "Phổ biến", save: "Lưu", saving: "Đang lưu...", upgradePlan: "Nâng cấp gói"},
    shell: {back: "Quay lại", sectionsAria: "Các mục cài đặt", subtitle: "Quản lý cài đặt và tùy chọn tài khoản", title: "Cài đặt"},
    profile: {description: "Quản lý thông tin cá nhân", firstName: "Tên", lastName: "Họ", title: "Hồ sơ", updated: "Hồ sơ đã được cập nhật."},
    security: {description: "Quản lý phương thức đăng nhập, email và mật khẩu.", title: "Bảo mật tài khoản"},
    usage: {description: "Xem mức sử dụng tài khoản và tín dụng còn lại", title: "Sử dụng"},
    preferences: {description: "Quản lý tùy chọn ứng dụng", interfaceLanguage: "Ngôn ngữ giao diện", timeZone: "Múi giờ", title: "Tùy chọn"},
    api: {title: "Quản lý khóa API"},
    notifications: {description: "Quản lý tùy chọn thông báo email", title: "Thông báo email"},
    integrations: {title: "Tích hợp"},
    danger: {deleteAccount: "Xóa tài khoản", title: "Vùng nguy hiểm", warning: "Các hành động không thể hoàn tác"}
  },
  ar: {
    tabs: {profile: "الملف الشخصي", security: "أمان الحساب", usage: "الاستخدام", preferences: "التفضيلات", api: "مفاتيح API", notifications: "الإشعارات", integrations: "التكاملات", danger: "منطقة الخطر"},
    common: {cancel: "إلغاء", close: "إغلاق", connect: "اتصال", connected: "متصل", copy: "نسخ", delete: "حذف", disconnect: "قطع الاتصال", disconnecting: "جار قطع الاتصال...", never: "أبدًا", notConnected: "غير متصل", notSet: "غير محدد", opening: "جار الفتح...", popular: "شائع", save: "حفظ", saving: "جار الحفظ...", upgradePlan: "ترقية الخطة"},
    shell: {back: "رجوع", sectionsAria: "أقسام الإعدادات", subtitle: "إدارة إعدادات الحساب والتفضيلات", title: "الإعدادات"},
    profile: {description: "إدارة معلوماتك الشخصية", firstName: "الاسم الأول", lastName: "اسم العائلة", title: "الملف الشخصي", updated: "تم تحديث الملف الشخصي."},
    security: {description: "إدارة طرق تسجيل الدخول والبريد وكلمة المرور.", title: "أمان الحساب"},
    usage: {description: "عرض استخدام الحساب والرصيد المتبقي", title: "الاستخدام"},
    preferences: {description: "إدارة تفضيلات التطبيق", interfaceLanguage: "لغة الواجهة", timeZone: "المنطقة الزمنية", title: "التفضيلات"},
    api: {title: "إدارة مفاتيح API"},
    notifications: {description: "إدارة تفضيلات إشعارات البريد", title: "إشعارات البريد"},
    integrations: {title: "التكاملات"},
    danger: {deleteAccount: "حذف الحساب", title: "منطقة الخطر", warning: "إجراءات لا يمكن التراجع عنها"}
  },
  pt: {
    tabs: {profile: "Perfil", security: "Segurança da conta", usage: "Uso", preferences: "Preferências", api: "Chaves de API", notifications: "Notificações", integrations: "Integrações", danger: "Zona de perigo"},
    common: {cancel: "Cancelar", close: "Fechar", connect: "Conectar", connected: "Conectado", copy: "Copiar", delete: "Excluir", disconnect: "Desconectar", disconnecting: "Desconectando...", never: "Nunca", notConnected: "Não conectado", notSet: "Não definido", opening: "Abrindo...", popular: "Popular", save: "Salvar", saving: "Salvando...", upgradePlan: "Atualizar plano"},
    shell: {back: "Voltar", sectionsAria: "Seções de configurações", subtitle: "Gerencie as configurações e preferências da sua conta", title: "Configurações"},
    profile: {description: "Gerencie suas informações pessoais", firstName: "Nome", lastName: "Sobrenome", title: "Perfil", updated: "Perfil atualizado."},
    security: {description: "Gerencie métodos de login, email e senha.", title: "Segurança da conta"},
    usage: {description: "Veja o uso da conta e créditos restantes", title: "Uso"},
    preferences: {description: "Gerencie as preferências do aplicativo", interfaceLanguage: "Idioma da interface", timeZone: "Fuso horário", title: "Preferências"},
    api: {title: "Gerenciamento de chaves API"},
    notifications: {description: "Gerencie as preferências de notificações por email", title: "Notificações por email"},
    integrations: {title: "Integrações"},
    danger: {deleteAccount: "Excluir conta", title: "Zona de perigo", warning: "Ações que não podem ser desfeitas"}
  },
  fr: {
    tabs: {profile: "Profil", security: "Sécurité du compte", usage: "Utilisation", preferences: "Préférences", api: "Clés API", notifications: "Notifications", integrations: "Intégrations", danger: "Zone dangereuse"},
    common: {cancel: "Annuler", close: "Fermer", connect: "Connecter", connected: "Connecté", copy: "Copier", delete: "Supprimer", disconnect: "Déconnecter", disconnecting: "Déconnexion...", never: "Jamais", notConnected: "Non connecté", notSet: "Non défini", opening: "Ouverture...", popular: "Populaire", save: "Enregistrer", saving: "Enregistrement...", upgradePlan: "Changer de plan"},
    shell: {back: "Retour", sectionsAria: "Sections des paramètres", subtitle: "Gérez les paramètres et préférences de votre compte", title: "Paramètres"},
    profile: {description: "Gérez vos informations personnelles", firstName: "Prénom", lastName: "Nom", title: "Profil", updated: "Le profil a été mis à jour."},
    security: {description: "Gérez vos méthodes de connexion, email et mot de passe.", title: "Sécurité du compte"},
    usage: {description: "Consultez l'utilisation du compte et les crédits restants", title: "Utilisation"},
    preferences: {description: "Gérez les préférences de l'application", interfaceLanguage: "Langue de l'interface", timeZone: "Fuseau horaire", title: "Préférences"},
    api: {title: "Gestion des clés API"},
    notifications: {description: "Gérez vos préférences de notifications email", title: "Notifications email"},
    integrations: {title: "Intégrations"},
    danger: {deleteAccount: "Supprimer le compte", title: "Zone dangereuse", warning: "Actions irréversibles"}
  },
  zh: {
    tabs: {profile: "个人资料", security: "账号安全", usage: "用量", preferences: "偏好设置", api: "API 密钥", notifications: "通知", integrations: "集成", danger: "危险区域"},
    common: {addon: "加购包", beta: "Beta", buyNow: "立即购买", cancel: "取消", close: "关闭", connect: "连接", connected: "已连接", copy: "复制", delete: "删除", disconnect: "断开连接", disconnecting: "正在断开...", never: "从未", notConnected: "未连接", notSet: "未设置", opening: "正在打开...", popular: "热门", save: "保存", saving: "保存中...", upgradePlan: "升级套餐"},
    shell: {back: "返回", sectionsAria: "设置分区", subtitle: "管理你的账号设置和偏好", title: "设置"},
    profile: {avatarAlt: "头像", defaultUser: "Votxt 用户", description: "管理你的个人信息", firstName: "名", lastName: "姓", title: "个人资料", updated: "个人资料已更新。"},
    security: {description: "管理登录方式、邮箱和密码安全。", title: "账号安全"},
    usage: {description: "查看账号用量和剩余额度", title: "用量"},
    preferences: {description: "管理应用偏好", interfaceLanguage: "界面语言", timeZone: "时区", title: "偏好设置"},
    api: {title: "API 密钥管理"},
    notifications: {description: "管理邮件通知偏好", title: "邮件通知"},
    integrations: {connectedFallback: "Google Drive 已连接", disconnected: "Google Drive 已断开。", driveDescription: "直接从 Google Drive 导入音频和视频文件。", title: "集成"},
    danger: {deleteAccount: "删除账号", title: "危险区域", warning: "无法撤销的操作"}
  },
  "zh-TW": {
    tabs: {profile: "個人資料", security: "帳號安全", usage: "用量", preferences: "偏好設定", api: "API 金鑰", notifications: "通知", integrations: "整合", danger: "危險區域"},
    common: {addon: "加購包", buyNow: "立即購買", cancel: "取消", close: "關閉", connect: "連接", connected: "已連接", copy: "複製", delete: "刪除", disconnect: "中斷連接", disconnecting: "正在中斷...", never: "從未", notConnected: "未連接", notSet: "未設定", opening: "正在開啟...", popular: "熱門", save: "儲存", saving: "儲存中...", upgradePlan: "升級方案"},
    shell: {back: "返回", sectionsAria: "設定區段", subtitle: "管理你的帳號設定和偏好", title: "設定"},
    profile: {avatarAlt: "頭像", defaultUser: "Votxt 使用者", description: "管理你的個人資訊", firstName: "名字", lastName: "姓氏", title: "個人資料", updated: "個人資料已更新。"},
    security: {description: "管理登入方式、電子郵件和密碼安全。", title: "帳號安全"},
    usage: {description: "查看帳號用量和剩餘額度", title: "用量"},
    preferences: {description: "管理應用程式偏好", interfaceLanguage: "介面語言", timeZone: "時區", title: "偏好設定"},
    api: {title: "API 金鑰管理"},
    notifications: {description: "管理電子郵件通知偏好", title: "電子郵件通知"},
    integrations: {title: "整合"},
    danger: {deleteAccount: "刪除帳號", title: "危險區域", warning: "無法復原的操作"}
  },
  de: {
    tabs: {profile: "Profil", security: "Kontosicherheit", usage: "Nutzung", preferences: "Einstellungen", api: "API-Schlüssel", notifications: "Benachrichtigungen", integrations: "Integrationen", danger: "Gefahrenzone"},
    common: {cancel: "Abbrechen", close: "Schließen", connect: "Verbinden", connected: "Verbunden", copy: "Kopieren", delete: "Löschen", disconnect: "Trennen", disconnecting: "Trennen...", never: "Nie", notConnected: "Nicht verbunden", notSet: "Nicht festgelegt", opening: "Wird geöffnet...", popular: "Beliebt", save: "Speichern", saving: "Speichern...", upgradePlan: "Plan upgraden"},
    shell: {back: "Zurück", sectionsAria: "Einstellungsbereiche", subtitle: "Kontoeinstellungen und Präferenzen verwalten", title: "Einstellungen"},
    profile: {description: "Persönliche Informationen verwalten", firstName: "Vorname", lastName: "Nachname", title: "Profil", updated: "Profil wurde aktualisiert."},
    security: {description: "Anmeldemethoden, E-Mail und Passwortsicherheit verwalten.", title: "Kontosicherheit"},
    usage: {description: "Kontonutzung und verbleibende Credits ansehen", title: "Nutzung"},
    preferences: {description: "App-Einstellungen verwalten", interfaceLanguage: "Oberflächensprache", timeZone: "Zeitzone", title: "Einstellungen"},
    api: {title: "API-Schlüsselverwaltung"},
    notifications: {description: "E-Mail-Benachrichtigungen verwalten", title: "E-Mail-Benachrichtigungen"},
    integrations: {title: "Integrationen"},
    danger: {deleteAccount: "Konto löschen", title: "Gefahrenzone", warning: "Aktionen, die nicht rückgängig gemacht werden können"}
  },
  it: {
    tabs: {profile: "Profilo", security: "Sicurezza account", usage: "Utilizzo", preferences: "Preferenze", api: "Chiavi API", notifications: "Notifiche", integrations: "Integrazioni", danger: "Zona pericolosa"},
    common: {cancel: "Annulla", close: "Chiudi", connect: "Connetti", connected: "Connesso", copy: "Copia", delete: "Elimina", disconnect: "Disconnetti", disconnecting: "Disconnessione...", never: "Mai", notConnected: "Non connesso", notSet: "Non impostato", opening: "Apertura...", popular: "Popolare", save: "Salva", saving: "Salvataggio...", upgradePlan: "Aggiorna piano"},
    shell: {back: "Indietro", sectionsAria: "Sezioni impostazioni", subtitle: "Gestisci impostazioni e preferenze dell'account", title: "Impostazioni"},
    profile: {description: "Gestisci le tue informazioni personali", firstName: "Nome", lastName: "Cognome", title: "Profilo", updated: "Profilo aggiornato."},
    security: {description: "Gestisci metodi di accesso, email e password.", title: "Sicurezza account"},
    usage: {description: "Visualizza utilizzo account e crediti rimanenti", title: "Utilizzo"},
    preferences: {description: "Gestisci le preferenze dell'applicazione", interfaceLanguage: "Lingua interfaccia", timeZone: "Fuso orario", title: "Preferenze"},
    api: {title: "Gestione chiavi API"},
    notifications: {description: "Gestisci le preferenze delle notifiche email", title: "Notifiche email"},
    integrations: {title: "Integrazioni"},
    danger: {deleteAccount: "Elimina account", title: "Zona pericolosa", warning: "Azioni che non possono essere annullate"}
  },
  th: {
    tabs: {profile: "โปรไฟล์", security: "ความปลอดภัยบัญชี", usage: "การใช้งาน", preferences: "การตั้งค่า", api: "คีย์ API", notifications: "การแจ้งเตือน", integrations: "การเชื่อมต่อ", danger: "โซนอันตราย"},
    common: {cancel: "ยกเลิก", close: "ปิด", connect: "เชื่อมต่อ", connected: "เชื่อมต่อแล้ว", copy: "คัดลอก", delete: "ลบ", disconnect: "ตัดการเชื่อมต่อ", disconnecting: "กำลังตัดการเชื่อมต่อ...", never: "ไม่เคย", notConnected: "ยังไม่เชื่อมต่อ", notSet: "ยังไม่ได้ตั้งค่า", opening: "กำลังเปิด...", popular: "ยอดนิยม", save: "บันทึก", saving: "กำลังบันทึก...", upgradePlan: "อัปเกรดแพ็กเกจ"},
    shell: {back: "กลับ", sectionsAria: "ส่วนการตั้งค่า", subtitle: "จัดการการตั้งค่าและความชอบของบัญชี", title: "การตั้งค่า"},
    profile: {description: "จัดการข้อมูลส่วนตัว", firstName: "ชื่อ", lastName: "นามสกุล", title: "โปรไฟล์", updated: "อัปเดตโปรไฟล์แล้ว"},
    security: {description: "จัดการวิธีเข้าสู่ระบบ อีเมล และรหัสผ่าน", title: "ความปลอดภัยบัญชี"},
    usage: {description: "ดูการใช้งานบัญชีและเครดิตที่เหลือ", title: "การใช้งาน"},
    preferences: {description: "จัดการการตั้งค่าแอป", interfaceLanguage: "ภาษาอินเทอร์เฟซ", timeZone: "เขตเวลา", title: "การตั้งค่า"},
    api: {title: "การจัดการคีย์ API"},
    notifications: {description: "จัดการการแจ้งเตือนทางอีเมล", title: "การแจ้งเตือนอีเมล"},
    integrations: {title: "การเชื่อมต่อ"},
    danger: {deleteAccount: "ลบบัญชี", title: "โซนอันตราย", warning: "การดำเนินการที่ย้อนกลับไม่ได้"}
  },
  uk: {
    tabs: {profile: "Профіль", security: "Безпека акаунта", usage: "Використання", preferences: "Налаштування", api: "API-ключі", notifications: "Сповіщення", integrations: "Інтеграції", danger: "Небезпечна зона"},
    common: {cancel: "Скасувати", close: "Закрити", connect: "Підключити", connected: "Підключено", copy: "Копіювати", delete: "Видалити", disconnect: "Відключити", disconnecting: "Відключення...", never: "Ніколи", notConnected: "Не підключено", notSet: "Не задано", opening: "Відкриття...", popular: "Популярне", save: "Зберегти", saving: "Збереження...", upgradePlan: "Оновити план"},
    shell: {back: "Назад", sectionsAria: "Розділи налаштувань", subtitle: "Керуйте налаштуваннями та вподобаннями акаунта", title: "Налаштування"},
    profile: {description: "Керуйте особистою інформацією", firstName: "Ім'я", lastName: "Прізвище", title: "Профіль", updated: "Профіль оновлено."},
    security: {description: "Керуйте способами входу, email і паролем.", title: "Безпека акаунта"},
    usage: {description: "Переглядайте використання акаунта та залишок кредитів", title: "Використання"},
    preferences: {description: "Керуйте налаштуваннями застосунку", interfaceLanguage: "Мова інтерфейсу", timeZone: "Часовий пояс", title: "Налаштування"},
    api: {title: "Керування API-ключами"},
    notifications: {description: "Керуйте email-сповіщеннями", title: "Email-сповіщення"},
    integrations: {title: "Інтеграції"},
    danger: {deleteAccount: "Видалити акаунт", title: "Небезпечна зона", warning: "Дії, які не можна скасувати"}
  },
  tr: {
    tabs: {profile: "Profil", security: "Hesap Güvenliği", usage: "Kullanım", preferences: "Tercihler", api: "API Anahtarları", notifications: "Bildirimler", integrations: "Entegrasyonlar", danger: "Tehlikeli Alan"},
    common: {cancel: "İptal", close: "Kapat", connect: "Bağlan", connected: "Bağlı", copy: "Kopyala", delete: "Sil", disconnect: "Bağlantıyı kes", disconnecting: "Bağlantı kesiliyor...", never: "Hiçbir zaman", notConnected: "Bağlı değil", notSet: "Ayarlanmadı", opening: "Açılıyor...", popular: "Popüler", save: "Kaydet", saving: "Kaydediliyor...", upgradePlan: "Planı yükselt"},
    shell: {back: "Geri", sectionsAria: "Ayar bölümleri", subtitle: "Hesap ayarlarınızı ve tercihlerinizi yönetin", title: "Ayarlar"},
    profile: {description: "Kişisel bilgilerinizi yönetin", firstName: "Ad", lastName: "Soyad", title: "Profil", updated: "Profil güncellendi."},
    security: {description: "Giriş yöntemlerini, e-postayı ve şifre güvenliğini yönetin.", title: "Hesap Güvenliği"},
    usage: {description: "Hesap kullanımını ve kalan kredileri görüntüleyin", title: "Kullanım"},
    preferences: {description: "Uygulama tercihlerinizi yönetin", interfaceLanguage: "Arayüz dili", timeZone: "Saat dilimi", title: "Tercihler"},
    api: {title: "API Anahtarı Yönetimi"},
    notifications: {description: "E-posta bildirim tercihlerinizi yönetin", title: "E-posta Bildirimleri"},
    integrations: {title: "Entegrasyonlar"},
    danger: {deleteAccount: "Hesabı sil", title: "Tehlikeli Alan", warning: "Geri alınamayan işlemler"}
  },
  ja: {
    tabs: {profile: "プロフィール", security: "アカウントの安全性", usage: "使用状況", preferences: "環境設定", api: "API キー", notifications: "通知", integrations: "連携", danger: "危険な操作"},
    common: {cancel: "キャンセル", close: "閉じる", connect: "接続", connected: "接続済み", copy: "コピー", delete: "削除", disconnect: "切断", disconnecting: "切断中...", never: "なし", notConnected: "未接続", notSet: "未設定", opening: "開いています...", popular: "人気", save: "保存", saving: "保存中...", upgradePlan: "プランをアップグレード"},
    shell: {back: "戻る", sectionsAria: "設定セクション", subtitle: "アカウント設定と環境設定を管理します", title: "設定"},
    profile: {description: "個人情報を管理します", firstName: "名", lastName: "姓", title: "プロフィール", updated: "プロフィールを更新しました。"},
    security: {description: "ログイン方法、メール、パスワードを管理します。", title: "アカウントの安全性"},
    usage: {description: "アカウント使用量と残りクレジットを確認します", title: "使用状況"},
    preferences: {description: "アプリの環境設定を管理します", interfaceLanguage: "インターフェース言語", timeZone: "タイムゾーン", title: "環境設定"},
    api: {title: "API キー管理"},
    notifications: {description: "メール通知の設定を管理します", title: "メール通知"},
    integrations: {title: "連携"},
    danger: {deleteAccount: "アカウントを削除", title: "危険な操作", warning: "元に戻せない操作"}
  },
  nl: {
    tabs: {profile: "Profiel", security: "Accountbeveiliging", usage: "Gebruik", preferences: "Voorkeuren", api: "API-sleutels", notifications: "Meldingen", integrations: "Integraties", danger: "Gevarenzone"},
    common: {cancel: "Annuleren", close: "Sluiten", connect: "Verbinden", connected: "Verbonden", copy: "Kopiëren", delete: "Verwijderen", disconnect: "Verbinding verbreken", disconnecting: "Verbinding verbreken...", never: "Nooit", notConnected: "Niet verbonden", notSet: "Niet ingesteld", opening: "Openen...", popular: "Populair", save: "Opslaan", saving: "Opslaan...", upgradePlan: "Plan upgraden"},
    shell: {back: "Terug", sectionsAria: "Instellingensecties", subtitle: "Beheer je accountinstellingen en voorkeuren", title: "Instellingen"},
    profile: {description: "Beheer je persoonlijke gegevens", firstName: "Voornaam", lastName: "Achternaam", title: "Profiel", updated: "Profiel is bijgewerkt."},
    security: {description: "Beheer aanmeldmethoden, e-mail en wachtwoordbeveiliging.", title: "Accountbeveiliging"},
    usage: {description: "Bekijk accountgebruik en resterende credits", title: "Gebruik"},
    preferences: {description: "Beheer je app-voorkeuren", interfaceLanguage: "Interfacetaal", timeZone: "Tijdzone", title: "Voorkeuren"},
    api: {title: "API-sleutelbeheer"},
    notifications: {description: "Beheer je e-mailmeldingen", title: "E-mailmeldingen"},
    integrations: {title: "Integraties"},
    danger: {deleteAccount: "Account verwijderen", title: "Gevarenzone", warning: "Acties die niet ongedaan kunnen worden gemaakt"}
  },
  pl: {
    tabs: {profile: "Profil", security: "Bezpieczeństwo konta", usage: "Użycie", preferences: "Preferencje", api: "Klucze API", notifications: "Powiadomienia", integrations: "Integracje", danger: "Strefa zagrożenia"},
    common: {cancel: "Anuluj", close: "Zamknij", connect: "Połącz", connected: "Połączono", copy: "Kopiuj", delete: "Usuń", disconnect: "Rozłącz", disconnecting: "Rozłączanie...", never: "Nigdy", notConnected: "Nie połączono", notSet: "Nie ustawiono", opening: "Otwieranie...", popular: "Popularne", save: "Zapisz", saving: "Zapisywanie...", upgradePlan: "Ulepsz plan"},
    shell: {back: "Wstecz", sectionsAria: "Sekcje ustawień", subtitle: "Zarządzaj ustawieniami i preferencjami konta", title: "Ustawienia"},
    profile: {description: "Zarządzaj swoimi danymi osobowymi", firstName: "Imię", lastName: "Nazwisko", title: "Profil", updated: "Profil został zaktualizowany."},
    security: {description: "Zarządzaj metodami logowania, emailem i hasłem.", title: "Bezpieczeństwo konta"},
    usage: {description: "Sprawdź użycie konta i pozostałe kredyty", title: "Użycie"},
    preferences: {description: "Zarządzaj preferencjami aplikacji", interfaceLanguage: "Język interfejsu", timeZone: "Strefa czasowa", title: "Preferencje"},
    api: {title: "Zarządzanie kluczami API"},
    notifications: {description: "Zarządzaj powiadomieniami e-mail", title: "Powiadomienia e-mail"},
    integrations: {title: "Integracje"},
    danger: {deleteAccount: "Usuń konto", title: "Strefa zagrożenia", warning: "Działania, których nie można cofnąć"}
  },
  ko: {
    tabs: {profile: "프로필", security: "계정 보안", usage: "사용량", preferences: "환경설정", api: "API 키", notifications: "알림", integrations: "연동", danger: "위험 영역"},
    common: {cancel: "취소", close: "닫기", connect: "연결", connected: "연결됨", copy: "복사", delete: "삭제", disconnect: "연결 해제", disconnecting: "연결 해제 중...", never: "없음", notConnected: "연결 안 됨", notSet: "설정 안 됨", opening: "여는 중...", popular: "인기", save: "저장", saving: "저장 중...", upgradePlan: "플랜 업그레이드"},
    shell: {back: "뒤로", sectionsAria: "설정 섹션", subtitle: "계정 설정과 환경설정을 관리하세요", title: "설정"},
    profile: {description: "개인 정보를 관리하세요", firstName: "이름", lastName: "성", title: "프로필", updated: "프로필이 업데이트되었습니다."},
    security: {description: "로그인 방법, 이메일, 비밀번호 보안을 관리하세요.", title: "계정 보안"},
    usage: {description: "계정 사용량과 남은 크레딧을 확인하세요", title: "사용량"},
    preferences: {description: "앱 환경설정을 관리하세요", interfaceLanguage: "인터페이스 언어", timeZone: "시간대", title: "환경설정"},
    api: {title: "API 키 관리"},
    notifications: {description: "이메일 알림 환경설정을 관리하세요", title: "이메일 알림"},
    integrations: {title: "연동"},
    danger: {deleteAccount: "계정 삭제", title: "위험 영역", warning: "되돌릴 수 없는 작업"}
  },
  hu: {
    tabs: {profile: "Profil", security: "Fiókbiztonság", usage: "Használat", preferences: "Beállítások", api: "API-kulcsok", notifications: "Értesítések", integrations: "Integrációk", danger: "Veszélyzóna"},
    common: {cancel: "Mégse", close: "Bezárás", connect: "Csatlakozás", connected: "Csatlakoztatva", copy: "Másolás", delete: "Törlés", disconnect: "Leválasztás", disconnecting: "Leválasztás...", never: "Soha", notConnected: "Nincs csatlakoztatva", notSet: "Nincs beállítva", opening: "Megnyitás...", popular: "Népszerű", save: "Mentés", saving: "Mentés...", upgradePlan: "Csomag frissítése"},
    shell: {back: "Vissza", sectionsAria: "Beállítási szakaszok", subtitle: "Kezeld a fiókbeállításokat és preferenciákat", title: "Beállítások"},
    profile: {description: "Kezeld a személyes adataidat", firstName: "Keresztnév", lastName: "Vezetéknév", title: "Profil", updated: "A profil frissítve."},
    security: {description: "Kezeld a bejelentkezési módokat, emailt és jelszót.", title: "Fiókbiztonság"},
    usage: {description: "Tekintsd meg a fiókhasználatot és a maradék krediteket", title: "Használat"},
    preferences: {description: "Kezeld az alkalmazás beállításait", interfaceLanguage: "Felület nyelve", timeZone: "Időzóna", title: "Beállítások"},
    api: {title: "API-kulcs kezelés"},
    notifications: {description: "Kezeld az email értesítéseket", title: "Email értesítések"},
    integrations: {title: "Integrációk"},
    danger: {deleteAccount: "Fiók törlése", title: "Veszélyzóna", warning: "Nem visszavonható műveletek"}
  }
};

const settingsCommonCopy: Record<Locale, SettingsCopy["common"]> = {
  ar: {addon: "إضافة", beta: "تجريبي", buyNow: "اشتر الآن", cancel: "إلغاء", close: "إغلاق", connect: "اتصال", connected: "متصل", copy: "نسخ", delete: "حذف", disconnect: "قطع الاتصال", disconnecting: "جار قطع الاتصال...", folders: "المجلدات", never: "أبدًا", notConnected: "غير متصل", notSet: "غير محدد", opening: "جار الفتح...", popular: "شائع", save: "حفظ", saving: "جار الحفظ...", upgradePlan: "ترقية الخطة", uncategorized: "غير مصنف"},
  de: {addon: "Add-on", beta: "Beta", buyNow: "Jetzt kaufen", cancel: "Abbrechen", close: "Schließen", connect: "Verbinden", connected: "Verbunden", copy: "Kopieren", delete: "Löschen", disconnect: "Trennen", disconnecting: "Trennen...", folders: "Ordner", never: "Nie", notConnected: "Nicht verbunden", notSet: "Nicht festgelegt", opening: "Wird geöffnet...", popular: "Beliebt", save: "Speichern", saving: "Speichern...", upgradePlan: "Plan upgraden", uncategorized: "Nicht kategorisiert"},
  en: settingsCopyEn.common,
  es: {addon: "Complemento", beta: "Beta", buyNow: "Comprar ahora", cancel: "Cancelar", close: "Cerrar", connect: "Conectar", connected: "Conectado", copy: "Copiar", delete: "Eliminar", disconnect: "Desconectar", disconnecting: "Desconectando...", folders: "Carpetas", never: "Nunca", notConnected: "No conectado", notSet: "No configurado", opening: "Abriendo...", popular: "Popular", save: "Guardar", saving: "Guardando...", upgradePlan: "Mejorar plan", uncategorized: "Sin categoría"},
  fr: {addon: "Module", beta: "Bêta", buyNow: "Acheter maintenant", cancel: "Annuler", close: "Fermer", connect: "Connecter", connected: "Connecté", copy: "Copier", delete: "Supprimer", disconnect: "Déconnecter", disconnecting: "Déconnexion...", folders: "Dossiers", never: "Jamais", notConnected: "Non connecté", notSet: "Non défini", opening: "Ouverture...", popular: "Populaire", save: "Enregistrer", saving: "Enregistrement...", upgradePlan: "Changer de plan", uncategorized: "Non classé"},
  hu: {addon: "Kiegészítő", beta: "Béta", buyNow: "Vásárlás most", cancel: "Mégse", close: "Bezárás", connect: "Csatlakozás", connected: "Csatlakoztatva", copy: "Másolás", delete: "Törlés", disconnect: "Leválasztás", disconnecting: "Leválasztás...", folders: "Mappák", never: "Soha", notConnected: "Nincs csatlakoztatva", notSet: "Nincs beállítva", opening: "Megnyitás...", popular: "Népszerű", save: "Mentés", saving: "Mentés...", upgradePlan: "Csomag frissítése", uncategorized: "Kategorizálatlan"},
  id: {addon: "Add-on", beta: "Beta", buyNow: "Beli sekarang", cancel: "Batal", close: "Tutup", connect: "Hubungkan", connected: "Terhubung", copy: "Salin", delete: "Hapus", disconnect: "Putuskan", disconnecting: "Memutuskan...", folders: "Folder", never: "Tidak pernah", notConnected: "Belum terhubung", notSet: "Belum diatur", opening: "Membuka...", popular: "Populer", save: "Simpan", saving: "Menyimpan...", upgradePlan: "Tingkatkan Paket", uncategorized: "Tanpa kategori"},
  it: {addon: "Componente aggiuntivo", beta: "Beta", buyNow: "Acquista ora", cancel: "Annulla", close: "Chiudi", connect: "Connetti", connected: "Connesso", copy: "Copia", delete: "Elimina", disconnect: "Disconnetti", disconnecting: "Disconnessione...", folders: "Cartelle", never: "Mai", notConnected: "Non connesso", notSet: "Non impostato", opening: "Apertura...", popular: "Popolare", save: "Salva", saving: "Salvataggio...", upgradePlan: "Aggiorna piano", uncategorized: "Senza categoria"},
  ja: {addon: "追加分", beta: "ベータ", buyNow: "今すぐ購入", cancel: "キャンセル", close: "閉じる", connect: "接続", connected: "接続済み", copy: "コピー", delete: "削除", disconnect: "切断", disconnecting: "切断中...", folders: "フォルダー", never: "なし", notConnected: "未接続", notSet: "未設定", opening: "開いています...", popular: "人気", save: "保存", saving: "保存中...", upgradePlan: "プランをアップグレード", uncategorized: "未分類"},
  ko: {addon: "추가 팩", beta: "베타", buyNow: "지금 구매", cancel: "취소", close: "닫기", connect: "연결", connected: "연결됨", copy: "복사", delete: "삭제", disconnect: "연결 해제", disconnecting: "연결 해제 중...", folders: "폴더", never: "없음", notConnected: "연결 안 됨", notSet: "설정 안 됨", opening: "여는 중...", popular: "인기", save: "저장", saving: "저장 중...", upgradePlan: "플랜 업그레이드", uncategorized: "분류 없음"},
  nl: {addon: "Add-on", beta: "Bèta", buyNow: "Nu kopen", cancel: "Annuleren", close: "Sluiten", connect: "Verbinden", connected: "Verbonden", copy: "Kopiëren", delete: "Verwijderen", disconnect: "Verbinding verbreken", disconnecting: "Verbinding verbreken...", folders: "Mappen", never: "Nooit", notConnected: "Niet verbonden", notSet: "Niet ingesteld", opening: "Openen...", popular: "Populair", save: "Opslaan", saving: "Opslaan...", upgradePlan: "Plan upgraden", uncategorized: "Ongecategoriseerd"},
  pl: {addon: "Dodatek", beta: "Beta", buyNow: "Kup teraz", cancel: "Anuluj", close: "Zamknij", connect: "Połącz", connected: "Połączono", copy: "Kopiuj", delete: "Usuń", disconnect: "Rozłącz", disconnecting: "Rozłączanie...", folders: "Foldery", never: "Nigdy", notConnected: "Nie połączono", notSet: "Nie ustawiono", opening: "Otwieranie...", popular: "Popularne", save: "Zapisz", saving: "Zapisywanie...", upgradePlan: "Ulepsz plan", uncategorized: "Bez kategorii"},
  pt: {addon: "Complemento", beta: "Beta", buyNow: "Comprar agora", cancel: "Cancelar", close: "Fechar", connect: "Conectar", connected: "Conectado", copy: "Copiar", delete: "Excluir", disconnect: "Desconectar", disconnecting: "Desconectando...", folders: "Pastas", never: "Nunca", notConnected: "Não conectado", notSet: "Não definido", opening: "Abrindo...", popular: "Popular", save: "Salvar", saving: "Salvando...", upgradePlan: "Atualizar plano", uncategorized: "Sem categoria"},
  ru: {addon: "Дополнение", beta: "Бета", buyNow: "Купить сейчас", cancel: "Отмена", close: "Закрыть", connect: "Подключить", connected: "Подключено", copy: "Копировать", delete: "Удалить", disconnect: "Отключить", disconnecting: "Отключение...", folders: "Папки", never: "Никогда", notConnected: "Не подключено", notSet: "Не задано", opening: "Открытие...", popular: "Популярно", save: "Сохранить", saving: "Сохранение...", upgradePlan: "Обновить план", uncategorized: "Без категории"},
  th: {addon: "แพ็กเสริม", beta: "เบต้า", buyNow: "ซื้อเลย", cancel: "ยกเลิก", close: "ปิด", connect: "เชื่อมต่อ", connected: "เชื่อมต่อแล้ว", copy: "คัดลอก", delete: "ลบ", disconnect: "ตัดการเชื่อมต่อ", disconnecting: "กำลังตัดการเชื่อมต่อ...", folders: "โฟลเดอร์", never: "ไม่เคย", notConnected: "ยังไม่เชื่อมต่อ", notSet: "ยังไม่ได้ตั้งค่า", opening: "กำลังเปิด...", popular: "ยอดนิยม", save: "บันทึก", saving: "กำลังบันทึก...", upgradePlan: "อัปเกรดแพ็กเกจ", uncategorized: "ไม่จัดหมวดหมู่"},
  tr: {addon: "Eklenti", beta: "Beta", buyNow: "Şimdi satın al", cancel: "İptal", close: "Kapat", connect: "Bağlan", connected: "Bağlı", copy: "Kopyala", delete: "Sil", disconnect: "Bağlantıyı kes", disconnecting: "Bağlantı kesiliyor...", folders: "Klasörler", never: "Hiçbir zaman", notConnected: "Bağlı değil", notSet: "Ayarlanmadı", opening: "Açılıyor...", popular: "Popüler", save: "Kaydet", saving: "Kaydediliyor...", upgradePlan: "Planı yükselt", uncategorized: "Kategorisiz"},
  uk: {addon: "Додаток", beta: "Бета", buyNow: "Купити зараз", cancel: "Скасувати", close: "Закрити", connect: "Підключити", connected: "Підключено", copy: "Копіювати", delete: "Видалити", disconnect: "Відключити", disconnecting: "Відключення...", folders: "Папки", never: "Ніколи", notConnected: "Не підключено", notSet: "Не задано", opening: "Відкриття...", popular: "Популярне", save: "Зберегти", saving: "Збереження...", upgradePlan: "Оновити план", uncategorized: "Без категорії"},
  vi: {addon: "Gói bổ sung", beta: "Beta", buyNow: "Mua ngay", cancel: "Hủy", close: "Đóng", connect: "Kết nối", connected: "Đã kết nối", copy: "Sao chép", delete: "Xóa", disconnect: "Ngắt kết nối", disconnecting: "Đang ngắt...", folders: "Thư mục", never: "Chưa bao giờ", notConnected: "Chưa kết nối", notSet: "Chưa đặt", opening: "Đang mở...", popular: "Phổ biến", save: "Lưu", saving: "Đang lưu...", upgradePlan: "Nâng cấp gói", uncategorized: "Chưa phân loại"},
  zh: {addon: "加购包", beta: "Beta", buyNow: "立即购买", cancel: "取消", close: "关闭", connect: "连接", connected: "已连接", copy: "复制", delete: "删除", disconnect: "断开连接", disconnecting: "正在断开...", folders: "文件夹", never: "从未", notConnected: "未连接", notSet: "未设置", opening: "正在打开...", popular: "热门", save: "保存", saving: "保存中...", upgradePlan: "升级套餐", uncategorized: "未分类"},
  "zh-TW": {addon: "加購包", beta: "Beta", buyNow: "立即購買", cancel: "取消", close: "關閉", connect: "連接", connected: "已連接", copy: "複製", delete: "刪除", disconnect: "中斷連接", disconnecting: "正在中斷...", folders: "資料夾", never: "從未", notConnected: "未連接", notSet: "未設定", opening: "正在開啟...", popular: "熱門", save: "儲存", saving: "儲存中...", upgradePlan: "升級方案", uncategorized: "未分類"}
};

const settingsPreferencesCopy: Record<Locale, SettingsCopy["preferences"]> = {
  ar: {description: "إدارة تفضيلات التطبيق", interfaceLanguage: "لغة الواجهة", interfaceLanguageDescription: "اختر لغتك المفضلة لواجهة التطبيق", searchPlaceholder: "بحث", timeZone: "المنطقة الزمنية", timeZoneDescription: "اختر منطقتك الزمنية", timeZoneUpdated: "تم تحديث تفضيل المنطقة الزمنية.", title: "التفضيلات"},
  de: {description: "App-Einstellungen verwalten", interfaceLanguage: "Oberflächensprache", interfaceLanguageDescription: "Wähle deine bevorzugte Sprache für die App-Oberfläche", searchPlaceholder: "Suchen", timeZone: "Zeitzone", timeZoneDescription: "Wähle deine Zeitzone", timeZoneUpdated: "Zeitzonenpräferenz wurde aktualisiert.", title: "Einstellungen"},
  en: settingsCopyEn.preferences,
  es: {description: "Gestiona las preferencias de la aplicación", interfaceLanguage: "Idioma de la interfaz", interfaceLanguageDescription: "Elige tu idioma preferido para la interfaz de la aplicación", searchPlaceholder: "Buscar", timeZone: "Zona horaria", timeZoneDescription: "Selecciona tu zona horaria", timeZoneUpdated: "La preferencia de zona horaria se actualizó.", title: "Preferencias"},
  fr: {description: "Gérez les préférences de l'application", interfaceLanguage: "Langue de l'interface", interfaceLanguageDescription: "Choisissez votre langue préférée pour l'interface de l'application", searchPlaceholder: "Rechercher", timeZone: "Fuseau horaire", timeZoneDescription: "Sélectionnez votre fuseau horaire", timeZoneUpdated: "La préférence de fuseau horaire a été mise à jour.", title: "Préférences"},
  hu: {description: "Kezeld az alkalmazás beállításait", interfaceLanguage: "Felület nyelve", interfaceLanguageDescription: "Válaszd ki az alkalmazás felületének nyelvét", searchPlaceholder: "Keresés", timeZone: "Időzóna", timeZoneDescription: "Válaszd ki az időzónádat", timeZoneUpdated: "Az időzóna-beállítás frissítve.", title: "Beállítások"},
  id: {description: "Kelola preferensi aplikasi Anda", interfaceLanguage: "Bahasa Antarmuka", interfaceLanguageDescription: "Pilih bahasa pilihan untuk antarmuka aplikasi", searchPlaceholder: "Cari", timeZone: "Zona Waktu", timeZoneDescription: "Pilih zona waktu Anda", timeZoneUpdated: "Preferensi zona waktu telah diperbarui.", title: "Preferensi"},
  it: {description: "Gestisci le preferenze dell'applicazione", interfaceLanguage: "Lingua interfaccia", interfaceLanguageDescription: "Scegli la lingua preferita per l'interfaccia dell'app", searchPlaceholder: "Cerca", timeZone: "Fuso orario", timeZoneDescription: "Seleziona il tuo fuso orario", timeZoneUpdated: "Preferenza fuso orario aggiornata.", title: "Preferenze"},
  ja: {description: "アプリの環境設定を管理します", interfaceLanguage: "インターフェース言語", interfaceLanguageDescription: "アプリ画面で使う言語を選択します", searchPlaceholder: "検索", timeZone: "タイムゾーン", timeZoneDescription: "タイムゾーンを選択します", timeZoneUpdated: "タイムゾーン設定を更新しました。", title: "環境設定"},
  ko: {description: "앱 환경설정을 관리하세요", interfaceLanguage: "인터페이스 언어", interfaceLanguageDescription: "앱 인터페이스에 사용할 언어를 선택하세요", searchPlaceholder: "검색", timeZone: "시간대", timeZoneDescription: "시간대를 선택하세요", timeZoneUpdated: "시간대 환경설정이 업데이트되었습니다.", title: "환경설정"},
  nl: {description: "Beheer je app-voorkeuren", interfaceLanguage: "Interfacetaal", interfaceLanguageDescription: "Kies je voorkeurstaal voor de app-interface", searchPlaceholder: "Zoeken", timeZone: "Tijdzone", timeZoneDescription: "Selecteer je tijdzone", timeZoneUpdated: "Tijdzonevoorkeur is bijgewerkt.", title: "Voorkeuren"},
  pl: {description: "Zarządzaj preferencjami aplikacji", interfaceLanguage: "Język interfejsu", interfaceLanguageDescription: "Wybierz preferowany język interfejsu aplikacji", searchPlaceholder: "Szukaj", timeZone: "Strefa czasowa", timeZoneDescription: "Wybierz swoją strefę czasową", timeZoneUpdated: "Preferencja strefy czasowej została zaktualizowana.", title: "Preferencje"},
  pt: {description: "Gerencie as preferências do aplicativo", interfaceLanguage: "Idioma da interface", interfaceLanguageDescription: "Escolha o idioma preferido para a interface do aplicativo", searchPlaceholder: "Pesquisar", timeZone: "Fuso horário", timeZoneDescription: "Selecione seu fuso horário", timeZoneUpdated: "Preferência de fuso horário atualizada.", title: "Preferências"},
  ru: {description: "Управляйте предпочтениями приложения", interfaceLanguage: "Язык интерфейса", interfaceLanguageDescription: "Выберите предпочитаемый язык интерфейса приложения", searchPlaceholder: "Поиск", timeZone: "Часовой пояс", timeZoneDescription: "Выберите часовой пояс", timeZoneUpdated: "Настройка часового пояса обновлена.", title: "Настройки"},
  th: {description: "จัดการการตั้งค่าแอป", interfaceLanguage: "ภาษาอินเทอร์เฟซ", interfaceLanguageDescription: "เลือกภาษาที่ต้องการสำหรับอินเทอร์เฟซแอป", searchPlaceholder: "ค้นหา", timeZone: "เขตเวลา", timeZoneDescription: "เลือกเขตเวลาของคุณ", timeZoneUpdated: "อัปเดตการตั้งค่าเขตเวลาแล้ว", title: "การตั้งค่า"},
  tr: {description: "Uygulama tercihlerinizi yönetin", interfaceLanguage: "Arayüz dili", interfaceLanguageDescription: "Uygulama arayüzü için tercih ettiğiniz dili seçin", searchPlaceholder: "Ara", timeZone: "Saat dilimi", timeZoneDescription: "Saat diliminizi seçin", timeZoneUpdated: "Saat dilimi tercihi güncellendi.", title: "Tercihler"},
  uk: {description: "Керуйте налаштуваннями застосунку", interfaceLanguage: "Мова інтерфейсу", interfaceLanguageDescription: "Виберіть бажану мову інтерфейсу застосунку", searchPlaceholder: "Пошук", timeZone: "Часовий пояс", timeZoneDescription: "Виберіть свій часовий пояс", timeZoneUpdated: "Налаштування часового поясу оновлено.", title: "Налаштування"},
  vi: {description: "Quản lý tùy chọn ứng dụng", interfaceLanguage: "Ngôn ngữ giao diện", interfaceLanguageDescription: "Chọn ngôn ngữ bạn muốn dùng cho giao diện ứng dụng", searchPlaceholder: "Tìm kiếm", timeZone: "Múi giờ", timeZoneDescription: "Chọn múi giờ của bạn", timeZoneUpdated: "Tùy chọn múi giờ đã được cập nhật.", title: "Tùy chọn"},
  zh: {description: "管理应用偏好", interfaceLanguage: "界面语言", interfaceLanguageDescription: "选择应用界面的首选语言", searchPlaceholder: "搜索", timeZone: "时区", timeZoneDescription: "选择你的时区", timeZoneUpdated: "时区偏好已更新。", title: "偏好设置"},
  "zh-TW": {description: "管理應用程式偏好", interfaceLanguage: "介面語言", interfaceLanguageDescription: "選擇應用程式介面的偏好語言", searchPlaceholder: "搜尋", timeZone: "時區", timeZoneDescription: "選擇你的時區", timeZoneUpdated: "時區偏好已更新。", title: "偏好設定"}
};

const settingsProfileCopy: Record<Locale, SettingsCopy["profile"]> = {
  ar: {avatarAlt: "الصورة الرمزية", defaultUser: "مستخدم Votxt", description: "إدارة معلوماتك الشخصية", firstName: "الاسم الأول", lastName: "اسم العائلة", title: "الملف الشخصي", updated: "تم تحديث الملف الشخصي."},
  de: {avatarAlt: "Avatar", defaultUser: "Votxt-Nutzer", description: "Persönliche Informationen verwalten", firstName: "Vorname", lastName: "Nachname", title: "Profil", updated: "Profil wurde aktualisiert."},
  en: settingsCopyEn.profile,
  es: {avatarAlt: "Avatar", defaultUser: "Usuario de Votxt", description: "Gestiona tu información personal", firstName: "Nombre", lastName: "Apellido", title: "Perfil", updated: "El perfil se ha actualizado."},
  fr: {avatarAlt: "Avatar", defaultUser: "Utilisateur Votxt", description: "Gérez vos informations personnelles", firstName: "Prénom", lastName: "Nom", title: "Profil", updated: "Le profil a été mis à jour."},
  hu: {avatarAlt: "Profilkép", defaultUser: "Votxt felhasználó", description: "Kezeld a személyes adataidat", firstName: "Keresztnév", lastName: "Vezetéknév", title: "Profil", updated: "A profil frissítve."},
  id: {avatarAlt: "Avatar", defaultUser: "Pengguna Votxt", description: "Kelola informasi pribadi Anda", firstName: "Nama depan", lastName: "Nama belakang", title: "Profil", updated: "Profil telah diperbarui."},
  it: {avatarAlt: "Avatar", defaultUser: "Utente Votxt", description: "Gestisci le tue informazioni personali", firstName: "Nome", lastName: "Cognome", title: "Profilo", updated: "Profilo aggiornato."},
  ja: {avatarAlt: "アバター", defaultUser: "Votxt ユーザー", description: "個人情報を管理します", firstName: "名", lastName: "姓", title: "プロフィール", updated: "プロフィールを更新しました。"},
  ko: {avatarAlt: "아바타", defaultUser: "Votxt 사용자", description: "개인 정보를 관리하세요", firstName: "이름", lastName: "성", title: "프로필", updated: "프로필이 업데이트되었습니다."},
  nl: {avatarAlt: "Avatar", defaultUser: "Votxt-gebruiker", description: "Beheer je persoonlijke gegevens", firstName: "Voornaam", lastName: "Achternaam", title: "Profiel", updated: "Profiel is bijgewerkt."},
  pl: {avatarAlt: "Awatar", defaultUser: "Użytkownik Votxt", description: "Zarządzaj swoimi danymi osobowymi", firstName: "Imię", lastName: "Nazwisko", title: "Profil", updated: "Profil został zaktualizowany."},
  pt: {avatarAlt: "Avatar", defaultUser: "Usuário Votxt", description: "Gerencie suas informações pessoais", firstName: "Nome", lastName: "Sobrenome", title: "Perfil", updated: "Perfil atualizado."},
  ru: {avatarAlt: "Аватар", defaultUser: "Пользователь Votxt", description: "Управляйте личной информацией", firstName: "Имя", lastName: "Фамилия", title: "Профиль", updated: "Профиль обновлен."},
  th: {avatarAlt: "อวาตาร์", defaultUser: "ผู้ใช้ Votxt", description: "จัดการข้อมูลส่วนตัว", firstName: "ชื่อ", lastName: "นามสกุล", title: "โปรไฟล์", updated: "อัปเดตโปรไฟล์แล้ว"},
  tr: {avatarAlt: "Avatar", defaultUser: "Votxt kullanıcısı", description: "Kişisel bilgilerinizi yönetin", firstName: "Ad", lastName: "Soyad", title: "Profil", updated: "Profil güncellendi."},
  uk: {avatarAlt: "Аватар", defaultUser: "Користувач Votxt", description: "Керуйте особистою інформацією", firstName: "Ім'я", lastName: "Прізвище", title: "Профіль", updated: "Профіль оновлено."},
  vi: {avatarAlt: "Ảnh đại diện", defaultUser: "Người dùng Votxt", description: "Quản lý thông tin cá nhân", firstName: "Tên", lastName: "Họ", title: "Hồ sơ", updated: "Hồ sơ đã được cập nhật."},
  zh: {avatarAlt: "头像", defaultUser: "Votxt 用户", description: "管理你的个人信息", firstName: "名", lastName: "姓", title: "个人资料", updated: "个人资料已更新。"},
  "zh-TW": {avatarAlt: "頭像", defaultUser: "Votxt 使用者", description: "管理你的個人資訊", firstName: "名字", lastName: "姓氏", title: "個人資料", updated: "個人資料已更新。"}
};

const settingsUsageCopy: Record<Locale, SettingsCopy["usage"]> = {
  ar: {billingPortalUnavailable: "تتوفر بوابة الفوترة بعد ربط اشتراك مدفوع.", buyMoreDescription: "تضاف دقائق الإضافة إلى خطتك النشطة بعد الدفع.", buyMoreTitle: "اشتر دقائق تفريغ إضافية", description: "عرض استخدام الحساب والرصيد المتبقي", manageBilling: "إدارة الفوترة", packs: {ADDON_BASIC: {description: "زيادة مركزة للأعمال الإضافية الصغيرة.", name: "أساسي", quota: "500 دقيقة إضافية"}, ADDON_STANDARD: {description: "أفضل قيمة لتجاوزات الحساب المدفوع المنتظمة.", name: "قياسي", quota: "1000 دقيقة إضافية"}, ADDON_PRO: {description: "دقائق عالية الحجم لفترات المشاريع المكثفة.", name: "احترافي", quota: "3000 دقيقة إضافية"}}, planNames: {BASIC: "أساسي", FREE: "مجاني", PRO: "احترافي", STANDARD: "قياسي"}, resetsOn: (date) => `يعاد التعيين في ${date}`, title: "الاستخدام", total: (value) => `الإجمالي: ${value}`, upgradeNow: "الترقية الآن", used: (value) => `المستخدم: ${value}`},
  de: {billingPortalUnavailable: "Das Abrechnungsportal ist verfügbar, sobald ein kostenpflichtiges Abo verbunden ist.", buyMoreDescription: "Add-on-Minuten werden deiner aktiven Mitgliedschaft nach dem Checkout gutgeschrieben.", buyMoreTitle: "Mehr Transkriptionsminuten kaufen", description: "Kontonutzung und verbleibende Credits ansehen", manageBilling: "Abrechnung verwalten", packs: {ADDON_BASIC: {description: "Gezielte Aufstockung für kleinere Mehrarbeit.", name: "Basic", quota: "500 zusätzliche Minuten"}, ADDON_STANDARD: {description: "Bestes Preis-Leistungs-Verhältnis für regelmäßige Überschreitungen.", name: "Standard", quota: "1000 zusätzliche Minuten"}, ADDON_PRO: {description: "Viele Minuten für intensive Projektphasen.", name: "Pro", quota: "3000 zusätzliche Minuten"}}, planNames: {BASIC: "Basic", FREE: "Kostenlos", PRO: "Pro", STANDARD: "Standard"}, resetsOn: (date) => `Wird zurückgesetzt am ${date}`, title: "Nutzung", total: (value) => `Gesamt: ${value}`, upgradeNow: "Jetzt upgraden", used: (value) => `Verwendet: ${value}`},
  en: settingsCopyEn.usage,
  es: {billingPortalUnavailable: "El portal de facturación está disponible después de conectar una suscripción de pago.", buyMoreDescription: "Los minutos adicionales se acreditan a tu plan activo después del pago.", buyMoreTitle: "Comprar más minutos de transcripción", description: "Consulta el uso de tu cuenta y los créditos restantes", manageBilling: "Gestionar facturación", packs: {ADDON_BASIC: {description: "Una recarga enfocada para pequeños excedentes.", name: "Basic", quota: "500 minutos extra"}, ADDON_STANDARD: {description: "Mejor valor para excedentes regulares de cuentas de pago.", name: "Standard", quota: "1000 minutos extra"}, ADDON_PRO: {description: "Minutos de alto volumen para ráfagas intensas de proyectos.", name: "Pro", quota: "3000 minutos extra"}}, planNames: {BASIC: "Basic", FREE: "Gratis", PRO: "Pro", STANDARD: "Standard"}, resetsOn: (date) => `Se reinicia el ${date}`, title: "Uso", total: (value) => `Total: ${value}`, upgradeNow: "Mejorar ahora", used: (value) => `Usado: ${value}`},
  fr: {billingPortalUnavailable: "Le portail de facturation est disponible après la connexion d'un abonnement payant.", buyMoreDescription: "Les minutes supplémentaires sont ajoutées à votre forfait actif après le paiement.", buyMoreTitle: "Acheter plus de minutes de transcription", description: "Consultez l'utilisation du compte et les crédits restants", manageBilling: "Gérer la facturation", packs: {ADDON_BASIC: {description: "Une recharge ciblée pour les petits dépassements.", name: "Basic", quota: "500 minutes supplémentaires"}, ADDON_STANDARD: {description: "Le meilleur rapport qualité-prix pour les dépassements réguliers.", name: "Standard", quota: "1000 minutes supplémentaires"}, ADDON_PRO: {description: "Un grand volume de minutes pour les périodes de projet intenses.", name: "Pro", quota: "3000 minutes supplémentaires"}}, planNames: {BASIC: "Basic", FREE: "Gratuit", PRO: "Pro", STANDARD: "Standard"}, resetsOn: (date) => `Réinitialisation le ${date}`, title: "Utilisation", total: (value) => `Total : ${value}`, upgradeNow: "Mettre à niveau", used: (value) => `Utilisé : ${value}`},
  hu: {billingPortalUnavailable: "A számlázási portál fizetős előfizetés csatlakoztatása után érhető el.", buyMoreDescription: "A kiegészítő percek fizetés után az aktív csomagodhoz kerülnek.", buyMoreTitle: "További átírási percek vásárlása", description: "Tekintsd meg a fiókhasználatot és a maradék krediteket", manageBilling: "Számlázás kezelése", packs: {ADDON_BASIC: {description: "Célzott feltöltés kisebb többletmunkákhoz.", name: "Basic", quota: "500 extra perc"}, ADDON_STANDARD: {description: "Legjobb érték rendszeres fizetős túllépésekhez.", name: "Standard", quota: "1000 extra perc"}, ADDON_PRO: {description: "Nagy mennyiségű perc intenzív projektekhez.", name: "Pro", quota: "3000 extra perc"}}, planNames: {BASIC: "Basic", FREE: "Ingyenes", PRO: "Pro", STANDARD: "Standard"}, resetsOn: (date) => `Visszaállítás: ${date}`, title: "Használat", total: (value) => `Összesen: ${value}`, upgradeNow: "Frissítés most", used: (value) => `Felhasználva: ${value}`},
  id: {billingPortalUnavailable: "Portal penagihan tersedia setelah langganan berbayar terhubung.", buyMoreDescription: "Menit add-on dikreditkan ke paket aktif Anda setelah checkout.", buyMoreTitle: "Beli menit transkripsi tambahan", description: "Lihat pemakaian akun dan kredit tersisa", manageBilling: "Kelola Penagihan", packs: {ADDON_BASIC: {description: "Top-up terarah untuk pekerjaan tambahan kecil.", name: "Basic", quota: "500 menit ekstra"}, ADDON_STANDARD: {description: "Nilai terbaik untuk kelebihan penggunaan rutin akun berbayar.", name: "Standard", quota: "1000 menit ekstra"}, ADDON_PRO: {description: "Menit volume tinggi untuk lonjakan proyek intens.", name: "Pro", quota: "3000 menit ekstra"}}, planNames: {BASIC: "Basic", FREE: "Gratis", PRO: "Pro", STANDARD: "Standard"}, resetsOn: (date) => `Direset pada ${date}`, title: "Pemakaian", total: (value) => `Total: ${value}`, upgradeNow: "Tingkatkan Sekarang", used: (value) => `Terpakai: ${value}`},
  it: {billingPortalUnavailable: "Il portale di fatturazione è disponibile dopo aver collegato un abbonamento a pagamento.", buyMoreDescription: "I minuti aggiuntivi vengono accreditati al piano attivo dopo il pagamento.", buyMoreTitle: "Acquista altri minuti di trascrizione", description: "Visualizza utilizzo account e crediti rimanenti", manageBilling: "Gestisci fatturazione", packs: {ADDON_BASIC: {description: "Una ricarica mirata per piccoli extra.", name: "Basic", quota: "500 minuti extra"}, ADDON_STANDARD: {description: "Miglior valore per eccedenze regolari di account a pagamento.", name: "Standard", quota: "1000 minuti extra"}, ADDON_PRO: {description: "Minuti ad alto volume per picchi di progetto intensi.", name: "Pro", quota: "3000 minuti extra"}}, planNames: {BASIC: "Basic", FREE: "Gratis", PRO: "Pro", STANDARD: "Standard"}, resetsOn: (date) => `Si reimposta il ${date}`, title: "Utilizzo", total: (value) => `Totale: ${value}`, upgradeNow: "Aggiorna ora", used: (value) => `Usati: ${value}`},
  ja: {billingPortalUnavailable: "請求ポータルは有料サブスクリプション接続後に利用できます。", buyMoreDescription: "追加分は決済後、アクティブなプランに反映されます。", buyMoreTitle: "文字起こし分数を追加購入", description: "アカウント使用量と残りクレジットを確認します", manageBilling: "請求を管理", packs: {ADDON_BASIC: {description: "小さな超過作業向けの追加分です。", name: "Basic", quota: "追加 500 分"}, ADDON_STANDARD: {description: "有料アカウントの定期的な超過に最適です。", name: "Standard", quota: "追加 1000 分"}, ADDON_PRO: {description: "集中的なプロジェクト期間向けの大容量分数です。", name: "Pro", quota: "追加 3000 分"}}, planNames: {BASIC: "Basic", FREE: "無料", PRO: "Pro", STANDARD: "Standard"}, resetsOn: (date) => `${date} にリセット`, title: "使用状況", total: (value) => `合計: ${value}`, upgradeNow: "今すぐアップグレード", used: (value) => `使用済み: ${value}`},
  ko: {billingPortalUnavailable: "유료 구독이 연결된 후 결제 포털을 사용할 수 있습니다.", buyMoreDescription: "추가 분수는 결제 후 활성 플랜에 적립됩니다.", buyMoreTitle: "전사 시간 추가 구매", description: "계정 사용량과 남은 크레딧을 확인하세요", manageBilling: "결제 관리", packs: {ADDON_BASIC: {description: "작은 초과 작업을 위한 집중 충전입니다.", name: "Basic", quota: "추가 500분"}, ADDON_STANDARD: {description: "유료 계정의 정기 초과 사용에 가장 좋은 가치입니다.", name: "Standard", quota: "추가 1000분"}, ADDON_PRO: {description: "집중 프로젝트 기간을 위한 대용량 분수입니다.", name: "Pro", quota: "추가 3000분"}}, planNames: {BASIC: "Basic", FREE: "무료", PRO: "Pro", STANDARD: "Standard"}, resetsOn: (date) => `${date}에 재설정`, title: "사용량", total: (value) => `총계: ${value}`, upgradeNow: "지금 업그레이드", used: (value) => `사용됨: ${value}`},
  nl: {billingPortalUnavailable: "Het factureringsportaal is beschikbaar nadat een betaald abonnement is gekoppeld.", buyMoreDescription: "Add-onminuten worden na betaling toegevoegd aan je actieve plan.", buyMoreTitle: "Meer transcriptieminuten kopen", description: "Bekijk accountgebruik en resterende credits", manageBilling: "Facturering beheren", packs: {ADDON_BASIC: {description: "Een gerichte aanvulling voor kleinere extra werkzaamheden.", name: "Basic", quota: "500 extra minuten"}, ADDON_STANDARD: {description: "Beste waarde voor regelmatige overschrijdingen van betaalde accounts.", name: "Standard", quota: "1000 extra minuten"}, ADDON_PRO: {description: "Veel minuten voor intensieve projectpieken.", name: "Pro", quota: "3000 extra minuten"}}, planNames: {BASIC: "Basic", FREE: "Gratis", PRO: "Pro", STANDARD: "Standard"}, resetsOn: (date) => `Reset op ${date}`, title: "Gebruik", total: (value) => `Totaal: ${value}`, upgradeNow: "Nu upgraden", used: (value) => `Gebruikt: ${value}`},
  pl: {billingPortalUnavailable: "Portal rozliczeniowy jest dostępny po połączeniu płatnej subskrypcji.", buyMoreDescription: "Minuty dodatku są dodawane do aktywnego planu po płatności.", buyMoreTitle: "Kup więcej minut transkrypcji", description: "Sprawdź użycie konta i pozostałe kredyty", manageBilling: "Zarządzaj rozliczeniami", packs: {ADDON_BASIC: {description: "Ukierunkowane doładowanie dla mniejszych nadwyżek.", name: "Basic", quota: "500 dodatkowych minut"}, ADDON_STANDARD: {description: "Najlepsza wartość dla regularnych nadwyżek płatnego konta.", name: "Standard", quota: "1000 dodatkowych minut"}, ADDON_PRO: {description: "Duża liczba minut na intensywne etapy projektów.", name: "Pro", quota: "3000 dodatkowych minut"}}, planNames: {BASIC: "Basic", FREE: "Darmowy", PRO: "Pro", STANDARD: "Standard"}, resetsOn: (date) => `Resetuje się ${date}`, title: "Użycie", total: (value) => `Łącznie: ${value}`, upgradeNow: "Ulepsz teraz", used: (value) => `Użyto: ${value}`},
  pt: {billingPortalUnavailable: "O portal de cobrança fica disponível depois que uma assinatura paga é conectada.", buyMoreDescription: "Minutos complementares são creditados ao seu plano ativo após o checkout.", buyMoreTitle: "Comprar mais minutos de transcrição", description: "Veja o uso da conta e créditos restantes", manageBilling: "Gerenciar cobrança", packs: {ADDON_BASIC: {description: "Uma recarga focada para pequenos excedentes.", name: "Basic", quota: "500 minutos extras"}, ADDON_STANDARD: {description: "Melhor valor para excedentes regulares de contas pagas.", name: "Standard", quota: "1000 minutos extras"}, ADDON_PRO: {description: "Minutos de alto volume para picos intensos de projeto.", name: "Pro", quota: "3000 minutos extras"}}, planNames: {BASIC: "Basic", FREE: "Grátis", PRO: "Pro", STANDARD: "Standard"}, resetsOn: (date) => `Redefine em ${date}`, title: "Uso", total: (value) => `Total: ${value}`, upgradeNow: "Atualizar agora", used: (value) => `Usado: ${value}`},
  ru: {billingPortalUnavailable: "Портал оплаты доступен после подключения платной подписки.", buyMoreDescription: "Дополнительные минуты будут добавлены к активному плану после оплаты.", buyMoreTitle: "Купить дополнительные минуты расшифровки", description: "Просматривайте использование аккаунта и остаток кредитов", manageBilling: "Управлять оплатой", packs: {ADDON_BASIC: {description: "Точечное пополнение для небольших превышений.", name: "Basic", quota: "500 дополнительных минут"}, ADDON_STANDARD: {description: "Лучшее предложение для регулярных превышений платного аккаунта.", name: "Standard", quota: "1000 дополнительных минут"}, ADDON_PRO: {description: "Большой объем минут для интенсивных проектов.", name: "Pro", quota: "3000 дополнительных минут"}}, planNames: {BASIC: "Basic", FREE: "Бесплатный", PRO: "Pro", STANDARD: "Standard"}, resetsOn: (date) => `Сброс ${date}`, title: "Использование", total: (value) => `Всего: ${value}`, upgradeNow: "Обновить сейчас", used: (value) => `Использовано: ${value}`},
  th: {billingPortalUnavailable: "พอร์ทัลการเรียกเก็บเงินจะใช้ได้หลังจากเชื่อมต่อการสมัครสมาชิกแบบชำระเงิน", buyMoreDescription: "นาทีเสริมจะถูกเติมเข้ากับแพ็กเกจที่ใช้งานหลังชำระเงิน", buyMoreTitle: "ซื้อนาทีถอดเสียงเพิ่ม", description: "ดูการใช้งานบัญชีและเครดิตที่เหลือ", manageBilling: "จัดการการเรียกเก็บเงิน", packs: {ADDON_BASIC: {description: "เติมเพิ่มสำหรับงานส่วนเกินขนาดเล็ก", name: "Basic", quota: "เพิ่ม 500 นาที"}, ADDON_STANDARD: {description: "คุ้มค่าสำหรับการใช้งานเกินเป็นประจำของบัญชีแบบชำระเงิน", name: "Standard", quota: "เพิ่ม 1000 นาที"}, ADDON_PRO: {description: "นาทีปริมาณมากสำหรับช่วงโปรเจกต์เข้มข้น", name: "Pro", quota: "เพิ่ม 3000 นาที"}}, planNames: {BASIC: "Basic", FREE: "ฟรี", PRO: "Pro", STANDARD: "Standard"}, resetsOn: (date) => `รีเซ็ตวันที่ ${date}`, title: "การใช้งาน", total: (value) => `ทั้งหมด: ${value}`, upgradeNow: "อัปเกรดตอนนี้", used: (value) => `ใช้แล้ว: ${value}`},
  tr: {billingPortalUnavailable: "Faturalama portalı, ücretli abonelik bağlandıktan sonra kullanılabilir.", buyMoreDescription: "Eklenti dakikaları ödeme sonrası aktif planınıza eklenir.", buyMoreTitle: "Daha fazla transkripsiyon dakikası satın al", description: "Hesap kullanımını ve kalan kredileri görüntüleyin", manageBilling: "Faturalamayı yönet", packs: {ADDON_BASIC: {description: "Küçük ek işler için odaklı yükleme.", name: "Basic", quota: "500 ekstra dakika"}, ADDON_STANDARD: {description: "Ücretli hesaplarda düzenli aşım için en iyi değer.", name: "Standard", quota: "1000 ekstra dakika"}, ADDON_PRO: {description: "Yoğun proje dönemleri için yüksek hacimli dakikalar.", name: "Pro", quota: "3000 ekstra dakika"}}, planNames: {BASIC: "Basic", FREE: "Ücretsiz", PRO: "Pro", STANDARD: "Standard"}, resetsOn: (date) => `${date} tarihinde sıfırlanır`, title: "Kullanım", total: (value) => `Toplam: ${value}`, upgradeNow: "Şimdi yükselt", used: (value) => `Kullanılan: ${value}`},
  uk: {billingPortalUnavailable: "Портал оплати доступний після підключення платної підписки.", buyMoreDescription: "Додаткові хвилини додаються до активного плану після оплати.", buyMoreTitle: "Купити більше хвилин транскрипції", description: "Переглядайте використання акаунта та залишок кредитів", manageBilling: "Керувати оплатою", packs: {ADDON_BASIC: {description: "Цільове поповнення для невеликих перевищень.", name: "Basic", quota: "500 додаткових хвилин"}, ADDON_STANDARD: {description: "Найкраща цінність для регулярних перевищень платного акаунта.", name: "Standard", quota: "1000 додаткових хвилин"}, ADDON_PRO: {description: "Великий обсяг хвилин для інтенсивних проєктів.", name: "Pro", quota: "3000 додаткових хвилин"}}, planNames: {BASIC: "Basic", FREE: "Безкоштовний", PRO: "Pro", STANDARD: "Standard"}, resetsOn: (date) => `Скидання ${date}`, title: "Використання", total: (value) => `Усього: ${value}`, upgradeNow: "Оновити зараз", used: (value) => `Використано: ${value}`},
  vi: {billingPortalUnavailable: "Cổng thanh toán khả dụng sau khi kết nối một gói trả phí.", buyMoreDescription: "Phút bổ sung sẽ được cộng vào gói đang hoạt động sau khi thanh toán.", buyMoreTitle: "Mua thêm phút chép lời", description: "Xem mức sử dụng tài khoản và tín dụng còn lại", manageBilling: "Quản lý thanh toán", packs: {ADDON_BASIC: {description: "Gói nạp tập trung cho phần việc vượt nhỏ.", name: "Basic", quota: "500 phút bổ sung"}, ADDON_STANDARD: {description: "Giá trị tốt nhất cho phần vượt thường xuyên của tài khoản trả phí.", name: "Standard", quota: "1000 phút bổ sung"}, ADDON_PRO: {description: "Số phút lớn cho các đợt dự án cường độ cao.", name: "Pro", quota: "3000 phút bổ sung"}}, planNames: {BASIC: "Basic", FREE: "Miễn phí", PRO: "Pro", STANDARD: "Standard"}, resetsOn: (date) => `Đặt lại vào ${date}`, title: "Sử dụng", total: (value) => `Tổng: ${value}`, upgradeNow: "Nâng cấp ngay", used: (value) => `Đã dùng: ${value}`},
  zh: {billingPortalUnavailable: "连接付费订阅后即可使用账单门户。", buyMoreDescription: "加购分钟会在结账后计入你的当前套餐。", buyMoreTitle: "购买更多转写分钟", description: "查看账号用量和剩余额度", manageBilling: "管理账单", packs: {ADDON_BASIC: {description: "适合少量超额工作的精准补充。", name: "基础版", quota: "额外 500 分钟"}, ADDON_STANDARD: {description: "适合付费账号常规超额的高性价比选择。", name: "标准版", quota: "额外 1000 分钟"}, ADDON_PRO: {description: "适合密集项目冲刺的大容量分钟包。", name: "专业版", quota: "额外 3000 分钟"}}, planNames: {BASIC: "基础版", FREE: "免费版", PRO: "专业版", STANDARD: "标准版"}, resetsOn: (date) => `重置日期：${date}`, title: "用量", total: (value) => `总量：${value}`, upgradeNow: "立即升级", used: (value) => `已用：${value}`},
  "zh-TW": {billingPortalUnavailable: "連接付費訂閱後即可使用帳單入口。", buyMoreDescription: "加購分鐘會在結帳後加入你的目前方案。", buyMoreTitle: "購買更多轉寫分鐘", description: "查看帳號用量和剩餘額度", manageBilling: "管理帳單", packs: {ADDON_BASIC: {description: "適合少量超額工作的精準補充。", name: "基礎版", quota: "額外 500 分鐘"}, ADDON_STANDARD: {description: "適合付費帳號常規超額的高性價比選擇。", name: "標準版", quota: "額外 1000 分鐘"}, ADDON_PRO: {description: "適合密集專案衝刺的大容量分鐘包。", name: "專業版", quota: "額外 3000 分鐘"}}, planNames: {BASIC: "基礎版", FREE: "免費版", PRO: "專業版", STANDARD: "標準版"}, resetsOn: (date) => `重設日期：${date}`, title: "用量", total: (value) => `總量：${value}`, upgradeNow: "立即升級", used: (value) => `已用：${value}`}
};

const settingsApiCopy: Record<Locale, SettingsCopy["api"]> = {
  ar: {actions: "الإجراءات", apiKeyCreated: "تم إنشاء مفتاح API. انسخ الرمز الآن لأنه سيظهر مرة واحدة فقط.", apiKeyRenamed: "تمت إعادة تسمية مفتاح API.", apiKeyReset: "تمت إعادة ضبط مفتاح API. انسخ الرمز الجديد الآن لأنه سيظهر مرة واحدة فقط.", apiKeyRevoked: "تم إلغاء مفتاح API.", apiTokenCopied: "تم نسخ رمز API.", copyTokenNow: "انسخ هذا الرمز الآن. لن يظهر مرة أخرى.", createApiKey: "إنشاء مفتاح API", creating: "جار الإنشاء...", description: "إدارة مفاتيح API للوصول إلى Votxt API", fullKeyNotice: "تظهر مفاتيح API الكاملة مرة واحدة بعد الإنشاء أو إعادة الضبط. خزّن الرمز بأمان قبل مغادرة الصفحة.", keyName: "اسم المفتاح", keyNamePlaceholder: "مفتاح API للإنتاج", loading: "جار تحميل مفاتيح API...", lockedDescription: "قم بترقية خطتك للوصول إلى ميزات إدارة API", lockedTitle: "يتطلب الوصول إلى API اشتراكًا نشطًا أو خطة LTD", name: "الاسم", newToken: "رمز API جديد", noKeysDescription: "أنشئ مفتاحًا لربط عملاء الأتمتة مع Votxt API.", noKeysTitle: "لا توجد مفاتيح API بعد", productionKeyDefault: "مفتاح API افتراضي", renameAria: "إعادة تسمية مفتاح API", resetAria: "إعادة ضبط مفتاح API", revokeAria: "إلغاء مفتاح API", status: "الحالة", statuses: {ACTIVE: "نشط", REVOKED: "ملغى"}, title: "إدارة مفاتيح API", viewDocs: "عرض وثائق API", createdLastUsed: (created, lastUsed) => `أُنشئ ${created} · آخر استخدام ${lastUsed}`},
  de: {actions: "Aktionen", apiKeyCreated: "API-Schlüssel erstellt. Kopiere den Token jetzt, da er nur einmal angezeigt wird.", apiKeyRenamed: "API-Schlüssel umbenannt.", apiKeyReset: "API-Schlüssel zurückgesetzt. Kopiere den neuen Token jetzt, da er nur einmal angezeigt wird.", apiKeyRevoked: "API-Schlüssel widerrufen.", apiTokenCopied: "API-Token kopiert.", copyTokenNow: "Kopiere diesen Token jetzt. Er wird nicht erneut angezeigt.", createApiKey: "API-Schlüssel erstellen", creating: "Wird erstellt...", description: "Verwalte deine API-Schlüssel für den Zugriff auf die Votxt API", fullKeyNotice: "Vollständige API-Schlüssel werden nach Erstellung oder Zurücksetzen einmal angezeigt. Speichere den Token sicher, bevor du die Seite verlässt.", keyName: "Schlüsselname", keyNamePlaceholder: "Produktions-API-Schlüssel", loading: "API-Schlüssel werden geladen...", lockedDescription: "Upgrade deinen Plan, um API-Verwaltungsfunktionen zu nutzen", lockedTitle: "API-Zugriff erfordert ein aktives Abo oder einen LTD-Plan", name: "Name", newToken: "Neuer API-Token", noKeysDescription: "Erstelle einen Schlüssel, um Automatisierungsclients mit der Votxt API zu verbinden.", noKeysTitle: "Noch keine API-Schlüssel", productionKeyDefault: "Standard-API-Schlüssel", renameAria: "API-Schlüssel umbenennen", resetAria: "API-Schlüssel zurücksetzen", revokeAria: "API-Schlüssel widerrufen", status: "Status", statuses: {ACTIVE: "Aktiv", REVOKED: "Widerrufen"}, title: "API-Schlüsselverwaltung", viewDocs: "API-Dokumentation ansehen", createdLastUsed: (created, lastUsed) => `Erstellt ${created} · Zuletzt verwendet ${lastUsed}`},
  en: settingsCopyEn.api,
  es: {actions: "Acciones", apiKeyCreated: "Clave API creada. Copia el token ahora porque solo se mostrará una vez.", apiKeyRenamed: "Clave API renombrada.", apiKeyReset: "Clave API restablecida. Copia el nuevo token ahora porque solo se mostrará una vez.", apiKeyRevoked: "Clave API revocada.", apiTokenCopied: "Token API copiado.", copyTokenNow: "Copia este token ahora. No se mostrará otra vez.", createApiKey: "Crear clave API", creating: "Creando...", description: "Gestiona tus claves API para acceder a la API de Votxt", fullKeyNotice: "Las claves API completas se muestran una vez después de crearlas o restablecerlas. Guarda el token de forma segura antes de salir de esta página.", keyName: "Nombre de clave", keyNamePlaceholder: "Clave API de producción", loading: "Cargando claves API...", lockedDescription: "Mejora tu plan para acceder a la gestión de API", lockedTitle: "El acceso API requiere una suscripción activa o un plan LTD", name: "Nombre", newToken: "Nuevo token API", noKeysDescription: "Crea una clave para conectar clientes de automatización con la API de Votxt.", noKeysTitle: "Aún no hay claves API", productionKeyDefault: "Clave API predeterminada", renameAria: "Renombrar clave API", resetAria: "Restablecer clave API", revokeAria: "Revocar clave API", status: "Estado", statuses: {ACTIVE: "Activa", REVOKED: "Revocada"}, title: "Gestión de claves API", viewDocs: "Ver documentación API", createdLastUsed: (created, lastUsed) => `Creada ${created} · Último uso ${lastUsed}`},
  fr: {actions: "Actions", apiKeyCreated: "Clé API créée. Copiez le jeton maintenant, car il ne sera affiché qu'une seule fois.", apiKeyRenamed: "Clé API renommée.", apiKeyReset: "Clé API réinitialisée. Copiez le nouveau jeton maintenant, car il ne sera affiché qu'une seule fois.", apiKeyRevoked: "Clé API révoquée.", apiTokenCopied: "Jeton API copié.", copyTokenNow: "Copiez ce jeton maintenant. Il ne sera plus affiché.", createApiKey: "Créer une clé API", creating: "Création...", description: "Gérez vos clés API pour accéder à l'API Votxt", fullKeyNotice: "Les clés API complètes sont affichées une fois après création ou réinitialisation. Enregistrez le jeton en lieu sûr avant de quitter cette page.", keyName: "Nom de la clé", keyNamePlaceholder: "Clé API de production", loading: "Chargement des clés API...", lockedDescription: "Changez de forfait pour accéder aux fonctions de gestion API", lockedTitle: "L'accès API nécessite un abonnement actif ou un forfait LTD", name: "Nom", newToken: "Nouveau jeton API", noKeysDescription: "Créez une clé pour connecter des clients d'automatisation à l'API Votxt.", noKeysTitle: "Aucune clé API pour le moment", productionKeyDefault: "Clé API par défaut", renameAria: "Renommer la clé API", resetAria: "Réinitialiser la clé API", revokeAria: "Révoquer la clé API", status: "Statut", statuses: {ACTIVE: "Active", REVOKED: "Révoquée"}, title: "Gestion des clés API", viewDocs: "Voir la documentation API", createdLastUsed: (created, lastUsed) => `Créée ${created} · Dernière utilisation ${lastUsed}`},
  hu: {actions: "Műveletek", apiKeyCreated: "API-kulcs létrehozva. Másold ki most a tokent, mert csak egyszer jelenik meg.", apiKeyRenamed: "API-kulcs átnevezve.", apiKeyReset: "API-kulcs alaphelyzetbe állítva. Másold ki most az új tokent, mert csak egyszer jelenik meg.", apiKeyRevoked: "API-kulcs visszavonva.", apiTokenCopied: "API-token másolva.", copyTokenNow: "Másold ki most ezt a tokent. Többé nem jelenik meg.", createApiKey: "API-kulcs létrehozása", creating: "Létrehozás...", description: "Kezeld az Votxt API eléréséhez használt API-kulcsokat", fullKeyNotice: "A teljes API-kulcsok létrehozás vagy visszaállítás után egyszer jelennek meg. Tárold biztonságosan a tokent, mielőtt elhagyod az oldalt.", keyName: "Kulcs neve", keyNamePlaceholder: "Éles API-kulcs", loading: "API-kulcsok betöltése...", lockedDescription: "Frissítsd a csomagod az API-kezelési funkciók eléréséhez", lockedTitle: "Az API-hozzáféréshez aktív előfizetés vagy LTD-csomag szükséges", name: "Név", newToken: "Új API-token", noKeysDescription: "Hozz létre kulcsot, hogy automatizálási klienseket kapcsolj az Votxt API-hoz.", noKeysTitle: "Még nincsenek API-kulcsok", productionKeyDefault: "Alapértelmezett API-kulcs", renameAria: "API-kulcs átnevezése", resetAria: "API-kulcs visszaállítása", revokeAria: "API-kulcs visszavonása", status: "Állapot", statuses: {ACTIVE: "Aktív", REVOKED: "Visszavonva"}, title: "API-kulcs kezelés", viewDocs: "API dokumentáció megtekintése", createdLastUsed: (created, lastUsed) => `Létrehozva ${created} · Utolsó használat ${lastUsed}`},
  id: {actions: "Tindakan", apiKeyCreated: "Kunci API dibuat. Salin token sekarang karena hanya akan ditampilkan sekali.", apiKeyRenamed: "Kunci API diganti nama.", apiKeyReset: "Kunci API direset. Salin token baru sekarang karena hanya akan ditampilkan sekali.", apiKeyRevoked: "Kunci API dicabut.", apiTokenCopied: "Token API disalin.", copyTokenNow: "Salin token ini sekarang. Token tidak akan ditampilkan lagi.", createApiKey: "Buat Kunci API", creating: "Membuat...", description: "Kelola kunci API untuk mengakses Votxt API", fullKeyNotice: "Kunci API lengkap ditampilkan sekali setelah dibuat atau direset. Simpan token dengan aman sebelum meninggalkan halaman ini.", keyName: "Nama Kunci", keyNamePlaceholder: "Kunci API Produksi", loading: "Memuat kunci API...", lockedDescription: "Tingkatkan paket Anda untuk mengakses fitur manajemen API", lockedTitle: "Akses API memerlukan langganan aktif atau paket LTD", name: "Nama", newToken: "Token API baru", noKeysDescription: "Buat kunci untuk menghubungkan klien otomatisasi ke Votxt API.", noKeysTitle: "Belum ada kunci API", productionKeyDefault: "Kunci API Default", renameAria: "Ganti nama kunci API", resetAria: "Reset kunci API", revokeAria: "Cabut kunci API", status: "Status", statuses: {ACTIVE: "Aktif", REVOKED: "Dicabut"}, title: "Manajemen Kunci API", viewDocs: "Lihat Dokumentasi API", createdLastUsed: (created, lastUsed) => `Dibuat ${created} · Terakhir digunakan ${lastUsed}`},
  it: {actions: "Azioni", apiKeyCreated: "Chiave API creata. Copia il token ora perché verrà mostrato una sola volta.", apiKeyRenamed: "Chiave API rinominata.", apiKeyReset: "Chiave API reimpostata. Copia il nuovo token ora perché verrà mostrato una sola volta.", apiKeyRevoked: "Chiave API revocata.", apiTokenCopied: "Token API copiato.", copyTokenNow: "Copia questo token ora. Non verrà mostrato di nuovo.", createApiKey: "Crea chiave API", creating: "Creazione...", description: "Gestisci le chiavi API per accedere all'API Votxt", fullKeyNotice: "Le chiavi API complete vengono mostrate una volta dopo la creazione o il reset. Salva il token in modo sicuro prima di lasciare la pagina.", keyName: "Nome chiave", keyNamePlaceholder: "Chiave API di produzione", loading: "Caricamento chiavi API...", lockedDescription: "Aggiorna il piano per accedere alle funzioni di gestione API", lockedTitle: "L'accesso API richiede un abbonamento attivo o un piano LTD", name: "Nome", newToken: "Nuovo token API", noKeysDescription: "Crea una chiave per collegare client di automazione all'API Votxt.", noKeysTitle: "Ancora nessuna chiave API", productionKeyDefault: "Chiave API predefinita", renameAria: "Rinomina chiave API", resetAria: "Reimposta chiave API", revokeAria: "Revoca chiave API", status: "Stato", statuses: {ACTIVE: "Attiva", REVOKED: "Revocata"}, title: "Gestione chiavi API", viewDocs: "Vedi documentazione API", createdLastUsed: (created, lastUsed) => `Creata ${created} · Ultimo uso ${lastUsed}`},
  ja: {actions: "操作", apiKeyCreated: "API キーを作成しました。トークンは一度だけ表示されるため、今コピーしてください。", apiKeyRenamed: "API キー名を変更しました。", apiKeyReset: "API キーをリセットしました。新しいトークンは一度だけ表示されるため、今コピーしてください。", apiKeyRevoked: "API キーを取り消しました。", apiTokenCopied: "API トークンをコピーしました。", copyTokenNow: "このトークンを今コピーしてください。再表示されません。", createApiKey: "API キーを作成", creating: "作成中...", description: "Votxt API へアクセスする API キーを管理します", fullKeyNotice: "完全な API キーは作成またはリセット後に一度だけ表示されます。このページを離れる前に安全に保存してください。", keyName: "キー名", keyNamePlaceholder: "本番 API キー", loading: "API キーを読み込み中...", lockedDescription: "API 管理機能を使うにはプランをアップグレードしてください", lockedTitle: "API アクセスには有効なサブスクリプションまたは LTD プランが必要です", name: "名前", newToken: "新しい API トークン", noKeysDescription: "自動化クライアントを Votxt API に接続するキーを作成します。", noKeysTitle: "API キーはまだありません", productionKeyDefault: "デフォルト API キー", renameAria: "API キー名を変更", resetAria: "API キーをリセット", revokeAria: "API キーを取り消し", status: "ステータス", statuses: {ACTIVE: "有効", REVOKED: "取消済み"}, title: "API キー管理", viewDocs: "API ドキュメントを見る", createdLastUsed: (created, lastUsed) => `作成 ${created} · 最終使用 ${lastUsed}`},
  ko: {actions: "작업", apiKeyCreated: "API 키가 생성되었습니다. 토큰은 한 번만 표시되므로 지금 복사하세요.", apiKeyRenamed: "API 키 이름이 변경되었습니다.", apiKeyReset: "API 키가 재설정되었습니다. 새 토큰은 한 번만 표시되므로 지금 복사하세요.", apiKeyRevoked: "API 키가 폐기되었습니다.", apiTokenCopied: "API 토큰이 복사되었습니다.", copyTokenNow: "이 토큰을 지금 복사하세요. 다시 표시되지 않습니다.", createApiKey: "API 키 만들기", creating: "생성 중...", description: "Votxt API 접근용 API 키를 관리하세요", fullKeyNotice: "전체 API 키는 생성 또는 재설정 후 한 번만 표시됩니다. 이 페이지를 떠나기 전에 토큰을 안전하게 저장하세요.", keyName: "키 이름", keyNamePlaceholder: "프로덕션 API 키", loading: "API 키 로딩 중...", lockedDescription: "API 관리 기능을 사용하려면 플랜을 업그레이드하세요", lockedTitle: "API 접근에는 활성 구독 또는 LTD 플랜이 필요합니다", name: "이름", newToken: "새 API 토큰", noKeysDescription: "자동화 클라이언트를 Votxt API에 연결할 키를 만드세요.", noKeysTitle: "아직 API 키가 없습니다", productionKeyDefault: "기본 API 키", renameAria: "API 키 이름 변경", resetAria: "API 키 재설정", revokeAria: "API 키 폐기", status: "상태", statuses: {ACTIVE: "활성", REVOKED: "폐기됨"}, title: "API 키 관리", viewDocs: "API 문서 보기", createdLastUsed: (created, lastUsed) => `생성 ${created} · 마지막 사용 ${lastUsed}`},
  nl: {actions: "Acties", apiKeyCreated: "API-sleutel aangemaakt. Kopieer de token nu, want deze wordt maar één keer getoond.", apiKeyRenamed: "API-sleutel hernoemd.", apiKeyReset: "API-sleutel gereset. Kopieer de nieuwe token nu, want deze wordt maar één keer getoond.", apiKeyRevoked: "API-sleutel ingetrokken.", apiTokenCopied: "API-token gekopieerd.", copyTokenNow: "Kopieer deze token nu. Hij wordt niet opnieuw getoond.", createApiKey: "API-sleutel maken", creating: "Maken...", description: "Beheer je API-sleutels voor toegang tot de Votxt API", fullKeyNotice: "Volledige API-sleutels worden één keer getoond na aanmaken of resetten. Bewaar de token veilig voordat je deze pagina verlaat.", keyName: "Sleutelnaam", keyNamePlaceholder: "Productie-API-sleutel", loading: "API-sleutels laden...", lockedDescription: "Upgrade je plan om API-beheerfuncties te gebruiken", lockedTitle: "API-toegang vereist een actief abonnement of LTD-plan", name: "Naam", newToken: "Nieuwe API-token", noKeysDescription: "Maak een sleutel om automatiseringsclients met de Votxt API te verbinden.", noKeysTitle: "Nog geen API-sleutels", productionKeyDefault: "Standaard API-sleutel", renameAria: "API-sleutel hernoemen", resetAria: "API-sleutel resetten", revokeAria: "API-sleutel intrekken", status: "Status", statuses: {ACTIVE: "Actief", REVOKED: "Ingetrokken"}, title: "API-sleutelbeheer", viewDocs: "API-documentatie bekijken", createdLastUsed: (created, lastUsed) => `Aangemaakt ${created} · Laatst gebruikt ${lastUsed}`},
  pl: {actions: "Akcje", apiKeyCreated: "Klucz API utworzony. Skopiuj token teraz, ponieważ zostanie pokazany tylko raz.", apiKeyRenamed: "Klucz API zmieniony.", apiKeyReset: "Klucz API zresetowany. Skopiuj nowy token teraz, ponieważ zostanie pokazany tylko raz.", apiKeyRevoked: "Klucz API unieważniony.", apiTokenCopied: "Token API skopiowany.", copyTokenNow: "Skopiuj ten token teraz. Nie zostanie pokazany ponownie.", createApiKey: "Utwórz klucz API", creating: "Tworzenie...", description: "Zarządzaj kluczami API do dostępu do Votxt API", fullKeyNotice: "Pełne klucze API są pokazywane raz po utworzeniu lub resecie. Zapisz token bezpiecznie przed opuszczeniem tej strony.", keyName: "Nazwa klucza", keyNamePlaceholder: "Produkcyjny klucz API", loading: "Ładowanie kluczy API...", lockedDescription: "Ulepsz plan, aby uzyskać dostęp do funkcji zarządzania API", lockedTitle: "Dostęp API wymaga aktywnej subskrypcji lub planu LTD", name: "Nazwa", newToken: "Nowy token API", noKeysDescription: "Utwórz klucz, aby połączyć klientów automatyzacji z Votxt API.", noKeysTitle: "Brak kluczy API", productionKeyDefault: "Domyślny klucz API", renameAria: "Zmień nazwę klucza API", resetAria: "Zresetuj klucz API", revokeAria: "Unieważnij klucz API", status: "Status", statuses: {ACTIVE: "Aktywny", REVOKED: "Unieważniony"}, title: "Zarządzanie kluczami API", viewDocs: "Zobacz dokumentację API", createdLastUsed: (created, lastUsed) => `Utworzono ${created} · Ostatnio użyto ${lastUsed}`},
  pt: {actions: "Ações", apiKeyCreated: "Chave de API criada. Copie o token agora, pois ele será mostrado apenas uma vez.", apiKeyRenamed: "Chave de API renomeada.", apiKeyReset: "Chave de API redefinida. Copie o novo token agora, pois ele será mostrado apenas uma vez.", apiKeyRevoked: "Chave de API revogada.", apiTokenCopied: "Token de API copiado.", copyTokenNow: "Copie este token agora. Ele não será mostrado novamente.", createApiKey: "Criar chave de API", creating: "Criando...", description: "Gerencie suas chaves de API para acessar a API da Votxt", fullKeyNotice: "Chaves de API completas são mostradas uma vez após criação ou redefinição. Salve o token com segurança antes de sair desta página.", keyName: "Nome da chave", keyNamePlaceholder: "Chave de API de produção", loading: "Carregando chaves de API...", lockedDescription: "Atualize seu plano para acessar recursos de gerenciamento de API", lockedTitle: "O acesso à API requer uma assinatura ativa ou plano LTD", name: "Nome", newToken: "Novo token de API", noKeysDescription: "Crie uma chave para conectar clientes de automação à API da Votxt.", noKeysTitle: "Ainda não há chaves de API", productionKeyDefault: "Chave de API padrão", renameAria: "Renomear chave de API", resetAria: "Redefinir chave de API", revokeAria: "Revogar chave de API", status: "Status", statuses: {ACTIVE: "Ativa", REVOKED: "Revogada"}, title: "Gerenciamento de chaves API", viewDocs: "Ver documentação da API", createdLastUsed: (created, lastUsed) => `Criada ${created} · Último uso ${lastUsed}`},
  ru: {actions: "Действия", apiKeyCreated: "API-ключ создан. Скопируйте токен сейчас, потому что он будет показан только один раз.", apiKeyRenamed: "API-ключ переименован.", apiKeyReset: "API-ключ сброшен. Скопируйте новый токен сейчас, потому что он будет показан только один раз.", apiKeyRevoked: "API-ключ отозван.", apiTokenCopied: "API-токен скопирован.", copyTokenNow: "Скопируйте этот токен сейчас. Он больше не будет показан.", createApiKey: "Создать API-ключ", creating: "Создание...", description: "Управляйте API-ключами для доступа к Votxt API", fullKeyNotice: "Полные API-ключи показываются один раз после создания или сброса. Сохраните токен безопасно перед уходом со страницы.", keyName: "Название ключа", keyNamePlaceholder: "Production API Key", loading: "Загрузка API-ключей...", lockedDescription: "Обновите план, чтобы получить доступ к управлению API", lockedTitle: "Для доступа к API нужна активная подписка или LTD-план", name: "Название", newToken: "Новый API-токен", noKeysDescription: "Создайте ключ, чтобы подключить клиенты автоматизации к Votxt API.", noKeysTitle: "API-ключей пока нет", productionKeyDefault: "API-ключ по умолчанию", renameAria: "Переименовать API-ключ", resetAria: "Сбросить API-ключ", revokeAria: "Отозвать API-ключ", status: "Статус", statuses: {ACTIVE: "Активен", REVOKED: "Отозван"}, title: "Управление API-ключами", viewDocs: "Открыть документацию API", createdLastUsed: (created, lastUsed) => `Создан ${created} · Последнее использование ${lastUsed}`},
  th: {actions: "การดำเนินการ", apiKeyCreated: "สร้างคีย์ API แล้ว คัดลอกโทเค็นตอนนี้เพราะจะแสดงเพียงครั้งเดียว", apiKeyRenamed: "เปลี่ยนชื่อคีย์ API แล้ว", apiKeyReset: "รีเซ็ตคีย์ API แล้ว คัดลอกโทเค็นใหม่ตอนนี้เพราะจะแสดงเพียงครั้งเดียว", apiKeyRevoked: "เพิกถอนคีย์ API แล้ว", apiTokenCopied: "คัดลอกโทเค็น API แล้ว", copyTokenNow: "คัดลอกโทเค็นนี้ตอนนี้ ระบบจะไม่แสดงอีก", createApiKey: "สร้างคีย์ API", creating: "กำลังสร้าง...", description: "จัดการคีย์ API สำหรับเข้าถึง Votxt API", fullKeyNotice: "คีย์ API แบบเต็มจะแสดงหนึ่งครั้งหลังสร้างหรือรีเซ็ต โปรดเก็บโทเค็นให้ปลอดภัยก่อนออกจากหน้านี้", keyName: "ชื่อคีย์", keyNamePlaceholder: "คีย์ API สำหรับโปรดักชัน", loading: "กำลังโหลดคีย์ API...", lockedDescription: "อัปเกรดแพ็กเกจเพื่อเข้าถึงฟีเจอร์จัดการ API", lockedTitle: "การเข้าถึง API ต้องมีการสมัครสมาชิกที่ใช้งานอยู่หรือแพ็กเกจ LTD", name: "ชื่อ", newToken: "โทเค็น API ใหม่", noKeysDescription: "สร้างคีย์เพื่อเชื่อมต่อไคลเอนต์อัตโนมัติกับ Votxt API", noKeysTitle: "ยังไม่มีคีย์ API", productionKeyDefault: "คีย์ API เริ่มต้น", renameAria: "เปลี่ยนชื่อคีย์ API", resetAria: "รีเซ็ตคีย์ API", revokeAria: "เพิกถอนคีย์ API", status: "สถานะ", statuses: {ACTIVE: "ใช้งานอยู่", REVOKED: "ถูกเพิกถอน"}, title: "การจัดการคีย์ API", viewDocs: "ดูเอกสาร API", createdLastUsed: (created, lastUsed) => `สร้างเมื่อ ${created} · ใช้ล่าสุด ${lastUsed}`},
  tr: {actions: "İşlemler", apiKeyCreated: "API anahtarı oluşturuldu. Token yalnızca bir kez gösterileceği için şimdi kopyalayın.", apiKeyRenamed: "API anahtarı yeniden adlandırıldı.", apiKeyReset: "API anahtarı sıfırlandı. Yeni token yalnızca bir kez gösterileceği için şimdi kopyalayın.", apiKeyRevoked: "API anahtarı iptal edildi.", apiTokenCopied: "API token kopyalandı.", copyTokenNow: "Bu tokenı şimdi kopyalayın. Tekrar gösterilmeyecek.", createApiKey: "API Anahtarı Oluştur", creating: "Oluşturuluyor...", description: "Votxt API erişimi için API anahtarlarınızı yönetin", fullKeyNotice: "Tam API anahtarları oluşturma veya sıfırlama sonrası bir kez gösterilir. Bu sayfadan ayrılmadan önce tokenı güvenle saklayın.", keyName: "Anahtar adı", keyNamePlaceholder: "Üretim API Anahtarı", loading: "API anahtarları yükleniyor...", lockedDescription: "API yönetim özelliklerine erişmek için planınızı yükseltin", lockedTitle: "API erişimi aktif abonelik veya LTD planı gerektirir", name: "Ad", newToken: "Yeni API token", noKeysDescription: "Otomasyon istemcilerini Votxt API'ye bağlamak için bir anahtar oluşturun.", noKeysTitle: "Henüz API anahtarı yok", productionKeyDefault: "Varsayılan API Anahtarı", renameAria: "API anahtarını yeniden adlandır", resetAria: "API anahtarını sıfırla", revokeAria: "API anahtarını iptal et", status: "Durum", statuses: {ACTIVE: "Aktif", REVOKED: "İptal edildi"}, title: "API Anahtarı Yönetimi", viewDocs: "API Belgelerini Gör", createdLastUsed: (created, lastUsed) => `Oluşturuldu ${created} · Son kullanım ${lastUsed}`},
  uk: {actions: "Дії", apiKeyCreated: "API-ключ створено. Скопіюйте токен зараз, бо він буде показаний лише один раз.", apiKeyRenamed: "API-ключ перейменовано.", apiKeyReset: "API-ключ скинуто. Скопіюйте новий токен зараз, бо він буде показаний лише один раз.", apiKeyRevoked: "API-ключ відкликано.", apiTokenCopied: "API-токен скопійовано.", copyTokenNow: "Скопіюйте цей токен зараз. Його більше не буде показано.", createApiKey: "Створити API-ключ", creating: "Створення...", description: "Керуйте API-ключами для доступу до Votxt API", fullKeyNotice: "Повні API-ключі показуються один раз після створення або скидання. Збережіть токен безпечно перед виходом зі сторінки.", keyName: "Назва ключа", keyNamePlaceholder: "Production API Key", loading: "Завантаження API-ключів...", lockedDescription: "Оновіть план, щоб отримати доступ до керування API", lockedTitle: "Для доступу до API потрібна активна підписка або LTD-план", name: "Назва", newToken: "Новий API-токен", noKeysDescription: "Створіть ключ, щоб підключити клієнти автоматизації до Votxt API.", noKeysTitle: "API-ключів ще немає", productionKeyDefault: "API-ключ за замовчуванням", renameAria: "Перейменувати API-ключ", resetAria: "Скинути API-ключ", revokeAria: "Відкликати API-ключ", status: "Статус", statuses: {ACTIVE: "Активний", REVOKED: "Відкликаний"}, title: "Керування API-ключами", viewDocs: "Переглянути документацію API", createdLastUsed: (created, lastUsed) => `Створено ${created} · Останнє використання ${lastUsed}`},
  vi: {actions: "Thao tác", apiKeyCreated: "Đã tạo khóa API. Hãy sao chép token ngay vì nó chỉ hiển thị một lần.", apiKeyRenamed: "Đã đổi tên khóa API.", apiKeyReset: "Đã đặt lại khóa API. Hãy sao chép token mới ngay vì nó chỉ hiển thị một lần.", apiKeyRevoked: "Đã thu hồi khóa API.", apiTokenCopied: "Đã sao chép token API.", copyTokenNow: "Sao chép token này ngay. Token sẽ không hiển thị lại.", createApiKey: "Tạo khóa API", creating: "Đang tạo...", description: "Quản lý khóa API để truy cập Votxt API", fullKeyNotice: "Khóa API đầy đủ chỉ hiển thị một lần sau khi tạo hoặc đặt lại. Hãy lưu token an toàn trước khi rời trang này.", keyName: "Tên khóa", keyNamePlaceholder: "Khóa API sản xuất", loading: "Đang tải khóa API...", lockedDescription: "Nâng cấp gói để truy cập tính năng quản lý API", lockedTitle: "Truy cập API yêu cầu gói đăng ký đang hoạt động hoặc gói LTD", name: "Tên", newToken: "Token API mới", noKeysDescription: "Tạo khóa để kết nối các client tự động hóa với Votxt API.", noKeysTitle: "Chưa có khóa API", productionKeyDefault: "Khóa API mặc định", renameAria: "Đổi tên khóa API", resetAria: "Đặt lại khóa API", revokeAria: "Thu hồi khóa API", status: "Trạng thái", statuses: {ACTIVE: "Hoạt động", REVOKED: "Đã thu hồi"}, title: "Quản lý khóa API", viewDocs: "Xem tài liệu API", createdLastUsed: (created, lastUsed) => `Đã tạo ${created} · Dùng lần cuối ${lastUsed}`},
  zh: {actions: "操作", apiKeyCreated: "API 密钥已创建。请立即复制令牌，因为它只会显示一次。", apiKeyRenamed: "API 密钥已重命名。", apiKeyReset: "API 密钥已重置。请立即复制新令牌，因为它只会显示一次。", apiKeyRevoked: "API 密钥已撤销。", apiTokenCopied: "API 令牌已复制。", copyTokenNow: "请立即复制此令牌。它不会再次显示。", createApiKey: "创建 API 密钥", creating: "正在创建...", description: "管理用于访问 Votxt API 的 API 密钥", fullKeyNotice: "完整 API 密钥只会在创建或重置后显示一次。离开此页面前请安全保存令牌。", keyName: "密钥名称", keyNamePlaceholder: "生产 API 密钥", loading: "正在加载 API 密钥...", lockedDescription: "升级套餐以使用 API 管理功能", lockedTitle: "API 访问需要有效订阅或 LTD 套餐", name: "名称", newToken: "新的 API 令牌", noKeysDescription: "创建密钥，将自动化客户端连接到 Votxt API。", noKeysTitle: "还没有 API 密钥", productionKeyDefault: "默认 API 密钥", renameAria: "重命名 API 密钥", resetAria: "重置 API 密钥", revokeAria: "撤销 API 密钥", status: "状态", statuses: {ACTIVE: "有效", REVOKED: "已撤销"}, title: "API 密钥管理", viewDocs: "查看 API 文档", createdLastUsed: (created, lastUsed) => `创建于 ${created} · 上次使用 ${lastUsed}`},
  "zh-TW": {actions: "操作", apiKeyCreated: "API 金鑰已建立。請立即複製權杖，因為它只會顯示一次。", apiKeyRenamed: "API 金鑰已重新命名。", apiKeyReset: "API 金鑰已重設。請立即複製新權杖，因為它只會顯示一次。", apiKeyRevoked: "API 金鑰已撤銷。", apiTokenCopied: "API 權杖已複製。", copyTokenNow: "請立即複製此權杖。它不會再次顯示。", createApiKey: "建立 API 金鑰", creating: "正在建立...", description: "管理用於存取 Votxt API 的 API 金鑰", fullKeyNotice: "完整 API 金鑰只會在建立或重設後顯示一次。離開此頁面前請安全保存權杖。", keyName: "金鑰名稱", keyNamePlaceholder: "正式環境 API 金鑰", loading: "正在載入 API 金鑰...", lockedDescription: "升級方案以使用 API 管理功能", lockedTitle: "API 存取需要有效訂閱或 LTD 方案", name: "名稱", newToken: "新的 API 權杖", noKeysDescription: "建立金鑰，將自動化用戶端連接到 Votxt API。", noKeysTitle: "尚無 API 金鑰", productionKeyDefault: "預設 API 金鑰", renameAria: "重新命名 API 金鑰", resetAria: "重設 API 金鑰", revokeAria: "撤銷 API 金鑰", status: "狀態", statuses: {ACTIVE: "有效", REVOKED: "已撤銷"}, title: "API 金鑰管理", viewDocs: "查看 API 文件", createdLastUsed: (created, lastUsed) => `建立於 ${created} · 上次使用 ${lastUsed}`}
};

const settingsApiDialogsCopy: Record<Locale, SettingsCopy["apiDialogs"]> = {
  ar: {renameDescription: (name) => `أدخل اسمًا جديدًا لـ "${name}".`, renameTitle: "إعادة تسمية مفتاح API", resetDescription: (name) => `إعادة ضبط "${name}"؟ العملاء الذين يستخدمون الرمز القديم سيتوقفون عن العمل.`, resetTitle: "إعادة ضبط مفتاح API", revokeDescription: (name) => `إلغاء "${name}"؟ لا يمكن التراجع عن ذلك.`, revokeTitle: "إلغاء مفتاح API"},
  de: {renameDescription: (name) => `Gib einen neuen Namen für "${name}" ein.`, renameTitle: "API-Schlüssel umbenennen", resetDescription: (name) => `"${name}" zurücksetzen? Bestehende Clients mit dem alten Token funktionieren nicht mehr.`, resetTitle: "API-Schlüssel zurücksetzen", revokeDescription: (name) => `"${name}" widerrufen? Dies kann nicht rückgängig gemacht werden.`, revokeTitle: "API-Schlüssel widerrufen"},
  en: settingsCopyEn.apiDialogs,
  es: {renameDescription: (name) => `Introduce un nuevo nombre para "${name}".`, renameTitle: "Renombrar clave API", resetDescription: (name) => `¿Restablecer "${name}"? Los clientes que usen el token anterior dejarán de funcionar.`, resetTitle: "Restablecer clave API", revokeDescription: (name) => `¿Revocar "${name}"? Esto no se puede deshacer.`, revokeTitle: "Revocar clave API"},
  fr: {renameDescription: (name) => `Saisissez un nouveau nom pour "${name}".`, renameTitle: "Renommer la clé API", resetDescription: (name) => `Réinitialiser "${name}" ? Les clients utilisant l'ancien jeton cesseront de fonctionner.`, resetTitle: "Réinitialiser la clé API", revokeDescription: (name) => `Révoquer "${name}" ? Cette action est irréversible.`, revokeTitle: "Révoquer la clé API"},
  hu: {renameDescription: (name) => `Adj meg új nevet ehhez: "${name}".`, renameTitle: "API-kulcs átnevezése", resetDescription: (name) => `Visszaállítod ezt: "${name}"? A régi tokent használó kliensek leállnak.`, resetTitle: "API-kulcs visszaállítása", revokeDescription: (name) => `Visszavonod ezt: "${name}"? Ez nem vonható vissza.`, revokeTitle: "API-kulcs visszavonása"},
  id: {renameDescription: (name) => `Masukkan nama baru untuk "${name}".`, renameTitle: "Ganti Nama Kunci API", resetDescription: (name) => `Reset "${name}"? Klien yang memakai token lama akan berhenti berfungsi.`, resetTitle: "Reset Kunci API", revokeDescription: (name) => `Cabut "${name}"? Tindakan ini tidak dapat dibatalkan.`, revokeTitle: "Cabut Kunci API"},
  it: {renameDescription: (name) => `Inserisci un nuovo nome per "${name}".`, renameTitle: "Rinomina chiave API", resetDescription: (name) => `Reimpostare "${name}"? I client che usano il vecchio token smetteranno di funzionare.`, resetTitle: "Reimposta chiave API", revokeDescription: (name) => `Revocare "${name}"? Questa azione non può essere annullata.`, revokeTitle: "Revoca chiave API"},
  ja: {renameDescription: (name) => `"${name}" の新しい名前を入力します。`, renameTitle: "API キー名を変更", resetDescription: (name) => `"${name}" をリセットしますか？古いトークンを使う既存クライアントは動作しなくなります。`, resetTitle: "API キーをリセット", revokeDescription: (name) => `"${name}" を取り消しますか？この操作は元に戻せません。`, revokeTitle: "API キーを取り消し"},
  ko: {renameDescription: (name) => `"${name}"의 새 이름을 입력하세요.`, renameTitle: "API 키 이름 변경", resetDescription: (name) => `"${name}"을 재설정할까요? 기존 토큰을 사용하는 클라이언트는 작동을 멈춥니다.`, resetTitle: "API 키 재설정", revokeDescription: (name) => `"${name}"을 폐기할까요? 이 작업은 되돌릴 수 없습니다.`, revokeTitle: "API 키 폐기"},
  nl: {renameDescription: (name) => `Voer een nieuwe naam in voor "${name}".`, renameTitle: "API-sleutel hernoemen", resetDescription: (name) => `"${name}" resetten? Bestaande clients met de oude token werken dan niet meer.`, resetTitle: "API-sleutel resetten", revokeDescription: (name) => `"${name}" intrekken? Dit kan niet ongedaan worden gemaakt.`, revokeTitle: "API-sleutel intrekken"},
  pl: {renameDescription: (name) => `Wpisz nową nazwę dla "${name}".`, renameTitle: "Zmień nazwę klucza API", resetDescription: (name) => `Zresetować "${name}"? Klienci używający starego tokenu przestaną działać.`, resetTitle: "Zresetuj klucz API", revokeDescription: (name) => `Unieważnić "${name}"? Tego nie można cofnąć.`, revokeTitle: "Unieważnij klucz API"},
  pt: {renameDescription: (name) => `Insira um novo nome para "${name}".`, renameTitle: "Renomear chave de API", resetDescription: (name) => `Redefinir "${name}"? Clientes usando o token antigo deixarão de funcionar.`, resetTitle: "Redefinir chave de API", revokeDescription: (name) => `Revogar "${name}"? Isso não pode ser desfeito.`, revokeTitle: "Revogar chave de API"},
  ru: {renameDescription: (name) => `Введите новое имя для "${name}".`, renameTitle: "Переименовать API-ключ", resetDescription: (name) => `Сбросить "${name}"? Клиенты со старым токеном перестанут работать.`, resetTitle: "Сбросить API-ключ", revokeDescription: (name) => `Отозвать "${name}"? Это нельзя отменить.`, revokeTitle: "Отозвать API-ключ"},
  th: {renameDescription: (name) => `ป้อนชื่อใหม่สำหรับ "${name}"`, renameTitle: "เปลี่ยนชื่อคีย์ API", resetDescription: (name) => `รีเซ็ต "${name}"? ไคลเอนต์ที่ใช้โทเค็นเก่าจะหยุดทำงาน`, resetTitle: "รีเซ็ตคีย์ API", revokeDescription: (name) => `เพิกถอน "${name}"? การดำเนินการนี้ย้อนกลับไม่ได้`, revokeTitle: "เพิกถอนคีย์ API"},
  tr: {renameDescription: (name) => `"${name}" için yeni bir ad girin.`, renameTitle: "API Anahtarını Yeniden Adlandır", resetDescription: (name) => `"${name}" sıfırlansın mı? Eski tokenı kullanan mevcut istemciler çalışmayı durdurur.`, resetTitle: "API Anahtarını Sıfırla", revokeDescription: (name) => `"${name}" iptal edilsin mi? Bu işlem geri alınamaz.`, revokeTitle: "API Anahtarını İptal Et"},
  uk: {renameDescription: (name) => `Введіть нову назву для "${name}".`, renameTitle: "Перейменувати API-ключ", resetDescription: (name) => `Скинути "${name}"? Клієнти зі старим токеном перестануть працювати.`, resetTitle: "Скинути API-ключ", revokeDescription: (name) => `Відкликати "${name}"? Це не можна скасувати.`, revokeTitle: "Відкликати API-ключ"},
  vi: {renameDescription: (name) => `Nhập tên mới cho "${name}".`, renameTitle: "Đổi tên khóa API", resetDescription: (name) => `Đặt lại "${name}"? Các client dùng token cũ sẽ ngừng hoạt động.`, resetTitle: "Đặt lại khóa API", revokeDescription: (name) => `Thu hồi "${name}"? Không thể hoàn tác thao tác này.`, revokeTitle: "Thu hồi khóa API"},
  zh: {renameDescription: (name) => `为“${name}”输入新名称。`, renameTitle: "重命名 API 密钥", resetDescription: (name) => `重置“${name}”？使用旧令牌的现有客户端将停止工作。`, resetTitle: "重置 API 密钥", revokeDescription: (name) => `撤销“${name}”？此操作无法撤销。`, revokeTitle: "撤销 API 密钥"},
  "zh-TW": {renameDescription: (name) => `為「${name}」輸入新名稱。`, renameTitle: "重新命名 API 金鑰", resetDescription: (name) => `重設「${name}」？使用舊權杖的現有用戶端將停止運作。`, resetTitle: "重設 API 金鑰", revokeDescription: (name) => `撤銷「${name}」？此操作無法復原。`, revokeTitle: "撤銷 API 金鑰"}
};

const settingsErrorsCopy: Record<Locale, SettingsCopy["errors"]> = {
  ar: {createApiKey: "تعذر إنشاء مفتاح API.", createFolder: "تعذر إنشاء المجلد.", deleteFolder: "تعذر حذف المجلد.", renameApiKey: "تعذر إعادة تسمية مفتاح API.", renameFolder: "تعذر إعادة تسمية المجلد.", resetApiKey: "تعذر إعادة ضبط مفتاح API.", revokeApiKey: "تعذر إلغاء مفتاح API.", updateAccount: "تعذر تحديث إعدادات الحساب.", updateLanguage: "تعذر تحديث لغة الواجهة."},
  de: {createApiKey: "API-Schlüssel konnte nicht erstellt werden.", createFolder: "Ordner konnte nicht erstellt werden.", deleteFolder: "Ordner konnte nicht gelöscht werden.", renameApiKey: "API-Schlüssel konnte nicht umbenannt werden.", renameFolder: "Ordner konnte nicht umbenannt werden.", resetApiKey: "API-Schlüssel konnte nicht zurückgesetzt werden.", revokeApiKey: "API-Schlüssel konnte nicht widerrufen werden.", updateAccount: "Kontoeinstellungen konnten nicht aktualisiert werden.", updateLanguage: "Oberflächensprache konnte nicht aktualisiert werden."},
  en: settingsCopyEn.errors,
  es: {createApiKey: "No se pudo crear la clave API.", createFolder: "No se pudo crear la carpeta.", deleteFolder: "No se pudo eliminar la carpeta.", renameApiKey: "No se pudo renombrar la clave API.", renameFolder: "No se pudo renombrar la carpeta.", resetApiKey: "No se pudo restablecer la clave API.", revokeApiKey: "No se pudo revocar la clave API.", updateAccount: "No se pudieron actualizar los ajustes de la cuenta.", updateLanguage: "No se pudo actualizar el idioma de la interfaz."},
  fr: {createApiKey: "Impossible de créer la clé API.", createFolder: "Impossible de créer le dossier.", deleteFolder: "Impossible de supprimer le dossier.", renameApiKey: "Impossible de renommer la clé API.", renameFolder: "Impossible de renommer le dossier.", resetApiKey: "Impossible de réinitialiser la clé API.", revokeApiKey: "Impossible de révoquer la clé API.", updateAccount: "Impossible de mettre à jour les paramètres du compte.", updateLanguage: "Impossible de mettre à jour la langue de l'interface."},
  hu: {createApiKey: "Nem sikerült API-kulcsot létrehozni.", createFolder: "Nem sikerült mappát létrehozni.", deleteFolder: "Nem sikerült törölni a mappát.", renameApiKey: "Nem sikerült átnevezni az API-kulcsot.", renameFolder: "Nem sikerült átnevezni a mappát.", resetApiKey: "Nem sikerült visszaállítani az API-kulcsot.", revokeApiKey: "Nem sikerült visszavonni az API-kulcsot.", updateAccount: "Nem sikerült frissíteni a fiókbeállításokat.", updateLanguage: "Nem sikerült frissíteni a felület nyelvét."},
  id: {createApiKey: "Tidak dapat membuat kunci API.", createFolder: "Tidak dapat membuat folder.", deleteFolder: "Tidak dapat menghapus folder.", renameApiKey: "Tidak dapat mengganti nama kunci API.", renameFolder: "Tidak dapat mengganti nama folder.", resetApiKey: "Tidak dapat mereset kunci API.", revokeApiKey: "Tidak dapat mencabut kunci API.", updateAccount: "Tidak dapat memperbarui pengaturan akun.", updateLanguage: "Tidak dapat memperbarui bahasa antarmuka."},
  it: {createApiKey: "Impossibile creare la chiave API.", createFolder: "Impossibile creare la cartella.", deleteFolder: "Impossibile eliminare la cartella.", renameApiKey: "Impossibile rinominare la chiave API.", renameFolder: "Impossibile rinominare la cartella.", resetApiKey: "Impossibile reimpostare la chiave API.", revokeApiKey: "Impossibile revocare la chiave API.", updateAccount: "Impossibile aggiornare le impostazioni dell'account.", updateLanguage: "Impossibile aggiornare la lingua dell'interfaccia."},
  ja: {createApiKey: "API キーを作成できません。", createFolder: "フォルダーを作成できません。", deleteFolder: "フォルダーを削除できません。", renameApiKey: "API キー名を変更できません。", renameFolder: "フォルダー名を変更できません。", resetApiKey: "API キーをリセットできません。", revokeApiKey: "API キーを取り消せません。", updateAccount: "アカウント設定を更新できません。", updateLanguage: "インターフェース言語を更新できません。"},
  ko: {createApiKey: "API 키를 만들 수 없습니다.", createFolder: "폴더를 만들 수 없습니다.", deleteFolder: "폴더를 삭제할 수 없습니다.", renameApiKey: "API 키 이름을 변경할 수 없습니다.", renameFolder: "폴더 이름을 변경할 수 없습니다.", resetApiKey: "API 키를 재설정할 수 없습니다.", revokeApiKey: "API 키를 폐기할 수 없습니다.", updateAccount: "계정 설정을 업데이트할 수 없습니다.", updateLanguage: "인터페이스 언어를 업데이트할 수 없습니다."},
  nl: {createApiKey: "Kan API-sleutel niet maken.", createFolder: "Kan map niet maken.", deleteFolder: "Kan map niet verwijderen.", renameApiKey: "Kan API-sleutel niet hernoemen.", renameFolder: "Kan map niet hernoemen.", resetApiKey: "Kan API-sleutel niet resetten.", revokeApiKey: "Kan API-sleutel niet intrekken.", updateAccount: "Kan accountinstellingen niet bijwerken.", updateLanguage: "Kan interfacetaal niet bijwerken."},
  pl: {createApiKey: "Nie można utworzyć klucza API.", createFolder: "Nie można utworzyć folderu.", deleteFolder: "Nie można usunąć folderu.", renameApiKey: "Nie można zmienić nazwy klucza API.", renameFolder: "Nie można zmienić nazwy folderu.", resetApiKey: "Nie można zresetować klucza API.", revokeApiKey: "Nie można unieważnić klucza API.", updateAccount: "Nie można zaktualizować ustawień konta.", updateLanguage: "Nie można zaktualizować języka interfejsu."},
  pt: {createApiKey: "Não foi possível criar a chave de API.", createFolder: "Não foi possível criar a pasta.", deleteFolder: "Não foi possível excluir a pasta.", renameApiKey: "Não foi possível renomear a chave de API.", renameFolder: "Não foi possível renomear a pasta.", resetApiKey: "Não foi possível redefinir a chave de API.", revokeApiKey: "Não foi possível revogar a chave de API.", updateAccount: "Não foi possível atualizar as configurações da conta.", updateLanguage: "Não foi possível atualizar o idioma da interface."},
  ru: {createApiKey: "Не удалось создать API-ключ.", createFolder: "Не удалось создать папку.", deleteFolder: "Не удалось удалить папку.", renameApiKey: "Не удалось переименовать API-ключ.", renameFolder: "Не удалось переименовать папку.", resetApiKey: "Не удалось сбросить API-ключ.", revokeApiKey: "Не удалось отозвать API-ключ.", updateAccount: "Не удалось обновить настройки аккаунта.", updateLanguage: "Не удалось обновить язык интерфейса."},
  th: {createApiKey: "ไม่สามารถสร้างคีย์ API ได้", createFolder: "ไม่สามารถสร้างโฟลเดอร์ได้", deleteFolder: "ไม่สามารถลบโฟลเดอร์ได้", renameApiKey: "ไม่สามารถเปลี่ยนชื่อคีย์ API ได้", renameFolder: "ไม่สามารถเปลี่ยนชื่อโฟลเดอร์ได้", resetApiKey: "ไม่สามารถรีเซ็ตคีย์ API ได้", revokeApiKey: "ไม่สามารถเพิกถอนคีย์ API ได้", updateAccount: "ไม่สามารถอัปเดตการตั้งค่าบัญชีได้", updateLanguage: "ไม่สามารถอัปเดตภาษาอินเทอร์เฟซได้"},
  tr: {createApiKey: "API anahtarı oluşturulamadı.", createFolder: "Klasör oluşturulamadı.", deleteFolder: "Klasör silinemedi.", renameApiKey: "API anahtarı yeniden adlandırılamadı.", renameFolder: "Klasör yeniden adlandırılamadı.", resetApiKey: "API anahtarı sıfırlanamadı.", revokeApiKey: "API anahtarı iptal edilemedi.", updateAccount: "Hesap ayarları güncellenemedi.", updateLanguage: "Arayüz dili güncellenemedi."},
  uk: {createApiKey: "Не вдалося створити API-ключ.", createFolder: "Не вдалося створити папку.", deleteFolder: "Не вдалося видалити папку.", renameApiKey: "Не вдалося перейменувати API-ключ.", renameFolder: "Не вдалося перейменувати папку.", resetApiKey: "Не вдалося скинути API-ключ.", revokeApiKey: "Не вдалося відкликати API-ключ.", updateAccount: "Не вдалося оновити налаштування акаунта.", updateLanguage: "Не вдалося оновити мову інтерфейсу."},
  vi: {createApiKey: "Không thể tạo khóa API.", createFolder: "Không thể tạo thư mục.", deleteFolder: "Không thể xóa thư mục.", renameApiKey: "Không thể đổi tên khóa API.", renameFolder: "Không thể đổi tên thư mục.", resetApiKey: "Không thể đặt lại khóa API.", revokeApiKey: "Không thể thu hồi khóa API.", updateAccount: "Không thể cập nhật cài đặt tài khoản.", updateLanguage: "Không thể cập nhật ngôn ngữ giao diện."},
  zh: {createApiKey: "无法创建 API 密钥。", createFolder: "无法创建文件夹。", deleteFolder: "无法删除文件夹。", renameApiKey: "无法重命名 API 密钥。", renameFolder: "无法重命名文件夹。", resetApiKey: "无法重置 API 密钥。", revokeApiKey: "无法撤销 API 密钥。", updateAccount: "无法更新账号设置。", updateLanguage: "无法更新界面语言。"},
  "zh-TW": {createApiKey: "無法建立 API 金鑰。", createFolder: "無法建立資料夾。", deleteFolder: "無法刪除資料夾。", renameApiKey: "無法重新命名 API 金鑰。", renameFolder: "無法重新命名資料夾。", resetApiKey: "無法重設 API 金鑰。", revokeApiKey: "無法撤銷 API 金鑰。", updateAccount: "無法更新帳號設定。", updateLanguage: "無法更新介面語言。"}
};

const settingsSecurityCopy: Record<Locale, SettingsCopy["security"]> = {
  ar: {
    changeEmailTitle: "تغيير عنوان تسجيل الدخول بالبريد",
    confirmPassword: "تأكيد كلمة المرور",
    currentEmail: (email) => `عنوان تسجيل الدخول الحالي: ${email}`,
    description: "إدارة طرق تسجيل الدخول والبريد وكلمة المرور.",
    emailPassword: "البريد + كلمة المرور",
    emailPlaceholder: "أدخل عنوان بريد جديد لتسجيل الدخول",
    emailUpdated: "تم تحديث عنوان البريد. يرجى تأكيد العنوان الجديد.",
    googleSignIn: "تسجيل الدخول عبر Google",
    identityHint: "بريد Google يدار من Google. عنوان تسجيل الدخول بالبريد يدار هنا.",
    linked: "مرتبط",
    newPassword: "كلمة مرور جديدة",
    noMethodsDescription: "يرجى تحديث الصفحة أو إضافة عنوان بريد لتسجيل الدخول أدناه.",
    noMethodsTitle: "لم يتم العثور على طرق تسجيل دخول.",
    openVerificationLink: "فتح رابط التحقق",
    passwordMismatch: "كلمتا المرور غير متطابقتين.",
    passwordNotSet: "كلمة المرور غير محددة",
    passwordPending: "هوية البريد مرتبطة، لكن كلمة المرور لم تضبط بعد.",
    passwordSet: "كلمة المرور مضبوطة",
    passwordUpdated: "تم تحديث كلمة المرور.",
    setPassword: "ضبط كلمة المرور",
    setPasswordDescription: "اضبط كلمة مرور لإكمال إعداد تسجيل الدخول بالبريد.",
    setPasswordTitle: "ضبط أو تغيير كلمة المرور",
    signInMethods: "طرق تسجيل الدخول",
    title: "أمان الحساب",
    updateEmail: "تحديث البريد"
  },
  de: {
    changeEmailTitle: "E-Mail-Anmeldeadresse ändern",
    confirmPassword: "Passwort bestätigen",
    currentEmail: (email) => `Aktuelle E-Mail-Anmeldeadresse: ${email}`,
    description: "Anmeldemethoden, E-Mail und Passwortsicherheit verwalten.",
    emailPassword: "E-Mail + Passwort",
    emailPlaceholder: "Neue E-Mail-Anmeldeadresse eingeben",
    emailUpdated: "E-Mail-Anmeldeadresse wurde aktualisiert. Bitte bestätige die neue Adresse.",
    googleSignIn: "Google-Anmeldung",
    identityHint: "Google-E-Mail wird von Google verwaltet. Die E-Mail-Anmeldeadresse wird hier verwaltet.",
    linked: "Verknüpft",
    newPassword: "Neues Passwort",
    noMethodsDescription: "Bitte aktualisiere diese Seite oder füge unten eine E-Mail-Anmeldeadresse hinzu.",
    noMethodsTitle: "Keine Anmeldemethoden erkannt.",
    openVerificationLink: "Bestätigungslink öffnen",
    passwordMismatch: "Passwörter stimmen nicht überein.",
    passwordNotSet: "Passwort nicht festgelegt",
    passwordPending: "E-Mail-Identität ist verknüpft, aber ein Passwort ist noch nicht festgelegt.",
    passwordSet: "Passwort festgelegt",
    passwordUpdated: "Passwort wurde aktualisiert.",
    setPassword: "Passwort festlegen",
    setPasswordDescription: "Lege ein Passwort fest, um die E-Mail-Anmeldung abzuschließen.",
    setPasswordTitle: "Passwort festlegen oder ändern",
    signInMethods: "Anmeldemethoden",
    title: "Kontosicherheit",
    updateEmail: "E-Mail aktualisieren"
  },
  en: settingsCopyEn.security,
  es: {
    changeEmailTitle: "Cambiar email de inicio de sesión",
    confirmPassword: "Confirmar contraseña",
    currentEmail: (email) => `Email actual de inicio de sesión: ${email}`,
    description: "Gestiona métodos de inicio de sesión, email y contraseña.",
    emailPassword: "Email + contraseña",
    emailPlaceholder: "Introduce un nuevo email de inicio de sesión",
    emailUpdated: "El email de inicio de sesión se actualizó. Verifica la nueva dirección.",
    googleSignIn: "Inicio con Google",
    identityHint: "El email de Google se gestiona en Google. El email de inicio de sesión se gestiona aquí.",
    linked: "Vinculado",
    newPassword: "Nueva contraseña",
    noMethodsDescription: "Actualiza esta página o añade un email de inicio de sesión abajo.",
    noMethodsTitle: "No se detectaron métodos de inicio de sesión.",
    openVerificationLink: "Abrir enlace de verificación",
    passwordMismatch: "Las contraseñas no coinciden.",
    passwordNotSet: "Contraseña no configurada",
    passwordPending: "La identidad de email está vinculada, pero la contraseña aún no está configurada.",
    passwordSet: "Contraseña configurada",
    passwordUpdated: "La contraseña se ha actualizado.",
    setPassword: "Configurar contraseña",
    setPasswordDescription: "Configura una contraseña para completar el inicio de sesión por email.",
    setPasswordTitle: "Configurar o cambiar contraseña",
    signInMethods: "Métodos de inicio de sesión",
    title: "Seguridad de la cuenta",
    updateEmail: "Actualizar email"
  },
  fr: {
    changeEmailTitle: "Changer l’adresse e-mail de connexion",
    confirmPassword: "Confirmer le mot de passe",
    currentEmail: (email) => `Adresse e-mail de connexion actuelle : ${email}`,
    description: "Gérez les méthodes de connexion, l’e-mail et le mot de passe.",
    emailPassword: "E-mail + mot de passe",
    emailPlaceholder: "Saisissez une nouvelle adresse e-mail de connexion",
    emailUpdated: "L’adresse e-mail de connexion a été mise à jour. Veuillez vérifier la nouvelle adresse.",
    googleSignIn: "Connexion Google",
    identityHint: "L’e-mail Google est géré par Google. L’adresse e-mail de connexion est gérée ici.",
    linked: "Lié",
    newPassword: "Nouveau mot de passe",
    noMethodsDescription: "Veuillez actualiser cette page ou ajouter une adresse e-mail de connexion ci-dessous.",
    noMethodsTitle: "Aucune méthode de connexion détectée.",
    openVerificationLink: "Ouvrir le lien de vérification",
    passwordMismatch: "Les mots de passe ne correspondent pas.",
    passwordNotSet: "Mot de passe non défini",
    passwordPending: "L’identité e-mail est liée, mais le mot de passe n’est pas encore défini.",
    passwordSet: "Mot de passe défini",
    passwordUpdated: "Le mot de passe a été mis à jour.",
    setPassword: "Définir le mot de passe",
    setPasswordDescription: "Définissez un mot de passe pour terminer la connexion par e-mail.",
    setPasswordTitle: "Définir ou changer le mot de passe",
    signInMethods: "Méthodes de connexion",
    title: "Sécurité du compte",
    updateEmail: "Mettre à jour l’e-mail"
  },
  hu: {
    changeEmailTitle: "Emailes bejelentkezési cím módosítása",
    confirmPassword: "Jelszó megerősítése",
    currentEmail: (email) => `Jelenlegi emailes bejelentkezési cím: ${email}`,
    description: "Kezeld a bejelentkezési módokat, emailt és jelszót.",
    emailPassword: "Email + jelszó",
    emailPlaceholder: "Adj meg új emailes bejelentkezési címet",
    emailUpdated: "Az emailes bejelentkezési cím frissítve. Erősítsd meg az új címet.",
    googleSignIn: "Google bejelentkezés",
    identityHint: "A Google emailt a Google kezeli. Az emailes bejelentkezési címet itt kezelheted.",
    linked: "Összekapcsolva",
    newPassword: "Új jelszó",
    noMethodsDescription: "Frissítsd az oldalt, vagy adj hozzá lent egy emailes bejelentkezési címet.",
    noMethodsTitle: "Nem található bejelentkezési mód.",
    openVerificationLink: "Megerősítő link megnyitása",
    passwordMismatch: "A jelszavak nem egyeznek.",
    passwordNotSet: "Jelszó nincs beállítva",
    passwordPending: "Az emailazonosság össze van kapcsolva, de jelszó még nincs beállítva.",
    passwordSet: "Jelszó beállítva",
    passwordUpdated: "A jelszó frissítve.",
    setPassword: "Jelszó beállítása",
    setPasswordDescription: "Állíts be jelszót az emailes bejelentkezés befejezéséhez.",
    setPasswordTitle: "Jelszó beállítása vagy módosítása",
    signInMethods: "Bejelentkezési módok",
    title: "Fiókbiztonság",
    updateEmail: "Email frissítése"
  },
  id: {
    changeEmailTitle: "Ubah alamat email login",
    confirmPassword: "Konfirmasi kata sandi",
    currentEmail: (email) => `Alamat email login saat ini: ${email}`,
    description: "Kelola metode masuk, email, dan keamanan kata sandi.",
    emailPassword: "Email + kata sandi",
    emailPlaceholder: "Masukkan alamat email login baru",
    emailUpdated: "Alamat email login telah diperbarui. Verifikasi alamat baru.",
    googleSignIn: "Masuk dengan Google",
    identityHint: "Email Google dikelola oleh Google. Alamat email login dikelola di sini.",
    linked: "Terhubung",
    newPassword: "Kata sandi baru",
    noMethodsDescription: "Segarkan halaman ini atau tambahkan alamat email login di bawah.",
    noMethodsTitle: "Tidak ada metode masuk terdeteksi.",
    openVerificationLink: "Buka tautan verifikasi",
    passwordMismatch: "Kata sandi tidak cocok.",
    passwordNotSet: "Kata sandi belum diatur",
    passwordPending: "Identitas email terhubung, tetapi kata sandi belum diatur.",
    passwordSet: "Kata sandi sudah diatur",
    passwordUpdated: "Kata sandi telah diperbarui.",
    setPassword: "Atur kata sandi",
    setPasswordDescription: "Atur kata sandi untuk menyelesaikan login email.",
    setPasswordTitle: "Atur atau ubah kata sandi",
    signInMethods: "Metode masuk",
    title: "Keamanan Akun",
    updateEmail: "Perbarui email"
  },
  it: {
    changeEmailTitle: "Cambia email di accesso",
    confirmPassword: "Conferma password",
    currentEmail: (email) => `Email di accesso attuale: ${email}`,
    description: "Gestisci metodi di accesso, email e password.",
    emailPassword: "Email + password",
    emailPlaceholder: "Inserisci una nuova email di accesso",
    emailUpdated: "Email di accesso aggiornata. Verifica il nuovo indirizzo.",
    googleSignIn: "Accesso con Google",
    identityHint: "L’email Google è gestita da Google. L’email di accesso è gestita qui.",
    linked: "Collegato",
    newPassword: "Nuova password",
    noMethodsDescription: "Aggiorna la pagina o aggiungi un’email di accesso qui sotto.",
    noMethodsTitle: "Nessun metodo di accesso rilevato.",
    openVerificationLink: "Apri link di verifica",
    passwordMismatch: "Le password non corrispondono.",
    passwordNotSet: "Password non impostata",
    passwordPending: "L’identità email è collegata, ma la password non è ancora impostata.",
    passwordSet: "Password impostata",
    passwordUpdated: "Password aggiornata.",
    setPassword: "Imposta password",
    setPasswordDescription: "Imposta una password per completare l’accesso via email.",
    setPasswordTitle: "Imposta o cambia password",
    signInMethods: "Metodi di accesso",
    title: "Sicurezza account",
    updateEmail: "Aggiorna email"
  },
  ja: {
    changeEmailTitle: "メールログインアドレスを変更",
    confirmPassword: "パスワードを確認",
    currentEmail: (email) => `現在のメールログインアドレス: ${email}`,
    description: "ログイン方法、メール、パスワードを管理します。",
    emailPassword: "メール + パスワード",
    emailPlaceholder: "新しいメールログインアドレスを入力",
    emailUpdated: "メールログインアドレスを更新しました。新しいアドレスを確認してください。",
    googleSignIn: "Google ログイン",
    identityHint: "Google メールは Google 側で管理されます。メールログインアドレスはここで管理します。",
    linked: "連携済み",
    newPassword: "新しいパスワード",
    noMethodsDescription: "このページを更新するか、下でメールログインアドレスを追加してください。",
    noMethodsTitle: "ログイン方法が検出されませんでした。",
    openVerificationLink: "確認リンクを開く",
    passwordMismatch: "パスワードが一致しません。",
    passwordNotSet: "パスワード未設定",
    passwordPending: "メール ID は連携済みですが、パスワードはまだ設定されていません。",
    passwordSet: "パスワード設定済み",
    passwordUpdated: "パスワードを更新しました。",
    setPassword: "パスワードを設定",
    setPasswordDescription: "メールログイン設定を完了するためにパスワードを設定します。",
    setPasswordTitle: "パスワードを設定または変更",
    signInMethods: "ログイン方法",
    title: "アカウントの安全性",
    updateEmail: "メールを更新"
  },
  ko: {
    changeEmailTitle: "이메일 로그인 주소 변경",
    confirmPassword: "비밀번호 확인",
    currentEmail: (email) => `현재 이메일 로그인 주소: ${email}`,
    description: "로그인 방법, 이메일, 비밀번호 보안을 관리하세요.",
    emailPassword: "이메일 + 비밀번호",
    emailPlaceholder: "새 이메일 로그인 주소 입력",
    emailUpdated: "이메일 로그인 주소가 업데이트되었습니다. 새 주소를 확인하세요.",
    googleSignIn: "Google 로그인",
    identityHint: "Google 이메일은 Google에서 관리됩니다. 이메일 로그인 주소는 여기에서 관리합니다.",
    linked: "연결됨",
    newPassword: "새 비밀번호",
    noMethodsDescription: "이 페이지를 새로고침하거나 아래에서 이메일 로그인 주소를 추가하세요.",
    noMethodsTitle: "로그인 방법이 감지되지 않았습니다.",
    openVerificationLink: "인증 링크 열기",
    passwordMismatch: "비밀번호가 일치하지 않습니다.",
    passwordNotSet: "비밀번호 미설정",
    passwordPending: "이메일 ID는 연결되었지만 비밀번호는 아직 설정되지 않았습니다.",
    passwordSet: "비밀번호 설정됨",
    passwordUpdated: "비밀번호가 업데이트되었습니다.",
    setPassword: "비밀번호 설정",
    setPasswordDescription: "이메일 로그인을 완료하려면 비밀번호를 설정하세요.",
    setPasswordTitle: "비밀번호 설정 또는 변경",
    signInMethods: "로그인 방법",
    title: "계정 보안",
    updateEmail: "이메일 업데이트"
  },
  nl: {
    changeEmailTitle: "E-mailadres voor login wijzigen",
    confirmPassword: "Wachtwoord bevestigen",
    currentEmail: (email) => `Huidig login-e-mailadres: ${email}`,
    description: "Beheer aanmeldmethoden, e-mail en wachtwoordbeveiliging.",
    emailPassword: "E-mail + wachtwoord",
    emailPlaceholder: "Voer een nieuw login-e-mailadres in",
    emailUpdated: "Login-e-mailadres is bijgewerkt. Verifieer het nieuwe adres.",
    googleSignIn: "Inloggen met Google",
    identityHint: "Google-e-mail wordt beheerd door Google. Het login-e-mailadres beheer je hier.",
    linked: "Gekoppeld",
    newPassword: "Nieuw wachtwoord",
    noMethodsDescription: "Ververs deze pagina of voeg hieronder een login-e-mailadres toe.",
    noMethodsTitle: "Geen aanmeldmethoden gevonden.",
    openVerificationLink: "Verificatielink openen",
    passwordMismatch: "Wachtwoorden komen niet overeen.",
    passwordNotSet: "Wachtwoord niet ingesteld",
    passwordPending: "E-mailidentiteit is gekoppeld, maar wachtwoord is nog niet ingesteld.",
    passwordSet: "Wachtwoord ingesteld",
    passwordUpdated: "Wachtwoord is bijgewerkt.",
    setPassword: "Wachtwoord instellen",
    setPasswordDescription: "Stel een wachtwoord in om e-mailinloggen te voltooien.",
    setPasswordTitle: "Wachtwoord instellen of wijzigen",
    signInMethods: "Aanmeldmethoden",
    title: "Accountbeveiliging",
    updateEmail: "E-mail bijwerken"
  },
  pl: {
    changeEmailTitle: "Zmień adres e-mail logowania",
    confirmPassword: "Potwierdź hasło",
    currentEmail: (email) => `Obecny adres e-mail logowania: ${email}`,
    description: "Zarządzaj metodami logowania, emailem i hasłem.",
    emailPassword: "E-mail + hasło",
    emailPlaceholder: "Wpisz nowy adres e-mail logowania",
    emailUpdated: "Adres e-mail logowania został zaktualizowany. Zweryfikuj nowy adres.",
    googleSignIn: "Logowanie Google",
    identityHint: "E-mail Google jest zarządzany przez Google. Adres e-mail logowania jest zarządzany tutaj.",
    linked: "Połączono",
    newPassword: "Nowe hasło",
    noMethodsDescription: "Odśwież stronę lub dodaj poniżej adres e-mail logowania.",
    noMethodsTitle: "Nie wykryto metod logowania.",
    openVerificationLink: "Otwórz link weryfikacyjny",
    passwordMismatch: "Hasła nie są zgodne.",
    passwordNotSet: "Hasło nieustawione",
    passwordPending: "Tożsamość e-mail jest połączona, ale hasło nie jest jeszcze ustawione.",
    passwordSet: "Hasło ustawione",
    passwordUpdated: "Hasło zostało zaktualizowane.",
    setPassword: "Ustaw hasło",
    setPasswordDescription: "Ustaw hasło, aby dokończyć logowanie e-mailem.",
    setPasswordTitle: "Ustaw lub zmień hasło",
    signInMethods: "Metody logowania",
    title: "Bezpieczeństwo konta",
    updateEmail: "Zaktualizuj e-mail"
  },
  pt: {
    changeEmailTitle: "Alterar email de login",
    confirmPassword: "Confirmar senha",
    currentEmail: (email) => `Email de login atual: ${email}`,
    description: "Gerencie métodos de login, email e senha.",
    emailPassword: "Email + senha",
    emailPlaceholder: "Digite um novo email de login",
    emailUpdated: "Email de login atualizado. Verifique o novo endereço.",
    googleSignIn: "Login com Google",
    identityHint: "O email do Google é gerenciado pelo Google. O email de login é gerenciado aqui.",
    linked: "Vinculado",
    newPassword: "Nova senha",
    noMethodsDescription: "Atualize esta página ou adicione um email de login abaixo.",
    noMethodsTitle: "Nenhum método de login detectado.",
    openVerificationLink: "Abrir link de verificação",
    passwordMismatch: "As senhas não coincidem.",
    passwordNotSet: "Senha não definida",
    passwordPending: "A identidade de email está vinculada, mas a senha ainda não foi definida.",
    passwordSet: "Senha definida",
    passwordUpdated: "A senha foi atualizada.",
    setPassword: "Definir senha",
    setPasswordDescription: "Defina uma senha para concluir o login por email.",
    setPasswordTitle: "Definir ou alterar senha",
    signInMethods: "Métodos de login",
    title: "Segurança da conta",
    updateEmail: "Atualizar email"
  },
  ru: {
    changeEmailTitle: "Изменить email для входа",
    confirmPassword: "Подтвердите пароль",
    currentEmail: (email) => `Текущий email для входа: ${email}`,
    description: "Управляйте способами входа, email и паролем.",
    emailPassword: "Email + пароль",
    emailPlaceholder: "Введите новый email для входа",
    emailUpdated: "Email для входа обновлен. Подтвердите новый адрес.",
    googleSignIn: "Вход через Google",
    identityHint: "Email Google управляется Google. Email для входа управляется здесь.",
    linked: "Связано",
    newPassword: "Новый пароль",
    noMethodsDescription: "Обновите страницу или добавьте email для входа ниже.",
    noMethodsTitle: "Способы входа не обнаружены.",
    openVerificationLink: "Открыть ссылку подтверждения",
    passwordMismatch: "Пароли не совпадают.",
    passwordNotSet: "Пароль не задан",
    passwordPending: "Email-идентификация связана, но пароль еще не задан.",
    passwordSet: "Пароль задан",
    passwordUpdated: "Пароль обновлен.",
    setPassword: "Задать пароль",
    setPasswordDescription: "Задайте пароль, чтобы завершить настройку входа по email.",
    setPasswordTitle: "Задать или изменить пароль",
    signInMethods: "Способы входа",
    title: "Безопасность аккаунта",
    updateEmail: "Обновить email"
  },
  th: {
    changeEmailTitle: "เปลี่ยนอีเมลสำหรับเข้าสู่ระบบ",
    confirmPassword: "ยืนยันรหัสผ่าน",
    currentEmail: (email) => `อีเมลเข้าสู่ระบบปัจจุบัน: ${email}`,
    description: "จัดการวิธีเข้าสู่ระบบ อีเมล และรหัสผ่าน",
    emailPassword: "อีเมล + รหัสผ่าน",
    emailPlaceholder: "ป้อนอีเมลเข้าสู่ระบบใหม่",
    emailUpdated: "อัปเดตอีเมลเข้าสู่ระบบแล้ว โปรดยืนยันที่อยู่อีเมลใหม่",
    googleSignIn: "เข้าสู่ระบบด้วย Google",
    identityHint: "อีเมล Google จัดการโดย Google ส่วนอีเมลเข้าสู่ระบบจัดการที่นี่",
    linked: "เชื่อมโยงแล้ว",
    newPassword: "รหัสผ่านใหม่",
    noMethodsDescription: "โปรดรีเฟรชหน้านี้หรือเพิ่มอีเมลเข้าสู่ระบบด้านล่าง",
    noMethodsTitle: "ไม่พบวิธีเข้าสู่ระบบ",
    openVerificationLink: "เปิดลิงก์ยืนยัน",
    passwordMismatch: "รหัสผ่านไม่ตรงกัน",
    passwordNotSet: "ยังไม่ได้ตั้งรหัสผ่าน",
    passwordPending: "ตัวตนอีเมลเชื่อมโยงแล้ว แต่ยังไม่ได้ตั้งรหัสผ่าน",
    passwordSet: "ตั้งรหัสผ่านแล้ว",
    passwordUpdated: "อัปเดตรหัสผ่านแล้ว",
    setPassword: "ตั้งรหัสผ่าน",
    setPasswordDescription: "ตั้งรหัสผ่านเพื่อเสร็จสิ้นการเข้าสู่ระบบด้วยอีเมล",
    setPasswordTitle: "ตั้งหรือเปลี่ยนรหัสผ่าน",
    signInMethods: "วิธีเข้าสู่ระบบ",
    title: "ความปลอดภัยบัญชี",
    updateEmail: "อัปเดตอีเมล"
  },
  tr: {
    changeEmailTitle: "E-posta giriş adresini değiştir",
    confirmPassword: "Şifreyi onayla",
    currentEmail: (email) => `Mevcut e-posta giriş adresi: ${email}`,
    description: "Giriş yöntemlerini, e-postayı ve şifreyi yönetin.",
    emailPassword: "E-posta + şifre",
    emailPlaceholder: "Yeni e-posta giriş adresi girin",
    emailUpdated: "E-posta giriş adresi güncellendi. Yeni adresi doğrulayın.",
    googleSignIn: "Google ile giriş",
    identityHint: "Google e-postası Google tarafından yönetilir. E-posta giriş adresi burada yönetilir.",
    linked: "Bağlı",
    newPassword: "Yeni şifre",
    noMethodsDescription: "Bu sayfayı yenileyin veya aşağıya bir e-posta giriş adresi ekleyin.",
    noMethodsTitle: "Giriş yöntemi algılanmadı.",
    openVerificationLink: "Doğrulama bağlantısını aç",
    passwordMismatch: "Şifreler eşleşmiyor.",
    passwordNotSet: "Şifre ayarlanmadı",
    passwordPending: "E-posta kimliği bağlı, ancak şifre henüz ayarlanmadı.",
    passwordSet: "Şifre ayarlandı",
    passwordUpdated: "Şifre güncellendi.",
    setPassword: "Şifre ayarla",
    setPasswordDescription: "E-posta giriş kurulumunu tamamlamak için şifre ayarlayın.",
    setPasswordTitle: "Şifre ayarla veya değiştir",
    signInMethods: "Giriş yöntemleri",
    title: "Hesap Güvenliği",
    updateEmail: "E-postayı güncelle"
  },
  uk: {
    changeEmailTitle: "Змінити email для входу",
    confirmPassword: "Підтвердьте пароль",
    currentEmail: (email) => `Поточний email для входу: ${email}`,
    description: "Керуйте способами входу, email і паролем.",
    emailPassword: "Email + пароль",
    emailPlaceholder: "Введіть новий email для входу",
    emailUpdated: "Email для входу оновлено. Підтвердьте нову адресу.",
    googleSignIn: "Вхід через Google",
    identityHint: "Email Google керується Google. Email для входу керується тут.",
    linked: "Пов’язано",
    newPassword: "Новий пароль",
    noMethodsDescription: "Оновіть сторінку або додайте email для входу нижче.",
    noMethodsTitle: "Способи входу не виявлено.",
    openVerificationLink: "Відкрити посилання підтвердження",
    passwordMismatch: "Паролі не збігаються.",
    passwordNotSet: "Пароль не задано",
    passwordPending: "Email-ідентичність пов’язана, але пароль ще не задано.",
    passwordSet: "Пароль задано",
    passwordUpdated: "Пароль оновлено.",
    setPassword: "Задати пароль",
    setPasswordDescription: "Задайте пароль, щоб завершити вхід через email.",
    setPasswordTitle: "Задати або змінити пароль",
    signInMethods: "Способи входу",
    title: "Безпека акаунта",
    updateEmail: "Оновити email"
  },
  vi: {
    changeEmailTitle: "Đổi email đăng nhập",
    confirmPassword: "Xác nhận mật khẩu",
    currentEmail: (email) => `Email đăng nhập hiện tại: ${email}`,
    description: "Quản lý phương thức đăng nhập, email và mật khẩu.",
    emailPassword: "Email + mật khẩu",
    emailPlaceholder: "Nhập email đăng nhập mới",
    emailUpdated: "Email đăng nhập đã được cập nhật. Vui lòng xác minh địa chỉ mới.",
    googleSignIn: "Đăng nhập Google",
    identityHint: "Email Google do Google quản lý. Email đăng nhập được quản lý tại đây.",
    linked: "Đã liên kết",
    newPassword: "Mật khẩu mới",
    noMethodsDescription: "Vui lòng tải lại trang này hoặc thêm email đăng nhập bên dưới.",
    noMethodsTitle: "Không phát hiện phương thức đăng nhập.",
    openVerificationLink: "Mở liên kết xác minh",
    passwordMismatch: "Mật khẩu không khớp.",
    passwordNotSet: "Chưa đặt mật khẩu",
    passwordPending: "Danh tính email đã liên kết, nhưng chưa đặt mật khẩu.",
    passwordSet: "Đã đặt mật khẩu",
    passwordUpdated: "Mật khẩu đã được cập nhật.",
    setPassword: "Đặt mật khẩu",
    setPasswordDescription: "Đặt mật khẩu để hoàn tất đăng nhập bằng email.",
    setPasswordTitle: "Đặt hoặc đổi mật khẩu",
    signInMethods: "Phương thức đăng nhập",
    title: "Bảo mật tài khoản",
    updateEmail: "Cập nhật email"
  },
  zh: {
    changeEmailTitle: "更改邮箱登录地址",
    confirmPassword: "确认密码",
    currentEmail: (email) => `当前邮箱登录地址：${email}`,
    description: "管理登录方式、邮箱和密码安全。",
    emailPassword: "邮箱 + 密码",
    emailPlaceholder: "输入新的邮箱登录地址",
    emailUpdated: "邮箱登录地址已更新。请验证新地址。",
    googleSignIn: "Google 登录",
    identityHint: "Google 邮箱由 Google 管理。邮箱登录地址在这里管理。",
    linked: "已关联",
    newPassword: "新密码",
    noMethodsDescription: "请刷新此页面，或在下方添加邮箱登录地址。",
    noMethodsTitle: "未检测到登录方式。",
    openVerificationLink: "打开验证链接",
    passwordMismatch: "两次密码不一致。",
    passwordNotSet: "未设置密码",
    passwordPending: "邮箱身份已关联，但尚未设置密码。",
    passwordSet: "已设置密码",
    passwordUpdated: "密码已更新。",
    setPassword: "设置密码",
    setPasswordDescription: "设置密码以完成邮箱登录配置。",
    setPasswordTitle: "设置或更改密码",
    signInMethods: "登录方式",
    title: "账号安全",
    updateEmail: "更新邮箱"
  },
  "zh-TW": {
    changeEmailTitle: "變更信箱登入地址",
    confirmPassword: "確認密碼",
    currentEmail: (email) => `目前信箱登入地址：${email}`,
    description: "管理登入方式、信箱和密碼安全。",
    emailPassword: "信箱 + 密碼",
    emailPlaceholder: "輸入新的信箱登入地址",
    emailUpdated: "信箱登入地址已更新。請驗證新地址。",
    googleSignIn: "Google 登入",
    identityHint: "Google 信箱由 Google 管理。信箱登入地址在這裡管理。",
    linked: "已連結",
    newPassword: "新密碼",
    noMethodsDescription: "請重新整理此頁面，或在下方新增信箱登入地址。",
    noMethodsTitle: "未偵測到登入方式。",
    openVerificationLink: "開啟驗證連結",
    passwordMismatch: "兩次密碼不一致。",
    passwordNotSet: "未設定密碼",
    passwordPending: "信箱身分已連結，但尚未設定密碼。",
    passwordSet: "已設定密碼",
    passwordUpdated: "密碼已更新。",
    setPassword: "設定密碼",
    setPasswordDescription: "設定密碼以完成信箱登入設定。",
    setPasswordTitle: "設定或變更密碼",
    signInMethods: "登入方式",
    title: "帳號安全",
    updateEmail: "更新信箱"
  }
};

const settingsDangerCopy: Record<Locale, SettingsCopy["danger"]> = {
  ar: {
    confirmationLabel: "للتأكيد، اكتب DELETE أدناه:",
    deleteAccount: "حذف الحساب",
    deleteBullets: ["سيتم حذف كل بياناتك نهائياً", "ستفقد الوصول إلى كل تفريغاتك", "سيتم إلغاء اشتراكك إن وجد", "لا يمكن استرداد حسابك", "لن يتمكن بريدك من إنشاء حساب جديد"],
    deleteDescription: "احذف حسابك وكل بياناتك نهائياً",
    deleteFailed: "تعذر حذف الحساب.",
    dialogIntro: "هل أنت متأكد من حذف حسابك؟ لا يمكن التراجع عن هذا الإجراء.",
    dialogTitle: "حذف الحساب",
    title: "منطقة الخطر",
    typeDeletePlaceholder: "اكتب DELETE هنا",
    warning: "إجراءات لا يمكن التراجع عنها"
  },
  de: {
    confirmationLabel: "Gib zur Bestätigung unten DELETE ein:",
    deleteAccount: "Konto löschen",
    deleteBullets: ["Alle deine Daten werden dauerhaft gelöscht", "Du verlierst den Zugriff auf alle Transkriptionen", "Dein Abonnement wird gekündigt, falls vorhanden", "Dein Konto kann nicht wiederhergestellt werden", "Mit deiner E-Mail kann kein neues Konto mehr erstellt werden"],
    deleteDescription: "Konto und alle Daten dauerhaft löschen",
    deleteFailed: "Konto konnte nicht gelöscht werden.",
    dialogIntro: "Möchtest du dein Konto wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
    dialogTitle: "Konto löschen",
    title: "Gefahrenzone",
    typeDeletePlaceholder: "Hier DELETE eingeben",
    warning: "Aktionen, die nicht rückgängig gemacht werden können"
  },
  en: settingsCopyEn.danger,
  es: {
    confirmationLabel: "Para confirmar, escribe DELETE abajo:",
    deleteAccount: "Eliminar cuenta",
    deleteBullets: ["Todos tus datos se eliminarán permanentemente", "Perderás acceso a todas tus transcripciones", "Tu suscripción se cancelará si aplica", "Tu cuenta no podrá recuperarse", "Tu email ya no podrá crear una cuenta nueva"],
    deleteDescription: "Elimina permanentemente tu cuenta y todos los datos",
    deleteFailed: "No se pudo eliminar la cuenta.",
    dialogIntro: "¿Seguro que quieres eliminar tu cuenta? Esta acción no se puede deshacer.",
    dialogTitle: "Eliminar cuenta",
    title: "Zona de peligro",
    typeDeletePlaceholder: "Escribe DELETE aquí",
    warning: "Acciones que no se pueden deshacer"
  },
  fr: {
    confirmationLabel: "Pour confirmer, saisissez DELETE ci-dessous :",
    deleteAccount: "Supprimer le compte",
    deleteBullets: ["Toutes vos données seront définitivement supprimées", "Vous perdrez l’accès à toutes vos transcriptions", "Votre abonnement sera annulé le cas échéant", "Votre compte ne pourra pas être récupéré", "Votre e-mail ne pourra plus créer de nouveau compte"],
    deleteDescription: "Supprimer définitivement votre compte et toutes les données",
    deleteFailed: "Impossible de supprimer le compte.",
    dialogIntro: "Voulez-vous vraiment supprimer votre compte ? Cette action est irréversible.",
    dialogTitle: "Supprimer le compte",
    title: "Zone dangereuse",
    typeDeletePlaceholder: "Saisissez DELETE ici",
    warning: "Actions irréversibles"
  },
  hu: {
    confirmationLabel: "Megerősítéshez írd be lent: DELETE",
    deleteAccount: "Fiók törlése",
    deleteBullets: ["Minden adatod véglegesen törlődik", "Elveszíted a hozzáférést minden átiratodhoz", "Az előfizetésed lemondásra kerül, ha van", "A fiókod nem állítható vissza", "Az emailed többé nem hozhat létre új fiókot"],
    deleteDescription: "Fiók és minden adat végleges törlése",
    deleteFailed: "A fiók törlése nem sikerült.",
    dialogIntro: "Biztosan törölni szeretnéd a fiókodat? Ez a művelet nem vonható vissza.",
    dialogTitle: "Fiók törlése",
    title: "Veszélyzóna",
    typeDeletePlaceholder: "Írd ide: DELETE",
    warning: "Nem visszavonható műveletek"
  },
  id: {
    confirmationLabel: "Untuk mengonfirmasi, ketik DELETE di bawah:",
    deleteAccount: "Hapus Akun",
    deleteBullets: ["Semua data Anda akan dihapus permanen", "Anda akan kehilangan akses ke semua transkrip", "Langganan Anda akan dibatalkan jika ada", "Akun Anda tidak dapat dipulihkan", "Email Anda tidak dapat lagi membuat akun baru"],
    deleteDescription: "Hapus akun dan semua data secara permanen",
    deleteFailed: "Tidak dapat menghapus akun.",
    dialogIntro: "Anda yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan.",
    dialogTitle: "Hapus Akun",
    title: "Zona Berbahaya",
    typeDeletePlaceholder: "Ketik DELETE di sini",
    warning: "Tindakan yang tidak dapat dibatalkan"
  },
  it: {
    confirmationLabel: "Per confermare, digita DELETE qui sotto:",
    deleteAccount: "Elimina account",
    deleteBullets: ["Tutti i tuoi dati verranno eliminati definitivamente", "Perderai accesso a tutte le trascrizioni", "L’abbonamento verrà annullato se presente", "L’account non potrà essere recuperato", "La tua email non potrà più creare un nuovo account"],
    deleteDescription: "Elimina definitivamente account e dati",
    deleteFailed: "Impossibile eliminare l’account.",
    dialogIntro: "Vuoi davvero eliminare il tuo account? Questa azione non può essere annullata.",
    dialogTitle: "Elimina account",
    title: "Zona pericolosa",
    typeDeletePlaceholder: "Digita DELETE qui",
    warning: "Azioni che non possono essere annullate"
  },
  ja: {
    confirmationLabel: "確認するには、下に DELETE と入力してください:",
    deleteAccount: "アカウントを削除",
    deleteBullets: ["すべてのデータが完全に削除されます", "すべての文字起こしにアクセスできなくなります", "該当する場合、サブスクリプションはキャンセルされます", "アカウントは復元できません", "このメールでは新しいアカウントを作成できなくなります"],
    deleteDescription: "アカウントとすべてのデータを完全に削除します",
    deleteFailed: "アカウントを削除できませんでした。",
    dialogIntro: "アカウントを削除してもよろしいですか？この操作は元に戻せません。",
    dialogTitle: "アカウントを削除",
    title: "危険な操作",
    typeDeletePlaceholder: "ここに DELETE と入力",
    warning: "元に戻せない操作"
  },
  ko: {
    confirmationLabel: "확인하려면 아래에 DELETE를 입력하세요:",
    deleteAccount: "계정 삭제",
    deleteBullets: ["모든 데이터가 영구적으로 삭제됩니다", "모든 전사에 접근할 수 없게 됩니다", "해당되는 경우 구독이 취소됩니다", "계정은 복구할 수 없습니다", "이 이메일로 새 계정을 만들 수 없습니다"],
    deleteDescription: "계정과 모든 데이터를 영구적으로 삭제합니다",
    deleteFailed: "계정을 삭제할 수 없습니다.",
    dialogIntro: "정말 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
    dialogTitle: "계정 삭제",
    title: "위험 영역",
    typeDeletePlaceholder: "여기에 DELETE 입력",
    warning: "되돌릴 수 없는 작업"
  },
  nl: {
    confirmationLabel: "Typ hieronder DELETE om te bevestigen:",
    deleteAccount: "Account verwijderen",
    deleteBullets: ["Al je gegevens worden permanent verwijderd", "Je verliest toegang tot al je transcripties", "Je abonnement wordt geannuleerd indien van toepassing", "Je account kan niet worden hersteld", "Je e-mail kan geen nieuw account meer aanmaken"],
    deleteDescription: "Verwijder je account en alle gegevens permanent",
    deleteFailed: "Kan account niet verwijderen.",
    dialogIntro: "Weet je zeker dat je je account wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.",
    dialogTitle: "Account verwijderen",
    title: "Gevarenzone",
    typeDeletePlaceholder: "Typ hier DELETE",
    warning: "Acties die niet ongedaan kunnen worden gemaakt"
  },
  pl: {
    confirmationLabel: "Aby potwierdzić, wpisz poniżej DELETE:",
    deleteAccount: "Usuń konto",
    deleteBullets: ["Wszystkie dane zostaną trwale usunięte", "Utracisz dostęp do wszystkich transkrypcji", "Subskrypcja zostanie anulowana, jeśli dotyczy", "Konta nie będzie można odzyskać", "Ten email nie będzie mógł utworzyć nowego konta"],
    deleteDescription: "Trwale usuń konto i wszystkie dane",
    deleteFailed: "Nie można usunąć konta.",
    dialogIntro: "Czy na pewno chcesz usunąć konto? Tej akcji nie można cofnąć.",
    dialogTitle: "Usuń konto",
    title: "Strefa zagrożenia",
    typeDeletePlaceholder: "Wpisz tutaj DELETE",
    warning: "Działania, których nie można cofnąć"
  },
  pt: {
    confirmationLabel: "Para confirmar, digite DELETE abaixo:",
    deleteAccount: "Excluir conta",
    deleteBullets: ["Todos os seus dados serão excluídos permanentemente", "Você perderá acesso a todas as transcrições", "Sua assinatura será cancelada se aplicável", "Sua conta não poderá ser recuperada", "Seu email não poderá mais criar uma nova conta"],
    deleteDescription: "Excluir permanentemente sua conta e todos os dados",
    deleteFailed: "Não foi possível excluir a conta.",
    dialogIntro: "Tem certeza de que deseja excluir sua conta? Esta ação não pode ser desfeita.",
    dialogTitle: "Excluir conta",
    title: "Zona de perigo",
    typeDeletePlaceholder: "Digite DELETE aqui",
    warning: "Ações que não podem ser desfeitas"
  },
  ru: {
    confirmationLabel: "Для подтверждения введите DELETE ниже:",
    deleteAccount: "Удалить аккаунт",
    deleteBullets: ["Все ваши данные будут удалены навсегда", "Вы потеряете доступ ко всем расшифровкам", "Подписка будет отменена, если применимо", "Аккаунт нельзя будет восстановить", "Ваш email больше не сможет создать новый аккаунт"],
    deleteDescription: "Навсегда удалить аккаунт и все данные",
    deleteFailed: "Не удалось удалить аккаунт.",
    dialogIntro: "Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.",
    dialogTitle: "Удалить аккаунт",
    title: "Опасная зона",
    typeDeletePlaceholder: "Введите DELETE здесь",
    warning: "Действия, которые нельзя отменить"
  },
  th: {
    confirmationLabel: "เพื่อยืนยัน ให้พิมพ์ DELETE ด้านล่าง:",
    deleteAccount: "ลบบัญชี",
    deleteBullets: ["ข้อมูลทั้งหมดของคุณจะถูกลบถาวร", "คุณจะเสียสิทธิ์เข้าถึงการถอดเสียงทั้งหมด", "การสมัครสมาชิกของคุณจะถูกยกเลิกหากมี", "ไม่สามารถกู้คืนบัญชีได้", "อีเมลของคุณจะไม่สามารถสร้างบัญชีใหม่ได้อีก"],
    deleteDescription: "ลบบัญชีและข้อมูลทั้งหมดอย่างถาวร",
    deleteFailed: "ไม่สามารถลบบัญชีได้",
    dialogIntro: "คุณแน่ใจหรือไม่ว่าต้องการลบบัญชี? การดำเนินการนี้ย้อนกลับไม่ได้",
    dialogTitle: "ลบบัญชี",
    title: "โซนอันตราย",
    typeDeletePlaceholder: "พิมพ์ DELETE ที่นี่",
    warning: "การดำเนินการที่ย้อนกลับไม่ได้"
  },
  tr: {
    confirmationLabel: "Onaylamak için aşağıya DELETE yazın:",
    deleteAccount: "Hesabı sil",
    deleteBullets: ["Tüm verileriniz kalıcı olarak silinir", "Tüm transkriptlerinize erişimi kaybedersiniz", "Varsa aboneliğiniz iptal edilir", "Hesabınız kurtarılamaz", "E-postanız artık yeni hesap oluşturamaz"],
    deleteDescription: "Hesabınızı ve tüm verileri kalıcı olarak silin",
    deleteFailed: "Hesap silinemedi.",
    dialogIntro: "Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.",
    dialogTitle: "Hesabı sil",
    title: "Tehlikeli Alan",
    typeDeletePlaceholder: "Buraya DELETE yazın",
    warning: "Geri alınamayan işlemler"
  },
  uk: {
    confirmationLabel: "Щоб підтвердити, введіть DELETE нижче:",
    deleteAccount: "Видалити акаунт",
    deleteBullets: ["Усі ваші дані буде видалено назавжди", "Ви втратите доступ до всіх транскрипцій", "Підписку буде скасовано, якщо застосовно", "Акаунт неможливо буде відновити", "Ваш email більше не зможе створити новий акаунт"],
    deleteDescription: "Назавжди видалити акаунт і всі дані",
    deleteFailed: "Не вдалося видалити акаунт.",
    dialogIntro: "Ви впевнені, що хочете видалити акаунт? Цю дію не можна скасувати.",
    dialogTitle: "Видалити акаунт",
    title: "Небезпечна зона",
    typeDeletePlaceholder: "Введіть DELETE тут",
    warning: "Дії, які не можна скасувати"
  },
  vi: {
    confirmationLabel: "Để xác nhận, nhập DELETE bên dưới:",
    deleteAccount: "Xóa tài khoản",
    deleteBullets: ["Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn", "Bạn sẽ mất quyền truy cập vào mọi bản chép lời", "Gói đăng ký sẽ bị hủy nếu có", "Không thể khôi phục tài khoản", "Email của bạn sẽ không thể tạo tài khoản mới"],
    deleteDescription: "Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu",
    deleteFailed: "Không thể xóa tài khoản.",
    dialogIntro: "Bạn có chắc muốn xóa tài khoản? Hành động này không thể hoàn tác.",
    dialogTitle: "Xóa tài khoản",
    title: "Vùng nguy hiểm",
    typeDeletePlaceholder: "Nhập DELETE tại đây",
    warning: "Các hành động không thể hoàn tác"
  },
  zh: {
    confirmationLabel: "如要确认，请在下方输入 DELETE：",
    deleteAccount: "删除账号",
    deleteBullets: ["你的所有数据将被永久删除", "你将无法访问所有转写记录", "你的订阅将被取消（如适用）", "你的账号无法恢复", "你的邮箱将无法再创建新账号"],
    deleteDescription: "永久删除你的账号和所有数据",
    deleteFailed: "无法删除账号。",
    dialogIntro: "确定要删除账号吗？此操作无法撤销。",
    dialogTitle: "删除账号",
    title: "危险区",
    typeDeletePlaceholder: "在此输入 DELETE",
    warning: "无法撤销的操作"
  },
  "zh-TW": {
    confirmationLabel: "如要確認，請在下方輸入 DELETE：",
    deleteAccount: "刪除帳號",
    deleteBullets: ["你的所有資料將被永久刪除", "你將無法存取所有轉寫紀錄", "你的訂閱將被取消（如適用）", "你的帳號無法復原", "你的信箱將無法再建立新帳號"],
    deleteDescription: "永久刪除你的帳號和所有資料",
    deleteFailed: "無法刪除帳號。",
    dialogIntro: "確定要刪除帳號嗎？此操作無法復原。",
    dialogTitle: "刪除帳號",
    title: "危險區",
    typeDeletePlaceholder: "在此輸入 DELETE",
    warning: "無法復原的操作"
  }
};

const settingsNotificationsCopy: Record<Locale, SettingsCopy["notifications"]> = {
  ar: {description: "إدارة تفضيلات إشعارات البريد", productUpdatesDescription: "استقبل إشعارات حول تحديثات المنتج والميزات الجديدة", productUpdatesTitle: "تحديثات المنتج والميزات الجديدة", quotaResetDescription: "استقبل إشعاراً عند إعادة تعيين حصة التفريغ", quotaResetTitle: "إشعارات إعادة تعيين حصة التفريغ", successDescription: "استقبل إشعاراً عند اكتمال تفريغ الصوت", successTitle: "إشعارات اكتمال التفريغ", title: "إشعارات البريد"},
  de: {description: "E-Mail-Benachrichtigungen verwalten", productUpdatesDescription: "Benachrichtigungen zu Produktupdates und neuen Funktionen erhalten", productUpdatesTitle: "Produktupdates und neue Funktionen", quotaResetDescription: "Benachrichtigung erhalten, wenn dein Transkriptionskontingent zurückgesetzt wird", quotaResetTitle: "Benachrichtigungen zum Kontingent-Reset", successDescription: "Benachrichtigung erhalten, wenn deine Audiotranskription abgeschlossen ist", successTitle: "Benachrichtigungen bei abgeschlossener Transkription", title: "E-Mail-Benachrichtigungen"},
  en: settingsCopyEn.notifications,
  es: {description: "Gestiona tus preferencias de notificaciones por email", productUpdatesDescription: "Recibe notificaciones sobre actualizaciones del producto y nuevas funciones", productUpdatesTitle: "Actualizaciones del producto y nuevas funciones", quotaResetDescription: "Recibe notificaciones cuando se restablezca tu cuota de transcripción", quotaResetTitle: "Notificaciones de restablecimiento de cuota", successDescription: "Recibe notificaciones cuando tu transcripción de audio esté lista", successTitle: "Notificaciones de transcripción completada", title: "Notificaciones por email"},
  fr: {description: "Gérez vos préférences de notifications par e-mail", productUpdatesDescription: "Recevez des notifications sur les mises à jour produit et nouvelles fonctionnalités", productUpdatesTitle: "Mises à jour produit et nouvelles fonctionnalités", quotaResetDescription: "Recevez une notification lorsque votre quota de transcription est réinitialisé", quotaResetTitle: "Notifications de réinitialisation du quota", successDescription: "Recevez une notification lorsque votre transcription audio est terminée", successTitle: "Notifications de transcription terminée", title: "Notifications par e-mail"},
  hu: {description: "Kezeld az email értesítéseket", productUpdatesDescription: "Értesítések termékfrissítésekről és új funkciókról", productUpdatesTitle: "Termékfrissítések és új funkciók", quotaResetDescription: "Értesítés, amikor a transzkripciós kereted visszaáll", quotaResetTitle: "Keret-visszaállítási értesítések", successDescription: "Értesítés, amikor az audioátirat elkészül", successTitle: "Sikeres transzkripciós értesítések", title: "Email értesítések"},
  id: {description: "Kelola preferensi notifikasi email Anda", productUpdatesDescription: "Terima notifikasi tentang pembaruan produk dan fitur baru", productUpdatesTitle: "Pembaruan produk dan fitur baru", quotaResetDescription: "Terima notifikasi saat kuota transkripsi Anda direset", quotaResetTitle: "Notifikasi reset kuota transkripsi", successDescription: "Terima notifikasi saat transkripsi audio selesai", successTitle: "Notifikasi transkripsi selesai", title: "Notifikasi email"},
  it: {description: "Gestisci le preferenze delle notifiche email", productUpdatesDescription: "Ricevi notifiche su aggiornamenti prodotto e nuove funzionalità", productUpdatesTitle: "Aggiornamenti prodotto e nuove funzionalità", quotaResetDescription: "Ricevi notifiche quando la quota di trascrizione viene reimpostata", quotaResetTitle: "Notifiche reset quota trascrizione", successDescription: "Ricevi notifiche quando la trascrizione audio è completa", successTitle: "Notifiche trascrizione completata", title: "Notifiche email"},
  ja: {description: "メール通知の設定を管理します", productUpdatesDescription: "製品アップデートと新機能に関する通知を受け取ります", productUpdatesTitle: "製品アップデートと新機能", quotaResetDescription: "文字起こし枠がリセットされたときに通知を受け取ります", quotaResetTitle: "文字起こし枠リセット通知", successDescription: "音声文字起こしが完了したときに通知を受け取ります", successTitle: "文字起こし完了通知", title: "メール通知"},
  ko: {description: "이메일 알림 환경설정을 관리하세요", productUpdatesDescription: "제품 업데이트와 새 기능 알림을 받습니다", productUpdatesTitle: "제품 업데이트 및 새 기능", quotaResetDescription: "전사 할당량이 재설정될 때 알림을 받습니다", quotaResetTitle: "전사 할당량 재설정 알림", successDescription: "오디오 전사가 완료되면 알림을 받습니다", successTitle: "전사 완료 알림", title: "이메일 알림"},
  nl: {description: "Beheer je e-mailmeldingen", productUpdatesDescription: "Ontvang meldingen over productupdates en nieuwe functies", productUpdatesTitle: "Productupdates en nieuwe functies", quotaResetDescription: "Ontvang meldingen wanneer je transcriptiequota wordt gereset", quotaResetTitle: "Meldingen voor transcriptiequota-reset", successDescription: "Ontvang meldingen wanneer je audiotranscriptie klaar is", successTitle: "Meldingen voor voltooide transcriptie", title: "E-mailmeldingen"},
  pl: {description: "Zarządzaj powiadomieniami e-mail", productUpdatesDescription: "Otrzymuj powiadomienia o aktualizacjach produktu i nowych funkcjach", productUpdatesTitle: "Aktualizacje produktu i nowe funkcje", quotaResetDescription: "Otrzymuj powiadomienia po zresetowaniu limitu transkrypcji", quotaResetTitle: "Powiadomienia o resecie limitu transkrypcji", successDescription: "Otrzymuj powiadomienia po ukończeniu transkrypcji audio", successTitle: "Powiadomienia o ukończeniu transkrypcji", title: "Powiadomienia e-mail"},
  pt: {description: "Gerencie as preferências de notificações por email", productUpdatesDescription: "Receba notificações sobre atualizações do produto e novos recursos", productUpdatesTitle: "Atualizações do produto e novos recursos", quotaResetDescription: "Receba notificações quando sua cota de transcrição for redefinida", quotaResetTitle: "Notificações de redefinição de cota", successDescription: "Receba notificações quando sua transcrição de áudio estiver concluída", successTitle: "Notificações de transcrição concluída", title: "Notificações por email"},
  ru: {description: "Управляйте email-уведомлениями", productUpdatesDescription: "Получайте уведомления об обновлениях продукта и новых функциях", productUpdatesTitle: "Обновления продукта и новые функции", quotaResetDescription: "Получайте уведомления при сбросе квоты транскрипции", quotaResetTitle: "Уведомления о сбросе квоты транскрипции", successDescription: "Получайте уведомления, когда аудиотранскрипция завершена", successTitle: "Уведомления о завершении транскрипции", title: "Email-уведомления"},
  th: {description: "จัดการการแจ้งเตือนทางอีเมล", productUpdatesDescription: "รับการแจ้งเตือนเกี่ยวกับการอัปเดตผลิตภัณฑ์และฟีเจอร์ใหม่", productUpdatesTitle: "การอัปเดตผลิตภัณฑ์และฟีเจอร์ใหม่", quotaResetDescription: "รับการแจ้งเตือนเมื่อโควตาถอดเสียงถูกรีเซ็ต", quotaResetTitle: "การแจ้งเตือนรีเซ็ตโควตาถอดเสียง", successDescription: "รับการแจ้งเตือนเมื่อการถอดเสียงเสร็จสมบูรณ์", successTitle: "การแจ้งเตือนถอดเสียงสำเร็จ", title: "การแจ้งเตือนอีเมล"},
  tr: {description: "E-posta bildirim tercihlerinizi yönetin", productUpdatesDescription: "Ürün güncellemeleri ve yeni özellikler hakkında bildirim alın", productUpdatesTitle: "Ürün güncellemeleri ve yeni özellikler", quotaResetDescription: "Transkripsiyon kotanız sıfırlandığında bildirim alın", quotaResetTitle: "Transkripsiyon kotası sıfırlama bildirimleri", successDescription: "Ses transkripsiyonunuz tamamlandığında bildirim alın", successTitle: "Transkripsiyon tamamlandı bildirimleri", title: "E-posta Bildirimleri"},
  uk: {description: "Керуйте email-сповіщеннями", productUpdatesDescription: "Отримуйте сповіщення про оновлення продукту й нові функції", productUpdatesTitle: "Оновлення продукту й нові функції", quotaResetDescription: "Отримуйте сповіщення, коли квоту транскрипції буде скинуто", quotaResetTitle: "Сповіщення про скидання квоти транскрипції", successDescription: "Отримуйте сповіщення, коли аудіотранскрипція завершена", successTitle: "Сповіщення про завершення транскрипції", title: "Email-сповіщення"},
  vi: {description: "Quản lý tùy chọn thông báo email", productUpdatesDescription: "Nhận thông báo về cập nhật sản phẩm và tính năng mới", productUpdatesTitle: "Cập nhật sản phẩm và tính năng mới", quotaResetDescription: "Nhận thông báo khi hạn mức chép lời được đặt lại", quotaResetTitle: "Thông báo đặt lại hạn mức chép lời", successDescription: "Nhận thông báo khi bản chép lời âm thanh hoàn tất", successTitle: "Thông báo chép lời thành công", title: "Thông báo email"},
  zh: {description: "管理你的邮箱通知偏好", productUpdatesDescription: "接收产品更新和新功能通知", productUpdatesTitle: "产品更新和新功能", quotaResetDescription: "转写额度重置时接收通知", quotaResetTitle: "转写额度重置通知", successDescription: "音频转写完成时接收通知", successTitle: "转写完成通知", title: "邮箱通知"},
  "zh-TW": {description: "管理你的信箱通知偏好", productUpdatesDescription: "接收產品更新和新功能通知", productUpdatesTitle: "產品更新和新功能", quotaResetDescription: "轉寫額度重設時接收通知", quotaResetTitle: "轉寫額度重設通知", successDescription: "音訊轉寫完成時接收通知", successTitle: "轉寫完成通知", title: "信箱通知"}
};

const settingsIntegrationsCopy: Record<Locale, SettingsCopy["integrations"]> = {
  ar: {connectedFallback: "Google Drive متصل", description: "إدارة اتصالاتك بالتخزين السحابي والخدمات الخارجية", disconnected: "تم قطع اتصال Google Drive.", disconnectError: "تعذر قطع اتصال Google Drive.", driveDescription: "استورد ملفات الصوت والفيديو مباشرة من Google Drive.", driveName: "Google Drive", title: "التكاملات"},
  de: {connectedFallback: "Google Drive verbunden", description: "Verbindungen zu Cloud-Speichern und Diensten verwalten", disconnected: "Google Drive getrennt.", disconnectError: "Google Drive konnte nicht getrennt werden.", driveDescription: "Audio- und Videodateien direkt aus Google Drive importieren.", driveName: "Google Drive", title: "Integrationen"},
  en: settingsCopyEn.integrations,
  es: {connectedFallback: "Google Drive conectado", description: "Gestiona tus conexiones con almacenamiento en la nube y servicios externos", disconnected: "Google Drive desconectado.", disconnectError: "No se pudo desconectar Google Drive.", driveDescription: "Importa archivos de audio y video directamente desde Google Drive.", driveName: "Google Drive", title: "Integraciones"},
  fr: {connectedFallback: "Google Drive connecté", description: "Gérez vos connexions avec le stockage cloud et les services tiers", disconnected: "Google Drive déconnecté.", disconnectError: "Impossible de déconnecter Google Drive.", driveDescription: "Importez des fichiers audio et vidéo directement depuis Google Drive.", driveName: "Google Drive", title: "Intégrations"},
  hu: {connectedFallback: "Google Drive csatlakoztatva", description: "Kezeld a külső felhőtárhelyek és szolgáltatások kapcsolatait", disconnected: "Google Drive leválasztva.", disconnectError: "A Google Drive leválasztása nem sikerült.", driveDescription: "Importálj hang- és videófájlokat közvetlenül a Google Drive-ból.", driveName: "Google Drive", title: "Integrációk"},
  id: {connectedFallback: "Google Drive terhubung", description: "Kelola koneksi dengan penyimpanan cloud dan layanan pihak ketiga", disconnected: "Google Drive terputus.", disconnectError: "Tidak dapat memutuskan Google Drive.", driveDescription: "Impor file audio dan video langsung dari Google Drive.", driveName: "Google Drive", title: "Integrasi"},
  it: {connectedFallback: "Google Drive connesso", description: "Gestisci connessioni con archiviazione cloud e servizi di terze parti", disconnected: "Google Drive disconnesso.", disconnectError: "Impossibile disconnettere Google Drive.", driveDescription: "Importa file audio e video direttamente da Google Drive.", driveName: "Google Drive", title: "Integrazioni"},
  ja: {connectedFallback: "Google Drive 接続済み", description: "クラウドストレージや外部サービスとの接続を管理します", disconnected: "Google Drive を切断しました。", disconnectError: "Google Drive を切断できませんでした。", driveDescription: "Google Drive から音声・動画ファイルを直接インポートします。", driveName: "Google Drive", title: "連携"},
  ko: {connectedFallback: "Google Drive 연결됨", description: "외부 클라우드 저장소 및 서비스 연결을 관리하세요", disconnected: "Google Drive 연결이 해제되었습니다.", disconnectError: "Google Drive 연결을 해제할 수 없습니다.", driveDescription: "Google Drive에서 오디오와 비디오 파일을 직접 가져옵니다.", driveName: "Google Drive", title: "연동"},
  nl: {connectedFallback: "Google Drive verbonden", description: "Beheer je verbindingen met cloudopslag en externe diensten", disconnected: "Google Drive losgekoppeld.", disconnectError: "Kan Google Drive niet loskoppelen.", driveDescription: "Importeer audio- en videobestanden rechtstreeks uit Google Drive.", driveName: "Google Drive", title: "Integraties"},
  pl: {connectedFallback: "Google Drive połączony", description: "Zarządzaj połączeniami z pamięcią chmurową i usługami zewnętrznymi", disconnected: "Google Drive rozłączono.", disconnectError: "Nie można rozłączyć Google Drive.", driveDescription: "Importuj pliki audio i wideo bezpośrednio z Google Drive.", driveName: "Google Drive", title: "Integracje"},
  pt: {connectedFallback: "Google Drive conectado", description: "Gerencie conexões com armazenamento em nuvem e serviços externos", disconnected: "Google Drive desconectado.", disconnectError: "Não foi possível desconectar o Google Drive.", driveDescription: "Importe arquivos de áudio e vídeo diretamente do Google Drive.", driveName: "Google Drive", title: "Integrações"},
  ru: {connectedFallback: "Google Drive подключен", description: "Управляйте подключениями к облачным хранилищам и сторонним сервисам", disconnected: "Google Drive отключен.", disconnectError: "Не удалось отключить Google Drive.", driveDescription: "Импортируйте аудио и видео напрямую из Google Drive.", driveName: "Google Drive", title: "Интеграции"},
  th: {connectedFallback: "เชื่อมต่อ Google Drive แล้ว", description: "จัดการการเชื่อมต่อกับพื้นที่เก็บข้อมูลคลาวด์และบริการภายนอก", disconnected: "ตัดการเชื่อมต่อ Google Drive แล้ว", disconnectError: "ไม่สามารถตัดการเชื่อมต่อ Google Drive ได้", driveDescription: "นำเข้าไฟล์เสียงและวิดีโอจาก Google Drive โดยตรง", driveName: "Google Drive", title: "การเชื่อมต่อ"},
  tr: {connectedFallback: "Google Drive bağlı", description: "Bulut depolama ve üçüncü taraf servis bağlantılarınızı yönetin", disconnected: "Google Drive bağlantısı kesildi.", disconnectError: "Google Drive bağlantısı kesilemedi.", driveDescription: "Ses ve video dosyalarını doğrudan Google Drive'dan içe aktarın.", driveName: "Google Drive", title: "Entegrasyonlar"},
  uk: {connectedFallback: "Google Drive підключено", description: "Керуйте підключеннями до хмарних сховищ і сторонніх сервісів", disconnected: "Google Drive відключено.", disconnectError: "Не вдалося відключити Google Drive.", driveDescription: "Імпортуйте аудіо й відео безпосередньо з Google Drive.", driveName: "Google Drive", title: "Інтеграції"},
  vi: {connectedFallback: "Google Drive đã kết nối", description: "Quản lý kết nối với lưu trữ đám mây và dịch vụ bên thứ ba", disconnected: "Đã ngắt kết nối Google Drive.", disconnectError: "Không thể ngắt kết nối Google Drive.", driveDescription: "Nhập tệp âm thanh và video trực tiếp từ Google Drive.", driveName: "Google Drive", title: "Tích hợp"},
  zh: {connectedFallback: "Google Drive 已连接", description: "管理你与第三方云存储和服务的连接", disconnected: "Google Drive 已断开连接。", disconnectError: "无法断开 Google Drive。", driveDescription: "直接从 Google Drive 导入音频和视频文件。", driveName: "Google Drive", title: "集成"},
  "zh-TW": {connectedFallback: "Google Drive 已連線", description: "管理你與第三方雲端儲存和服務的連線", disconnected: "Google Drive 已中斷連線。", disconnectError: "無法中斷 Google Drive。", driveDescription: "直接從 Google Drive 匯入音訊和影片檔。", driveName: "Google Drive", title: "整合"}
};

function mergeSettingsCopy(locale: string): SettingsCopy {
  const normalizedLocale = isLocale(locale) ? locale : "en";
  const localeKey = normalizedLocale.toLowerCase().split("-")[0] as Locale;
  const override = settingsCopyOverrides[normalizedLocale] ?? settingsCopyOverrides[localeKey] ?? {};
  const localizedUsage = settingsUsageCopy[normalizedLocale];
  const usagePackOverrides = override.usage?.packs ?? {};
  const usagePlanNameOverrides = override.usage?.planNames ?? {};
  return {
    ...settingsCopyEn,
    ...override,
    tabs: {...settingsCopyEn.tabs, ...override.tabs},
    common: {...settingsCopyEn.common, ...settingsCommonCopy[normalizedLocale], ...override.common},
    shell: {...settingsCopyEn.shell, ...override.shell},
    profile: {...settingsCopyEn.profile, ...settingsProfileCopy[normalizedLocale], ...override.profile},
    security: {...settingsCopyEn.security, ...settingsSecurityCopy[normalizedLocale], ...override.security},
    usage: {
      ...settingsCopyEn.usage,
      ...localizedUsage,
      ...override.usage,
      packs: {
        ADDON_BASIC: {...settingsCopyEn.usage.packs.ADDON_BASIC, ...localizedUsage.packs.ADDON_BASIC, ...usagePackOverrides.ADDON_BASIC},
        ADDON_STANDARD: {...settingsCopyEn.usage.packs.ADDON_STANDARD, ...localizedUsage.packs.ADDON_STANDARD, ...usagePackOverrides.ADDON_STANDARD},
        ADDON_PRO: {...settingsCopyEn.usage.packs.ADDON_PRO, ...localizedUsage.packs.ADDON_PRO, ...usagePackOverrides.ADDON_PRO}
      },
      planNames: {
        BASIC: usagePlanNameOverrides.BASIC ?? localizedUsage.planNames.BASIC,
        FREE: usagePlanNameOverrides.FREE ?? localizedUsage.planNames.FREE,
        PRO: usagePlanNameOverrides.PRO ?? localizedUsage.planNames.PRO,
        STANDARD: usagePlanNameOverrides.STANDARD ?? localizedUsage.planNames.STANDARD
      }
    },
    preferences: {...settingsCopyEn.preferences, ...settingsPreferencesCopy[normalizedLocale], ...override.preferences},
    api: {
      ...settingsCopyEn.api,
      ...settingsApiCopy[normalizedLocale],
      ...override.api,
      statuses: {...settingsCopyEn.api.statuses, ...settingsApiCopy[normalizedLocale].statuses, ...override.api?.statuses}
    },
    notifications: {...settingsCopyEn.notifications, ...settingsNotificationsCopy[normalizedLocale], ...override.notifications},
    integrations: {...settingsCopyEn.integrations, ...settingsIntegrationsCopy[normalizedLocale], ...override.integrations},
    danger: {
      ...settingsCopyEn.danger,
      ...settingsDangerCopy[normalizedLocale],
      ...override.danger,
      deleteBullets: override.danger?.deleteBullets ?? settingsDangerCopy[normalizedLocale].deleteBullets
    },
    apiDialogs: {...settingsCopyEn.apiDialogs, ...settingsApiDialogsCopy[normalizedLocale], ...override.apiDialogs},
    errors: {...settingsCopyEn.errors, ...settingsErrorsCopy[normalizedLocale], ...override.errors}
  };
}

function splitName(name?: string | null) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ")
  };
}

function formatDateTime(value?: string | null, locale = "en") {
  const date = value ? new Date(value) : (() => {
    const fallback = new Date();
    fallback.setMonth(fallback.getMonth() + 1);
    return fallback;
  })();
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function rollForwardMonthlyDate(value?: string | null) {
  if (!value) return null;
  let next = new Date(value);
  if (Number.isNaN(next.getTime())) return null;
  const now = new Date();
  while (next <= now) {
    next = addMonths(next, 1);
  }
  return next.toISOString();
}

function resolveUsageResetDate(input: {usageReset?: string | null; subscriptionReset?: string | null; dailyReset?: string | null; plan: string; stripeSubscriptionId?: string | null}) {
  if (input.usageReset) return input.usageReset;

  const normalizedPlan = input.plan.toUpperCase();
  if (input.subscriptionReset) {
    return normalizedPlan === "FREE" || !input.stripeSubscriptionId ? rollForwardMonthlyDate(input.subscriptionReset) : input.subscriptionReset;
  }

  if (input.dailyReset) {
    const dailyReset = new Date(input.dailyReset);
    if (!Number.isNaN(dailyReset.getTime()) && dailyReset > new Date()) return input.dailyReset;
  }

  return null;
}

function SettingSection({
  id,
  title,
  description,
  tone = "default",
  headerExtra,
  headerChildren,
  children
}: {
  id: TabId;
  title: string;
  description?: string;
  tone?: "default" | "danger";
  headerExtra?: ReactNode;
  headerChildren?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className={clsx("overflow-hidden rounded-lg border shadow-soft", tone === "danger" ? "border-red-500/20 bg-transparent" : "border-slate-200 bg-white")}>
      <div className={clsx("px-6 py-6", tone === "danger" ? "border-b border-red-500/10 bg-transparent" : "bg-slate-100/50")}>
        <div className="flex items-center gap-2">
          <h3 className={clsx("text-xl font-semibold leading-7 tracking-tight", tone === "danger" ? "text-red-500" : "text-[rgb(2,8,23)]")}>{title}</h3>
          {headerExtra}
        </div>
        {description ? <p className="mt-1.5 text-sm leading-5 text-slate-500 [word-spacing:1.25px]">{description}</p> : null}
        {headerChildren}
      </div>
      <div className="px-6 py-6">{children}</div>
    </section>
  );
}

function TextField({label, value, placeholder, type = "text", onChange}: {label: string; value?: string; placeholder?: string; type?: string; onChange: (value: string) => void}) {
  return (
    <label className="grid gap-2 text-sm font-medium leading-5 text-[rgb(2,8,23)]">
      {label}
      <input
        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-normal leading-5 text-[rgb(2,8,23)] outline-none ring-offset-white transition placeholder:text-slate-500 focus:border-violet focus:ring-2 focus:ring-violet/25 disabled:cursor-not-allowed disabled:opacity-50"
        value={value ?? ""}
        placeholder={placeholder}
        type={type}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function PrimarySettingsButton({children, onClick, disabled, className}: {children: ReactNode; onClick: () => void; disabled?: boolean; className?: string}) {
  return (
    <button
      type="button"
      className={clsx(
        "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-violet px-4 py-2 text-sm font-medium leading-5 text-white transition-colors hover:bg-violet/90 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function AuthMethodRow({label, status, email, statusTone = "outline"}: {label: string; status: string; email?: string | null; statusTone?: "outline" | "secondary"}) {
  return (
    <div className="h-20 rounded-md border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-base leading-6 text-[rgb(2,8,23)]">
          <Mail size={16} className="shrink-0" />
          <span>{label}</span>
        </div>
        <span
          className={clsx(
            "inline-flex h-[22px] shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-4",
            statusTone === "secondary" ? "border-transparent bg-slate-100 text-slate-900" : "border-slate-200 bg-transparent text-[rgb(2,8,23)]"
          )}
        >
          {status}
        </span>
      </div>
      <p className="mt-2 truncate text-sm leading-5 text-slate-500">{email}</p>
    </div>
  );
}

function ToggleRow({title, description, storageKey, defaultChecked = true}: {title: string; description: string; storageKey?: string; defaultChecked?: boolean}) {
  const [checked, setChecked] = useState(defaultChecked);

  useEffect(() => {
    if (!storageKey) {
      setChecked(defaultChecked);
      return;
    }
    const stored = window.localStorage.getItem(storageKey);
    setChecked(stored === null ? defaultChecked : stored === "true");
  }, [defaultChecked, storageKey]);

  function toggleChecked() {
    setChecked((value) => {
      const next = !value;
      if (storageKey) window.localStorage.setItem(storageKey, String(next));
      return next;
    });
  }

  return (
    <div className="flex min-h-[124px] items-center justify-between rounded-lg border border-slate-200 p-4 sm:min-h-20">
      <div className="space-y-0.5">
        <p className="text-sm font-medium leading-5 text-ink">{title}</p>
        <p className="text-sm leading-5 text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={toggleChecked}
        className={clsx(
          "inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-violet" : "bg-slate-200"
        )}
      >
        <span className={clsx("pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform", checked ? "translate-x-5" : "translate-x-0")} />
      </button>
    </div>
  );
}

function PreferenceMenu({
  value,
  options,
  align = "left",
  className,
  triggerClassName,
  menuClassName,
  menuMaxHeight = "50vh",
  flush = false,
  transparentTrigger = false,
  compactItems = false,
  searchable = false,
  onSelect
}: {
  value: string;
  options: PreferenceOption[];
  align?: "left" | "right";
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  menuMaxHeight?: string;
  flush?: boolean;
  transparentTrigger?: boolean;
  compactItems?: boolean;
  searchable?: boolean;
  onSelect?: (option: PreferenceOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const visibleOptions = searchable
    ? options.filter((option) => `${option.label} ${option.description ?? ""}`.toLowerCase().includes(query.toLowerCase().trim()))
    : options;
  return (
    <div
      className={clsx("relative w-fit", !flush && "mt-4", align === "right" && "ml-auto", className)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setQuery("");
          setOpen((current) => !current);
        }}
        className={clsx(
          "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium text-[rgb(2,8,23)] transition-colors focus-visible:outline-none",
          align === "right" && !transparentTrigger ? "border border-slate-200 bg-white hover:bg-slate-50" : "hover:bg-slate-50",
          triggerClassName
        )}
      >
        {value}
        <ChevronDown size={16} className="text-ink/55" />
      </button>
      {open ? (
        <div
          role="menu"
          className={clsx(
            "absolute z-50 overflow-y-auto rounded-md border border-slate-200 bg-white p-1 shadow-none",
            searchable ? "mt-1" : "mt-2.5",
            menuClassName ?? "w-72",
            align === "right" ? "right-0" : "left-0"
          )}
          style={{maxHeight: menuMaxHeight}}
        >
          {searchable ? (
            <div className="p-2">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-normal leading-5 text-[rgb(2,8,23)] outline-none ring-offset-white transition placeholder:text-slate-500 focus:border-violet focus:ring-2 focus:ring-violet/25"
              />
            </div>
          ) : null}
          <div className={searchable ? "py-1" : undefined}>
          {visibleOptions.map((option) => (
            <button
              key={`${option.label}-${option.description ?? ""}`}
              type="button"
              role="menuitem"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setOpen(false);
                onSelect?.(option);
              }}
              className={clsx(
                "flex w-full items-center justify-between gap-3 rounded text-left text-sm font-normal leading-5 text-[rgb(2,8,23)] transition hover:bg-slate-100",
                compactItems && !option.description ? "px-2 py-1.5" : "px-2 py-2"
              )}
            >
              <span className="min-w-0">
                <span className="block truncate">{option.label}</span>
                {option.description ? <span className="block truncate text-xs font-normal text-ink/50">{option.description}</span> : null}
              </span>
              {option.label === value ? <Check size={15} className="shrink-0 text-violet" /> : <span className="h-[15px] w-[15px] shrink-0" />}
            </button>
          ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Badge({children, tone = "neutral"}: {children: React.ReactNode; tone?: "neutral" | "success" | "beta"}) {
  return (
    <span className={clsx(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold leading-4",
      tone === "success" && "bg-sage/15 text-sage",
      tone === "beta" && "border-orange-200 bg-orange-100 text-orange-700",
      tone === "neutral" && "border-transparent bg-slate-100 text-slate-500"
    )}>
      {children}
    </span>
  );
}

export function SettingsPage({initialUser = null}: {initialUser?: CurrentUser | null}) {
  const locale = useLocale();
  const workspaceCopy = getWorkspaceCopy(locale);
  const settingsCopy = useMemo(() => mergeSettingsCopy(locale), [locale]);
  const [user, setUser] = useState<CurrentUser | null>(initialUser);
  const [usage, setUsage] = useState<UsageSnapshot | null>(null);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [active, setActive] = useState<TabId>("profile");
  const [notice, setNoticeText] = useState<string | null>(null);
  const [noticeLink, setNoticeLink] = useState<{href: string; label: string} | null>(null);
  const [portalBusy, setPortalBusy] = useState(false);
  const [settingsBusy, setSettingsBusy] = useState(false);
  const [driveBusy, setDriveBusy] = useState(false);
  const [settingsPlansOpen, setSettingsPlansOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);
  const [apiKeysLoaded, setApiKeysLoaded] = useState(false);
  const [apiKeyBusy, setApiKeyBusy] = useState<string | null>(null);
  const [apiKeyName, setApiKeyName] = useState(settingsCopy.api.productionKeyDefault);
  const [newApiToken, setNewApiToken] = useState<string | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [apiKeyConfirm, setApiKeyConfirm] = useState<{action: "reset" | "revoke"; apiKey: ApiKeyItem} | null>(null);
  const [apiKeyRename, setApiKeyRename] = useState<{apiKey: ApiKeyItem; name: string} | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [driveConnection, setDriveConnection] = useState<DriveConnectionState | null>(null);
  const [timeZone, setTimeZone] = useState("Asia/Hong Kong");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  function setNotice(message: string | null) {
    setNoticeText(message);
    setNoticeLink(null);
  }

  const t = (key: string) => {
    const fallback: Record<string, string> = {
      upgradePlan: settingsCopy.common.upgradePlan,
      folders: settingsCopy.common.folders,
      uncategorized: settingsCopy.common.uncategorized
    };
    return fallback[key] ?? key;
  };

  useEffect(() => {
    function scrollToSection(id: string) {
      window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({block: "start"}));
    }

    function syncActiveSectionFromHash() {
      const hash = window.location.hash.slice(1);
      if (hash === "usage-addon") {
        setActive("usage");
        scrollToSection("usage-addon");
        return;
      }
      if (tabs.some((tab) => tab.id === hash)) {
        setActive(hash as TabId);
        scrollToSection(hash);
      }
    }

    syncActiveSectionFromHash();
    window.addEventListener("hashchange", syncActiveSectionFromHash);
    return () => window.removeEventListener("hashchange", syncActiveSectionFromHash);
  }, []);

  useEffect(() => {
    const savedTimeZone = window.localStorage.getItem("votxt_time_zone");
    if (savedTimeZone) setTimeZone(savedTimeZone.replace(/_/g, " "));

    fetch("/api/auth/me", {cache: "no-store"})
      .then((response) => (response.ok ? response.json() : {user: null}))
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else if (!initialUser) {
          setUser(null);
        }
      })
      .catch(() => {
        if (!initialUser) setUser(null);
      });

    fetch("/api/account/usage", {cache: "no-store"})
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setUsage(data))
      .catch(() => setUsage(null));

    fetch("/api/google-drive/connection", {cache: "no-store"})
      .then((response) => (response.ok ? response.json() : {connected: false}))
      .then((data) => setDriveConnection(data as DriveConnectionState))
      .catch(() => setDriveConnection({connected: false}));

    fetch("/api/folders", {cache: "no-store"})
      .then((response) => (response.ok ? response.json() : {folders: []}))
      .then((data) => setFolders(data.folders ?? []))
      .catch(() => setFolders([]));
  }, [initialUser]);

  const nameParts = useMemo(() => splitName(user?.name), [user?.name]);
  useEffect(() => {
    setFirstName(nameParts.firstName);
    setLastName(nameParts.lastName);
    setLoginEmail("");
  }, [nameParts.firstName, nameParts.lastName, user?.email]);

  const plan = usage?.subscription.plan ?? user?.subscriptions?.[0]?.plan ?? "FREE";
  const currentSubscription = user?.subscriptions?.[0];
  const quota = usage?.subscription.monthlyMinuteQuota ?? user?.subscriptions?.[0]?.monthlyMinuteQuota ?? 120;
  const remaining = usage?.subscription.remainingMinutes ?? user?.subscriptions?.[0]?.remainingMinutes ?? quota;
  const used = usage?.subscription.usedMinutes ?? Math.max(0, quota - remaining);
  const resetAt = formatDateTime(resolveUsageResetDate({
    usageReset: usage?.subscription.currentPeriodEnd,
    subscriptionReset: currentSubscription?.currentPeriodEnd,
    dailyReset: user?.dailyResetAt,
    plan: String(plan),
    stripeSubscriptionId: currentSubscription?.stripeSubscriptionId
  }), locale);
  const normalizedPlan = String(plan).toUpperCase();
  const isPaid = normalizedPlan !== "FREE" && normalizedPlan !== "ANONYMOUS";
  const googleAccount = user?.oauthAccounts?.find((account) => account.provider === "google") ?? null;
  const hasEmailLogin = Boolean(user?.email);
  const hasGoogleLogin = Boolean(googleAccount);
  const hasSignInMethods = hasEmailLogin || hasGoogleLogin;
  // The target UI treats Google-linked email identity as still needing email password setup.
  const passwordSetupPending = hasGoogleLogin || !user?.passwordSet;
  const passwordStatusLabel = passwordSetupPending ? settingsCopy.security.passwordNotSet : settingsCopy.security.passwordSet;
  const planLabel = {
    BASIC: settingsCopy.usage.planNames.BASIC,
    FREE: settingsCopy.usage.planNames.FREE,
    PRO: settingsCopy.usage.planNames.PRO,
    STANDARD: settingsCopy.usage.planNames.STANDARD
  }[normalizedPlan] ?? String(plan).toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());
  const avatarUrl = user?.image || googleAccount?.avatarUrl || user?.oauthAccounts?.find((account) => account.avatarUrl)?.avatarUrl || null;
  const notificationStoragePrefix = `votxt_notification_preferences:${user?.id ?? "anonymous"}`;

  useEffect(() => {
    if (!isPaid) {
      setApiKeys([]);
      setApiKeysLoaded(false);
      setNewApiToken(null);
      setApiKeyError(null);
      return;
    }

    let cancelled = false;
    setApiKeyError(null);
    fetch("/api/account/api-keys", {cache: "no-store"})
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (response.status === 401) {
          window.location.href = `/${locale}/auth/signin`;
          return null;
        }
      if (!response.ok) throw new Error(data.error ?? settingsCopy.errors.createApiKey);
        return data as {apiKeys?: ApiKeyItem[]};
      })
      .then((data) => {
        if (!cancelled && data) {
          setApiKeys(data.apiKeys ?? []);
          setApiKeysLoaded(true);
        }
      })
      .catch((cause) => {
        if (!cancelled) {
          setApiKeyError(cause instanceof Error ? cause.message : String(cause));
          setApiKeysLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isPaid, locale, settingsCopy.errors.createApiKey]);

  useEffect(() => {
    if (!deleteDialogOpen) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById("delete-account-confirmation")?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [deleteDialogOpen]);

  async function openBillingPortal() {
    setPortalBusy(true);
    setNotice(null);
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({returnPath: `/${locale}/settings?portal=returned`})
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        window.location.href = `/${locale}/auth/signin`;
        return;
      }
      if (response.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setNotice(data.error ?? settingsCopy.usage.billingPortalUnavailable);
    } finally {
      setPortalBusy(false);
    }
  }

  async function updateAccountSettings(payload: {firstName?: string; lastName?: string; email?: string; password?: string}, successMessage: string) {
    setSettingsBusy(true);
    setNotice(null);
    setNoticeLink(null);
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        window.location.href = `/${locale}/auth/signin`;
        return;
      }
      if (!response.ok) throw new Error(data.error ?? settingsCopy.errors.updateAccount);
      setUser(data.user ?? user);
      setNotice(successMessage);
      if (data.emailVerification?.verificationUrl) {
        setNoticeLink({href: data.emailVerification.verificationUrl, label: settingsCopy.security.openVerificationLink});
      }
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setSettingsBusy(false);
    }
  }

  async function updateInterfaceLanguage(option: PreferenceOption) {
    const nextLocale = option.value;
    if (!nextLocale || !isLocale(nextLocale)) return;
    setSettingsBusy(true);
    setNotice(null);
    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({locale: nextLocale})
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        window.location.href = `/${locale}/auth/signin`;
        return;
      }
      if (!response.ok) throw new Error(data.error ?? settingsCopy.errors.updateLanguage);
      const nextPath = window.location.pathname.replace(/^\/[a-z]{2}(?:-[A-Z]{2})?(?=\/|$)/, `/${nextLocale}`);
      window.location.href = `${nextPath}${window.location.search}`;
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setSettingsBusy(false);
    }
  }

  function updateTimeZone(option: PreferenceOption) {
    const next = option.value ?? option.label;
    window.localStorage.setItem("votxt_time_zone", next);
    setTimeZone(next.replace(/_/g, " "));
    setNotice(settingsCopy.preferences.timeZoneUpdated);
  }

  async function saveProfile() {
    await updateAccountSettings({firstName, lastName}, settingsCopy.profile.updated);
  }

  async function updateEmailLoginAddress() {
    if (!loginEmail.trim()) return;
    await updateAccountSettings({email: loginEmail}, settingsCopy.security.emailUpdated);
  }

  async function setAccountPassword() {
    if (!newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      setNotice(settingsCopy.security.passwordMismatch);
      return;
    }
    await updateAccountSettings({password: newPassword}, settingsCopy.security.passwordUpdated);
    setNewPassword("");
    setConfirmPassword("");
  }

  function openDeleteDialog() {
    setDeleteConfirmation("");
    setDeleteDialogOpen(true);
    setNotice(null);
  }

  async function deactivateAccount() {
    if (deleteConfirmation !== "DELETE") return;
    setDeleteBusy(true);
    setNotice(null);
    try {
      const response = await fetch("/api/account/deactivate", {method: "DELETE"});
      if (response.ok) {
        window.location.href = `/${locale}`;
        return;
      }
      const data = await response.json().catch(() => ({}));
      setNotice(data.error ?? settingsCopy.danger.deleteFailed);
    } finally {
      setDeleteBusy(false);
    }
  }

  async function disconnectDrive() {
    setDriveBusy(true);
    setNotice(null);
    try {
      const response = await fetch("/api/google-drive/connection", {method: "DELETE"});
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        window.location.href = `/${locale}/auth/signin`;
        return;
      }
      if (!response.ok) throw new Error(data.error ?? settingsCopy.integrations.disconnectError);
      setDriveConnection({connected: false});
      setNotice(settingsCopy.integrations.disconnected);
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setDriveBusy(false);
    }
  }

  async function createApiKey() {
    const name = apiKeyName.trim();
    if (!name) return;
    setApiKeyBusy("create");
    setApiKeyError(null);
    setNewApiToken(null);
    try {
      const response = await fetch("/api/account/api-keys", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({name})
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        window.location.href = `/${locale}/auth/signin`;
        return;
      }
      if (!response.ok) throw new Error(data.error ?? settingsCopy.errors.createApiKey);
      if (data.apiKey) setApiKeys((items) => [data.apiKey, ...items]);
      if (data.token) setNewApiToken(data.token);
      setApiKeyName(settingsCopy.api.productionKeyDefault);
      setNotice(settingsCopy.api.apiKeyCreated);
    } catch (cause) {
      setApiKeyError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setApiKeyBusy(null);
    }
  }

  function openApiKeyRename(apiKey: ApiKeyItem) {
    setApiKeyRename({apiKey, name: apiKey.name});
    setApiKeyError(null);
  }

  async function renameApiKey(apiKey: ApiKeyItem, rawName: string) {
    const name = rawName.trim();
    if (!name || name === apiKey.name) {
      setApiKeyRename(null);
      return;
    }
    setApiKeyBusy(apiKey.id);
    setApiKeyError(null);
    try {
      const response = await fetch(`/api/account/api-keys/${apiKey.id}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({name})
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        window.location.href = `/${locale}/auth/signin`;
        return;
      }
      if (!response.ok) throw new Error(data.error ?? settingsCopy.errors.renameApiKey);
      setApiKeys((items) => items.map((item) => (item.id === apiKey.id ? {...item, name} : item)));
      setApiKeyRename(null);
      setNotice(settingsCopy.api.apiKeyRenamed);
    } catch (cause) {
      setApiKeyError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setApiKeyBusy(null);
    }
  }

  async function rotateApiKey(apiKey: ApiKeyItem) {
    setApiKeyBusy(apiKey.id);
    setApiKeyError(null);
    setNewApiToken(null);
    try {
      const response = await fetch(`/api/account/api-keys/${apiKey.id}`, {method: "POST"});
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        window.location.href = `/${locale}/auth/signin`;
        return;
      }
      if (!response.ok) throw new Error(data.error ?? settingsCopy.errors.resetApiKey);
      if (data.token) {
        setNewApiToken(data.token);
        const prefix = String(data.token).slice(0, 18);
        setApiKeys((items) => items.map((item) => (item.id === apiKey.id ? {...item, keyPrefix: prefix, status: "ACTIVE"} : item)));
      }
      setNotice(settingsCopy.api.apiKeyReset);
    } catch (cause) {
      setApiKeyError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setApiKeyBusy(null);
    }
  }

  async function revokeApiKey(apiKey: ApiKeyItem) {
    setApiKeyBusy(apiKey.id);
    setApiKeyError(null);
    try {
      const response = await fetch(`/api/account/api-keys/${apiKey.id}`, {method: "DELETE"});
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        window.location.href = `/${locale}/auth/signin`;
        return;
      }
      if (!response.ok) throw new Error(data.error ?? settingsCopy.errors.revokeApiKey);
      setApiKeys((items) => items.map((item) => (item.id === apiKey.id ? {...item, status: "REVOKED"} : item)));
      setNotice(settingsCopy.api.apiKeyRevoked);
    } catch (cause) {
      setApiKeyError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setApiKeyBusy(null);
    }
  }

  async function copyApiToken(token: string) {
    await navigator.clipboard.writeText(token).catch(() => undefined);
    setNotice(settingsCopy.api.apiTokenCopied);
  }

  function goBackToWorkspace() {
    if (window.history.length > 1 && document.referrer) {
      try {
        const referrer = new URL(document.referrer);
        if (referrer.origin === window.location.origin) {
          window.history.back();
          return;
        }
      } catch {
        // Fall through to the dashboard if the referrer cannot be parsed.
      }
    }
    window.location.href = `/${locale}/dashboard`;
  }

  async function createFolder(name: string) {
    const response = await fetch("/api/folders", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({name})
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setNotice(data.error ?? settingsCopy.errors.createFolder);
      return;
    }
    if (data.folder) setFolders((items) => [...items, data.folder]);
  }

  async function renameFolder(folderId: string, name: string) {
    const response = await fetch(`/api/folders/${folderId}`, {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({name})
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setNotice(data.error ?? settingsCopy.errors.renameFolder);
      return;
    }
    if (data.folder) setFolders((items) => items.map((folder) => (folder.id === folderId ? data.folder : folder)));
  }

  async function deleteFolder(folderId: string) {
    const response = await fetch(`/api/folders/${folderId}`, {method: "DELETE"});
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setNotice(data.error ?? settingsCopy.errors.deleteFolder);
      return;
    }
    setFolders((items) => items.filter((folder) => folder.id !== folderId));
    if (selectedFolderId === folderId) setSelectedFolderId(null);
  }

  return (
    <main className="flex h-screen overflow-hidden bg-white">
      <div className="hidden h-screen w-[300px] shrink-0 overflow-hidden md:block">
        <WorkspaceSidebar
          t={t}
          copy={workspaceCopy}
          locale={locale}
          tasks={[]}
          user={user}
          usageSnapshot={usage}
          folders={folders}
          selectedFolderId={selectedFolderId}
          setSelectedFolderId={setSelectedFolderId}
          createFolder={createFolder}
          renameFolder={renameFolder}
          deleteFolder={deleteFolder}
          assetView="transcripts"
          setAssetView={() => undefined}
          assetSearch=""
          setAssetSearch={() => undefined}
          onSelectTask={() => undefined}
        />
      </div>

      <section className="min-w-0 flex-1 overflow-y-auto p-4 md:p-8">
        <div className="flex w-full flex-col">
          <div className="flex items-start justify-between gap-4">
            <button
              type="button"
              onClick={goBackToWorkspace}
              className="inline-flex h-10 w-[34px] shrink-0 items-center justify-center rounded-md text-[rgb(2,8,23)] transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/35 md:mt-2 md:w-10"
              aria-label={settingsCopy.shell.back}
            >
              <ArrowLeft size={16} />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold leading-8 tracking-tight text-[rgb(2,8,23)]">{settingsCopy.shell.title}</h1>
              <p className="text-base leading-6 text-slate-500">{settingsCopy.shell.subtitle}</p>
            </div>
            <div className="relative z-40 w-44 shrink-0 md:hidden">
              <WorkspaceLanguageSwitcher locale={locale} copy={workspaceCopy} placement="below" />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-8 md:flex-row">
            <aside className="hidden shrink-0 md:sticky md:top-4 md:block md:w-64 md:self-start">
              <nav aria-label={settingsCopy.shell.sectionsAria}>
                {tabs.map((tab, index) => {
                  const Icon = tab.icon;
                  const isDanger = tab.id === "danger";
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActive(tab.id);
                        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${tab.id}`);
                        document.getElementById(tab.id)?.scrollIntoView({behavior: "smooth", block: "start"});
                      }}
                      className={clsx(
                        "inline-flex h-10 w-full items-center justify-start gap-2 whitespace-nowrap rounded-md px-4 py-2 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet/35 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
                        index > 0 && "mt-1",
                        active === tab.id && !isDanger && "bg-violet text-white hover:bg-violet/90",
                        active === tab.id && isDanger && "bg-coral/10 text-coral",
                        active !== tab.id && isDanger && "text-red-500 hover:bg-slate-100 hover:text-red-600",
                        active !== tab.id && !isDanger && "text-[rgb(2,8,23)] hover:bg-slate-100 hover:text-[rgb(2,8,23)]"
                      )}
                    >
                      <Icon size={16} />
                      {settingsCopy.tabs[tab.id]}
                    </button>
                  );
                })}
              </nav>
            </aside>

            <div className="w-full space-y-8 md:flex-1">
          {notice ? (
            <div className="rounded-xl border border-violet/20 bg-violet/10 px-4 py-3 text-sm font-bold text-violet">
              <p>{notice}</p>
              {noticeLink ? <a href={noticeLink.href} className="mt-2 inline-flex break-all text-sm font-bold underline">{noticeLink.label}</a> : null}
            </div>
          ) : null}

          <SettingSection id="profile" title={settingsCopy.profile.title} description={settingsCopy.profile.description}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {avatarUrl ? (
                <div className="h-20 w-20 overflow-hidden rounded-full">
                  {/* External avatar hosts vary, so avoid next/image remote domain constraints here. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={avatarUrl} alt={settingsCopy.profile.avatarAlt} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="grid h-20 w-20 place-items-center rounded-full bg-[#4f7d2d] text-4xl font-normal uppercase text-white">
                  {(nameParts.firstName || user?.email || "96").slice(0, 2)}
                </div>
              )}
              <div>
                <h3 className="text-lg font-medium text-ink">{user?.name || settingsCopy.profile.defaultUser}</h3>
              </div>
            </div>
            <div className="mt-12">
              <div className="grid gap-6 sm:grid-cols-2">
                <TextField label={settingsCopy.profile.firstName} value={firstName} onChange={setFirstName} />
                <TextField label={settingsCopy.profile.lastName} value={lastName} onChange={setLastName} />
              </div>
            </div>
            <div className="mt-12 flex justify-end">
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-violet px-4 py-2 text-sm font-medium leading-5 text-white transition hover:bg-violetDark disabled:pointer-events-none disabled:opacity-50"
                onClick={saveProfile}
                disabled={settingsBusy}
              >
                <Save size={16} />
                {settingsBusy ? settingsCopy.common.saving : settingsCopy.common.save}
              </button>
            </div>
          </SettingSection>

          <SettingSection id="security" title={settingsCopy.security.title} description={settingsCopy.security.description}>
            <div className="space-y-6">
              <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-100/20 p-4">
                <div className="flex items-center gap-2 text-sm font-medium leading-5 text-[rgb(2,8,23)]">
                  <ShieldCheck size={16} />
                  <span>{settingsCopy.security.signInMethods}</span>
                </div>
                <p className="mt-3 text-xs leading-4 text-slate-500">{settingsCopy.security.identityHint}</p>

                <div className="mt-3 flex flex-col gap-3">
                  {hasSignInMethods ? (
                    <>
                      {hasEmailLogin ? (
                        <AuthMethodRow label={settingsCopy.security.emailPassword} status={passwordStatusLabel} email={user?.email} />
                      ) : null}

                      {hasGoogleLogin ? (
                        <AuthMethodRow label={settingsCopy.security.googleSignIn} status={settingsCopy.security.linked} statusTone="secondary" email={googleAccount?.email ?? user?.email} />
                      ) : null}
                    </>
                  ) : (
                    <div className="rounded-md border border-ink/10 bg-white px-4 py-3">
                      <p className="font-medium text-[rgb(2,8,23)]">{settingsCopy.security.noMethodsTitle}</p>
                      <p className="mt-1 text-sm leading-5 text-slate-500">{settingsCopy.security.noMethodsDescription}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-px w-full shrink-0 bg-slate-200" />

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-base leading-6 text-[rgb(2,8,23)]">
                  <Mail size={16} />
                  <h3 className="font-medium">{settingsCopy.security.changeEmailTitle}</h3>
                </div>
                <p className="text-sm leading-5 text-slate-500">{settingsCopy.security.currentEmail(user?.email ?? settingsCopy.common.notSet)}</p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="min-w-0 flex-1">
                    <input
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-normal leading-5 text-[rgb(2,8,23)] outline-none ring-offset-white transition placeholder:text-slate-500 focus:border-violet focus:ring-2 focus:ring-violet/25 disabled:cursor-not-allowed disabled:opacity-50"
                      value={loginEmail}
                      placeholder={settingsCopy.security.emailPlaceholder}
                      type="email"
                      onChange={(event) => setLoginEmail(event.target.value)}
                    />
                  </div>
                  <PrimarySettingsButton onClick={updateEmailLoginAddress} disabled={settingsBusy} className="sm:w-auto">
                    {settingsCopy.security.updateEmail}
                  </PrimarySettingsButton>
                </div>
              </div>

              <div className="h-px w-full shrink-0 bg-slate-200" />

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-base leading-6 text-[rgb(2,8,23)]">
                  <LockKeyhole size={16} />
                  <h3 className="font-medium">{settingsCopy.security.setPasswordTitle}</h3>
                </div>
                <p className="text-sm leading-5 text-slate-500">{settingsCopy.security.setPasswordDescription}</p>
                {passwordSetupPending ? (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-900">{settingsCopy.security.passwordPending}</div>
                ) : null}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium leading-none text-[rgb(2,8,23)]" htmlFor="settings-new-password">
                      {settingsCopy.security.newPassword}
                    </label>
                    <input
                      id="settings-new-password"
                      className="mt-2 flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-normal leading-5 text-[rgb(2,8,23)] outline-none ring-offset-white transition placeholder:text-slate-500 focus:border-violet focus:ring-2 focus:ring-violet/25 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newPassword}
                      type="password"
                      onChange={(event) => setNewPassword(event.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium leading-none text-[rgb(2,8,23)]" htmlFor="settings-confirm-password">
                      {settingsCopy.security.confirmPassword}
                    </label>
                    <input
                      id="settings-confirm-password"
                      className="mt-2 flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-normal leading-5 text-[rgb(2,8,23)] outline-none ring-offset-white transition placeholder:text-slate-500 focus:border-violet focus:ring-2 focus:ring-violet/25 disabled:cursor-not-allowed disabled:opacity-50"
                      value={confirmPassword}
                      type="password"
                      onChange={(event) => setConfirmPassword(event.target.value)}
                    />
                  </div>
                </div>
                <PrimarySettingsButton onClick={setAccountPassword} disabled={settingsBusy} className="mt-4">
                  {settingsCopy.security.setPassword}
                </PrimarySettingsButton>
              </div>
            </div>
          </SettingSection>

          <SettingSection id="usage" title={settingsCopy.usage.title} description={settingsCopy.usage.description}>
            <div className="grid gap-4">
              <div className="rounded-lg border border-slate-200 bg-white p-4 transition hover:bg-slate-50/60">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium leading-5 text-ink">{planLabel}</h4>
                    <span className="inline-block min-w-[50px] whitespace-nowrap rounded-md border border-transparent bg-slate-100/60 px-1.5 py-0.5 text-center text-[10px] font-semibold leading-none text-white transition-colors">
                      {planLabel}
                    </span>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="mb-1.5 flex items-center justify-between text-xs leading-4 text-slate-500">
                    <span>{settingsCopy.usage.used(used)}</span>
                    <span>{settingsCopy.usage.total(quota)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-slate-200/70 transition-all duration-500 ease-in-out" style={{width: `${quota ? Math.min(100, Math.round((used / quota) * 100)) : 0}%`}} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs leading-4 text-slate-500">{settingsCopy.usage.resetsOn(resetAt)}</p>
                  <button
                    type="button"
                    className="focus-ring inline-flex h-7 items-center justify-center gap-2 whitespace-nowrap rounded-md px-2 text-xs font-medium leading-4 text-violet transition hover:bg-slate-100 hover:text-violet/80 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                    onClick={isPaid ? openBillingPortal : () => setSettingsPlansOpen(true)}
                    disabled={isPaid && portalBusy}
                  >
                    {portalBusy ? (
                      settingsCopy.common.opening
                    ) : isPaid ? (
                      settingsCopy.usage.manageBilling
                    ) : (
                      <>
                        {settingsCopy.usage.upgradeNow}
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {isPaid ? (
                <div id="usage-addon" className="scroll-mt-6 rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-base font-medium leading-6 text-ink">{settingsCopy.usage.buyMoreTitle}</h3>
                      <p className="text-sm leading-5 text-slate-500">{settingsCopy.usage.buyMoreDescription}</p>
                    </div>
                    <Badge tone="success">{settingsCopy.common.addon}</Badge>
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-3">
                    {usageAddonPacks.map((pack) => {
                      const packCopy = settingsCopy.usage.packs[pack.addon];
                      return (
                      <article key={pack.addon} className={clsx("flex min-h-[206px] flex-col rounded-lg border bg-white p-4", pack.highlight ? "border-violet shadow-soft" : "border-slate-200")}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-base font-semibold leading-6 text-ink">{packCopy.name}</h4>
                            <p className="mt-1 text-sm leading-5 text-slate-500">{packCopy.description}</p>
                          </div>
                          {pack.highlight ? <Badge>{settingsCopy.common.popular}</Badge> : null}
                        </div>
                        <div className="mt-4">
                          <p className="text-3xl font-semibold leading-9 text-ink">{pack.price}</p>
                          <p className="mt-1 text-sm font-medium leading-5 text-violet">{packCopy.quota}</p>
                        </div>
                        <PricingAction
                          addon={pack.addon}
                          label={settingsCopy.common.buyNow}
                          mode="one-time"
                          successPath={`/${locale}/settings#usage-addon`}
                          cancelPath={`/${locale}/settings#usage-addon`}
                          wrapperClassName="!mt-auto pt-4"
                          buttonClassName={clsx("h-10 rounded-md", pack.highlight ? "bg-violet text-white hover:bg-violet/90" : "border border-slate-200 bg-white text-ink hover:border-violet")}
                          variant={pack.highlight ? "primary" : "outline"}
                          showIcon={false}
                        />
                      </article>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </SettingSection>

          <SettingSection id="preferences" title={settingsCopy.preferences.title} description={settingsCopy.preferences.description}>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-medium leading-5 text-ink"><Globe2 size={17} /> {settingsCopy.preferences.interfaceLanguage}</div>
                  <p className="mt-0.5 text-sm leading-5 text-slate-500">{settingsCopy.preferences.interfaceLanguageDescription}</p>
                </div>
                <PreferenceMenu value={languageOptions.find((option) => option.value === locale)?.label ?? languageOptions[0].label} options={languageOptions} align="right" flush transparentTrigger triggerClassName="w-[133px]" onSelect={updateInterfaceLanguage} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-medium leading-5 text-ink"><Globe2 size={17} /> {settingsCopy.preferences.timeZone}</div>
                  <p className="mt-0.5 text-sm leading-5 text-slate-500">{settingsCopy.preferences.timeZoneDescription}</p>
                </div>
                <PreferenceMenu value={timeZone} options={timeZoneOptions} align="right" flush compactItems searchable triggerClassName="w-[142px]" menuClassName="w-[280px]" menuMaxHeight="300px" onSelect={updateTimeZone} />
              </div>
            </div>
          </SettingSection>

          <SettingSection
            id="api"
            title={settingsCopy.api.title}
            description={settingsCopy.api.description}
            headerExtra={<Badge tone="beta">{settingsCopy.common.beta}</Badge>}
            headerChildren={
              <div className="mt-1.5">
                <button type="button" onClick={() => { window.location.href = `/${locale}/docs`; }} className="inline-flex items-center bg-transparent p-0 text-sm font-normal leading-5 text-[rgb(2,8,23)] underline transition hover:text-violet">
                  {settingsCopy.api.viewDocs}
                </button>
              </div>
            }
          >
            {isPaid ? (
              <div className="mt-4 grid gap-4">
                <div className="rounded-xl border border-ink/10 bg-paper/55 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row">
                    <label className="min-w-0 flex-1 text-sm font-bold text-ink/70">
                      {settingsCopy.api.keyName}
                      <input
                        className="field mt-1.5 h-10"
                        value={apiKeyName}
                        placeholder={settingsCopy.api.keyNamePlaceholder}
                        onChange={(event) => setApiKeyName(event.target.value)}
                      />
                    </label>
                    <button type="button" className="btn-primary h-10 self-end" onClick={createApiKey} disabled={apiKeyBusy === "create" || !apiKeyName.trim()}>
                      <Plus size={16} />
                      {apiKeyBusy === "create" ? settingsCopy.api.creating : settingsCopy.api.createApiKey}
                    </button>
                  </div>
                  <p className="mt-3 text-xs font-bold leading-5 text-ink/50">{settingsCopy.api.fullKeyNotice}</p>
                </div>

                {newApiToken ? (
                  <div className="rounded-xl border border-violet/20 bg-violet/5 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-black text-ink">{settingsCopy.api.newToken}</p>
                        <p className="mt-1 text-sm leading-6 text-ink/60">{settingsCopy.api.copyTokenNow}</p>
                      </div>
                      <button type="button" className="btn-outline px-3 py-2" onClick={() => copyApiToken(newApiToken)}>
                        <Copy size={16} />
                        {settingsCopy.common.copy}
                      </button>
                    </div>
                    <code className="mt-3 block overflow-x-auto rounded-lg border border-ink/10 bg-white px-3 py-2 text-xs font-bold text-ink">{newApiToken}</code>
                  </div>
                ) : null}

                {apiKeyError ? <p className="rounded-lg border border-coral/20 bg-coral/10 px-3 py-2 text-sm font-bold text-coral">{apiKeyError}</p> : null}

                <div className="overflow-hidden rounded-xl border border-ink/10 bg-white">
                  <div className="grid grid-cols-[minmax(0,1fr)_120px_140px] gap-3 border-b border-ink/10 bg-paper/60 px-4 py-3 text-xs font-black uppercase tracking-normal text-ink/50 max-lg:hidden">
                    <span>{settingsCopy.api.name}</span>
                    <span>{settingsCopy.api.status}</span>
                    <span>{settingsCopy.api.actions}</span>
                  </div>
                  <div className="divide-y divide-ink/10">
                    {!apiKeysLoaded ? (
                      <p className="px-4 py-5 text-sm font-bold text-ink/55">{settingsCopy.api.loading}</p>
                    ) : apiKeys.length ? (
                      apiKeys.map((apiKey) => (
                        <article key={apiKey.id} className="grid gap-3 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_120px_140px] lg:items-center">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate font-black text-ink">{apiKey.name}</p>
                              <code className="rounded-full bg-ink/7 px-2 py-1 text-xs font-black text-ink/55">{apiKey.keyPrefix}...</code>
                            </div>
                            <p className="mt-1 text-xs font-bold leading-5 text-ink/50">
                              {settingsCopy.api.createdLastUsed(formatDateTime(apiKey.createdAt, locale), apiKey.lastUsedAt ? formatDateTime(apiKey.lastUsedAt, locale) : settingsCopy.common.never)}
                            </p>
                          </div>
                          <Badge tone={apiKey.status === "ACTIVE" ? "success" : "neutral"}>{settingsCopy.api.statuses[apiKey.status as ApiKeyStatus] ?? apiKey.status}</Badge>
                          <div className="flex flex-wrap gap-2 lg:justify-end">
                            <button type="button" className="btn-outline px-2.5 py-2" aria-label={settingsCopy.api.renameAria} onClick={() => openApiKeyRename(apiKey)} disabled={apiKeyBusy === apiKey.id || apiKey.status === "REVOKED"}>
                              <Pencil size={15} />
                            </button>
                            <button type="button" className="btn-outline px-2.5 py-2" aria-label={settingsCopy.api.resetAria} onClick={() => setApiKeyConfirm({action: "reset", apiKey})} disabled={apiKeyBusy === apiKey.id || apiKey.status === "REVOKED"}>
                              <RefreshCcw size={15} />
                            </button>
                            <button type="button" className="btn-outline border-coral/25 px-2.5 py-2 text-coral" aria-label={settingsCopy.api.revokeAria} onClick={() => setApiKeyConfirm({action: "revoke", apiKey})} disabled={apiKeyBusy === apiKey.id || apiKey.status === "REVOKED"}>
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </article>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <p className="font-black text-ink">{settingsCopy.api.noKeysTitle}</p>
                        <p className="mt-1 text-sm leading-6 text-ink/60">{settingsCopy.api.noKeysDescription}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[244px] flex-col items-center justify-center py-8 text-center">
                <AlertTriangle className="mb-4 h-12 w-12 text-yellow-500" />
                <h3 className="mb-2 text-lg font-medium leading-7 text-[rgb(2,8,23)]">{settingsCopy.api.lockedTitle}</h3>
                <p className="mb-4 text-base leading-6 text-slate-500">{settingsCopy.api.lockedDescription}</p>
                <div className="space-y-2">
                  <button type="button" onClick={() => setSettingsPlansOpen(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-violet px-4 py-2 text-sm font-medium leading-5 text-white transition hover:bg-violetDark">
                    {settingsCopy.common.upgradePlan}
                  </button>
                </div>
              </div>
            )}
          </SettingSection>

          <SettingSection id="notifications" title={settingsCopy.notifications.title} description={settingsCopy.notifications.description}>
            <div className="space-y-4">
              <ToggleRow title={settingsCopy.notifications.successTitle} description={settingsCopy.notifications.successDescription} storageKey={`${notificationStoragePrefix}:transcription-success`} />
              <ToggleRow title={settingsCopy.notifications.quotaResetTitle} description={settingsCopy.notifications.quotaResetDescription} storageKey={`${notificationStoragePrefix}:quota-reset`} />
              <ToggleRow title={settingsCopy.notifications.productUpdatesTitle} description={settingsCopy.notifications.productUpdatesDescription} storageKey={`${notificationStoragePrefix}:product-updates`} />
            </div>
          </SettingSection>

          <SettingSection id="integrations" title={settingsCopy.integrations.title} description={settingsCopy.integrations.description}>
            <div className="space-y-6">
                <div className="flex min-h-[198px] flex-col justify-between gap-4 rounded-[12px] border border-slate-200 p-4 transition-colors hover:bg-slate-100/20 sm:min-h-0 sm:flex-row sm:items-center">
                <div className="flex items-start gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-violet/10 text-violet">
                    <Cloud size={24} />
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-semibold text-[rgb(2,8,23)]">{settingsCopy.integrations.driveName}</h4>
                      <Badge tone={driveConnection?.connected ? "success" : "neutral"}>{driveConnection?.connected ? settingsCopy.common.connected : settingsCopy.common.notConnected}</Badge>
                    </div>
                    <p className="text-sm leading-5 text-slate-500">{settingsCopy.integrations.driveDescription}</p>
                    {driveConnection?.connected ? (
                      <p className="break-words text-xs font-bold text-ink/50">{driveConnection.connection?.email || settingsCopy.integrations.connectedFallback}</p>
                    ) : null}
                  </div>
                </div>
                {driveConnection?.connected ? (
                  <button type="button" className="btn-outline border-coral/25 px-3 py-2 text-coral" onClick={disconnectDrive} disabled={driveBusy}>
                    {driveBusy ? settingsCopy.common.disconnecting : settingsCopy.common.disconnect}
                  </button>
                ) : (
                  <button type="button" onClick={() => { window.location.href = `/api/google-drive/auth?locale=${encodeURIComponent(locale)}`; }} className="btn-primary h-9 shrink-0 self-start rounded-md px-3 py-2 font-medium sm:self-auto">
                    {settingsCopy.common.connect}
                  </button>
                )}
              </div>
            </div>
          </SettingSection>

          <SettingSection id="danger" title={settingsCopy.danger.title} description={settingsCopy.danger.warning} tone="danger">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-[rgb(2,8,23)]">{settingsCopy.danger.deleteAccount}</p>
                  <p className="text-sm leading-5 text-slate-500">{settingsCopy.danger.deleteDescription}</p>
                </div>
                <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-slate-50 transition hover:bg-red-500/90" onClick={openDeleteDialog}>
                  {settingsCopy.danger.deleteAccount}
                </button>
            </div>
          </SettingSection>
            </div>
          </div>
        </div>
      </section>

      {deleteDialogOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4 py-6">
          <section className="relative grid h-[506px] w-full max-w-[448px] gap-4 rounded-lg border border-slate-200 bg-white p-6 text-[rgb(2,8,23)] shadow-none" role="dialog" aria-modal="true" aria-labelledby="delete-account-title">
            <button type="button" onClick={() => setDeleteDialogOpen(false)} className="absolute right-4 top-4 block h-4 w-4 rounded text-[rgb(2,8,23)] opacity-70 transition hover:opacity-100" aria-label={settingsCopy.common.close}>
              <X size={16} />
              <span className="sr-only">{settingsCopy.common.close}</span>
            </button>

            <div className="flex flex-col space-y-3 text-center sm:text-left">
              <div className="flex h-7 items-center gap-2 text-red-500">
                <AlertTriangle className="h-5 w-5" />
                <h2 id="delete-account-title" className="text-xl font-bold leading-7 tracking-[-0.5px] text-red-500">{settingsCopy.danger.dialogTitle}</h2>
              </div>
              <p className="text-base font-medium leading-6 text-[rgb(2,8,23)]">{settingsCopy.danger.dialogIntro}</p>
            </div>

            <div className="space-y-4 py-2">
              <p className="text-sm font-medium leading-5 text-slate-500">{settingsCopy.danger.warning}</p>
              <ul className="space-y-2.5 text-sm font-normal leading-5 text-slate-500">
                {settingsCopy.danger.deleteBullets.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="space-y-2 pt-4">
                <label htmlFor="delete-account-confirmation" className="text-sm font-medium leading-5 text-slate-500">{settingsCopy.danger.confirmationLabel}</label>
                <input
                  id="delete-account-confirmation"
                  value={deleteConfirmation}
                  onChange={(event) => setDeleteConfirmation(event.target.value)}
                  className="flex h-10 w-full rounded-md border border-violet bg-white px-3 py-2 text-sm font-normal leading-5 text-[rgb(2,8,23)] outline-none ring-[3px] ring-violet/10 transition placeholder:text-slate-500 focus:border-violet"
                  placeholder={settingsCopy.danger.typeDeletePlaceholder}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:space-x-2">
              <button type="button" onClick={() => setDeleteDialogOpen(false)} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium leading-5 text-[rgb(2,8,23)] transition hover:bg-slate-50 sm:w-auto">
                {settingsCopy.common.cancel}
              </button>
              <button type="button" onClick={deactivateAccount} disabled={deleteBusy || deleteConfirmation !== "DELETE"} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm font-medium leading-5 text-slate-50 transition hover:bg-red-500/90 disabled:pointer-events-none disabled:opacity-50 sm:w-auto">
                {settingsCopy.common.delete}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {settingsPlansOpen ? <DashboardPricingOverlay locale={locale} initialMode="annual" onClose={() => setSettingsPlansOpen(false)} /> : null}

      {apiKeyConfirm ? (
        <ApiKeyConfirmDialog
          action={apiKeyConfirm.action}
          apiKeyName={apiKeyConfirm.apiKey.name}
          busy={apiKeyBusy === apiKeyConfirm.apiKey.id}
          copy={settingsCopy}
          onCancel={() => setApiKeyConfirm(null)}
          onConfirm={() => {
            const pending = apiKeyConfirm;
            setApiKeyConfirm(null);
            if (pending.action === "reset") {
              rotateApiKey(pending.apiKey).catch(() => undefined);
            } else {
              revokeApiKey(pending.apiKey).catch(() => undefined);
            }
          }}
        />
      ) : null}

      {apiKeyRename ? (
        <ApiKeyRenameDialog
          apiKeyName={apiKeyRename.apiKey.name}
          value={apiKeyRename.name}
          busy={apiKeyBusy === apiKeyRename.apiKey.id}
          error={apiKeyError}
          copy={settingsCopy}
          onChange={(name) => setApiKeyRename((current) => (current ? {...current, name} : current))}
          onCancel={() => setApiKeyRename(null)}
          onConfirm={() => {
            const pending = apiKeyRename;
            renameApiKey(pending.apiKey, pending.name).catch(() => undefined);
          }}
        />
      ) : null}
    </main>
  );
}

function ApiKeyRenameDialog({
  apiKeyName,
  value,
  busy,
  error,
  copy,
  onChange,
  onCancel,
  onConfirm
}: {
  apiKeyName: string;
  value: string;
  busy: boolean;
  error: string | null;
  copy: SettingsCopy;
  onChange: (name: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const canSave = value.trim().length > 0 && value.trim() !== apiKeyName;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <section className="relative grid w-full max-w-[448px] gap-4 rounded-lg border border-slate-200 bg-white p-0 text-[rgb(2,8,23)] shadow-none" role="dialog" aria-modal="true" aria-labelledby="api-key-rename-title">
        <div className="flex flex-col px-6 pb-0 pt-6 text-center sm:text-left">
          <h2 id="api-key-rename-title" className="text-xl font-semibold leading-7 text-[rgb(2,8,23)]">{copy.apiDialogs.renameTitle}</h2>
          <p className="mt-1.5 text-sm font-normal leading-5 text-slate-500">{copy.apiDialogs.renameDescription(apiKeyName)}</p>
        </div>
        <div className="grid gap-2 px-6">
          <label htmlFor="api-key-rename-input" className="text-sm font-medium leading-5 text-[rgb(2,8,23)]">{copy.api.keyName}</label>
          <input
            id="api-key-rename-input"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-5 text-[rgb(2,8,23)] outline-none transition placeholder:text-slate-500 focus:border-violet focus:ring-[3px] focus:ring-violet/20"
            autoFocus
          />
          {error ? <p className="text-sm font-medium leading-5 text-red-500">{error}</p> : null}
        </div>
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <button type="button" onClick={onCancel} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium leading-5 text-[rgb(2,8,23)] transition hover:bg-slate-50">{copy.common.cancel}</button>
          <button type="button" onClick={onConfirm} disabled={busy || !canSave} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-violet px-4 py-2 text-sm font-medium leading-5 text-white transition hover:bg-violetDark disabled:pointer-events-none disabled:opacity-50">
            {busy ? <RefreshCcw className="animate-spin" size={16} /> : null}
            {copy.common.save}
          </button>
        </div>
        <button type="button" onClick={onCancel} className="absolute right-4 top-4 grid h-4 w-4 place-items-center rounded-sm text-[rgb(2,8,23)] opacity-70 transition hover:opacity-100" aria-label={copy.common.close}>
          <X size={16} />
          <span className="sr-only">{copy.common.close}</span>
        </button>
      </section>
    </div>
  );
}

function ApiKeyConfirmDialog({
  action,
  apiKeyName,
  busy,
  copy,
  onCancel,
  onConfirm
}: {
  action: "reset" | "revoke";
  apiKeyName: string;
  busy: boolean;
  copy: SettingsCopy;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isReset = action === "reset";
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <section className="relative grid h-[216px] w-full max-w-[448px] gap-4 rounded-lg border border-slate-200 bg-white p-0 text-[rgb(2,8,23)] shadow-none" role="dialog" aria-modal="true" aria-labelledby="api-key-confirm-title">
        <div className="flex flex-col px-6 pb-4 pt-6 text-center sm:text-left">
          <h2 id="api-key-confirm-title" className="text-xl font-semibold leading-7 text-[rgb(2,8,23)]">{isReset ? copy.apiDialogs.resetTitle : copy.apiDialogs.revokeTitle}</h2>
          <p className="mt-1.5 text-sm font-normal leading-5 text-slate-500">
            {isReset
              ? copy.apiDialogs.resetDescription(apiKeyName)
              : copy.apiDialogs.revokeDescription(apiKeyName)}
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <button type="button" onClick={onCancel} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium leading-5 text-[rgb(2,8,23)] transition hover:bg-slate-50">{copy.common.cancel}</button>
          <button type="button" onClick={onConfirm} disabled={busy} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-red-500 px-4 py-2 text-sm font-medium leading-5 text-slate-50 transition hover:bg-red-500/90 disabled:pointer-events-none disabled:opacity-50">
            {busy ? <RefreshCcw className="animate-spin" size={16} /> : null}
            {isReset ? copy.apiDialogs.resetTitle : copy.apiDialogs.revokeTitle}
          </button>
        </div>
        <button type="button" onClick={onCancel} className="absolute right-4 top-4 grid h-4 w-4 place-items-center rounded-sm text-[rgb(2,8,23)] opacity-70 transition hover:opacity-100" aria-label={copy.common.close}>
          <X size={16} />
          <span className="sr-only">{copy.common.close}</span>
        </button>
      </section>
    </div>
  );
}
