import {BadgeCheck, Handshake, ShieldCheck} from "lucide-react";
import {PageHero, SiteFooter, SiteHeader} from "@/components/site-shell";
import {isLocale, type Locale} from "@/lib/locales";

type InfoType = "security" | "affiliate";
type InfoSection = readonly [string, string];

type AffiliateCopy = {
  eyebrow: string;
  title: string;
  description: string;
  sections: InfoSection[];
  stats: readonly [string, string, string][];
  ctaText: string;
  join: string;
  login: string;
  faqTitle: string;
  faqs: readonly [string, string][];
};

type LocaleInfoCopy = {
  security: {
    eyebrow: string;
    title: string;
    description: string;
    sections: InfoSection[];
  };
  affiliate: AffiliateCopy;
};

const infoCopy: Record<Locale, LocaleInfoCopy> = {
  ar: {
    security: {
      eyebrow: "الأمان",
      title: "الأمان والخصوصية",
      description: "تعرّف على طريقة حماية Votxt لملفاتك ونصوصك وروابط المشاركة والمدفوعات.",
      sections: [
        ["تشفير البيانات", "تُشفّر ملفات الوسائط والنصوص أثناء التخزين، وتتم عمليات النقل عبر اتصالات HTTPS آمنة."],
        ["وصول الحساب", "تظل الملفات مرتبطة بحسابك، ولا تصبح المشاركة عامة إلا عند إنشاء رابط قراءة فقط."],
        ["المدفوعات", "تتم المدفوعات عبر Stripe، ولا تخزن Votxt بيانات بطاقتك على خوادمها."],
        ["معالجة الذكاء الاصطناعي", "يتلقى مزودو الذكاء الاصطناعي الوسائط أو النص المطلوب فقط لإكمال المهمة، ولا نستخدم بياناتك للتدريب دون موافقة صريحة."]
      ]
    },
    affiliate: {
      eyebrow: "الشراكة",
      title: "برنامج شركاء Votxt",
      description: "اكسب عمولة 30% عند تعريف جمهورك بأدوات تحويل الصوت والفيديو إلى نص وملاحظات ذكية.",
      sections: [
        ["لجمهور مناسب", "Votxt مفيد للفرق والأفراد الذين يحولون الاجتماعات والمقابلات والدروس والبودكاست والفيديوهات إلى مستندات."],
        ["انضم إلى البرنامج", "أنشئ حسابك في Rewardful واحصل على رابط الإحالة الخاص بك."],
        ["شارك Votxt", "روّج للنسخ والتلخيص والخرائط الذهنية والترجمة وتصدير الملفات."],
        ["اكسب العمولة", "احصل على عمولة 30% من مدفوعات العملاء المحالين خلال أول 12 شهرا."]
      ],
      stats: [["العمولة", "30%", "على مدفوعات العملاء المحالين"], ["المدة", "12 شهرا", "نافذة العمولة لكل عميل"], ["التتبع", "Rewardful", "روابط الإحالة والتحويلات والمبالغ المستردة والمدفوعات"]],
      ctaText: "أنشئ حساب الشريك، واحصل على رابطك، وابدأ بمشاركة Votxt مع من يعملون بالصوت والفيديو.",
      join: "انضم إلى برنامج الشركاء",
      login: "دخول الشركاء",
      faqTitle: "هل أنت مستعد لتصبح شريكا في Votxt؟",
      faqs: [["من يناسبه البرنامج؟", "المبدعون والمعلمون والوكالات والمجتمعات التي تصل إلى مستخدمي الصوت والفيديو والاجتماعات والبحث."], ["كيف يتم تتبع الإحالات؟", "يتتبع Rewardful الزوار من رابطك ويربط المدفوعات المؤهلة بحسابك."], ["ماذا يحدث بعد الاسترداد؟", "تُعدّل المدفوعات المستردة في Rewardful قبل الدفع."], ["هل يمكنني استخدام الرابط لنفسي؟", "لا. البرنامج مخصص للإحالات الحقيقية من جمهورك أو عملائك أو مجتمعك."]]
    }
  },
  de: {
    security: {
      eyebrow: "Sicherheit",
      title: "Sicherheit & Datenschutz",
      description: "Erfahre, wie Votxt deine Dateien, Transkripte, Freigabelinks und Zahlungen schützt.",
      sections: [
        ["Datenverschlüsselung", "Medien und Transkripte werden ruhend verschlüsselt, und Übertragungen laufen über sichere HTTPS-Verbindungen."],
        ["Kontozugriff", "Dateien bleiben deinem Konto zugeordnet. Öffentlich wird nur ein schreibgeschützter Link, den du aktiv erstellst."],
        ["Zahlungen", "Zahlungen verarbeitet Stripe. Votxt speichert keine Kreditkartendaten auf eigenen Servern."],
        ["KI-Verarbeitung", "KI-Anbieter erhalten nur die Medien oder Texte, die für deine angeforderte Aufgabe nötig sind. Kein Training ohne ausdrückliche Zustimmung."]
      ]
    },
    affiliate: {
      eyebrow: "Affiliate",
      title: "Votxt Affiliate-Programm",
      description: "Verdiene 30% Provision, wenn du Votxt Menschen empfiehlst, die Audio und Video in Text und KI-Notizen verwandeln.",
      sections: [
        ["Für relevante Zielgruppen", "Votxt hilft Teams und Einzelpersonen, Meetings, Interviews, Vorlesungen, Podcasts und Videos in nutzbare Dokumente zu verwandeln."],
        ["Programm beitreten", "Erstelle dein Rewardful-Konto und erhalte deinen persönlichen Votxt-Empfehlungslink."],
        ["Votxt teilen", "Bewirb Transkription, Zusammenfassungen, Mindmaps, Übersetzung und Export-Workflows."],
        ["Provision verdienen", "Erhalte 30% Provision auf Zahlungen vermittelter Kunden innerhalb der ersten 12 Monate."]
      ],
      stats: [["Provision", "30%", "Auf Zahlungen vermittelter Kunden"], ["Dauer", "12 Monate", "Provisionsfenster pro Kunde"], ["Tracking", "Rewardful", "Empfehlungslinks, Conversions, Erstattungen und Auszahlungen"]],
      ctaText: "Erstelle dein Affiliate-Konto, hole deinen Link und teile Votxt mit Menschen, die mit Audio und Video arbeiten.",
      join: "Affiliate-Programm beitreten",
      login: "Affiliate-Login",
      faqTitle: "Bereit, Votxt Affiliate zu werden?",
      faqs: [["Wer passt gut zum Programm?", "Creator, Lehrende, Agenturen, Tool-Verzeichnisse und Communities rund um Audio, Video, Meetings, Podcasts, Kurse und Forschung."], ["Wie werden Empfehlungen getrackt?", "Rewardful verfolgt Besucher über deinen Link und ordnet qualifizierte Stripe-Zahlungen deinem Konto zu."], ["Was passiert bei einer Erstattung?", "Erstattete Zahlungen werden in Rewardful angepasst, bevor Provisionen ausgezahlt werden."], ["Darf ich mich selbst werben?", "Nein. Das Programm ist für echte Empfehlungen aus deinem Publikum, Kundenkreis oder deiner Community gedacht."]]
    }
  },
  en: {
    security: {
      eyebrow: "Security",
      title: "Security & Privacy",
      description: "Learn how Votxt protects your files, transcripts, share links, and payments.",
      sections: [
        ["Data encryption", "Media files and transcripts are encrypted at rest, and transfers use secure HTTPS connections."],
        ["Account access", "Files stay scoped to your account. A transcription becomes public only when you create a read-only share link."],
        ["Payments", "Payments are processed by Stripe. Votxt does not store your card details on its servers."],
        ["AI processing", "AI providers receive only the media or text needed for the task you requested. We do not use your data for AI training without explicit consent."]
      ]
    },
    affiliate: {
      eyebrow: "Affiliate",
      title: "Votxt Affiliate Program",
      description: "Earn 30% commission by introducing Votxt to people who need audio and video transcription, AI notes, and export workflows.",
      sections: [
        ["Built for relevant audiences", "Votxt is useful for teams and individuals who turn meetings, interviews, lectures, podcasts, and videos into usable documents."],
        ["Join the program", "Create your Rewardful affiliate account and get your unique Votxt referral link."],
        ["Share Votxt", "Promote transcription, summaries, mind maps, translation, subtitles, and document exports."],
        ["Earn commission", "Receive 30% commission on referred customer payments within the first 12 months."]
      ],
      stats: [["Commission", "30%", "On referred customer payments"], ["Duration", "12 months", "Commission window per customer"], ["Tracking", "Rewardful", "Referral links, conversions, refunds, and payout tracking"]],
      ctaText: "Create your Rewardful affiliate account, get your link, and start sharing Votxt with people who work with audio and video.",
      join: "Join the affiliate program",
      login: "Affiliate login",
      faqTitle: "Ready to become a Votxt affiliate?",
      faqs: [["Who is a good fit?", "Creators, educators, agencies, tool directories, and communities that reach people who work with audio, video, meetings, interviews, podcasts, courses, or research content."], ["How are referrals tracked?", "Rewardful tracks referred visitors through your affiliate link and connects eligible Stripe payments to your affiliate account."], ["What happens after a refund?", "Refunded payments are adjusted in Rewardful, so unpaid commissions are removed or reduced before payout."], ["Can I use my own link for self-referrals?", "No. The program is intended for genuine referrals from your audience, clients, or community."]]
    }
  },
  es: {
    security: {
      eyebrow: "Seguridad",
      title: "Seguridad y privacidad",
      description: "Conoce cómo Votxt protege tus archivos, transcripciones, enlaces compartidos y pagos.",
      sections: [
        ["Cifrado de datos", "Los archivos multimedia y las transcripciones se cifran en reposo, y las transferencias usan conexiones HTTPS seguras."],
        ["Acceso de cuenta", "Los archivos permanecen asociados a tu cuenta. Una transcripción solo se vuelve pública si creas un enlace de solo lectura."],
        ["Pagos", "Stripe procesa los pagos. Votxt no guarda los datos de tu tarjeta en sus servidores."],
        ["Procesamiento con IA", "Los proveedores de IA reciben solo el audio, video o texto necesario para la tarea solicitada. No usamos tus datos para entrenar IA sin consentimiento explícito."]
      ]
    },
    affiliate: {
      eyebrow: "Afiliados",
      title: "Programa de afiliados de Votxt",
      description: "Gana 30% de comisión recomendando Votxt a quienes necesitan transcripción de audio y video, notas con IA y exportaciones.",
      sections: [
        ["Para audiencias relevantes", "Votxt ayuda a equipos y personas que convierten reuniones, entrevistas, clases, podcasts y videos en documentos útiles."],
        ["Únete al programa", "Crea tu cuenta de afiliado en Rewardful y obtén tu enlace único de Votxt."],
        ["Comparte Votxt", "Promociona transcripción, resúmenes, mapas mentales, traducción, subtítulos y exportación de documentos."],
        ["Gana comisión", "Recibe 30% de comisión sobre pagos de clientes referidos durante los primeros 12 meses."]
      ],
      stats: [["Comisión", "30%", "Sobre pagos de clientes referidos"], ["Duración", "12 meses", "Ventana de comisión por cliente"], ["Seguimiento", "Rewardful", "Enlaces, conversiones, reembolsos y pagos"]],
      ctaText: "Crea tu cuenta de afiliado, consigue tu enlace y empieza a compartir Votxt con personas que trabajan con audio y video.",
      join: "Unirse al programa",
      login: "Acceso de afiliados",
      faqTitle: "¿Listo para ser afiliado de Votxt?",
      faqs: [["¿Para quién es ideal?", "Creadores, educadores, agencias, directorios de herramientas y comunidades que llegan a personas que trabajan con audio, video, reuniones, cursos o investigación."], ["¿Cómo se rastrean las referencias?", "Rewardful rastrea visitas desde tu enlace y conecta pagos elegibles de Stripe con tu cuenta."], ["¿Qué pasa tras un reembolso?", "Los pagos reembolsados se ajustan en Rewardful antes del pago de comisiones."], ["¿Puedo usar mi propio enlace?", "No. El programa es para referencias reales de tu audiencia, clientes o comunidad."]]
    }
  },
  fr: {
    security: {
      eyebrow: "Sécurité",
      title: "Sécurité et confidentialité",
      description: "Découvrez comment Votxt protège vos fichiers, transcriptions, liens partagés et paiements.",
      sections: [
        ["Chiffrement des données", "Les médias et transcriptions sont chiffrés au repos, et les transferts utilisent des connexions HTTPS sécurisées."],
        ["Accès au compte", "Les fichiers restent associés à votre compte. Une transcription ne devient publique que si vous créez un lien de lecture seule."],
        ["Paiements", "Les paiements sont traités par Stripe. Votxt ne stocke pas les données de carte sur ses serveurs."],
        ["Traitement IA", "Les fournisseurs IA reçoivent uniquement le média ou le texte nécessaire à la tâche demandée. Nous n'utilisons pas vos données pour entraîner l'IA sans consentement explicite."]
      ]
    },
    affiliate: {
      eyebrow: "Affiliation",
      title: "Programme d'affiliation Votxt",
      description: "Gagnez 30% de commission en recommandant Votxt aux personnes qui ont besoin de transcription audio et vidéo, notes IA et exports.",
      sections: [
        ["Pour les audiences pertinentes", "Votxt aide les équipes et les personnes qui transforment réunions, interviews, cours, podcasts et vidéos en documents utiles."],
        ["Rejoindre le programme", "Créez votre compte Rewardful et obtenez votre lien de parrainage Votxt unique."],
        ["Partager Votxt", "Promouvez transcription, résumés, cartes mentales, traduction, sous-titres et exports de documents."],
        ["Gagner une commission", "Recevez 30% de commission sur les paiements des clients parrainés pendant les 12 premiers mois."]
      ],
      stats: [["Commission", "30%", "Sur les paiements des clients parrainés"], ["Durée", "12 mois", "Fenêtre de commission par client"], ["Suivi", "Rewardful", "Liens, conversions, remboursements et paiements"]],
      ctaText: "Créez votre compte affilié, récupérez votre lien et partagez Votxt avec les personnes qui travaillent avec l'audio et la vidéo.",
      join: "Rejoindre le programme",
      login: "Connexion affilié",
      faqTitle: "Prêt à devenir affilié Votxt ?",
      faqs: [["Pour qui est-ce adapté ?", "Créateurs, enseignants, agences, annuaires d'outils et communautés qui touchent des personnes travaillant avec audio, vidéo, réunions, podcasts, cours ou recherche."], ["Comment les parrainages sont-ils suivis ?", "Rewardful suit les visiteurs depuis votre lien et associe les paiements Stripe éligibles à votre compte."], ["Que se passe-t-il après un remboursement ?", "Les paiements remboursés sont ajustés dans Rewardful avant le versement."], ["Puis-je utiliser mon propre lien ?", "Non. Le programme concerne les parrainages réels de votre audience, de vos clients ou de votre communauté."]]
    }
  },
  hu: {
    security: {
      eyebrow: "Biztonság",
      title: "Biztonság és adatvédelem",
      description: "Ismerd meg, hogyan védi a Votxt a fájljaidat, átirataidat, megosztási linkjeidet és fizetéseidet.",
      sections: [
        ["Adattitkosítás", "A médiafájlok és átiratok tárolás közben titkosítva vannak, az átvitel biztonságos HTTPS kapcsolaton történik."],
        ["Fiókhozzáférés", "A fájlok a fiókodhoz kötődnek. Átirat csak akkor lesz nyilvános, ha olvasási megosztási linket hozol létre."],
        ["Fizetések", "A fizetéseket a Stripe kezeli. A Votxt nem tárol bankkártyaadatokat a szerverein."],
        ["AI feldolgozás", "Az AI szolgáltatók csak a kért feladathoz szükséges médiát vagy szöveget kapják meg. Kifejezett hozzájárulás nélkül nem használjuk adataidat AI tanításra."]
      ]
    },
    affiliate: {
      eyebrow: "Partnerprogram",
      title: "Votxt partnerprogram",
      description: "Keress 30% jutalékot, ha Votxt-ot ajánlasz olyanoknak, akik hang- és videóátiratot, AI jegyzeteket és exportokat keresnek.",
      sections: [
        ["Releváns közönségeknek", "A Votxt csapatoknak és egyéneknek segít megbeszélések, interjúk, előadások, podcastek és videók dokumentummá alakításában."],
        ["Csatlakozás", "Hozd létre Rewardful partnerfiókodat, és szerezd meg egyedi Votxt ajánlólinkedet."],
        ["Votxt megosztása", "Népszerűsítsd az átiratokat, összefoglalókat, gondolattérképeket, fordítást, feliratokat és dokumentumexportot."],
        ["Jutalék keresése", "Kapj 30% jutalékot az ajánlott ügyfelek fizetései után az első 12 hónapban."]
      ],
      stats: [["Jutalék", "30%", "Ajánlott ügyfelek fizetései után"], ["Időtartam", "12 hónap", "Jutalékablak ügyfelenként"], ["Követés", "Rewardful", "Ajánlólinkek, konverziók, visszatérítések és kifizetések"]],
      ctaText: "Hozd létre partnerfiókodat, szerezd meg linkedet, és oszd meg a Votxt-ot hanggal és videóval dolgozó emberekkel.",
      join: "Csatlakozás a programhoz",
      login: "Partner belépés",
      faqTitle: "Készen állsz Votxt partnerré válni?",
      faqs: [["Kinek jó választás?", "Alkotóknak, oktatóknak, ügynökségeknek, eszközkatalógusoknak és közösségeknek, amelyek hanggal, videóval, megbeszélésekkel, kurzusokkal vagy kutatással dolgozó embereket érnek el."], ["Hogyan történik a követés?", "A Rewardful követi a látogatókat az ajánlólinkeden keresztül, és a jogosult Stripe fizetéseket a fiókodhoz rendeli."], ["Mi történik visszatérítés után?", "A visszatérített fizetések a Rewardfulban módosulnak a kifizetés előtt."], ["Használhatom saját linkemet?", "Nem. A program valódi ajánlásokra szolgál közönséged, ügyfeleid vagy közösséged felől."]]
    }
  },
  id: {
    security: {
      eyebrow: "Keamanan",
      title: "Keamanan & Privasi",
      description: "Pelajari cara Votxt melindungi file, transkrip, tautan berbagi, dan pembayaran Anda.",
      sections: [
        ["Enkripsi data", "File media dan transkrip dienkripsi saat tersimpan, dan transfer memakai koneksi HTTPS yang aman."],
        ["Akses akun", "File tetap berada dalam akun Anda. Transkripsi hanya menjadi publik saat Anda membuat tautan berbagi baca-saja."],
        ["Pembayaran", "Pembayaran diproses oleh Stripe. Votxt tidak menyimpan detail kartu di servernya."],
        ["Pemrosesan AI", "Penyedia AI hanya menerima media atau teks yang diperlukan untuk tugas yang Anda minta. Kami tidak memakai data Anda untuk pelatihan AI tanpa persetujuan eksplisit."]
      ]
    },
    affiliate: {
      eyebrow: "Afiliasi",
      title: "Program Afiliasi Votxt",
      description: "Dapatkan komisi 30% dengan memperkenalkan Votxt kepada orang yang membutuhkan transkripsi audio dan video, catatan AI, dan ekspor.",
      sections: [
        ["Untuk audiens relevan", "Votxt membantu tim dan individu mengubah rapat, wawancara, kuliah, podcast, dan video menjadi dokumen yang berguna."],
        ["Bergabung", "Buat akun afiliasi Rewardful dan dapatkan tautan referensi Votxt unik Anda."],
        ["Bagikan Votxt", "Promosikan transkripsi, ringkasan, mind map, terjemahan, subtitle, dan ekspor dokumen."],
        ["Dapatkan komisi", "Terima komisi 30% dari pembayaran pelanggan referensi dalam 12 bulan pertama."]
      ],
      stats: [["Komisi", "30%", "Dari pembayaran pelanggan referensi"], ["Durasi", "12 bulan", "Jendela komisi per pelanggan"], ["Pelacakan", "Rewardful", "Tautan referensi, konversi, refund, dan pembayaran"]],
      ctaText: "Buat akun afiliasi Anda, dapatkan tautan, dan mulai bagikan Votxt kepada orang yang bekerja dengan audio dan video.",
      join: "Bergabung dengan program afiliasi",
      login: "Login afiliasi",
      faqTitle: "Siap menjadi afiliasi Votxt?",
      faqs: [["Siapa yang cocok?", "Kreator, pendidik, agensi, direktori alat, dan komunitas yang menjangkau orang yang bekerja dengan audio, video, rapat, podcast, kursus, atau riset."], ["Bagaimana referensi dilacak?", "Rewardful melacak pengunjung dari tautan Anda dan menghubungkan pembayaran Stripe yang memenuhi syarat ke akun Anda."], ["Apa yang terjadi setelah refund?", "Pembayaran yang direfund disesuaikan di Rewardful sebelum komisi dibayarkan."], ["Bolehkah memakai tautan sendiri?", "Tidak. Program ini untuk referensi nyata dari audiens, klien, atau komunitas Anda."]]
    }
  },
  it: {
    security: {
      eyebrow: "Sicurezza",
      title: "Sicurezza e privacy",
      description: "Scopri come Votxt protegge file, trascrizioni, link condivisi e pagamenti.",
      sections: [
        ["Crittografia dei dati", "File multimediali e trascrizioni sono cifrati a riposo, e i trasferimenti usano connessioni HTTPS sicure."],
        ["Accesso account", "I file restano associati al tuo account. Una trascrizione diventa pubblica solo se crei un link di sola lettura."],
        ["Pagamenti", "I pagamenti sono gestiti da Stripe. Votxt non conserva i dati della carta sui propri server."],
        ["Elaborazione AI", "I provider AI ricevono solo media o testo necessari all'attività richiesta. Non usiamo i tuoi dati per addestrare AI senza consenso esplicito."]
      ]
    },
    affiliate: {
      eyebrow: "Affiliazione",
      title: "Programma affiliati Votxt",
      description: "Guadagna il 30% di commissione presentando Votxt a chi ha bisogno di trascrizione audio e video, note AI ed esportazioni.",
      sections: [
        ["Per audience rilevanti", "Votxt aiuta team e persone a trasformare riunioni, interviste, lezioni, podcast e video in documenti utilizzabili."],
        ["Unisciti al programma", "Crea il tuo account Rewardful e ottieni il link referral Votxt unico."],
        ["Condividi Votxt", "Promuovi trascrizione, riepiloghi, mappe mentali, traduzione, sottotitoli ed export documenti."],
        ["Guadagna commissioni", "Ricevi il 30% sui pagamenti dei clienti referenziati nei primi 12 mesi."]
      ],
      stats: [["Commissione", "30%", "Sui pagamenti dei clienti referenziati"], ["Durata", "12 mesi", "Finestra commissione per cliente"], ["Tracking", "Rewardful", "Link referral, conversioni, rimborsi e pagamenti"]],
      ctaText: "Crea il tuo account affiliato, ottieni il link e condividi Votxt con chi lavora con audio e video.",
      join: "Unisciti al programma",
      login: "Login affiliati",
      faqTitle: "Pronto a diventare affiliato Votxt?",
      faqs: [["Chi è adatto?", "Creator, educatori, agenzie, directory di strumenti e community che raggiungono persone che lavorano con audio, video, riunioni, podcast, corsi o ricerca."], ["Come vengono tracciati i referral?", "Rewardful traccia i visitatori dal tuo link e collega i pagamenti Stripe idonei al tuo account."], ["Cosa succede dopo un rimborso?", "I pagamenti rimborsati vengono adeguati in Rewardful prima del payout."], ["Posso usare il mio link per me stesso?", "No. Il programma è pensato per referral reali dal tuo pubblico, dai clienti o dalla community."]]
    }
  },
  ja: {
    security: {
      eyebrow: "セキュリティ",
      title: "セキュリティとプライバシー",
      description: "Votxt がファイル、文字起こし、共有リンク、支払いをどのように保護するかをご確認ください。",
      sections: [
        ["データ暗号化", "メディアファイルと文字起こしは保存時に暗号化され、転送には安全な HTTPS 接続を使用します。"],
        ["アカウントアクセス", "ファイルはアカウントに紐づきます。読み取り専用の共有リンクを作成した場合のみ公開されます。"],
        ["支払い", "支払いは Stripe が処理します。Votxt はカード情報をサーバーに保存しません。"],
        ["AI 処理", "AI プロバイダーには依頼された処理に必要なメディアまたはテキストのみ送信されます。明示的な同意なしに AI 学習へ使用しません。"]
      ]
    },
    affiliate: {
      eyebrow: "アフィリエイト",
      title: "Votxt アフィリエイトプログラム",
      description: "音声・動画の文字起こし、AI ノート、エクスポートが必要な人に Votxt を紹介して 30% のコミッションを獲得できます。",
      sections: [
        ["関連する audience 向け", "Votxt は会議、インタビュー、講義、ポッドキャスト、動画を使える文書に変換するチームや個人に役立ちます。"],
        ["プログラム参加", "Rewardful のアフィリエイトアカウントを作成し、専用の Votxt 紹介リンクを取得します。"],
        ["Votxt を共有", "文字起こし、要約、マインドマップ、翻訳、字幕、文書エクスポートを紹介できます。"],
        ["コミッション獲得", "紹介顧客の支払いから最初の 12 か月間 30% のコミッションを受け取れます。"]
      ],
      stats: [["コミッション", "30%", "紹介顧客の支払いに対して"], ["期間", "12 か月", "顧客ごとのコミッション期間"], ["トラッキング", "Rewardful", "紹介リンク、コンバージョン、返金、支払い管理"]],
      ctaText: "アフィリエイトアカウントを作成し、リンクを取得して、音声や動画を扱う人に Votxt を共有しましょう。",
      join: "アフィリエイトに参加",
      login: "アフィリエイトログイン",
      faqTitle: "Votxt アフィリエイトを始めますか？",
      faqs: [["どんな人に向いていますか？", "音声、動画、会議、ポッドキャスト、講座、研究コンテンツを扱う人に届くクリエイター、教育者、代理店、ツールディレクトリ、コミュニティです。"], ["紹介はどう追跡されますか？", "Rewardful が紹介リンク経由の訪問者を追跡し、対象となる Stripe 支払いをアカウントに紐づけます。"], ["返金後はどうなりますか？", "返金された支払いは Rewardful で調整され、未払いコミッションから差し引かれます。"], ["自分のリンクを自分で使えますか？", "いいえ。プログラムは audience、顧客、コミュニティからの genuine referral を対象としています。"]]
    }
  },
  ko: {
    security: {
      eyebrow: "보안",
      title: "보안 및 개인정보",
      description: "Votxt가 파일, 전사, 공유 링크, 결제를 어떻게 보호하는지 확인하세요.",
      sections: [
        ["데이터 암호화", "미디어 파일과 전사는 저장 시 암호화되며 전송에는 안전한 HTTPS 연결을 사용합니다."],
        ["계정 접근", "파일은 계정 범위에 유지됩니다. 읽기 전용 공유 링크를 만들 때만 공개됩니다."],
        ["결제", "결제는 Stripe가 처리합니다. Votxt는 카드 정보를 서버에 저장하지 않습니다."],
        ["AI 처리", "AI 제공업체는 요청한 작업에 필요한 미디어 또는 텍스트만 받습니다. 명시적 동의 없이 AI 학습에 사용하지 않습니다."]
      ]
    },
    affiliate: {
      eyebrow: "제휴",
      title: "Votxt 제휴 프로그램",
      description: "오디오 및 비디오 전사, AI 노트, 내보내기가 필요한 사람들에게 Votxt를 소개하고 30% 커미션을 받으세요.",
      sections: [
        ["관련 audience를 위해", "Votxt는 회의, 인터뷰, 강의, 팟캐스트, 비디오를 활용 가능한 문서로 바꾸는 팀과 개인에게 유용합니다."],
        ["프로그램 참여", "Rewardful 제휴 계정을 만들고 고유 Votxt 추천 링크를 받으세요."],
        ["Votxt 공유", "전사, 요약, 마인드맵, 번역, 자막, 문서 내보내기를 홍보하세요."],
        ["커미션 받기", "추천 고객 결제의 30%를 첫 12개월 동안 받을 수 있습니다."]
      ],
      stats: [["커미션", "30%", "추천 고객 결제 기준"], ["기간", "12개월", "고객별 커미션 기간"], ["추적", "Rewardful", "추천 링크, 전환, 환불, 지급 추적"]],
      ctaText: "제휴 계정을 만들고 링크를 받아 오디오와 비디오를 다루는 사람들에게 Votxt를 공유하세요.",
      join: "제휴 프로그램 참여",
      login: "제휴 로그인",
      faqTitle: "Votxt 제휴 파트너가 될 준비가 되셨나요?",
      faqs: [["누구에게 적합한가요?", "오디오, 비디오, 회의, 팟캐스트, 강의, 연구 콘텐츠를 다루는 사람들에게 도달하는 크리에이터, 교육자, 에이전시, 도구 디렉터리, 커뮤니티입니다."], ["추천은 어떻게 추적되나요?", "Rewardful이 추천 링크 방문자를 추적하고 적격 Stripe 결제를 계정에 연결합니다."], ["환불 후에는 어떻게 되나요?", "환불된 결제는 지급 전 Rewardful에서 조정됩니다."], ["내 링크를 직접 사용해도 되나요?", "아니요. 이 프로그램은 audience, 고객, 커뮤니티에서 발생한 실제 추천을 위한 것입니다."]]
    }
  },
  nl: {
    security: {
      eyebrow: "Beveiliging",
      title: "Beveiliging en privacy",
      description: "Lees hoe Votxt je bestanden, transcripties, deellinks en betalingen beschermt.",
      sections: [
        ["Gegevensversleuteling", "Mediabestanden en transcripties worden versleuteld opgeslagen, en overdracht gebruikt beveiligde HTTPS-verbindingen."],
        ["Accounttoegang", "Bestanden blijven gekoppeld aan je account. Een transcriptie wordt alleen openbaar wanneer je een alleen-lezen deellink maakt."],
        ["Betalingen", "Betalingen worden verwerkt door Stripe. Votxt bewaart geen kaartgegevens op eigen servers."],
        ["AI-verwerking", "AI-providers ontvangen alleen de media of tekst die nodig is voor de gevraagde taak. We gebruiken je data niet voor AI-training zonder expliciete toestemming."]
      ]
    },
    affiliate: {
      eyebrow: "Affiliate",
      title: "Votxt affiliateprogramma",
      description: "Verdien 30% commissie door Votxt te introduceren bij mensen die audio- en videotranscriptie, AI-notities en exports nodig hebben.",
      sections: [
        ["Voor relevante doelgroepen", "Votxt helpt teams en individuen vergaderingen, interviews, colleges, podcasts en video's om te zetten in bruikbare documenten."],
        ["Doe mee", "Maak je Rewardful affiliateaccount aan en ontvang je unieke Votxt verwijzingslink."],
        ["Deel Votxt", "Promoot transcriptie, samenvattingen, mindmaps, vertaling, ondertitels en documentexports."],
        ["Verdien commissie", "Ontvang 30% commissie op betalingen van verwezen klanten gedurende de eerste 12 maanden."]
      ],
      stats: [["Commissie", "30%", "Op betalingen van verwezen klanten"], ["Duur", "12 maanden", "Commissievenster per klant"], ["Tracking", "Rewardful", "Verwijzingslinks, conversies, refunds en uitbetalingen"]],
      ctaText: "Maak je affiliateaccount, ontvang je link en deel Votxt met mensen die met audio en video werken.",
      join: "Word affiliate",
      login: "Affiliate login",
      faqTitle: "Klaar om Votxt affiliate te worden?",
      faqs: [["Voor wie is dit geschikt?", "Creators, docenten, bureaus, tooldirectories en communities die mensen bereiken die werken met audio, video, meetings, podcasts, cursussen of onderzoek."], ["Hoe worden verwijzingen gevolgd?", "Rewardful volgt bezoekers via je link en koppelt in aanmerking komende Stripe-betalingen aan je account."], ["Wat gebeurt er na een refund?", "Terugbetaalde betalingen worden in Rewardful aangepast voordat commissies worden uitgekeerd."], ["Mag ik mijn eigen link gebruiken?", "Nee. Het programma is bedoeld voor echte verwijzingen vanuit je publiek, klanten of community."]]
    }
  },
  pl: {
    security: {
      eyebrow: "Bezpieczeństwo",
      title: "Bezpieczeństwo i prywatność",
      description: "Dowiedz się, jak Votxt chroni pliki, transkrypcje, linki udostępniania i płatności.",
      sections: [
        ["Szyfrowanie danych", "Pliki multimedialne i transkrypcje są szyfrowane w spoczynku, a transfer odbywa się przez bezpieczne połączenia HTTPS."],
        ["Dostęp do konta", "Pliki pozostają w zakresie konta. Transkrypcja staje się publiczna tylko po utworzeniu linku tylko do odczytu."],
        ["Płatności", "Płatności obsługuje Stripe. Votxt nie przechowuje danych karty na swoich serwerach."],
        ["Przetwarzanie AI", "Dostawcy AI otrzymują tylko media lub tekst potrzebny do zleconego zadania. Nie używamy danych do treningu AI bez wyraźnej zgody."]
      ]
    },
    affiliate: {
      eyebrow: "Afiliacja",
      title: "Program afiliacyjny Votxt",
      description: "Zarabiaj 30% prowizji, polecając Votxt osobom potrzebującym transkrypcji audio i wideo, notatek AI oraz eksportu.",
      sections: [
        ["Dla właściwych odbiorców", "Votxt pomaga zespołom i osobom zamieniać spotkania, wywiady, wykłady, podcasty i filmy w użyteczne dokumenty."],
        ["Dołącz do programu", "Utwórz konto afiliacyjne Rewardful i otrzymaj unikalny link polecający Votxt."],
        ["Udostępniaj Votxt", "Promuj transkrypcję, podsumowania, mapy myśli, tłumaczenia, napisy i eksport dokumentów."],
        ["Zarabiaj prowizję", "Otrzymuj 30% prowizji od płatności poleconych klientów przez pierwsze 12 miesięcy."]
      ],
      stats: [["Prowizja", "30%", "Od płatności poleconych klientów"], ["Czas", "12 miesięcy", "Okno prowizji na klienta"], ["Śledzenie", "Rewardful", "Linki polecające, konwersje, zwroty i wypłaty"]],
      ctaText: "Utwórz konto afiliacyjne, pobierz link i udostępniaj Votxt osobom pracującym z audio i wideo.",
      join: "Dołącz do programu",
      login: "Logowanie afilianta",
      faqTitle: "Gotowy zostać afiliantem Votxt?",
      faqs: [["Dla kogo to dobry wybór?", "Twórcy, edukatorzy, agencje, katalogi narzędzi i społeczności docierające do osób pracujących z audio, wideo, spotkaniami, podcastami, kursami lub badaniami."], ["Jak śledzone są polecenia?", "Rewardful śledzi odwiedzających z linku i łączy kwalifikujące się płatności Stripe z kontem."], ["Co dzieje się po zwrocie?", "Zwrócone płatności są korygowane w Rewardful przed wypłatą prowizji."], ["Czy mogę użyć linku samodzielnie?", "Nie. Program jest przeznaczony dla prawdziwych poleceń od odbiorców, klientów lub społeczności."]]
    }
  },
  pt: {
    security: {
      eyebrow: "Segurança",
      title: "Segurança e privacidade",
      description: "Saiba como a Votxt protege seus arquivos, transcrições, links compartilhados e pagamentos.",
      sections: [
        ["Criptografia de dados", "Arquivos de mídia e transcrições são criptografados em repouso, e transferências usam conexões HTTPS seguras."],
        ["Acesso da conta", "Arquivos ficam vinculados à sua conta. A transcrição só fica pública quando você cria um link de leitura."],
        ["Pagamentos", "Pagamentos são processados pela Stripe. A Votxt não armazena dados do cartão em seus servidores."],
        ["Processamento por IA", "Provedores de IA recebem apenas a mídia ou texto necessário para a tarefa solicitada. Não usamos seus dados para treinar IA sem consentimento explícito."]
      ]
    },
    affiliate: {
      eyebrow: "Afiliados",
      title: "Programa de Afiliados Votxt",
      description: "Ganhe 30% de comissão apresentando a Votxt a pessoas que precisam de transcrição de áudio e vídeo, notas com IA e exportações.",
      sections: [
        ["Para audiências relevantes", "A Votxt ajuda equipes e indivíduos a transformar reuniões, entrevistas, aulas, podcasts e vídeos em documentos úteis."],
        ["Participe", "Crie sua conta de afiliado na Rewardful e receba seu link único da Votxt."],
        ["Compartilhe a Votxt", "Promova transcrição, resumos, mapas mentais, tradução, legendas e exportação de documentos."],
        ["Ganhe comissão", "Receba 30% de comissão nos pagamentos de clientes indicados nos primeiros 12 meses."]
      ],
      stats: [["Comissão", "30%", "Sobre pagamentos de clientes indicados"], ["Duração", "12 meses", "Janela de comissão por cliente"], ["Rastreamento", "Rewardful", "Links, conversões, reembolsos e pagamentos"]],
      ctaText: "Crie sua conta de afiliado, pegue seu link e compartilhe a Votxt com pessoas que trabalham com áudio e vídeo.",
      join: "Entrar no programa",
      login: "Login de afiliado",
      faqTitle: "Pronto para ser afiliado da Votxt?",
      faqs: [["Quem combina com o programa?", "Criadores, educadores, agências, diretórios de ferramentas e comunidades que alcançam pessoas que trabalham com áudio, vídeo, reuniões, podcasts, cursos ou pesquisa."], ["Como as indicações são rastreadas?", "A Rewardful rastreia visitantes pelo seu link e conecta pagamentos Stripe elegíveis à sua conta."], ["O que acontece após reembolso?", "Pagamentos reembolsados são ajustados na Rewardful antes do pagamento da comissão."], ["Posso usar meu próprio link?", "Não. O programa é para indicações reais do seu público, clientes ou comunidade."]]
    }
  },
  ru: {
    security: {
      eyebrow: "Безопасность",
      title: "Безопасность и конфиденциальность",
      description: "Узнайте, как Votxt защищает ваши файлы, расшифровки, ссылки доступа и платежи.",
      sections: [
        ["Шифрование данных", "Медиафайлы и расшифровки шифруются при хранении, а передача выполняется через защищенные HTTPS-соединения."],
        ["Доступ к аккаунту", "Файлы остаются привязаны к вашему аккаунту. Расшифровка становится публичной только после создания ссылки только для чтения."],
        ["Платежи", "Платежи обрабатывает Stripe. Votxt не хранит данные карты на своих серверах."],
        ["AI-обработка", "Поставщики AI получают только медиа или текст, необходимые для запрошенной задачи. Мы не используем ваши данные для обучения AI без явного согласия."]
      ]
    },
    affiliate: {
      eyebrow: "Партнерская программа",
      title: "Партнерская программа Votxt",
      description: "Получайте 30% комиссии, рекомендуя Votxt людям, которым нужны расшифровка аудио и видео, AI-заметки и экспорт.",
      sections: [
        ["Для релевантной аудитории", "Votxt помогает командам и отдельным пользователям превращать встречи, интервью, лекции, подкасты и видео в полезные документы."],
        ["Присоединиться", "Создайте партнерский аккаунт Rewardful и получите уникальную ссылку Votxt."],
        ["Делиться Votxt", "Продвигайте расшифровку, резюме, интеллект-карты, перевод, субтитры и экспорт документов."],
        ["Получать комиссию", "Получайте 30% комиссии с платежей привлеченных клиентов в первые 12 месяцев."]
      ],
      stats: [["Комиссия", "30%", "С платежей привлеченных клиентов"], ["Срок", "12 месяцев", "Окно комиссии на клиента"], ["Отслеживание", "Rewardful", "Ссылки, конверсии, возвраты и выплаты"]],
      ctaText: "Создайте партнерский аккаунт, получите ссылку и делитесь Votxt с людьми, работающими с аудио и видео.",
      join: "Стать партнером",
      login: "Вход для партнеров",
      faqTitle: "Готовы стать партнером Votxt?",
      faqs: [["Кому подходит программа?", "Авторам, преподавателям, агентствам, каталогам инструментов и сообществам, которые охватывают людей, работающих с аудио, видео, встречами, подкастами, курсами или исследованиями."], ["Как отслеживаются рекомендации?", "Rewardful отслеживает посетителей по вашей ссылке и связывает подходящие платежи Stripe с аккаунтом."], ["Что происходит после возврата?", "Возвращенные платежи корректируются в Rewardful до выплаты комиссии."], ["Можно ли использовать ссылку для себя?", "Нет. Программа предназначена для реальных рекомендаций от вашей аудитории, клиентов или сообщества."]]
    }
  },
  th: {
    security: {
      eyebrow: "ความปลอดภัย",
      title: "ความปลอดภัยและความเป็นส่วนตัว",
      description: "ดูว่า Votxt ปกป้องไฟล์ ข้อความถอดเสียง ลิงก์แชร์ และการชำระเงินของคุณอย่างไร",
      sections: [
        ["การเข้ารหัสข้อมูล", "ไฟล์สื่อและข้อความถอดเสียงถูกเข้ารหัสเมื่อจัดเก็บ และการโอนถ่ายใช้การเชื่อมต่อ HTTPS ที่ปลอดภัย"],
        ["การเข้าถึงบัญชี", "ไฟล์อยู่ภายใต้บัญชีของคุณ ข้อความถอดเสียงจะเป็นสาธารณะเมื่อคุณสร้างลิงก์อ่านอย่างเดียวเท่านั้น"],
        ["การชำระเงิน", "Stripe เป็นผู้ประมวลผลการชำระเงิน Votxt ไม่เก็บข้อมูลบัตรบนเซิร์ฟเวอร์ของตน"],
        ["การประมวลผล AI", "ผู้ให้บริการ AI ได้รับเฉพาะสื่อหรือข้อความที่จำเป็นต่อคำขอของคุณ และเราไม่ใช้ข้อมูลเพื่อฝึก AI โดยไม่มีความยินยอมชัดเจน"]
      ]
    },
    affiliate: {
      eyebrow: "พันธมิตร",
      title: "โปรแกรมพันธมิตร Votxt",
      description: "รับค่าคอมมิชชัน 30% เมื่อแนะนำ Votxt ให้ผู้ที่ต้องการถอดเสียงเสียงและวิดีโอ โน้ต AI และการส่งออกไฟล์",
      sections: [
        ["สำหรับผู้ชมที่เกี่ยวข้อง", "Votxt ช่วยทีมและบุคคลเปลี่ยนการประชุม สัมภาษณ์ บทเรียน พอดแคสต์ และวิดีโอให้เป็นเอกสารที่ใช้งานได้"],
        ["เข้าร่วมโปรแกรม", "สร้างบัญชีพันธมิตร Rewardful และรับลิงก์แนะนำ Votxt ของคุณ"],
        ["แชร์ Votxt", "โปรโมตการถอดเสียง สรุป แผนผังความคิด การแปล คำบรรยาย และการส่งออกเอกสาร"],
        ["รับค่าคอมมิชชัน", "รับ 30% จากการชำระเงินของลูกค้าที่แนะนำใน 12 เดือนแรก"]
      ],
      stats: [["ค่าคอมมิชชัน", "30%", "จากการชำระเงินของลูกค้าที่แนะนำ"], ["ระยะเวลา", "12 เดือน", "ช่วงค่าคอมมิชชันต่อหนึ่งลูกค้า"], ["การติดตาม", "Rewardful", "ลิงก์แนะนำ คอนเวอร์ชัน การคืนเงิน และการจ่ายเงิน"]],
      ctaText: "สร้างบัญชีพันธมิตร รับลิงก์ และเริ่มแชร์ Votxt กับคนที่ทำงานกับเสียงและวิดีโอ",
      join: "เข้าร่วมโปรแกรมพันธมิตร",
      login: "เข้าสู่ระบบพันธมิตร",
      faqTitle: "พร้อมเป็นพันธมิตร Votxt หรือยัง?",
      faqs: [["ใครเหมาะกับโปรแกรมนี้?", "ครีเอเตอร์ ผู้สอน เอเจนซี ไดเรกทอรีเครื่องมือ และชุมชนที่เข้าถึงคนทำงานกับเสียง วิดีโอ การประชุม พอดแคสต์ คอร์ส หรือการวิจัย"], ["ติดตามการแนะนำอย่างไร?", "Rewardful ติดตามผู้เข้าชมจากลิงก์ของคุณและเชื่อมการชำระเงิน Stripe ที่เข้าเกณฑ์กับบัญชีของคุณ"], ["เกิดอะไรขึ้นหลังคืนเงิน?", "การชำระเงินที่คืนจะถูกปรับใน Rewardful ก่อนจ่ายค่าคอมมิชชัน"], ["ใช้ลิงก์ของตัวเองได้ไหม?", "ไม่ได้ โปรแกรมนี้สำหรับการแนะนำจริงจากผู้ชม ลูกค้า หรือชุมชนของคุณ"]]
    }
  },
  tr: {
    security: {
      eyebrow: "Güvenlik",
      title: "Güvenlik ve gizlilik",
      description: "Votxt'ın dosyalarınızı, transkriptlerinizi, paylaşım bağlantılarını ve ödemeleri nasıl koruduğunu öğrenin.",
      sections: [
        ["Veri şifreleme", "Medya dosyaları ve transkriptler depoda şifrelenir; aktarımlar güvenli HTTPS bağlantılarıyla yapılır."],
        ["Hesap erişimi", "Dosyalar hesabınıza bağlı kalır. Bir transkript yalnızca salt okunur paylaşım bağlantısı oluşturduğunuzda herkese açık olur."],
        ["Ödemeler", "Ödemeler Stripe tarafından işlenir. Votxt kart bilgilerinizi sunucularında saklamaz."],
        ["AI işleme", "AI sağlayıcıları yalnızca istediğiniz görev için gereken medya veya metni alır. Açık onay olmadan verilerinizi AI eğitimi için kullanmayız."]
      ]
    },
    affiliate: {
      eyebrow: "İş ortaklığı",
      title: "Votxt İş Ortaklığı Programı",
      description: "Ses ve video transkripsiyonu, AI notları ve dışa aktarma iş akışlarına ihtiyaç duyan kişilere Votxt'ı tanıtarak %30 komisyon kazanın.",
      sections: [
        ["İlgili kitleler için", "Votxt, toplantıları, röportajları, dersleri, podcastleri ve videoları kullanılabilir belgelere dönüştüren ekipler ve kişiler için faydalıdır."],
        ["Programa katılın", "Rewardful iş ortağı hesabınızı oluşturun ve benzersiz Votxt referans bağlantınızı alın."],
        ["Votxt'ı paylaşın", "Transkripsiyon, özetler, zihin haritaları, çeviri, altyazı ve belge dışa aktarımını tanıtın."],
        ["Komisyon kazanın", "İlk 12 ay boyunca yönlendirdiğiniz müşterilerin ödemelerinden %30 komisyon alın."]
      ],
      stats: [["Komisyon", "30%", "Yönlendirilen müşteri ödemelerinde"], ["Süre", "12 ay", "Müşteri başına komisyon penceresi"], ["Takip", "Rewardful", "Referans bağlantıları, dönüşümler, iadeler ve ödemeler"]],
      ctaText: "İş ortağı hesabınızı oluşturun, bağlantınızı alın ve Votxt'ı ses ve video ile çalışan kişilerle paylaşmaya başlayın.",
      join: "İş ortaklığı programına katıl",
      login: "İş ortağı girişi",
      faqTitle: "Votxt iş ortağı olmaya hazır mısınız?",
      faqs: [["Kimler için uygun?", "Ses, video, toplantılar, podcastler, kurslar veya araştırma içeriğiyle çalışan kişilere ulaşan içerik üreticileri, eğitimciler, ajanslar, araç dizinleri ve topluluklar."], ["Referanslar nasıl takip edilir?", "Rewardful, ziyaretçileri bağlantınız üzerinden takip eder ve uygun Stripe ödemelerini hesabınıza bağlar."], ["İade sonrası ne olur?", "İade edilen ödemeler, komisyon ödenmeden önce Rewardful'da düzenlenir."], ["Kendi bağlantımı kullanabilir miyim?", "Hayır. Program, kitlenizden, müşterilerinizden veya topluluğunuzdan gelen gerçek yönlendirmeler içindir."]]
    }
  },
  uk: {
    security: {
      eyebrow: "Безпека",
      title: "Безпека та приватність",
      description: "Дізнайтеся, як Votxt захищає ваші файли, транскрипції, посилання для поширення та платежі.",
      sections: [
        ["Шифрування даних", "Медіафайли й транскрипції шифруються під час зберігання, а передавання відбувається через захищені HTTPS-з'єднання."],
        ["Доступ до акаунта", "Файли залишаються прив'язаними до вашого акаунта. Транскрипція стає публічною лише після створення посилання тільки для читання."],
        ["Платежі", "Платежі обробляє Stripe. Votxt не зберігає дані картки на своїх серверах."],
        ["AI-обробка", "Постачальники AI отримують лише медіа або текст, потрібні для вашого завдання. Ми не використовуємо дані для навчання AI без явної згоди."]
      ]
    },
    affiliate: {
      eyebrow: "Партнерство",
      title: "Партнерська програма Votxt",
      description: "Заробляйте 30% комісії, рекомендуючи Votxt людям, яким потрібні транскрипція аудіо й відео, AI-нотатки та експорт.",
      sections: [
        ["Для релевантної аудиторії", "Votxt допомагає командам і людям перетворювати зустрічі, інтерв'ю, лекції, подкасти й відео на корисні документи."],
        ["Приєднатися", "Створіть партнерський акаунт Rewardful і отримайте унікальне посилання Votxt."],
        ["Поширюйте Votxt", "Просувайте транскрипцію, підсумки, ментальні карти, переклад, субтитри й експорт документів."],
        ["Заробляйте комісію", "Отримуйте 30% з платежів залучених клієнтів протягом перших 12 місяців."]
      ],
      stats: [["Комісія", "30%", "З платежів залучених клієнтів"], ["Тривалість", "12 місяців", "Комісійне вікно на клієнта"], ["Відстеження", "Rewardful", "Посилання, конверсії, повернення та виплати"]],
      ctaText: "Створіть партнерський акаунт, отримайте посилання й поширюйте Votxt серед людей, які працюють з аудіо та відео.",
      join: "Приєднатися до програми",
      login: "Вхід партнера",
      faqTitle: "Готові стати партнером Votxt?",
      faqs: [["Кому підходить програма?", "Креаторам, освітянам, агенціям, каталогам інструментів і спільнотам, що охоплюють людей, які працюють з аудіо, відео, зустрічами, подкастами, курсами чи дослідженнями."], ["Як відстежуються рекомендації?", "Rewardful відстежує відвідувачів за вашим посиланням і прив'язує відповідні Stripe-платежі до акаунта."], ["Що після повернення коштів?", "Повернені платежі коригуються в Rewardful до виплати комісій."], ["Чи можна використати власне посилання?", "Ні. Програма призначена для справжніх рекомендацій від вашої аудиторії, клієнтів або спільноти."]]
    }
  },
  vi: {
    security: {
      eyebrow: "Bảo mật",
      title: "Bảo mật & quyền riêng tư",
      description: "Tìm hiểu cách Votxt bảo vệ tệp, bản chép lời, liên kết chia sẻ và thanh toán của bạn.",
      sections: [
        ["Mã hóa dữ liệu", "Tệp media và bản chép lời được mã hóa khi lưu trữ, và quá trình truyền dùng kết nối HTTPS an toàn."],
        ["Quyền truy cập tài khoản", "Tệp luôn thuộc phạm vi tài khoản của bạn. Bản chép lời chỉ công khai khi bạn tạo liên kết chỉ đọc."],
        ["Thanh toán", "Stripe xử lý thanh toán. Votxt không lưu thông tin thẻ trên máy chủ của mình."],
        ["Xử lý AI", "Nhà cung cấp AI chỉ nhận media hoặc văn bản cần thiết cho tác vụ bạn yêu cầu. Chúng tôi không dùng dữ liệu để huấn luyện AI nếu không có đồng ý rõ ràng."]
      ]
    },
    affiliate: {
      eyebrow: "Tiếp thị liên kết",
      title: "Chương trình affiliate Votxt",
      description: "Kiếm 30% hoa hồng khi giới thiệu Votxt cho người cần chép lời audio và video, ghi chú AI và xuất tài liệu.",
      sections: [
        ["Cho đúng đối tượng", "Votxt giúp đội nhóm và cá nhân biến cuộc họp, phỏng vấn, bài giảng, podcast và video thành tài liệu hữu ích."],
        ["Tham gia chương trình", "Tạo tài khoản affiliate Rewardful và nhận liên kết giới thiệu Votxt riêng của bạn."],
        ["Chia sẻ Votxt", "Quảng bá chép lời, tóm tắt, sơ đồ tư duy, dịch, phụ đề và xuất tài liệu."],
        ["Kiếm hoa hồng", "Nhận 30% hoa hồng từ thanh toán của khách hàng được giới thiệu trong 12 tháng đầu."]
      ],
      stats: [["Hoa hồng", "30%", "Từ thanh toán của khách được giới thiệu"], ["Thời hạn", "12 tháng", "Cửa sổ hoa hồng cho mỗi khách"], ["Theo dõi", "Rewardful", "Liên kết, chuyển đổi, hoàn tiền và chi trả"]],
      ctaText: "Tạo tài khoản affiliate, lấy liên kết và bắt đầu chia sẻ Votxt với những người làm việc với audio và video.",
      join: "Tham gia chương trình",
      login: "Đăng nhập affiliate",
      faqTitle: "Sẵn sàng trở thành affiliate của Votxt?",
      faqs: [["Ai phù hợp?", "Nhà sáng tạo, nhà giáo dục, agency, thư mục công cụ và cộng đồng tiếp cận người làm việc với audio, video, cuộc họp, podcast, khóa học hoặc nghiên cứu."], ["Giới thiệu được theo dõi thế nào?", "Rewardful theo dõi khách truy cập qua liên kết của bạn và nối thanh toán Stripe đủ điều kiện với tài khoản."], ["Điều gì xảy ra sau hoàn tiền?", "Thanh toán hoàn tiền được điều chỉnh trong Rewardful trước khi chi trả hoa hồng."], ["Tôi có thể dùng link cho chính mình không?", "Không. Chương trình dành cho giới thiệu thật từ khán giả, khách hàng hoặc cộng đồng của bạn."]]
    }
  },
  zh: {
    security: {
      eyebrow: "安全",
      title: "安全与隐私",
      description: "了解 Votxt 如何保护你的文件、转写文本、分享链接和支付流程。",
      sections: [
        ["数据加密", "媒体文件和转写文本会在存储时加密，传输过程使用安全的 HTTPS 连接。"],
        ["账号访问", "文件默认归属你的账号。只有主动创建只读分享链接后，转写内容才会公开访问。"],
        ["支付安全", "支付由 Stripe 处理。Votxt 不会在自己的服务器上保存银行卡信息。"],
        ["AI 处理边界", "AI 服务商只接收完成当前任务所需的媒体或文本。未经明确同意，我们不会将你的数据用于 AI 训练。"]
      ]
    },
    affiliate: {
      eyebrow: "联盟计划",
      title: "Votxt 联盟计划",
      description: "把 Votxt 推荐给需要音视频转写、AI 笔记和导出工作流的人，并获得 30% 佣金。",
      sections: [
        ["适合相关受众", "Votxt 适合把会议、访谈、课程、播客和视频转成可用文档的团队和个人。"],
        ["加入计划", "创建 Rewardful 联盟账号，获取你的专属 Votxt 推荐链接。"],
        ["分享 Votxt", "推广转写、摘要、思维导图、翻译、字幕和文档导出工作流。"],
        ["赚取佣金", "在推荐客户前 12 个月的付款中获得 30% 佣金。"]
      ],
      stats: [["佣金", "30%", "基于推荐客户付款"], ["周期", "12 个月", "每位客户的佣金窗口"], ["追踪", "Rewardful", "推荐链接、转化、退款和付款追踪"]],
      ctaText: "创建你的联盟账号，获取链接，然后把 Votxt 分享给处理音频和视频的人。",
      join: "加入联盟计划",
      login: "联盟登录",
      faqTitle: "准备成为 Votxt 联盟伙伴？",
      faqs: [["谁适合加入？", "创作者、教育者、机构、工具目录和面向音频、视频、会议、播客、课程或研究人群的社区。"], ["推荐如何追踪？", "Rewardful 会通过你的推荐链接追踪访问者，并把符合条件的 Stripe 付款关联到你的账号。"], ["退款后会怎样？", "已退款付款会在 Rewardful 中调整，未支付佣金会相应减少。"], ["可以自己使用自己的链接吗？", "不可以。该计划用于来自你的受众、客户或社区的真实推荐。"]]
    }
  },
  "zh-TW": {
    security: {
      eyebrow: "安全",
      title: "安全與隱私",
      description: "了解 Votxt 如何保護你的檔案、轉寫文字、分享連結和付款流程。",
      sections: [
        ["資料加密", "媒體檔案和轉寫文字會在儲存時加密，傳輸過程使用安全的 HTTPS 連線。"],
        ["帳號存取", "檔案預設歸屬你的帳號。只有主動建立唯讀分享連結後，轉寫內容才會公開存取。"],
        ["付款安全", "付款由 Stripe 處理。Votxt 不會在自己的伺服器上保存信用卡資料。"],
        ["AI 處理邊界", "AI 服務商只接收完成目前任務所需的媒體或文字。未經明確同意，我們不會將你的資料用於 AI 訓練。"]
      ]
    },
    affiliate: {
      eyebrow: "聯盟計畫",
      title: "Votxt 聯盟計畫",
      description: "將 Votxt 推薦給需要音影片轉寫、AI 筆記與匯出流程的人，並獲得 30% 佣金。",
      sections: [
        ["適合相關受眾", "Votxt 適合把會議、訪談、課程、Podcast 和影片轉成可用文件的團隊與個人。"],
        ["加入計畫", "建立 Rewardful 聯盟帳號，取得你的專屬 Votxt 推薦連結。"],
        ["分享 Votxt", "推廣轉寫、摘要、心智圖、翻譯、字幕和文件匯出流程。"],
        ["賺取佣金", "在推薦客戶前 12 個月的付款中獲得 30% 佣金。"]
      ],
      stats: [["佣金", "30%", "依推薦客戶付款計算"], ["週期", "12 個月", "每位客戶的佣金期間"], ["追蹤", "Rewardful", "推薦連結、轉換、退款與付款追蹤"]],
      ctaText: "建立你的聯盟帳號，取得連結，然後把 Votxt 分享給處理音訊和影片的人。",
      join: "加入聯盟計畫",
      login: "聯盟登入",
      faqTitle: "準備成為 Votxt 聯盟夥伴？",
      faqs: [["誰適合加入？", "創作者、教育者、機構、工具目錄，以及面向音訊、影片、會議、Podcast、課程或研究人群的社群。"], ["推薦如何追蹤？", "Rewardful 會透過你的推薦連結追蹤訪客，並把符合條件的 Stripe 付款關聯到你的帳號。"], ["退款後會怎樣？", "已退款付款會在 Rewardful 中調整，未支付佣金會相應減少。"], ["可以自己使用自己的連結嗎？", "不可以。此計畫用於來自受眾、客戶或社群的真實推薦。"]]
    }
  }
};

