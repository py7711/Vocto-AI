"use client";

import {useEffect, useState} from "react";
import {useLocale} from "next-intl";
import {TriangleAlert, X} from "lucide-react";
import {isLocale, type Locale} from "@/lib/locales";

const noticeStorageKey = "uniscribe-system-update-notice-dismissed";
const systemUpdateNoticeEnabled = process.env.NEXT_PUBLIC_SYSTEM_UPDATE_NOTICE_ENABLED === "true";

type SystemUpdateNoticeCopy = {
  title: string;
  description: string;
  impactTitle: string;
  impactItems: [string, string, string];
  dismiss: string;
  understand: string;
  close: string;
};

const systemUpdateNoticeCopy: Record<Locale, SystemUpdateNoticeCopy> = {
  ar: {
    title: "تنبيه عاجل لتحديث النظام",
    description: "نطرح تحديثاً عاجلاً للنظام لتحسين استقرار الخدمة. أثناء التحديث، ستكون جميع خدمات UniScribe غير متاحة مؤقتاً.",
    impactTitle: "تأثير الخدمة:",
    impactItems: ["لن تتوفر عمليات الرفع ومعالجة التفريغ والتصدير وإدارة الحساب والفوترة", "يرجى الانتظار حتى يكتمل التحديث قبل بدء عمل جديد", "سنستعيد الوصول فور انتهاء التحديث"],
    dismiss: "إغلاق",
    understand: "فهمت",
    close: "إغلاق"
  },
  de: {
    title: "Dringender Hinweis zum Systemupdate",
    description: "Wir führen ein dringendes Systemupdate aus, um die Stabilität des Dienstes zu verbessern. Währenddessen sind alle UniScribe-Dienste vorübergehend nicht verfügbar.",
    impactTitle: "Auswirkungen:",
    impactItems: ["Uploads, Transkriptionsverarbeitung, Exporte, Kontoverwaltung und Abrechnung sind nicht verfügbar", "Bitte warte, bis das Update abgeschlossen ist, bevor du neue Arbeit startest", "Wir stellen den Zugriff wieder her, sobald das Update abgeschlossen ist"],
    dismiss: "Schließen",
    understand: "Verstanden",
    close: "Schließen"
  },
  en: {
    title: "Urgent System Update Notice",
    description: "We are rolling out an urgent system update to improve service stability. During this update, all UniScribe services will be temporarily unavailable.",
    impactTitle: "Service impact:",
    impactItems: ["Uploads, transcription processing, exports, account management, and billing access will be unavailable", "Please wait until the update is complete before starting new work", "We will restore access as soon as the update finishes"],
    dismiss: "Dismiss",
    understand: "I understand",
    close: "Close"
  },
  es: {
    title: "Aviso urgente de actualización del sistema",
    description: "Estamos implementando una actualización urgente para mejorar la estabilidad del servicio. Durante la actualización, todos los servicios de UniScribe estarán temporalmente no disponibles.",
    impactTitle: "Impacto del servicio:",
    impactItems: ["Las cargas, el procesamiento de transcripciones, las exportaciones, la gestión de cuenta y la facturación no estarán disponibles", "Espera a que termine la actualización antes de iniciar trabajo nuevo", "Restauraremos el acceso en cuanto finalice la actualización"],
    dismiss: "Cerrar",
    understand: "Entendido",
    close: "Cerrar"
  },
  fr: {
    title: "Avis urgent de mise à jour système",
    description: "Nous déployons une mise à jour urgente afin d'améliorer la stabilité du service. Pendant cette mise à jour, tous les services UniScribe seront temporairement indisponibles.",
    impactTitle: "Impact sur le service :",
    impactItems: ["Les imports, le traitement des transcriptions, les exports, la gestion du compte et la facturation seront indisponibles", "Veuillez attendre la fin de la mise à jour avant de commencer un nouveau travail", "Nous rétablirons l'accès dès la fin de la mise à jour"],
    dismiss: "Fermer",
    understand: "J'ai compris",
    close: "Fermer"
  },
  hu: {
    title: "Sürgős rendszerfrissítési értesítés",
    description: "Sürgős rendszerfrissítést vezetünk be a szolgáltatás stabilitásának javítására. A frissítés alatt minden UniScribe-szolgáltatás átmenetileg nem lesz elérhető.",
    impactTitle: "Szolgáltatási hatás:",
    impactItems: ["A feltöltés, átírásfeldolgozás, export, fiókkezelés és számlázás nem lesz elérhető", "Kérjük, várd meg a frissítés végét, mielőtt új munkát indítasz", "A hozzáférést a frissítés befejezése után azonnal visszaállítjuk"],
    dismiss: "Bezárás",
    understand: "Értem",
    close: "Bezárás"
  },
  id: {
    title: "Pemberitahuan Pembaruan Sistem Mendesak",
    description: "Kami sedang merilis pembaruan sistem mendesak untuk meningkatkan stabilitas layanan. Selama pembaruan ini, semua layanan UniScribe sementara tidak tersedia.",
    impactTitle: "Dampak layanan:",
    impactItems: ["Unggahan, pemrosesan transkripsi, ekspor, manajemen akun, dan akses penagihan tidak akan tersedia", "Tunggu hingga pembaruan selesai sebelum memulai pekerjaan baru", "Kami akan memulihkan akses segera setelah pembaruan selesai"],
    dismiss: "Tutup",
    understand: "Saya mengerti",
    close: "Tutup"
  },
  it: {
    title: "Avviso urgente di aggiornamento del sistema",
    description: "Stiamo distribuendo un aggiornamento urgente per migliorare la stabilità del servizio. Durante l'aggiornamento, tutti i servizi UniScribe saranno temporaneamente non disponibili.",
    impactTitle: "Impatto sul servizio:",
    impactItems: ["Caricamenti, elaborazione delle trascrizioni, esportazioni, gestione account e fatturazione non saranno disponibili", "Attendi il completamento dell'aggiornamento prima di iniziare nuovi lavori", "Ripristineremo l'accesso appena l'aggiornamento sarà terminato"],
    dismiss: "Chiudi",
    understand: "Ho capito",
    close: "Chiudi"
  },
  ja: {
    title: "緊急システム更新のお知らせ",
    description: "サービス安定性向上のため、緊急システム更新を実施しています。更新中は UniScribe のすべてのサービスが一時的に利用できません。",
    impactTitle: "サービスへの影響:",
    impactItems: ["アップロード、文字起こし処理、エクスポート、アカウント管理、請求関連の操作は利用できません", "新しい作業を開始する前に、更新完了までお待ちください", "更新が完了し次第、アクセスを復旧します"],
    dismiss: "閉じる",
    understand: "了解しました",
    close: "閉じる"
  },
  ko: {
    title: "긴급 시스템 업데이트 안내",
    description: "서비스 안정성을 높이기 위해 긴급 시스템 업데이트를 진행하고 있습니다. 업데이트 중에는 모든 UniScribe 서비스를 일시적으로 사용할 수 없습니다.",
    impactTitle: "서비스 영향:",
    impactItems: ["업로드, 전사 처리, 내보내기, 계정 관리, 결제 접근이 불가능합니다", "새 작업을 시작하기 전에 업데이트가 완료될 때까지 기다려 주세요", "업데이트가 끝나는 즉시 접근을 복구하겠습니다"],
    dismiss: "닫기",
    understand: "알겠습니다",
    close: "닫기"
  },
  nl: {
    title: "Dringende melding over systeemupdate",
    description: "We voeren een dringende systeemupdate uit om de stabiliteit van de service te verbeteren. Tijdens deze update zijn alle UniScribe-services tijdelijk niet beschikbaar.",
    impactTitle: "Impact op de service:",
    impactItems: ["Uploads, transcriptieverwerking, exports, accountbeheer en facturatie zijn niet beschikbaar", "Wacht tot de update is voltooid voordat je nieuw werk start", "We herstellen de toegang zodra de update klaar is"],
    dismiss: "Sluiten",
    understand: "Ik begrijp het",
    close: "Sluiten"
  },
  pl: {
    title: "Pilne powiadomienie o aktualizacji systemu",
    description: "Wdrażamy pilną aktualizację systemu, aby poprawić stabilność usługi. Podczas aktualizacji wszystkie usługi UniScribe będą tymczasowo niedostępne.",
    impactTitle: "Wpływ na usługę:",
    impactItems: ["Przesyłanie, przetwarzanie transkrypcji, eksporty, zarządzanie kontem i płatności będą niedostępne", "Poczekaj na zakończenie aktualizacji przed rozpoczęciem nowej pracy", "Przywrócimy dostęp, gdy tylko aktualizacja się zakończy"],
    dismiss: "Zamknij",
    understand: "Rozumiem",
    close: "Zamknij"
  },
  pt: {
    title: "Aviso urgente de atualização do sistema",
    description: "Estamos lançando uma atualização urgente para melhorar a estabilidade do serviço. Durante a atualização, todos os serviços UniScribe ficarão temporariamente indisponíveis.",
    impactTitle: "Impacto no serviço:",
    impactItems: ["Uploads, processamento de transcrições, exportações, gerenciamento de conta e faturamento ficarão indisponíveis", "Aguarde a conclusão da atualização antes de iniciar novo trabalho", "Restauraremos o acesso assim que a atualização terminar"],
    dismiss: "Fechar",
    understand: "Entendi",
    close: "Fechar"
  },
  ru: {
    title: "Срочное уведомление об обновлении системы",
    description: "Мы выпускаем срочное обновление системы, чтобы повысить стабильность сервиса. Во время обновления все сервисы UniScribe будут временно недоступны.",
    impactTitle: "Влияние на сервис:",
    impactItems: ["Загрузка файлов, обработка расшифровок, экспорт, управление аккаунтом и биллинг будут недоступны", "Пожалуйста, дождитесь завершения обновления перед началом новой работы", "Мы восстановим доступ сразу после завершения обновления"],
    dismiss: "Закрыть",
    understand: "Понятно",
    close: "Закрыть"
  },
  th: {
    title: "ประกาศอัปเดตระบบเร่งด่วน",
    description: "เรากำลังปล่อยอัปเดตระบบเร่งด่วนเพื่อปรับปรุงความเสถียรของบริการ ระหว่างการอัปเดต บริการ UniScribe ทั้งหมดจะไม่พร้อมใช้งานชั่วคราว",
    impactTitle: "ผลกระทบต่อบริการ:",
    impactItems: ["การอัปโหลด การประมวลผลถอดเสียง การส่งออก การจัดการบัญชี และการเรียกเก็บเงินจะไม่พร้อมใช้งาน", "โปรดรอจนกว่าการอัปเดตจะเสร็จสิ้นก่อนเริ่มงานใหม่", "เราจะเปิดใช้งานอีกครั้งทันทีเมื่อการอัปเดตเสร็จสิ้น"],
    dismiss: "ปิด",
    understand: "เข้าใจแล้ว",
    close: "ปิด"
  },
  tr: {
    title: "Acil Sistem Güncellemesi Bildirimi",
    description: "Hizmet kararlılığını iyileştirmek için acil bir sistem güncellemesi yayınlıyoruz. Güncelleme sırasında tüm UniScribe hizmetleri geçici olarak kullanılamaz.",
    impactTitle: "Hizmet etkisi:",
    impactItems: ["Yüklemeler, transkripsiyon işleme, dışa aktarma, hesap yönetimi ve faturalandırma erişimi kullanılamaz", "Yeni bir işe başlamadan önce güncellemenin tamamlanmasını bekleyin", "Güncelleme biter bitmez erişimi geri yükleyeceğiz"],
    dismiss: "Kapat",
    understand: "Anladım",
    close: "Kapat"
  },
  uk: {
    title: "Термінове повідомлення про оновлення системи",
    description: "Ми впроваджуємо термінове оновлення системи, щоб покращити стабільність сервісу. Під час оновлення всі сервіси UniScribe будуть тимчасово недоступні.",
    impactTitle: "Вплив на сервіс:",
    impactItems: ["Завантаження, обробка транскрипцій, експорт, керування акаунтом і білінг будуть недоступні", "Будь ласка, дочекайтеся завершення оновлення перед початком нової роботи", "Ми відновимо доступ одразу після завершення оновлення"],
    dismiss: "Закрити",
    understand: "Зрозуміло",
    close: "Закрити"
  },
  vi: {
    title: "Thông báo cập nhật hệ thống khẩn cấp",
    description: "Chúng tôi đang triển khai bản cập nhật hệ thống khẩn cấp để cải thiện độ ổn định dịch vụ. Trong thời gian này, mọi dịch vụ UniScribe sẽ tạm thời không khả dụng.",
    impactTitle: "Ảnh hưởng dịch vụ:",
    impactItems: ["Tải lên, xử lý chép lời, xuất tệp, quản lý tài khoản và thanh toán sẽ không khả dụng", "Vui lòng chờ cập nhật hoàn tất trước khi bắt đầu công việc mới", "Chúng tôi sẽ khôi phục quyền truy cập ngay khi cập nhật hoàn tất"],
    dismiss: "Đóng",
    understand: "Tôi hiểu",
    close: "Đóng"
  },
  zh: {
    title: "紧急系统更新通知",
    description: "我们正在发布紧急系统更新，以提升服务稳定性。更新期间，所有 UniScribe 服务将暂时不可用。",
    impactTitle: "服务影响：",
    impactItems: ["上传、转写处理、导出、账号管理和账单访问将不可用", "请等待更新完成后再开始新的工作", "更新完成后我们会尽快恢复访问"],
    dismiss: "关闭",
    understand: "我已了解",
    close: "关闭"
  },
  "zh-TW": {
    title: "緊急系統更新通知",
    description: "我們正在發布緊急系統更新，以提升服務穩定性。更新期間，所有 UniScribe 服務將暫時無法使用。",
    impactTitle: "服務影響：",
    impactItems: ["上傳、轉寫處理、匯出、帳號管理和帳單存取將無法使用", "請等待更新完成後再開始新的工作", "更新完成後我們會盡快恢復存取"],
    dismiss: "關閉",
    understand: "我已了解",
    close: "關閉"
  }
};

