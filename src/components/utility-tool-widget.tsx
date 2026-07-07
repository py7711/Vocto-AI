"use client";

import {useRef, useState} from "react";
import {useLocale} from "next-intl";
import {Download, FileAudio, FileUp, Loader2, ShieldCheck, X} from "lucide-react";
import lamejs from "lamejs";
import {isLocale, type Locale} from "@/lib/locales";

type UtilityKind = "wav-to-mp3-converter" | "video-to-audio-extractor";

type UtilityToolWidgetProps = {
  kind: UtilityKind;
  accept?: string;
  selectLabel?: string;
  actionLabel?: string;
};

type ResultFile = {
  name: string;
  url: string;
  mimeType: string;
  size: number;
};

type UtilityToolCopy = {
  selectFile: string;
  convert: string;
  dropFile: string;
  localProcessing: string;
  processing: string;
  clear: string;
  download: string;
  browserBased: string;
  wavOnlyError: string;
  videoOnlyError: string;
  videoDecodeError: string;
  captureUnsupported: string;
  noAudioTrack: string;
  extractionFailed: string;
};

const utilityToolCopyByLocale: Record<Locale, UtilityToolCopy> = {
  ar: {
    selectFile: "اختيار ملف",
    convert: "تحويل",
    dropFile: "أفلت ملفاً هنا",
    localProcessing: "تتم معالجة الملفات محلياً في متصفحك",
    processing: "جارٍ المعالجة...",
    clear: "مسح",
    download: "تنزيل",
    browserBased: "تحويل داخل المتصفح - لا تغادر ملفاتك جهازك",
    wavOnlyError: "يرجى اختيار ملف WAV.",
    videoOnlyError: "يرجى اختيار ملف فيديو.",
    videoDecodeError: "لا يستطيع المتصفح فك ترميز هذا الفيديو.",
    captureUnsupported: "هذا المتصفح لا يدعم استخراج صوت الفيديو محلياً.",
    noAudioTrack: "لم يتم العثور على مسار صوتي في هذا الفيديو.",
    extractionFailed: "فشل استخراج الصوت."
  },
  de: {
    selectFile: "Datei auswählen",
    convert: "Konvertieren",
    dropFile: "Datei hier ablegen",
    localProcessing: "Dateien werden lokal in deinem Browser verarbeitet",
    processing: "Wird verarbeitet...",
    clear: "Leeren",
    download: "Herunterladen",
    browserBased: "Browserbasierte Konvertierung - Dateien verlassen dein Gerät nicht",
    wavOnlyError: "Bitte eine WAV-Datei auswählen.",
    videoOnlyError: "Bitte eine Videodatei auswählen.",
    videoDecodeError: "Der Browser kann dieses Videoformat nicht dekodieren.",
    captureUnsupported: "Dieser Browser unterstützt lokale Audioextraktion aus Video nicht.",
    noAudioTrack: "In diesem Video wurde keine Audiospur gefunden.",
    extractionFailed: "Audioextraktion fehlgeschlagen."
  },
  en: {
    selectFile: "Select file",
    convert: "Convert",
    dropFile: "Drop a file here",
    localProcessing: "Files are processed locally in your browser",
    processing: "Processing...",
    clear: "Clear",
    download: "Download",
    browserBased: "Browser-based conversion - files never leave your device",
    wavOnlyError: "Please choose a WAV file.",
    videoOnlyError: "Please choose a video file.",
    videoDecodeError: "The browser could not decode this video format.",
    captureUnsupported: "This browser does not support local video audio extraction.",
    noAudioTrack: "No audio track was found in this video.",
    extractionFailed: "Audio extraction failed."
  },
  es: {
    selectFile: "Seleccionar archivo",
    convert: "Convertir",
    dropFile: "Suelta un archivo aquí",
    localProcessing: "Los archivos se procesan localmente en tu navegador",
    processing: "Procesando...",
    clear: "Limpiar",
    download: "Descargar",
    browserBased: "Conversión en navegador - los archivos no salen de tu dispositivo",
    wavOnlyError: "Elige un archivo WAV.",
    videoOnlyError: "Elige un archivo de video.",
    videoDecodeError: "El navegador no pudo decodificar este formato de video.",
    captureUnsupported: "Este navegador no admite extracción local de audio de video.",
    noAudioTrack: "No se encontró pista de audio en este video.",
    extractionFailed: "La extracción de audio falló."
  },
  fr: {
    selectFile: "Choisir un fichier",
    convert: "Convertir",
    dropFile: "Déposez un fichier ici",
    localProcessing: "Les fichiers sont traités localement dans votre navigateur",
    processing: "Traitement...",
    clear: "Effacer",
    download: "Télécharger",
    browserBased: "Conversion dans le navigateur - vos fichiers ne quittent pas l'appareil",
    wavOnlyError: "Veuillez choisir un fichier WAV.",
    videoOnlyError: "Veuillez choisir un fichier vidéo.",
    videoDecodeError: "Le navigateur n'a pas pu décoder ce format vidéo.",
    captureUnsupported: "Ce navigateur ne prend pas en charge l'extraction audio locale.",
    noAudioTrack: "Aucune piste audio trouvée dans cette vidéo.",
    extractionFailed: "L'extraction audio a échoué."
  },
  hu: {
    selectFile: "Fájl kiválasztása",
    convert: "Konvertálás",
    dropFile: "Húzz ide egy fájlt",
    localProcessing: "A fájlok helyben, a böngésződben készülnek",
    processing: "Feldolgozás...",
    clear: "Törlés",
    download: "Letöltés",
    browserBased: "Böngészőalapú konvertálás - a fájlok nem hagyják el az eszközt",
    wavOnlyError: "Válassz WAV fájlt.",
    videoOnlyError: "Válassz videófájlt.",
    videoDecodeError: "A böngésző nem tudta dekódolni ezt a videóformátumot.",
    captureUnsupported: "Ez a böngésző nem támogatja a helyi videóhang-kinyerést.",
    noAudioTrack: "Ebben a videóban nem található hangsáv.",
    extractionFailed: "A hang kinyerése sikertelen."
  },
  id: {
    selectFile: "Pilih file",
    convert: "Konversi",
    dropFile: "Jatuhkan file di sini",
    localProcessing: "File diproses secara lokal di browser Anda",
    processing: "Memproses...",
    clear: "Bersihkan",
    download: "Unduh",
    browserBased: "Konversi berbasis browser - file tidak meninggalkan perangkat Anda",
    wavOnlyError: "Pilih file WAV.",
    videoOnlyError: "Pilih file video.",
    videoDecodeError: "Browser tidak dapat membaca format video ini.",
    captureUnsupported: "Browser ini tidak mendukung ekstraksi audio video lokal.",
    noAudioTrack: "Tidak ada trek audio dalam video ini.",
    extractionFailed: "Ekstraksi audio gagal."
  },
  it: {
    selectFile: "Seleziona file",
    convert: "Converti",
    dropFile: "Trascina un file qui",
    localProcessing: "I file vengono elaborati localmente nel browser",
    processing: "Elaborazione...",
    clear: "Cancella",
    download: "Scarica",
    browserBased: "Conversione nel browser - i file non lasciano il dispositivo",
    wavOnlyError: "Scegli un file WAV.",
    videoOnlyError: "Scegli un file video.",
    videoDecodeError: "Il browser non può decodificare questo formato video.",
    captureUnsupported: "Questo browser non supporta l'estrazione audio locale.",
    noAudioTrack: "Nessuna traccia audio trovata in questo video.",
    extractionFailed: "Estrazione audio non riuscita."
  },
  ja: {
    selectFile: "ファイルを選択",
    convert: "変換",
    dropFile: "ここにファイルをドロップ",
    localProcessing: "ファイルはブラウザ内でローカル処理されます",
    processing: "処理中...",
    clear: "クリア",
    download: "ダウンロード",
    browserBased: "ブラウザ内変換 - ファイルはデバイス外へ送信されません",
    wavOnlyError: "WAV ファイルを選択してください。",
    videoOnlyError: "動画ファイルを選択してください。",
    videoDecodeError: "ブラウザがこの動画形式をデコードできませんでした。",
    captureUnsupported: "このブラウザはローカルでの動画音声抽出に対応していません。",
    noAudioTrack: "この動画に音声トラックが見つかりません。",
    extractionFailed: "音声抽出に失敗しました。"
  },
  ko: {
    selectFile: "파일 선택",
    convert: "변환",
    dropFile: "여기에 파일을 놓으세요",
    localProcessing: "파일은 브라우저에서 로컬로 처리됩니다",
    processing: "처리 중...",
    clear: "지우기",
    download: "다운로드",
    browserBased: "브라우저 기반 변환 - 파일은 기기를 떠나지 않습니다",
    wavOnlyError: "WAV 파일을 선택하세요.",
    videoOnlyError: "비디오 파일을 선택하세요.",
    videoDecodeError: "브라우저가 이 비디오 형식을 디코딩할 수 없습니다.",
    captureUnsupported: "이 브라우저는 로컬 비디오 오디오 추출을 지원하지 않습니다.",
    noAudioTrack: "이 비디오에서 오디오 트랙을 찾을 수 없습니다.",
    extractionFailed: "오디오 추출에 실패했습니다."
  },
  nl: {
    selectFile: "Bestand kiezen",
    convert: "Converteren",
    dropFile: "Sleep hier een bestand",
    localProcessing: "Bestanden worden lokaal in je browser verwerkt",
    processing: "Verwerken...",
    clear: "Wissen",
    download: "Downloaden",
    browserBased: "Browserconversie - bestanden verlaten je apparaat niet",
    wavOnlyError: "Kies een WAV-bestand.",
    videoOnlyError: "Kies een videobestand.",
    videoDecodeError: "De browser kon dit videoformaat niet decoderen.",
    captureUnsupported: "Deze browser ondersteunt geen lokale audio-extractie uit video.",
    noAudioTrack: "Er is geen audiotrack gevonden in deze video.",
    extractionFailed: "Audio-extractie mislukt."
  },
  pl: {
    selectFile: "Wybierz plik",
    convert: "Konwertuj",
    dropFile: "Upuść plik tutaj",
    localProcessing: "Pliki są przetwarzane lokalnie w przeglądarce",
    processing: "Przetwarzanie...",
    clear: "Wyczyść",
    download: "Pobierz",
    browserBased: "Konwersja w przeglądarce - pliki nie opuszczają urządzenia",
    wavOnlyError: "Wybierz plik WAV.",
    videoOnlyError: "Wybierz plik wideo.",
    videoDecodeError: "Przeglądarka nie mogła odczytać tego formatu wideo.",
    captureUnsupported: "Ta przeglądarka nie obsługuje lokalnego wyodrębniania audio.",
    noAudioTrack: "W tym filmie nie znaleziono ścieżki audio.",
    extractionFailed: "Wyodrębnianie audio nie powiodło się."
  },
  pt: {
    selectFile: "Selecionar arquivo",
    convert: "Converter",
    dropFile: "Solte um arquivo aqui",
    localProcessing: "Os arquivos são processados localmente no navegador",
    processing: "Processando...",
    clear: "Limpar",
    download: "Baixar",
    browserBased: "Conversão no navegador - os arquivos não saem do seu dispositivo",
    wavOnlyError: "Escolha um arquivo WAV.",
    videoOnlyError: "Escolha um arquivo de vídeo.",
    videoDecodeError: "O navegador não conseguiu decodificar este formato de vídeo.",
    captureUnsupported: "Este navegador não oferece extração local de áudio de vídeo.",
    noAudioTrack: "Nenhuma faixa de áudio foi encontrada neste vídeo.",
    extractionFailed: "Falha ao extrair o áudio."
  },
  ru: {
    selectFile: "Выбрать файл",
    convert: "Конвертировать",
    dropFile: "Перетащите файл сюда",
    localProcessing: "Файлы обрабатываются локально в браузере",
    processing: "Обработка...",
    clear: "Очистить",
    download: "Скачать",
    browserBased: "Конвертация в браузере - файлы не покидают устройство",
    wavOnlyError: "Выберите файл WAV.",
    videoOnlyError: "Выберите видеофайл.",
    videoDecodeError: "Браузер не смог декодировать этот формат видео.",
    captureUnsupported: "Этот браузер не поддерживает локальное извлечение аудио из видео.",
    noAudioTrack: "В этом видео не найдена аудиодорожка.",
    extractionFailed: "Не удалось извлечь аудио."
  },
  th: {
    selectFile: "เลือกไฟล์",
    convert: "แปลง",
    dropFile: "วางไฟล์ที่นี่",
    localProcessing: "ไฟล์จะถูกประมวลผลในเบราว์เซอร์ของคุณ",
    processing: "กำลังประมวลผล...",
    clear: "ล้าง",
    download: "ดาวน์โหลด",
    browserBased: "แปลงในเบราว์เซอร์ - ไฟล์ไม่ออกจากอุปกรณ์ของคุณ",
    wavOnlyError: "โปรดเลือกไฟล์ WAV",
    videoOnlyError: "โปรดเลือกไฟล์วิดีโอ",
    videoDecodeError: "เบราว์เซอร์ไม่สามารถถอดรหัสรูปแบบวิดีโอนี้ได้",
    captureUnsupported: "เบราว์เซอร์นี้ไม่รองรับการแยกเสียงวิดีโอภายในเครื่อง",
    noAudioTrack: "ไม่พบแทร็กเสียงในวิดีโอนี้",
    extractionFailed: "แยกเสียงไม่สำเร็จ"
  },
  tr: {
    selectFile: "Dosya seç",
    convert: "Dönüştür",
    dropFile: "Dosyayı buraya bırak",
    localProcessing: "Dosyalar tarayıcında yerel olarak işlenir",
    processing: "İşleniyor...",
    clear: "Temizle",
    download: "İndir",
    browserBased: "Tarayıcıda dönüştürme - dosyalar cihazından ayrılmaz",
    wavOnlyError: "Lütfen bir WAV dosyası seç.",
    videoOnlyError: "Lütfen bir video dosyası seç.",
    videoDecodeError: "Tarayıcı bu video biçimini çözemedi.",
    captureUnsupported: "Bu tarayıcı yerel video sesi çıkarma işlemini desteklemiyor.",
    noAudioTrack: "Bu videoda ses parçası bulunamadı.",
    extractionFailed: "Ses çıkarma başarısız oldu."
  },
  uk: {
    selectFile: "Вибрати файл",
    convert: "Конвертувати",
    dropFile: "Перетягніть файл сюди",
    localProcessing: "Файли обробляються локально в браузері",
    processing: "Обробка...",
    clear: "Очистити",
    download: "Завантажити",
    browserBased: "Конвертація в браузері - файли не залишають пристрій",
    wavOnlyError: "Виберіть файл WAV.",
    videoOnlyError: "Виберіть відеофайл.",
    videoDecodeError: "Браузер не зміг декодувати цей формат відео.",
    captureUnsupported: "Цей браузер не підтримує локальне витягування аудіо з відео.",
    noAudioTrack: "У цьому відео не знайдено аудіодоріжку.",
    extractionFailed: "Не вдалося витягнути аудіо."
  },
  vi: {
    selectFile: "Chọn tệp",
    convert: "Chuyển đổi",
    dropFile: "Thả tệp vào đây",
    localProcessing: "Tệp được xử lý cục bộ trong trình duyệt",
    processing: "Đang xử lý...",
    clear: "Xóa",
    download: "Tải xuống",
    browserBased: "Chuyển đổi trong trình duyệt - tệp không rời khỏi thiết bị",
    wavOnlyError: "Vui lòng chọn tệp WAV.",
    videoOnlyError: "Vui lòng chọn tệp video.",
    videoDecodeError: "Trình duyệt không thể giải mã định dạng video này.",
    captureUnsupported: "Trình duyệt này không hỗ trợ tách âm thanh video cục bộ.",
    noAudioTrack: "Không tìm thấy track âm thanh trong video này.",
    extractionFailed: "Tách âm thanh thất bại."
  },
  zh: {
    selectFile: "选择文件",
    convert: "转换",
    dropFile: "将文件拖到这里",
    localProcessing: "文件会在你的浏览器中本地处理",
    processing: "处理中...",
    clear: "清除",
    download: "下载",
    browserBased: "浏览器内转换 - 文件不会离开你的设备",
    wavOnlyError: "请选择 WAV 文件。",
    videoOnlyError: "请选择视频文件。",
    videoDecodeError: "浏览器无法解码这个视频格式。",
    captureUnsupported: "当前浏览器不支持本地提取视频音频。",
    noAudioTrack: "这个视频中没有找到音轨。",
    extractionFailed: "音频提取失败。"
  },
  "zh-TW": {
    selectFile: "選擇檔案",
    convert: "轉換",
    dropFile: "將檔案拖到這裡",
    localProcessing: "檔案會在你的瀏覽器中本機處理",
    processing: "處理中...",
    clear: "清除",
    download: "下載",
    browserBased: "瀏覽器內轉換 - 檔案不會離開你的裝置",
    wavOnlyError: "請選擇 WAV 檔案。",
    videoOnlyError: "請選擇影片檔案。",
    videoDecodeError: "瀏覽器無法解碼此影片格式。",
    captureUnsupported: "目前瀏覽器不支援本機提取影片音訊。",
    noAudioTrack: "此影片中找不到音軌。",
    extractionFailed: "音訊提取失敗。"
  }
};

function readableSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function stem(name: string) {
  return name.replace(/\.[^.]+$/, "") || "uniscribe-export";
}

function toInt16Samples(channel: Float32Array) {
  const samples = new Int16Array(channel.length);
  for (let index = 0; index < channel.length; index += 1) {
    const value = Math.max(-1, Math.min(1, channel[index] ?? 0));
    samples[index] = value < 0 ? value * 0x8000 : value * 0x7fff;
  }
  return samples;
}

function downmixAndResample(audioBuffer: AudioBuffer, targetRate = 16000) {
  const ratio = audioBuffer.sampleRate / targetRate;
  const length = Math.max(1, Math.floor(audioBuffer.duration * targetRate));
  const output = new Float32Array(length);

  for (let channelIndex = 0; channelIndex < audioBuffer.numberOfChannels; channelIndex += 1) {
    const channel = audioBuffer.getChannelData(channelIndex);
    for (let index = 0; index < length; index += 1) {
      const sourceIndex = Math.min(channel.length - 1, Math.floor(index * ratio));
      output[index] += (channel[sourceIndex] ?? 0) / audioBuffer.numberOfChannels;
    }
  }

  return {samples: toInt16Samples(output), sampleRate: targetRate};
}

function encodeMp3(samples: Int16Array, sampleRate: number) {
  const encoder = new lamejs.Mp3Encoder(1, sampleRate, 64);
  const chunks: ArrayBuffer[] = [];
  const blockSize = 1152;
  const toArrayBuffer = (chunk: Int8Array) => {
    const buffer = new ArrayBuffer(chunk.length);
    new Uint8Array(buffer).set(chunk);
    return buffer;
  };

  for (let offset = 0; offset < samples.length; offset += blockSize) {
    const encoded = encoder.encodeBuffer(samples.subarray(offset, offset + blockSize));
    if (encoded.length) chunks.push(toArrayBuffer(encoded));
  }

  const tail = encoder.flush();
  if (tail.length) chunks.push(toArrayBuffer(tail));
  return new Blob(chunks, {type: "audio/mpeg"});
}