export function getInfoPageCopy(locale: string, type: InfoType) {
  const normalizedLocale = isLocale(locale) ? locale : "en";
  return infoCopy[normalizedLocale][type];
}

export function InfoPage({type, locale}: {type: InfoType; locale: string}) {
  const normalizedLocale = isLocale(locale) ? locale : "en";
  const localeCopy = infoCopy[normalizedLocale];
  const copy = getInfoPageCopy(locale, type);
  const affiliate = localeCopy.affiliate;
  const Icon = type === "security" ? ShieldCheck : Handshake;

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <PageHero {...copy} />
      {type === "affiliate" ? (
        <section className="mx-auto max-w-5xl px-4 pt-12 md:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {affiliate.stats.map(([label, value, detail]) => (
              <article key={label} className="rounded-2xl border border-violet/15 bg-white p-6 shadow-soft">
                <p className="text-sm font-black uppercase tracking-wide text-ink/45">{label}</p>
                <p className="mt-2 text-3xl font-black text-violet">{value}</p>
                <p className="mt-2 text-sm leading-6 text-ink/65">{detail}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
      <section className="mx-auto grid max-w-5xl gap-4 px-4 py-12 md:px-8">
        {copy.sections.map(([heading, body]) => (
          <article key={heading} className="rounded-2xl border border-ink/10 bg-white/75 p-6 shadow-soft transition hover:border-ink/15">
            <h2 className="flex items-center gap-2 text-xl font-black text-ink"><Icon size={19} className="text-tide" />{heading}</h2>
            <p className="mt-3 text-sm leading-7 text-ink/70">{body}</p>
          </article>
        ))}
        {type === "affiliate" ? (
          <>
            <div className="rounded-2xl border border-violet/15 bg-lavender p-6">
              <BadgeCheck className="text-violet" size={24} />
              <p className="mt-3 text-sm font-bold leading-7 text-ink/70">{affiliate.ctaText}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href="https://votxt.getrewardful.com" className="btn-primary">{affiliate.join}</a>
                <a href="https://votxt.getrewardful.com/login" className="btn-outline">{affiliate.login}</a>
              </div>
            </div>
            <div className="mt-6">
              <h2 className="text-3xl font-black tracking-tight text-ink">{affiliate.faqTitle}</h2>
              <div className="mt-5 grid gap-3">
                {affiliate.faqs.map(([question, answer]) => (
                  <article key={question} className="rounded-xl border border-ink/10 bg-white p-5 shadow-soft">
                    <h3 className="font-black text-ink">{question}</h3>
                    <p className="mt-2 text-sm leading-6 text-ink/65">{answer}</p>
                  </article>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </section>
      <SiteFooter />
    </main>
  );
}