export function SystemUpdateNoticeDialog() {
  const locale = useLocale();
  const copy = systemUpdateNoticeCopy[isLocale(locale) ? locale : "en"];
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!systemUpdateNoticeEnabled) return;
    setOpen(sessionStorage.getItem(noticeStorageKey) !== "true");
  }, []);

  function dismiss() {
    sessionStorage.setItem(noticeStorageKey, "true");
    setOpen(false);
  }

  if (!systemUpdateNoticeEnabled || !open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="system-update-notice-title"
        className="fixed left-1/2 top-1/2 z-50 grid max-h-[min(92vh,620px)] w-[calc(100vw-32px)] max-w-[448px] -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-lg border border-slate-200 bg-white p-6 text-[rgb(2,8,23)] shadow-none"
      >
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 id="system-update-notice-title" className="flex items-center gap-2 text-lg font-semibold leading-[18px] tracking-normal text-[rgb(2,8,23)]">
            <TriangleAlert className="h-5 w-5 text-violet" />
            {copy.title}
          </h2>
          <p className="mt-1.5 text-sm font-normal leading-5 text-slate-500">
            {copy.description}
          </p>
        </div>

        <div className="mt-2 text-sm font-normal leading-5 text-slate-500">
          <h4 className="mb-1 font-medium text-[rgb(2,8,23)]">{copy.impactTitle}</h4>
          <ul className="list-disc space-y-1 pl-5">
            {copy.impactItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          <button type="button" onClick={dismiss} className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium leading-5 text-[rgb(2,8,23)] transition-colors hover:bg-slate-50">
            {copy.dismiss}
          </button>
          <button type="button" onClick={dismiss} className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-violet px-4 py-2 text-sm font-medium leading-5 text-white transition-colors hover:bg-violet/90">
            {copy.understand}
          </button>
        </div>

        <button type="button" onClick={dismiss} className="absolute right-4 top-4 grid h-4 w-4 place-items-center rounded-sm text-[rgb(2,8,23)] opacity-70 transition-opacity hover:opacity-100" aria-label={copy.close}>
          <X className="h-4 w-4" />
          <span className="sr-only">{copy.close}</span>
        </button>
      </div>
    </>
  );
}