function getUtilityToolCopy(locale: string) {
  return utilityToolCopyByLocale[isLocale(locale) ? locale : "en"];
}

async function convertWavToMp3(file: File, copy: UtilityToolCopy) {
  if (!file.name.toLowerCase().endsWith(".wav") && file.type !== "audio/wav" && file.type !== "audio/x-wav") {
    throw new Error(copy.wavOnlyError);
  }

  const audioContext = new AudioContext();
  try {
    const audioBuffer = await audioContext.decodeAudioData(await file.arrayBuffer());
    const compact = downmixAndResample(audioBuffer);
    const blob = encodeMp3(compact.samples, compact.sampleRate);
    return {
      name: `${stem(file.name)}-speech.mp3`,
      url: URL.createObjectURL(blob),
      mimeType: blob.type,
      size: blob.size
    };
  } finally {
    await audioContext.close().catch(() => undefined);
  }
}

async function extractAudioFromVideo(file: File, copy: UtilityToolCopy) {
  if (!file.type.startsWith("video/")) {
    throw new Error(copy.videoOnlyError);
  }

  const sourceUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.src = sourceUrl;
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error(copy.videoDecodeError));
    });

    const captureStream = (video as HTMLVideoElement & {captureStream?: () => MediaStream; mozCaptureStream?: () => MediaStream}).captureStream
      ?? (video as HTMLVideoElement & {mozCaptureStream?: () => MediaStream}).mozCaptureStream;
    if (!captureStream) throw new Error(copy.captureUnsupported);

    const stream = captureStream.call(video);
    const audioTracks = stream.getAudioTracks();
    if (!audioTracks.length) throw new Error(copy.noAudioTrack);
    const audioStream = new MediaStream(audioTracks);
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
    const recorder = new MediaRecorder(audioStream, {mimeType});
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };

    const stopped = new Promise<void>((resolve, reject) => {
      recorder.onstop = () => resolve();
      recorder.onerror = () => reject(new Error(copy.extractionFailed));
    });

    recorder.start();
    await video.play();
    await new Promise<void>((resolve) => {
      video.onended = () => resolve();
    });
    if (recorder.state !== "inactive") recorder.stop();
    await stopped;
    audioTracks.forEach((track) => track.stop());

    const blob = new Blob(chunks, {type: mimeType});
    return {
      name: `${stem(file.name)}.webm`,
      url: URL.createObjectURL(blob),
      mimeType: "audio/webm",
      size: blob.size
    };
  } finally {
    video.pause();
    URL.revokeObjectURL(sourceUrl);
  }
}

