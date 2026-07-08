import {FileText, ShieldCheck} from "lucide-react";
import {PageHero, SiteFooter, SiteHeader} from "@/components/site-shell";
import {isLocale, type Locale} from "@/lib/locales";

type LegalSection = readonly [string, string];
type LegalPageCopy = {
  eyebrow: string;
  title: string;
  description: string;
  sections: readonly LegalSection[];
};
type LegalCopy = {
  terms: LegalPageCopy;
  privacy: LegalPageCopy;
};

const legalCopy: Record<Locale, LegalCopy> = {
  zh: {
    terms: {
      eyebrow: "服务条款",
      title: "Votxt 服务条款",
      description: "这些条款说明个人账号、订阅、转写任务、分享链接和内容使用边界。",
      sections: [
        ["账号与安全", "你需要对个人账号和密码负责。请勿共享登录凭证，发现异常登录后应立即修改密码并联系支持。"],
        ["媒体与转写任务", "你应确保上传、粘贴链接或录音的内容拥有合法处理权。Votxt 会按任务配置调用转写、AI 洞察和翻译服务商，并在失败时自动降级。"],
        ["订阅与额度", "免费和付费套餐包含不同的月度分钟数、单文件限制和队列权益。任务创建会预留额度，完成后按实际时长结算，失败会释放预留额度。"],
        ["个人功能", "公开分享链接用于个人内容分发，是只读页面，请谨慎分发给外部人员。"],
        ["可接受使用", "不得使用 Votxt 处理违法内容、侵犯他人权益的素材、恶意自动化请求或规避平台限制的任务。"]
      ]
    },
    privacy: {
      eyebrow: "隐私政策",
      title: "Votxt 隐私政策",
      description: "本政策说明 Votxt 如何处理账号信息、媒体文件、转写文本、AI 洞察、支付信息和个人使用记录。",
      sections: [
        ["我们处理的数据", "Votxt 会处理账号邮箱、名称、头像、登录状态、订阅信息、上传媒体 URL、转写文本、AI 洞察、导出文件和用量流水。"],
        ["媒体与服务商", "为了完成转写、摘要和翻译，Votxt 会把必要的媒体或文本发送给已配置的 Groq、Deepgram、AssemblyAI、DeepSeek、Gemini、DeepL 等服务商。"],
        ["安全措施", "上传使用短期预签名 URL，登录使用 httpOnly Cookie，分享令牌只保存哈希，不保存明文。"],
        ["个人数据控制", "用户可以管理自己的任务、分享链接、导出文件和订阅。后续会提供更细的删除和数据导出能力。"],
        ["联系与删除", "如需删除账号、任务或个人数据，可联系支持处理。删除请求会按照适用的数据保留、备份和安全政策执行。"]
      ]
    }
  },
  en: {
    terms: {
      eyebrow: "Terms",
      title: "Terms of Service",
      description: "Last updated: Oct 9, 2024",
      sections: [
        ["Account Terms", "When we say Company, we, our, or us, we are referring to Votxt. You are responsible for maintaining the security of your account, for all activity under your account, and for using the Services only for lawful purposes. Accounts registered by bots or other automated methods are not permitted."],
        ["Payment, Refunds, and Plan Changes", "Paid services may include trials, upgrades, subscriptions, taxes, and plan changes. Fees are charged according to the selected plan. Purchases are generally non-refundable unless otherwise stated, and paid subscriptions can be cancelled from your account."],
        ["Cancellation and Termination", "You are responsible for properly cancelling your account. After cancellation, account content becomes inaccessible and may be deleted from active systems and backups according to the retention policy. We may suspend or terminate accounts that violate these terms."],
        ["Uptime and Security", "Services are provided on an as-is and as-available basis. Votxt takes uptime, backups, redundancy, and encryption seriously, and uses third-party vendors and hosting partners to operate the service."],
        ["Copyright and Content Ownership", "You retain ownership of materials you upload. Content posted through the Services must comply with copyright law, and the Votxt name, look, feel, HTML, CSS, JavaScript, and visual design elements may not be copied without permission."],
        ["Features and Bugs", "We design Votxt with care, but every product has limitations and bugs. Features may change as the service evolves."],
        ["Liability", "Your use of the Services is at your sole risk. These terms include limitations of liability to the extent permitted by law."]
      ]
    },
    privacy: {
      eyebrow: "Privacy",
      title: "Votxt Privacy Policy",
      description: "Effective June 8, 2025",
      sections: [
        ["Introduction", "Your privacy is critically important to us. This policy explains how Votxt, Votxt, we, or us collects, uses, and shares personal information when you use our services."],
        ["Information We Collect", "We collect account information, user input such as audio, video, YouTube links and text, communications information, payment details processed by Stripe, usage information, device information, approximate location, cookies, and information from platforms our services rely on."],
        ["How We Use Information", "We use personal information to set up accounts, provide transcription and AI services, analyze and improve the product, communicate with you, send product news, and remember preferences through cookies."],
        ["Third Parties", "Votxt relies on selected third parties such as cloud providers, support providers, AI service providers, analytics providers, and payment processors. These parties receive information needed to provide their services."],
        ["Security", "Votxt maintains physical, administrative, and technical safeguards to protect the confidentiality, integrity, and availability of personal information, while recognizing that internet transmission carries inherent risks."],
        ["International Transfers and Retention", "Our services operate in the United States. Personal information may be transferred and stored there. We keep information as long as necessary for the purposes in this policy or as required by law."],
        ["Deletion and Rights", "When you delete your account or a transcription, associated data is removed according to the deletion policy. Depending on your location, you may have rights to access, correct, delete, or restrict processing of personal information."],
        ["Children and Updates", "The services are not aimed at children under 13. We may update this policy and will make updated versions available on this page."],
        ["Contact", "Questions about privacy, your data, or your rights can be sent to hi@votxt.co."]
      ]
    }
  },
  id: {
    terms: {
      eyebrow: "Ketentuan",
      title: "Ketentuan Layanan Votxt",
      description: "Ketentuan ini menjelaskan akun pribadi, langganan, tugas transkripsi, tautan berbagi, dan batas penggunaan konten.",
      sections: [
        ["Akun dan keamanan", "Anda bertanggung jawab atas keamanan akun, kata sandi, dan semua aktivitas yang terjadi melalui akun Anda."],
        ["Media dan tugas transkripsi", "Pastikan Anda memiliki hak untuk memproses file, tautan, atau rekaman yang dikirim ke Votxt."],
        ["Langganan dan kuota", "Paket gratis dan berbayar memiliki menit bulanan, batas file, dan hak antrean yang berbeda."],
        ["Berbagi dan ekspor", "Tautan berbagi bersifat baca-saja. Bagikan hanya kepada orang yang memang boleh melihat konten tersebut."],
        ["Penggunaan yang diterima", "Jangan gunakan Votxt untuk konten ilegal, pelanggaran hak, otomatisasi berbahaya, atau upaya menghindari batas platform."]
      ]
    },
    privacy: {
      eyebrow: "Privasi",
      title: "Kebijakan Privasi Votxt",
      description: "Kebijakan ini menjelaskan cara Votxt menangani informasi akun, media, transkrip, insight AI, pembayaran, dan riwayat penggunaan.",
      sections: [
        ["Data yang kami proses", "Kami memproses email akun, nama, status masuk, langganan, media yang diunggah, transkrip, insight AI, ekspor, dan penggunaan."],
        ["Media dan penyedia layanan", "Untuk menyelesaikan transkripsi, ringkasan, dan terjemahan, data yang diperlukan dapat dikirim ke penyedia AI atau transkripsi yang dikonfigurasi."],
        ["Keamanan", "Unggahan memakai URL bertanda tangan sementara, sesi memakai cookie httpOnly, dan token berbagi disimpan dalam bentuk hash."],
        ["Kontrol data", "Anda dapat mengelola tugas, tautan berbagi, ekspor, dan langganan dari akun Anda."],
        ["Kontak dan penghapusan", "Hubungi dukungan untuk permintaan penghapusan akun, tugas, atau data pribadi sesuai kebijakan retensi."]
      ]
    }
  },
  ru: {
    terms: {
      eyebrow: "Условия",
      title: "Условия обслуживания Votxt",
      description: "Эти условия описывают личные аккаунты, подписки, задачи транскрипции, ссылки общего доступа и границы использования контента.",
      sections: [
        ["Аккаунт и безопасность", "Вы отвечаете за безопасность аккаунта, пароля и все действия, совершенные через ваш аккаунт."],
        ["Медиа и задачи", "Убедитесь, что у вас есть право обрабатывать загружаемые файлы, ссылки или записи."],
        ["Подписки и квоты", "Бесплатные и платные планы имеют разные месячные минуты, ограничения файлов и приоритет очереди."],
        ["Общий доступ", "Публичные ссылки являются страницами только для чтения. Передавайте их только тем, кому можно видеть контент."],
        ["Допустимое использование", "Запрещено использовать Votxt для незаконного контента, нарушения прав, вредной автоматизации или обхода ограничений платформ."]
      ]
    },
    privacy: {
      eyebrow: "Конфиденциальность",
      title: "Политика конфиденциальности Votxt",
      description: "Политика объясняет обработку данных аккаунта, медиафайлов, транскриптов, AI-инсайтов, платежей и истории использования.",
      sections: [
        ["Какие данные мы обрабатываем", "Мы обрабатываем email, имя, статус входа, подписки, загруженные медиа, транскрипты, AI-инсайты, экспорты и данные использования."],
        ["Медиа и поставщики", "Для транскрипции, резюме и перевода необходимые данные могут отправляться настроенным AI- и транскрипционным поставщикам."],
        ["Защита", "Загрузки используют краткосрочные подписанные URL, сессии используют httpOnly cookie, а токены ссылок хранятся как хэши."],
        ["Контроль данных", "Вы можете управлять задачами, ссылками, экспортами и подписками в своем аккаунте."],
        ["Контакт и удаление", "Для удаления аккаунта, задач или персональных данных обратитесь в поддержку; запросы выполняются с учетом политики хранения."]
      ]
    }
  },
  es: {
    terms: {
      eyebrow: "Términos",
      title: "Términos de servicio de Votxt",
      description: "Estos términos explican cuentas personales, suscripciones, tareas de transcripción, enlaces compartidos y límites de uso del contenido.",
      sections: [
        ["Cuenta y seguridad", "Eres responsable de proteger tu cuenta, contraseña y toda actividad realizada desde ella."],
        ["Medios y tareas", "Debes tener derecho a procesar los archivos, enlaces o grabaciones que envíes a Votxt."],
        ["Suscripciones y cuota", "Los planes gratis y de pago incluyen diferentes minutos mensuales, límites de archivo y ventajas de cola."],
        ["Compartir y exportar", "Los enlaces públicos son páginas de solo lectura. Compártelos solo con personas autorizadas."],
        ["Uso aceptable", "No uses Votxt para contenido ilegal, infracción de derechos, automatización maliciosa o evasión de límites."]
      ]
    },
    privacy: {
      eyebrow: "Privacidad",
      title: "Política de privacidad de Votxt",
      description: "Esta política explica cómo Votxt trata datos de cuenta, archivos multimedia, transcripciones, insights de IA, pagos y registros de uso.",
      sections: [
        ["Datos tratados", "Tratamos email, nombre, sesión, suscripciones, medios subidos, transcripciones, insights de IA, exportaciones y uso."],
        ["Medios y proveedores", "Para transcribir, resumir o traducir, los datos necesarios pueden enviarse a proveedores configurados de IA o transcripción."],
        ["Seguridad", "Las subidas usan URLs firmadas temporales, las sesiones usan cookies httpOnly y los tokens compartidos se guardan como hashes."],
        ["Control de datos", "Puedes gestionar tareas, enlaces compartidos, exportaciones y suscripciones desde tu cuenta."],
        ["Contacto y eliminación", "Contacta con soporte para eliminar cuenta, tareas o datos personales según la política de retención."]
      ]
    }
  },
  vi: {
    terms: {
      eyebrow: "Điều khoản",
      title: "Điều khoản dịch vụ Votxt",
      description: "Các điều khoản này giải thích tài khoản cá nhân, gói đăng ký, tác vụ chép lời, liên kết chia sẻ và giới hạn sử dụng nội dung.",
      sections: [
        ["Tài khoản và bảo mật", "Bạn chịu trách nhiệm bảo vệ tài khoản, mật khẩu và mọi hoạt động phát sinh từ tài khoản."],
        ["Media và tác vụ", "Bạn cần có quyền xử lý các tệp, liên kết hoặc bản ghi gửi lên Votxt."],
        ["Gói và hạn mức", "Gói miễn phí và trả phí có số phút tháng, giới hạn tệp và quyền hàng đợi khác nhau."],
        ["Chia sẻ và xuất", "Liên kết công khai là trang chỉ đọc. Chỉ chia sẻ với người được phép xem nội dung."],
        ["Sử dụng được chấp nhận", "Không dùng Votxt cho nội dung bất hợp pháp, xâm phạm quyền, tự động hóa độc hại hoặc né giới hạn nền tảng."]
      ]
    },
    privacy: {
      eyebrow: "Quyền riêng tư",
      title: "Chính sách quyền riêng tư Votxt",
      description: "Chính sách này mô tả cách Votxt xử lý thông tin tài khoản, media, bản chép lời, insight AI, thanh toán và lịch sử sử dụng.",
      sections: [
        ["Dữ liệu được xử lý", "Chúng tôi xử lý email, tên, trạng thái đăng nhập, gói, media tải lên, bản chép lời, insight AI, tệp xuất và dữ liệu sử dụng."],
        ["Media và nhà cung cấp", "Để chép lời, tóm tắt hoặc dịch, dữ liệu cần thiết có thể được gửi tới nhà cung cấp AI hoặc chép lời đã cấu hình."],
        ["Bảo mật", "Tải lên dùng URL ký tạm thời, phiên dùng cookie httpOnly, token chia sẻ được lưu dưới dạng hash."],
        ["Kiểm soát dữ liệu", "Bạn có thể quản lý tác vụ, liên kết chia sẻ, tệp xuất và gói đăng ký trong tài khoản."],
        ["Liên hệ và xóa", "Liên hệ hỗ trợ để yêu cầu xóa tài khoản, tác vụ hoặc dữ liệu cá nhân theo chính sách lưu giữ."]
      ]
    }
  },
  ar: {
    terms: {
      eyebrow: "الشروط",
      title: "شروط خدمة Votxt",
      description: "توضح هذه الشروط الحسابات الشخصية والاشتراكات ومهام النسخ وروابط المشاركة وحدود استخدام المحتوى.",
      sections: [
        ["الحساب والأمان", "أنت مسؤول عن حماية حسابك وكلمة المرور وكل نشاط يتم من خلال حسابك."],
        ["الوسائط والمهام", "يجب أن تملك الحق في معالجة الملفات أو الروابط أو التسجيلات التي ترسلها إلى Votxt."],
        ["الاشتراكات والحصص", "تتضمن الخطط المجانية والمدفوعة دقائق شهرية وحدود ملفات وامتيازات انتظار مختلفة."],
        ["المشاركة والتصدير", "روابط المشاركة العامة صفحات للقراءة فقط. شاركها فقط مع من يحق له مشاهدة المحتوى."],
        ["الاستخدام المقبول", "لا تستخدم Votxt لمحتوى غير قانوني أو انتهاك حقوق أو أتمتة ضارة أو تجاوز حدود المنصات."]
      ]
    },
    privacy: {
      eyebrow: "الخصوصية",
      title: "سياسة خصوصية Votxt",
      description: "تشرح هذه السياسة كيفية تعامل Votxt مع بيانات الحساب والوسائط والنصوص ورؤى الذكاء الاصطناعي والمدفوعات وسجل الاستخدام.",
      sections: [
        ["البيانات التي نعالجها", "نعالج البريد الإلكتروني والاسم وحالة الدخول والاشتراك والوسائط المرفوعة والنصوص والرؤى والتصديرات وبيانات الاستخدام."],
        ["الوسائط ومزودو الخدمة", "لإكمال النسخ أو التلخيص أو الترجمة، قد ترسل البيانات المطلوبة إلى مزودي AI أو النسخ الذين تم تكوينهم."],
        ["الأمان", "تستخدم التحميلات روابط موقعة قصيرة الأجل، والجلسات تستخدم ملفات cookie httpOnly، وتحفظ رموز المشاركة كهاش."],
        ["التحكم في البيانات", "يمكنك إدارة المهام وروابط المشاركة والتصديرات والاشتراكات من حسابك."],
        ["التواصل والحذف", "اتصل بالدعم لطلبات حذف الحساب أو المهام أو البيانات الشخصية وفق سياسة الاحتفاظ."]
      ]
    }
  },
  pt: {
    terms: {
      eyebrow: "Termos",
      title: "Termos de Serviço do Votxt",
      description: "Estes termos explicam contas pessoais, assinaturas, tarefas de transcrição, links compartilhados e limites de uso de conteúdo.",
      sections: [
        ["Conta e segurança", "Você é responsável por proteger sua conta, senha e toda atividade realizada por ela."],
        ["Mídia e tarefas", "Você deve ter direito de processar os arquivos, links ou gravações enviados ao Votxt."],
        ["Assinaturas e cota", "Planos gratuitos e pagos incluem minutos mensais, limites de arquivo e benefícios de fila diferentes."],
        ["Compartilhamento e exportação", "Links públicos são páginas somente leitura. Compartilhe apenas com pessoas autorizadas."],
        ["Uso aceitável", "Não use o Votxt para conteúdo ilegal, violação de direitos, automação maliciosa ou evasão de limites."]
      ]
    },
    privacy: {
      eyebrow: "Privacidade",
      title: "Política de Privacidade do Votxt",
      description: "Esta política explica como o Votxt trata dados de conta, mídia, transcrições, insights de IA, pagamentos e histórico de uso.",
      sections: [
        ["Dados processados", "Processamos email, nome, sessão, assinaturas, mídia enviada, transcrições, insights de IA, exportações e dados de uso."],
        ["Mídia e provedores", "Para transcrever, resumir ou traduzir, dados necessários podem ser enviados a provedores configurados de IA ou transcrição."],
        ["Segurança", "Uploads usam URLs assinadas temporárias, sessões usam cookies httpOnly e tokens de compartilhamento são armazenados como hashes."],
        ["Controle de dados", "Você pode gerenciar tarefas, links compartilhados, exportações e assinaturas na sua conta."],
        ["Contato e exclusão", "Contate o suporte para excluir conta, tarefas ou dados pessoais conforme a política de retenção."]
      ]
    }
  },
  fr: {
    terms: {
      eyebrow: "Conditions",
      title: "Conditions d'utilisation de Votxt",
      description: "Ces conditions couvrent les comptes personnels, abonnements, tâches de transcription, liens de partage et limites d'utilisation du contenu.",
      sections: [
        ["Compte et sécurité", "Vous êtes responsable de la sécurité de votre compte, de votre mot de passe et de toute activité liée au compte."],
        ["Médias et tâches", "Vous devez disposer du droit de traiter les fichiers, liens ou enregistrements envoyés à Votxt."],
        ["Abonnements et quota", "Les offres gratuites et payantes incluent des minutes mensuelles, limites de fichiers et priorités de file différentes."],
        ["Partage et exports", "Les liens publics sont des pages en lecture seule. Partagez-les uniquement avec des personnes autorisées."],
        ["Utilisation acceptable", "N'utilisez pas Votxt pour du contenu illégal, une atteinte aux droits, une automatisation malveillante ou le contournement de limites."]
      ]
    },
    privacy: {
      eyebrow: "Confidentialité",
      title: "Politique de confidentialité Votxt",
      description: "Cette politique explique le traitement des données de compte, médias, transcriptions, insights IA, paiements et historiques d'utilisation.",
      sections: [
        ["Données traitées", "Nous traitons email, nom, session, abonnement, médias importés, transcriptions, insights IA, exports et données d'usage."],
        ["Médias et prestataires", "Pour transcrire, résumer ou traduire, les données nécessaires peuvent être envoyées aux prestataires IA ou transcription configurés."],
        ["Sécurité", "Les uploads utilisent des URL signées temporaires, les sessions des cookies httpOnly et les jetons de partage sont stockés sous forme de hash."],
        ["Contrôle des données", "Vous pouvez gérer tâches, liens de partage, exports et abonnements depuis votre compte."],
        ["Contact et suppression", "Contactez le support pour supprimer compte, tâches ou données personnelles selon la politique de conservation."]
      ]
    }
  },
  "zh-TW": {
    terms: {
      eyebrow: "服務條款",
      title: "Votxt 服務條款",
      description: "這些條款說明個人帳號、訂閱、轉寫任務、分享連結與內容使用邊界。",
      sections: [
        ["帳號與安全", "你需要負責保護帳號、密碼以及帳號下的所有活動。"],
        ["媒體與轉寫任務", "你應確保上傳檔案、貼上連結或錄音內容具有合法處理權。"],
        ["訂閱與額度", "免費與付費方案包含不同的每月分鐘數、單檔限制與佇列權益。"],
        ["分享與匯出", "公開分享連結為唯讀頁面，請只分享給有權查看內容的人。"],
        ["可接受使用", "不得使用 Votxt 處理違法內容、侵權素材、惡意自動化或規避平台限制的任務。"]
      ]
    },
    privacy: {
      eyebrow: "隱私權",
      title: "Votxt 隱私權政策",
      description: "本政策說明 Votxt 如何處理帳號資訊、媒體檔案、逐字稿、AI 洞察、付款資訊與使用紀錄。",
      sections: [
        ["我們處理的資料", "我們會處理帳號 email、名稱、登入狀態、訂閱、上傳媒體、逐字稿、AI 洞察、匯出與用量資料。"],
        ["媒體與服務商", "為完成轉寫、摘要或翻譯，必要資料可能傳送給已設定的 AI 或轉寫服務商。"],
        ["安全措施", "上傳使用短期簽名 URL，登入使用 httpOnly Cookie，分享權杖以雜湊形式保存。"],
        ["資料控制", "你可以在帳號中管理任務、分享連結、匯出檔案與訂閱。"],
        ["聯絡與刪除", "如需刪除帳號、任務或個人資料，可聯絡支援並依資料保留政策處理。"]
      ]
    }
  },
  de: {
    terms: {
      eyebrow: "Bedingungen",
      title: "Votxt Nutzungsbedingungen",
      description: "Diese Bedingungen beschreiben persönliche Konten, Abonnements, Transkriptionsaufgaben, Freigabelinks und Nutzungsgrenzen.",
      sections: [
        ["Konto und Sicherheit", "Du bist für die Sicherheit deines Kontos, Passworts und aller Aktivitäten in deinem Konto verantwortlich."],
        ["Medien und Aufgaben", "Du musst berechtigt sein, Dateien, Links oder Aufnahmen zu verarbeiten, die du an Votxt sendest."],
        ["Abonnements und Kontingente", "Kostenlose und kostenpflichtige Pläne enthalten unterschiedliche Monatsminuten, Dateigrenzen und Warteschlangenrechte."],
        ["Teilen und Exportieren", "Öffentliche Links sind schreibgeschützte Seiten. Teile sie nur mit berechtigten Personen."],
        ["Zulässige Nutzung", "Nutze Votxt nicht für illegale Inhalte, Rechtsverletzungen, schädliche Automatisierung oder Umgehung von Plattformlimits."]
      ]
    },
    privacy: {
      eyebrow: "Datenschutz",
      title: "Votxt Datenschutzrichtlinie",
      description: "Diese Richtlinie erklärt, wie Votxt Kontodaten, Medien, Transkripte, KI-Insights, Zahlungen und Nutzungsdaten verarbeitet.",
      sections: [
        ["Verarbeitete Daten", "Wir verarbeiten E-Mail, Name, Sitzung, Abonnement, hochgeladene Medien, Transkripte, KI-Insights, Exporte und Nutzungsdaten."],
        ["Medien und Anbieter", "Für Transkription, Zusammenfassung oder Übersetzung können erforderliche Daten an konfigurierte KI- oder Transkriptionsanbieter gesendet werden."],
        ["Sicherheit", "Uploads verwenden kurzlebige signierte URLs, Sitzungen httpOnly-Cookies und Freigabetokens werden als Hash gespeichert."],
        ["Datenkontrolle", "Du kannst Aufgaben, Freigabelinks, Exporte und Abonnements in deinem Konto verwalten."],
        ["Kontakt und Löschung", "Wende dich für Löschanfragen zu Konto, Aufgaben oder personenbezogenen Daten an den Support."]
      ]
    }
  },
  it: {
    terms: {
      eyebrow: "Termini",
      title: "Termini di servizio Votxt",
      description: "Questi termini spiegano account personali, abbonamenti, attività di trascrizione, link condivisi e limiti d'uso dei contenuti.",
      sections: [
        ["Account e sicurezza", "Sei responsabile della sicurezza dell'account, della password e di ogni attività svolta tramite l'account."],
        ["Media e attività", "Devi avere il diritto di trattare file, link o registrazioni inviati a Votxt."],
        ["Abbonamenti e quota", "Piani gratuiti e a pagamento includono minuti mensili, limiti file e vantaggi di coda diversi."],
        ["Condivisione ed export", "I link pubblici sono pagine di sola lettura. Condividili solo con persone autorizzate."],
        ["Uso accettabile", "Non usare Votxt per contenuti illegali, violazioni di diritti, automazione dannosa o aggiramento di limiti."]
      ]
    },
    privacy: {
      eyebrow: "Privacy",
      title: "Informativa privacy Votxt",
      description: "Questa informativa spiega come Votxt tratta dati account, media, trascrizioni, insight AI, pagamenti e uso.",
      sections: [
        ["Dati trattati", "Trattiamo email, nome, sessione, abbonamento, media caricati, trascrizioni, insight AI, export e dati d'uso."],
        ["Media e fornitori", "Per trascrivere, riassumere o tradurre, i dati necessari possono essere inviati ai fornitori AI o di trascrizione configurati."],
        ["Sicurezza", "Gli upload usano URL firmati temporanei, le sessioni cookie httpOnly e i token condivisi sono archiviati come hash."],
        ["Controllo dei dati", "Puoi gestire attività, link condivisi, export e abbonamenti dal tuo account."],
        ["Contatto e cancellazione", "Contatta il supporto per eliminare account, attività o dati personali secondo la politica di conservazione."]
      ]
    }
  },
  th: {
    terms: {
      eyebrow: "ข้อกำหนด",
      title: "ข้อกำหนดการให้บริการ Votxt",
      description: "ข้อกำหนดนี้อธิบายบัญชีส่วนตัว การสมัครสมาชิก งานถอดเสียง ลิงก์แชร์ และขอบเขตการใช้เนื้อหา",
      sections: [
        ["บัญชีและความปลอดภัย", "คุณต้องรับผิดชอบต่อความปลอดภัยของบัญชี รหัสผ่าน และกิจกรรมทั้งหมดในบัญชีของคุณ"],
        ["สื่อและงานถอดเสียง", "คุณต้องมีสิทธิ์ในการประมวลผลไฟล์ ลิงก์ หรือการบันทึกที่ส่งไปยัง Votxt"],
        ["แพ็กเกจและโควต้า", "แพ็กเกจฟรีและแบบชำระเงินมีจำนวนนาทีรายเดือน ข้อจำกัดไฟล์ และสิทธิ์คิวต่างกัน"],
        ["การแชร์และส่งออก", "ลิงก์สาธารณะเป็นหน้าอ่านอย่างเดียว โปรดแชร์เฉพาะกับผู้ที่ได้รับอนุญาต"],
        ["การใช้งานที่ยอมรับได้", "ห้ามใช้ Votxt กับเนื้อหาผิดกฎหมาย ละเมิดสิทธิ์ ระบบอัตโนมัติที่เป็นอันตราย หรือเลี่ยงข้อจำกัดแพลตฟอร์ม"]
      ]
    },
    privacy: {
      eyebrow: "ความเป็นส่วนตัว",
      title: "นโยบายความเป็นส่วนตัว Votxt",
      description: "นโยบายนี้อธิบายวิธีที่ Votxt จัดการข้อมูลบัญชี สื่อ ข้อความถอดเสียง ข้อมูลเชิงลึก AI การชำระเงิน และประวัติการใช้งาน",
      sections: [
        ["ข้อมูลที่ประมวลผล", "เราประมวลผลอีเมล ชื่อ สถานะเข้าสู่ระบบ แพ็กเกจ สื่อที่อัปโหลด ข้อความถอดเสียง ข้อมูล AI ไฟล์ส่งออก และข้อมูลการใช้งาน"],
        ["สื่อและผู้ให้บริการ", "เพื่อถอดเสียง สรุป หรือแปล ข้อมูลที่จำเป็นอาจถูกส่งไปยังผู้ให้บริการ AI หรือถอดเสียงที่ตั้งค่าไว้"],
        ["ความปลอดภัย", "การอัปโหลดใช้ URL ลงนามชั่วคราว เซสชันใช้ cookie แบบ httpOnly และ token แชร์จัดเก็บเป็น hash"],
        ["การควบคุมข้อมูล", "คุณสามารถจัดการงาน ลิงก์แชร์ ไฟล์ส่งออก และแพ็กเกจได้จากบัญชีของคุณ"],
        ["ติดต่อและลบข้อมูล", "ติดต่อฝ่ายสนับสนุนเพื่อขอลบบัญชี งาน หรือข้อมูลส่วนตัวตามนโยบายการเก็บรักษา"]
      ]
    }
  },
  uk: {
    terms: {
      eyebrow: "Умови",
      title: "Умови обслуговування Votxt",
      description: "Ці умови пояснюють особисті акаунти, підписки, задачі транскрипції, посилання для поширення та межі використання контенту.",
      sections: [
        ["Акаунт і безпека", "Ви відповідаєте за безпеку акаунта, пароля та всі дії, виконані через акаунт."],
        ["Медіа і задачі", "Ви повинні мати право обробляти файли, посилання або записи, надіслані до Votxt."],
        ["Підписки і квоти", "Безкоштовні й платні плани мають різні місячні хвилини, обмеження файлів і права черги."],
        ["Поширення та експорт", "Публічні посилання є сторінками тільки для читання. Діліться ними лише з уповноваженими особами."],
        ["Прийнятне використання", "Не використовуйте Votxt для незаконного контенту, порушення прав, шкідливої автоматизації або обходу лімітів."]
      ]
    },
    privacy: {
      eyebrow: "Конфіденційність",
      title: "Політика конфіденційності Votxt",
      description: "Політика пояснює обробку даних акаунта, медіа, транскриптів, AI-інсайтів, платежів і історії використання.",
      sections: [
        ["Дані, які ми обробляємо", "Ми обробляємо email, ім'я, стан входу, підписки, завантажені медіа, транскрипти, AI-інсайти, експорти і дані використання."],
        ["Медіа і постачальники", "Для транскрипції, підсумків або перекладу потрібні дані можуть надсилатися налаштованим AI- або транскрипційним постачальникам."],
        ["Безпека", "Завантаження використовує короткочасні підписані URL, сесії — httpOnly cookie, а токени поширення зберігаються як хеші."],
        ["Контроль даних", "Ви можете керувати задачами, посиланнями, експортами і підписками у своєму акаунті."],
        ["Контакт і видалення", "Зверніться до підтримки щодо видалення акаунта, задач або персональних даних відповідно до політики зберігання."]
      ]
    }
  },
  tr: {
    terms: {
      eyebrow: "Şartlar",
      title: "Votxt Hizmet Şartları",
      description: "Bu şartlar kişisel hesapları, abonelikleri, transkripsiyon görevlerini, paylaşım bağlantılarını ve içerik kullanım sınırlarını açıklar.",
      sections: [
        ["Hesap ve güvenlik", "Hesabınızın, şifrenizin ve hesabınızdaki tüm etkinliklerin güvenliğinden siz sorumlusunuz."],
        ["Medya ve görevler", "Votxt'a gönderdiğiniz dosya, bağlantı veya kayıtları işleme hakkına sahip olmalısınız."],
        ["Abonelikler ve kota", "Ücretsiz ve ücretli planlar farklı aylık dakika, dosya limiti ve kuyruk hakları içerir."],
        ["Paylaşım ve dışa aktarma", "Genel bağlantılar salt okunur sayfalardır. Yalnızca içeriği görme yetkisi olan kişilerle paylaşın."],
        ["Kabul edilebilir kullanım", "Votxt'ı yasa dışı içerik, hak ihlali, zararlı otomasyon veya platform limitlerini aşmak için kullanmayın."]
      ]
    },
    privacy: {
      eyebrow: "Gizlilik",
      title: "Votxt Gizlilik Politikası",
      description: "Bu politika Votxt'ın hesap bilgileri, medya, transkriptler, AI içgörüleri, ödeme ve kullanım geçmişini nasıl işlediğini açıklar.",
      sections: [
        ["İşlenen veriler", "E-posta, ad, oturum, abonelikler, yüklenen medya, transkriptler, AI içgörüleri, dışa aktarımlar ve kullanım verilerini işleriz."],
        ["Medya ve sağlayıcılar", "Transkripsiyon, özet veya çeviri için gerekli veriler yapılandırılmış AI veya transkripsiyon sağlayıcılarına gönderilebilir."],
        ["Güvenlik", "Yüklemeler kısa süreli imzalı URL'ler, oturumlar httpOnly cookie'ler kullanır; paylaşım tokenları hash olarak saklanır."],
        ["Veri kontrolü", "Görevleri, paylaşım bağlantılarını, dışa aktarımları ve abonelikleri hesabınızdan yönetebilirsiniz."],
        ["İletişim ve silme", "Hesap, görev veya kişisel veri silme talepleri için saklama politikasına göre destekle iletişime geçin."]
      ]
    }
  },
  ja: {
    terms: {
      eyebrow: "利用規約",
      title: "Votxt 利用規約",
      description: "この規約は、個人アカウント、サブスクリプション、文字起こしタスク、共有リンク、コンテンツ利用範囲を説明します。",
      sections: [
        ["アカウントと安全性", "アカウント、パスワード、およびアカウント上のすべての操作の安全性はユーザーの責任です。"],
        ["メディアとタスク", "Votxt に送信するファイル、リンク、録音を処理する権利を持っている必要があります。"],
        ["サブスクリプションと割当", "無料・有料プランには月間分数、ファイル制限、キュー権限の違いがあります。"],
        ["共有とエクスポート", "公開共有リンクは読み取り専用ページです。閲覧権限のある相手にのみ共有してください。"],
        ["許容される利用", "違法コンテンツ、権利侵害、有害な自動化、プラットフォーム制限回避に Votxt を使わないでください。"]
      ]
    },
    privacy: {
      eyebrow: "プライバシー",
      title: "Votxt プライバシーポリシー",
      description: "このポリシーは、アカウント情報、メディア、文字起こし、AI インサイト、支払い、利用履歴の取り扱いを説明します。",
      sections: [
        ["処理するデータ", "メール、名前、ログイン状態、サブスクリプション、アップロードメディア、文字起こし、AI インサイト、エクスポート、利用データを処理します。"],
        ["メディアとサービス提供者", "文字起こし、要約、翻訳のために必要なデータが設定済みの AI または文字起こし提供者へ送信される場合があります。"],
        ["安全対策", "アップロードは短期署名 URL、セッションは httpOnly Cookie、共有トークンはハッシュ保存を利用します。"],
        ["データ管理", "タスク、共有リンク、エクスポート、サブスクリプションをアカウントから管理できます。"],
        ["連絡と削除", "アカウント、タスク、個人データ削除の依頼は保持ポリシーに従ってサポートへ連絡してください。"]
      ]
    }
  },
  nl: {
    terms: {
      eyebrow: "Voorwaarden",
      title: "Votxt Servicevoorwaarden",
      description: "Deze voorwaarden beschrijven persoonlijke accounts, abonnementen, transcriptietaken, deellinks en grenzen voor contentgebruik.",
      sections: [
        ["Account en beveiliging", "Je bent verantwoordelijk voor de beveiliging van je account, wachtwoord en alle activiteit in je account."],
        ["Media en taken", "Je moet het recht hebben om bestanden, links of opnames die je naar Votxt stuurt te verwerken."],
        ["Abonnementen en quota", "Gratis en betaalde plannen hebben verschillende maandminuten, bestandslimieten en wachtrijrechten."],
        ["Delen en exporteren", "Openbare links zijn alleen-lezen pagina's. Deel ze alleen met bevoegde personen."],
        ["Aanvaardbaar gebruik", "Gebruik Votxt niet voor illegale content, rechteninbreuk, schadelijke automatisering of het omzeilen van platformlimieten."]
      ]
    },
    privacy: {
      eyebrow: "Privacy",
      title: "Votxt Privacybeleid",
      description: "Dit beleid legt uit hoe Votxt accountgegevens, media, transcripties, AI-inzichten, betalingen en gebruiksgeschiedenis verwerkt.",
      sections: [
        ["Verwerkte gegevens", "We verwerken e-mail, naam, sessie, abonnement, geüploade media, transcripties, AI-inzichten, exports en gebruiksgegevens."],
        ["Media en leveranciers", "Voor transcriptie, samenvatting of vertaling kunnen noodzakelijke gegevens naar ingestelde AI- of transcriptieleveranciers worden gestuurd."],
        ["Beveiliging", "Uploads gebruiken tijdelijke ondertekende URL's, sessies httpOnly cookies en deeltokens worden als hash opgeslagen."],
        ["Datacontrole", "Je kunt taken, deellinks, exports en abonnementen beheren vanuit je account."],
        ["Contact en verwijdering", "Neem contact op met support voor verwijdering van account, taken of persoonlijke gegevens volgens het bewaarbeleid."]
      ]
    }
  },
  pl: {
    terms: {
      eyebrow: "Warunki",
      title: "Warunki korzystania z Votxt",
      description: "Warunki opisują konta osobiste, subskrypcje, zadania transkrypcji, linki udostępniania i granice użycia treści.",
      sections: [
        ["Konto i bezpieczeństwo", "Odpowiadasz za bezpieczeństwo konta, hasła i wszystkich działań wykonywanych na koncie."],
        ["Media i zadania", "Musisz mieć prawo do przetwarzania plików, linków lub nagrań wysyłanych do Votxt."],
        ["Subskrypcje i limity", "Plany darmowe i płatne mają różne minuty miesięczne, limity plików i uprawnienia kolejki."],
        ["Udostępnianie i eksport", "Publiczne linki są stronami tylko do odczytu. Udostępniaj je tylko osobom uprawnionym."],
        ["Akceptowalne użycie", "Nie używaj Votxt do treści nielegalnych, naruszeń praw, szkodliwej automatyzacji ani omijania limitów platform."]
      ]
    },
    privacy: {
      eyebrow: "Prywatność",
      title: "Polityka prywatności Votxt",
      description: "Polityka wyjaśnia przetwarzanie danych konta, mediów, transkryptów, insightów AI, płatności i historii użycia.",
      sections: [
        ["Przetwarzane dane", "Przetwarzamy email, nazwę, sesję, subskrypcję, przesłane media, transkrypty, insighty AI, eksporty i dane użycia."],
        ["Media i dostawcy", "Do transkrypcji, podsumowania lub tłumaczenia niezbędne dane mogą trafiać do skonfigurowanych dostawców AI lub transkrypcji."],
        ["Bezpieczeństwo", "Uploady używają tymczasowych podpisanych URL, sesje cookie httpOnly, a tokeny udostępniania są przechowywane jako hashe."],
        ["Kontrola danych", "Możesz zarządzać zadaniami, linkami, eksportami i subskrypcjami z konta."],
        ["Kontakt i usuwanie", "Skontaktuj się z supportem, aby usunąć konto, zadania lub dane osobowe zgodnie z polityką retencji."]
      ]
    }
  },
  ko: {
    terms: {
      eyebrow: "약관",
      title: "Votxt 서비스 약관",
      description: "이 약관은 개인 계정, 구독, 전사 작업, 공유 링크, 콘텐츠 사용 범위를 설명합니다.",
      sections: [
        ["계정과 보안", "계정, 비밀번호, 계정에서 발생하는 모든 활동의 보안은 사용자 책임입니다."],
        ["미디어와 작업", "Votxt에 보내는 파일, 링크, 녹음을 처리할 권리가 있어야 합니다."],
        ["구독과 할당량", "무료 및 유료 플랜은 월간 분수, 파일 제한, 큐 권한이 다릅니다."],
        ["공유와 내보내기", "공개 공유 링크는 읽기 전용 페이지입니다. 볼 권한이 있는 사람에게만 공유하세요."],
        ["허용되는 사용", "불법 콘텐츠, 권리 침해, 유해한 자동화, 플랫폼 제한 우회에 Votxt를 사용하지 마세요."]
      ]
    },
    privacy: {
      eyebrow: "개인정보",
      title: "Votxt 개인정보 처리방침",
      description: "이 정책은 계정 정보, 미디어, 전사, AI 인사이트, 결제, 사용 기록 처리 방식을 설명합니다.",
      sections: [
        ["처리하는 데이터", "이메일, 이름, 로그인 상태, 구독, 업로드 미디어, 전사, AI 인사이트, 내보내기, 사용 데이터를 처리합니다."],
        ["미디어와 제공업체", "전사, 요약, 번역을 위해 필요한 데이터가 설정된 AI 또는 전사 제공업체로 전송될 수 있습니다."],
        ["보안", "업로드는 단기 서명 URL, 세션은 httpOnly 쿠키, 공유 토큰은 해시 저장을 사용합니다."],
        ["데이터 제어", "계정에서 작업, 공유 링크, 내보내기, 구독을 관리할 수 있습니다."],
        ["문의와 삭제", "계정, 작업, 개인 데이터 삭제 요청은 보존 정책에 따라 지원팀에 문의하세요."]
      ]
    }
  },
  hu: {
    terms: {
      eyebrow: "Feltételek",
      title: "Votxt szolgáltatási feltételek",
      description: "Ezek a feltételek ismertetik a személyes fiókokat, előfizetéseket, átírási feladatokat, megosztási linkeket és tartalomhasználati határokat.",
      sections: [
        ["Fiók és biztonság", "Te felelsz a fiókod, jelszavad és a fiókban végzett minden tevékenység biztonságáért."],
        ["Média és feladatok", "Jogosultnak kell lenned a Votxt-nak küldött fájlok, linkek vagy felvételek feldolgozására."],
        ["Előfizetések és kvóták", "Az ingyenes és fizetős csomagok eltérő havi perceket, fájlkorlátokat és sorjogosultságokat tartalmaznak."],
        ["Megosztás és export", "A nyilvános linkek csak olvasható oldalak. Csak jogosult személyekkel oszd meg."],
        ["Elfogadható használat", "Ne használd a Votxt-ot illegális tartalomra, jogsértésre, káros automatizálásra vagy platformkorlátok megkerülésére."]
      ]
    },
    privacy: {
      eyebrow: "Adatvédelem",
      title: "Votxt adatvédelmi irányelvek",
      description: "Ez az irányelv ismerteti a fiókadatok, média, leiratok, AI insightok, fizetés és használati előzmények kezelését.",
      sections: [
        ["Kezelt adatok", "Kezeljük az emailt, nevet, munkamenetet, előfizetést, feltöltött médiát, leiratot, AI insightokat, exportokat és használati adatokat."],
        ["Média és szolgáltatók", "Átírás, összefoglalás vagy fordítás céljából szükséges adatok konfigurált AI- vagy átírási szolgáltatókhoz kerülhetnek."],
        ["Biztonság", "A feltöltések rövid életű aláírt URL-eket, a munkamenetek httpOnly cookie-kat használnak; a megosztási tokenek hashként tárolódnak."],
        ["Adatkontroll", "A fiókodban kezelheted a feladatokat, megosztási linkeket, exportokat és előfizetéseket."],
        ["Kapcsolat és törlés", "Fiók, feladat vagy személyes adat törléséhez fordulj a támogatáshoz a megőrzési szabályzat szerint."]
      ]
    }
  }
};

export function getLegalPageCopy(locale: string, type: "terms" | "privacy") {
  const normalizedLocale = isLocale(locale) ? locale : "en";
  return legalCopy[normalizedLocale][type];
}

export function LegalPage({type, locale}: {type: "terms" | "privacy"; locale: string}) {
  const copy = getLegalPageCopy(locale, type);
  const Icon = type === "privacy" ? ShieldCheck : FileText;

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <PageHero {...copy} />
      <section className="mx-auto grid max-w-4xl gap-4 px-4 py-12 md:px-8">
        {copy.sections.map(([heading, body]) => (
          <article key={heading} className="border-b border-ink/10 bg-transparent py-6">
            <h2 className="flex items-center gap-2 text-xl font-black text-ink"><Icon size={19} className="text-tide" />{heading}</h2>
            <p className="mt-3 text-sm leading-7 text-ink/70">{body}</p>
          </article>
        ))}
      </section>
      <SiteFooter />
    </main>
  );
}