export function UtilityToolWidget({kind, accept, selectLabel, actionLabel}: UtilityToolWidgetProps) {
  const copy = getUtilityToolCopy(useLocale());
  const resolvedSelectLabel = selectLabel ?? copy.selectFile;
  const resolvedActionLabel = actionLabel ?? copy.convert;
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ResultFile | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function clearResult() {
    if (result?.url) URL.revokeObjectURL(result.url);
    setResult(null);
  }

  async function runConversion() {
    if (!file) return;
    clearResult();
    setBusy(true);
    setError(null);
    try {
      const nextResult = kind === "wav-to-mp3-converter" ? await convertWavToMp3(file, copy) : await extractAudioFromVideo(file, copy);
      setResult(nextResult);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full rounded-xl border border-ink/10 bg-white p-5 shadow-lifted">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          clearResult();
          setError(null);
          setFile(event.target.files?.[0] ?? null);
        }}
      />
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          clearResult();
          setError(null);
          setFile(event.dataTransfer.files[0] ?? null);
        }}
        className="grid min-h-48 place-items-center rounded-xl border-2 border-dashed border-violet/25 bg-paper/50 px-4 py-8 text-center"
      >
        <div>
          <FileAudio className="mx-auto text-violet" size={36} />
          <p className="mt-3 text-lg font-black text-ink">{file?.name ?? copy.dropFile}</p>
          <p className="mt-1 text-sm font-bold text-ink/50">{file ? readableSize(file.size) : copy.localProcessing}</p>
          <button type="button" onClick={() => inputRef.current?.click()} className="btn-primary mt-5">
            <FileUp size={18} />
            {resolvedSelectLabel}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={runConversion} disabled={!file || busy} className="btn-outline">
          {busy ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
          {busy ? copy.processing : resolvedActionLabel}
        </button>
        {file ? (
          <button
            type="button"
            onClick={() => {
              clearResult();
              setFile(null);
              setError(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="btn-ghost"
          >
            <X size={16} />
            {copy.clear}
          </button>
        ) : null}
      </div>

      {result ? (
        <div className="mt-4 rounded-lg border border-sage/20 bg-sage/10 p-4 text-left">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-black text-ink">{result.name}</p>
              <p className="mt-1 text-sm font-bold text-ink/55">{result.mimeType} · {readableSize(result.size)}</p>
            </div>
            <a href={result.url} download={result.name} className="btn-primary">
              <Download size={17} />
              {copy.download}
            </a>
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-4 rounded-lg border border-coral/25 bg-coral/10 px-3 py-2 text-sm font-bold text-coral">{error}</p> : null}
      <p className="mt-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wide text-ink/45">
        <ShieldCheck size={15} />
        {copy.browserBased}
      </p>
    </div>
  );
}
