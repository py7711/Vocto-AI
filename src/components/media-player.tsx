"use client";

import {Pause, Play, RotateCcw, RotateCw, Volume2, VolumeX} from "lucide-react";
import {useLocale} from "next-intl";
import type {ReactNode, RefObject} from "react";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {isLocale, type Locale} from "@/lib/locales";

type MediaInfo = {
  url: string;
  fileName?: string | null;
  sourceType?: string | null;
  storedObject?: boolean;
};

type MediaPlayerProps = {
  endpoint: string;
  initialMedia?: MediaInfo | null;
  durationSeconds?: number | null;
  seekSignal?: {time: number; nonce: number} | null;
  seekEventId?: string;
  label?: string;
  chrome?: "card" | "bar";
};

type MediaPlayerCopy = {
  defaultLabel: string;
  loading: string;
  loadError: string;
  playError: string;
  unavailable: string;
  play: (label: string) => string;
  pause: (label: string) => string;
  seek: string;
  skipBack: string;
  skipForward: string;
  mute: string;
  unmute: string;
  volume: string;
};

const mediaPlayerCopy: Record<Locale, MediaPlayerCopy> = {
  ar: {defaultLabel: "الوسائط الأصلية", loading: "جارٍ تحميل الوسائط...", loadError: "تعذر تحميل الوسائط الأصلية.", playError: "تعذر تشغيل الوسائط.", unavailable: "الوسائط الأصلية غير متاحة.", play: (label) => `تشغيل ${label}`, pause: (label) => `إيقاف ${label}`, seek: "التنقل في الوسائط", skipBack: "الرجوع 15 ثانية", skipForward: "التقدم 15 ثانية", mute: "كتم الوسائط", unmute: "إلغاء كتم الوسائط", volume: "مستوى الصوت"},
  de: {defaultLabel: "Originalmedium", loading: "Medien werden geladen...", loadError: "Originalmedium konnte nicht geladen werden.", playError: "Medium konnte nicht abgespielt werden.", unavailable: "Originalmedium ist nicht verfügbar.", play: (label) => `${label} abspielen`, pause: (label) => `${label} pausieren`, seek: "Medium durchsuchen", skipBack: "15 Sekunden zurück", skipForward: "15 Sekunden vor", mute: "Medium stummschalten", unmute: "Stummschaltung aufheben", volume: "Lautstärke"},
  en: {defaultLabel: "Original media", loading: "Loading media...", loadError: "Original media could not be loaded.", playError: "Unable to play media.", unavailable: "Original media is unavailable.", play: (label) => `Play ${label}`, pause: (label) => `Pause ${label}`, seek: "Seek media", skipBack: "Skip back 15 seconds", skipForward: "Skip forward 15 seconds", mute: "Mute media", unmute: "Unmute media", volume: "Volume"},
  es: {defaultLabel: "Medio original", loading: "Cargando medio...", loadError: "No se pudo cargar el medio original.", playError: "No se pudo reproducir el medio.", unavailable: "El medio original no está disponible.", play: (label) => `Reproducir ${label}`, pause: (label) => `Pausar ${label}`, seek: "Buscar en el medio", skipBack: "Retroceder 15 segundos", skipForward: "Avanzar 15 segundos", mute: "Silenciar medio", unmute: "Activar sonido", volume: "Volumen"},
  fr: {defaultLabel: "Média d'origine", loading: "Chargement du média...", loadError: "Impossible de charger le média d'origine.", playError: "Impossible de lire le média.", unavailable: "Le média d'origine est indisponible.", play: (label) => `Lire ${label}`, pause: (label) => `Mettre ${label} en pause`, seek: "Parcourir le média", skipBack: "Reculer de 15 secondes", skipForward: "Avancer de 15 secondes", mute: "Couper le son", unmute: "Rétablir le son", volume: "Volume"},
  hu: {defaultLabel: "Eredeti média", loading: "Média betöltése...", loadError: "Az eredeti média nem tölthető be.", playError: "A média nem játszható le.", unavailable: "Az eredeti média nem érhető el.", play: (label) => `${label} lejátszása`, pause: (label) => `${label} szüneteltetése`, seek: "Média keresése", skipBack: "15 másodperc vissza", skipForward: "15 másodperc előre", mute: "Média némítása", unmute: "Némítás feloldása", volume: "Hangerő"},
  id: {defaultLabel: "Media asli", loading: "Memuat media...", loadError: "Media asli tidak dapat dimuat.", playError: "Tidak dapat memutar media.", unavailable: "Media asli tidak tersedia.", play: (label) => `Putar ${label}`, pause: (label) => `Jeda ${label}`, seek: "Cari posisi media", skipBack: "Mundur 15 detik", skipForward: "Maju 15 detik", mute: "Bisukan media", unmute: "Nyalakan suara media", volume: "Volume"},
  it: {defaultLabel: "Media originale", loading: "Caricamento media...", loadError: "Impossibile caricare il media originale.", playError: "Impossibile riprodurre il media.", unavailable: "Il media originale non è disponibile.", play: (label) => `Riproduci ${label}`, pause: (label) => `Metti in pausa ${label}`, seek: "Scorri il media", skipBack: "Indietro di 15 secondi", skipForward: "Avanti di 15 secondi", mute: "Disattiva audio", unmute: "Riattiva audio", volume: "Volume"},
  ja: {defaultLabel: "元のメディア", loading: "メディアを読み込み中...", loadError: "元のメディアを読み込めません。", playError: "メディアを再生できません。", unavailable: "元のメディアは利用できません。", play: (label) => `${label} を再生`, pause: (label) => `${label} を一時停止`, seek: "メディアをシーク", skipBack: "15 秒戻る", skipForward: "15 秒進む", mute: "ミュート", unmute: "ミュート解除", volume: "音量"},
  ko: {defaultLabel: "원본 미디어", loading: "미디어 로드 중...", loadError: "원본 미디어를 불러올 수 없습니다.", playError: "미디어를 재생할 수 없습니다.", unavailable: "원본 미디어를 사용할 수 없습니다.", play: (label) => `${label} 재생`, pause: (label) => `${label} 일시정지`, seek: "미디어 탐색", skipBack: "15초 뒤로", skipForward: "15초 앞으로", mute: "미디어 음소거", unmute: "음소거 해제", volume: "볼륨"},
  nl: {defaultLabel: "Originele media", loading: "Media laden...", loadError: "Originele media kon niet worden geladen.", playError: "Media kan niet worden afgespeeld.", unavailable: "Originele media is niet beschikbaar.", play: (label) => `${label} afspelen`, pause: (label) => `${label} pauzeren`, seek: "Media zoeken", skipBack: "15 seconden terug", skipForward: "15 seconden vooruit", mute: "Media dempen", unmute: "Dempen opheffen", volume: "Volume"},
  pl: {defaultLabel: "Oryginalne media", loading: "Ładowanie mediów...", loadError: "Nie można wczytać oryginalnych mediów.", playError: "Nie można odtworzyć mediów.", unavailable: "Oryginalne media są niedostępne.", play: (label) => `Odtwórz ${label}`, pause: (label) => `Wstrzymaj ${label}`, seek: "Przewiń media", skipBack: "Cofnij o 15 sekund", skipForward: "Przewiń o 15 sekund", mute: "Wycisz media", unmute: "Włącz dźwięk", volume: "Głośność"},
  pt: {defaultLabel: "Mídia original", loading: "Carregando mídia...", loadError: "Não foi possível carregar a mídia original.", playError: "Não foi possível reproduzir a mídia.", unavailable: "A mídia original está indisponível.", play: (label) => `Reproduzir ${label}`, pause: (label) => `Pausar ${label}`, seek: "Navegar na mídia", skipBack: "Voltar 15 segundos", skipForward: "Avançar 15 segundos", mute: "Silenciar mídia", unmute: "Ativar som da mídia", volume: "Volume"},
  ru: {defaultLabel: "Исходный медиафайл", loading: "Загрузка медиа...", loadError: "Не удалось загрузить исходный медиафайл.", playError: "Не удалось воспроизвести медиа.", unavailable: "Исходный медиафайл недоступен.", play: (label) => `Воспроизвести ${label}`, pause: (label) => `Пауза ${label}`, seek: "Перемотка медиа", skipBack: "Назад на 15 секунд", skipForward: "Вперед на 15 секунд", mute: "Отключить звук", unmute: "Включить звук", volume: "Громкость"},
  th: {defaultLabel: "สื่อต้นฉบับ", loading: "กำลังโหลดสื่อ...", loadError: "ไม่สามารถโหลดสื่อต้นฉบับได้", playError: "ไม่สามารถเล่นสื่อได้", unavailable: "สื่อต้นฉบับไม่พร้อมใช้งาน", play: (label) => `เล่น ${label}`, pause: (label) => `หยุด ${label} ชั่วคราว`, seek: "เลื่อนตำแหน่งสื่อ", skipBack: "ย้อนกลับ 15 วินาที", skipForward: "ไปข้างหน้า 15 วินาที", mute: "ปิดเสียงสื่อ", unmute: "เปิดเสียงสื่อ", volume: "ระดับเสียง"},
  tr: {defaultLabel: "Orijinal medya", loading: "Medya yükleniyor...", loadError: "Orijinal medya yüklenemedi.", playError: "Medya oynatılamadı.", unavailable: "Orijinal medya kullanılamıyor.", play: (label) => `${label} oynat`, pause: (label) => `${label} duraklat`, seek: "Medyada ara", skipBack: "15 saniye geri", skipForward: "15 saniye ileri", mute: "Medyayı sessize al", unmute: "Sesi aç", volume: "Ses"},
  uk: {defaultLabel: "Оригінальний медіафайл", loading: "Завантаження медіа...", loadError: "Не вдалося завантажити оригінальний медіафайл.", playError: "Не вдалося відтворити медіа.", unavailable: "Оригінальний медіафайл недоступний.", play: (label) => `Відтворити ${label}`, pause: (label) => `Призупинити ${label}`, seek: "Прокрутити медіа", skipBack: "Назад на 15 секунд", skipForward: "Вперед на 15 секунд", mute: "Вимкнути звук", unmute: "Увімкнути звук", volume: "Гучність"},
  vi: {defaultLabel: "Phương tiện gốc", loading: "Đang tải phương tiện...", loadError: "Không thể tải phương tiện gốc.", playError: "Không thể phát phương tiện.", unavailable: "Phương tiện gốc không khả dụng.", play: (label) => `Phát ${label}`, pause: (label) => `Tạm dừng ${label}`, seek: "Tua phương tiện", skipBack: "Lùi 15 giây", skipForward: "Tiến 15 giây", mute: "Tắt tiếng phương tiện", unmute: "Bật tiếng phương tiện", volume: "Âm lượng"},
  zh: {defaultLabel: "原始媒体", loading: "正在加载媒体...", loadError: "无法加载原始媒体。", playError: "无法播放媒体。", unavailable: "原始媒体不可用。", play: (label) => `播放${label}`, pause: (label) => `暂停${label}`, seek: "定位媒体", skipBack: "后退 15 秒", skipForward: "前进 15 秒", mute: "静音媒体", unmute: "取消静音媒体", volume: "音量"},
  "zh-TW": {defaultLabel: "原始媒體", loading: "正在載入媒體...", loadError: "無法載入原始媒體。", playError: "無法播放媒體。", unavailable: "原始媒體不可用。", play: (label) => `播放${label}`, pause: (label) => `暫停${label}`, seek: "定位媒體", skipBack: "後退 15 秒", skipForward: "前進 15 秒", mute: "靜音媒體", unmute: "取消靜音媒體", volume: "音量"}
};

function formatClock(value: number | null | undefined) {
  if (!Number.isFinite(value ?? NaN) || !value || value < 0) return "00:00";
  const totalSeconds = Math.floor(value);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function durationFromMetadata(element: HTMLMediaElement) {
  return Number.isFinite(element.duration) && element.duration > 0 ? element.duration : 0;
}

function isVideoSource(media: MediaInfo | null) {
  const value = `${media?.fileName ?? ""} ${media?.url ?? ""}`.toLowerCase();
  return /\.(mp4|mov|m4v|webm|mkv|avi|wmv)(\?|#|$)/.test(value);
}

export function MediaPlayer({endpoint, initialMedia = null, durationSeconds, seekSignal, seekEventId, label, chrome = "card"}: MediaPlayerProps) {
  const locale = useLocale();
  const copy = mediaPlayerCopy[isLocale(locale) ? locale : "en"];
  const playerLabel = label ?? copy.defaultLabel;
  const mediaRef = useRef<HTMLMediaElement | null>(null);
  const [media, setMedia] = useState<MediaInfo | null>(initialMedia);
  const [loading, setLoading] = useState(!initialMedia);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSeconds ?? 0);
  const [volume, setVolume] = useState(1);

  const progress = useMemo(() => {
    if (!duration) return 0;
    return Math.min(100, Math.max(0, (currentTime / duration) * 100));
  }, [currentTime, duration]);

  useEffect(() => {
    let alive = true;
    if (initialMedia) {
      setMedia(initialMedia);
      setLoading(false);
    } else {
      setLoading(true);
      setMedia(null);
    }
    setError(null);
    fetch(endpoint, {cache: "no-store"})
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? copy.unavailable);
        return body as MediaInfo;
      })
      .then((nextMedia) => {
        if (!alive) return;
        setMedia(nextMedia);
      })
      .catch((cause) => {
        if (!alive) return;
        setError(cause instanceof Error ? cause.message : String(cause));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [endpoint, initialMedia]);

  useEffect(() => {
    setDuration((previous) => previous || durationSeconds || 0);
  }, [durationSeconds]);

  useEffect(() => {
    const element = mediaRef.current;
    if (!element || !seekSignal) return;
    const target = Math.max(0, seekSignal.time);
    if (Number.isFinite(element.duration)) {
      element.currentTime = Math.min(target, element.duration);
    } else {
      element.currentTime = target;
    }
    setCurrentTime(element.currentTime);
    element.play().catch(() => undefined);
  }, [seekSignal]);

  useEffect(() => {
    if (!seekEventId) return;
    function handleSeek(event: Event) {
      const detail = (event as CustomEvent<{id?: string; time?: number}>).detail;
      if (detail?.id !== seekEventId || typeof detail.time !== "number") return;
      const element = mediaRef.current;
      if (!element) return;
      const target = Math.max(0, detail.time);
      element.currentTime = Number.isFinite(element.duration) ? Math.min(target, element.duration) : target;
      setCurrentTime(element.currentTime);
      element.play().catch(() => undefined);
    }
    window.addEventListener("media-player:seek", handleSeek);
    return () => window.removeEventListener("media-player:seek", handleSeek);
  }, [seekEventId]);

  const togglePlayback = useCallback(() => {
    const element = mediaRef.current;
    if (!element || !media) return;
    if (element.paused) {
      element.play().catch((cause) => setError(cause instanceof Error ? cause.message : copy.playError));
    } else {
      element.pause();
    }
  }, [copy.playError, media]);

  const updateSeek = useCallback((value: string) => {
    const nextTime = Number(value);
    const element = mediaRef.current;
    if (!element || !Number.isFinite(nextTime)) return;
    element.currentTime = nextTime;
    setCurrentTime(nextTime);
  }, []);

  const skipBy = useCallback((seconds: number) => {
    const element = mediaRef.current;
    if (!element) return;
    const max = Number.isFinite(element.duration) ? element.duration : Math.max(duration, currentTime, 0);
    const nextTime = Math.min(Math.max(element.currentTime + seconds, 0), Math.max(max, 0));
    element.currentTime = nextTime;
    setCurrentTime(nextTime);
  }, [currentTime, duration]);

  const updateVolume = useCallback((value: string) => {
    const nextVolume = Number(value);
    const element = mediaRef.current;
    if (!element || !Number.isFinite(nextVolume)) return;
    element.volume = nextVolume;
    element.muted = nextVolume === 0;
    setVolume(nextVolume);
  }, []);

  const toggleMute = useCallback(() => {
    const nextVolume = volume === 0 ? 1 : 0;
    const element = mediaRef.current;
    if (element) {
      element.volume = nextVolume;
      element.muted = nextVolume === 0;
    }
    setVolume(nextVolume);
  }, [volume]);

  const updateDurationFromMetadata = useCallback((element: HTMLMediaElement) => {
    setDuration(durationFromMetadata(element) || durationSeconds || 0);
  }, [durationSeconds]);

  const mediaElement = isVideoSource(media) ? (
    <video
      ref={mediaRef as RefObject<HTMLVideoElement>}
      src={media?.url}
      preload="metadata"
      playsInline
      className="sr-only"
      onLoadedMetadata={(event) => updateDurationFromMetadata(event.currentTarget)}
      onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
      onPlay={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
      onEnded={() => setPlaying(false)}
      onError={() => setError(copy.loadError)}
    />
  ) : (
    <audio
      ref={mediaRef as RefObject<HTMLAudioElement>}
      src={media?.url}
      preload="metadata"
      className="sr-only"
      onLoadedMetadata={(event) => updateDurationFromMetadata(event.currentTarget)}
      onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
      onPlay={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
      onEnded={() => setPlaying(false)}
      onError={() => setError(copy.loadError)}
    />
  );

  if (chrome === "bar") {
    return (
      <div className="flex flex-1 items-center bg-white px-4 py-3 text-sm font-semibold text-slate-600 xl:block xl:px-6">
        {media ? mediaElement : null}
        <div className="flex w-full items-center gap-2 xl:gap-3">
          <span className="w-11 shrink-0 text-center tabular-nums text-slate-600 xl:order-none xl:w-12">{formatClock(currentTime)}</span>
          <button type="button" onClick={() => skipBy(-15)} disabled={!media || loading} className="focus-ring inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-violet transition hover:bg-violet/10 disabled:cursor-not-allowed disabled:opacity-45" aria-label={copy.skipBack}>
            <RotateCcw size={17} />
            <span className="absolute text-[9px] font-black leading-none">15</span>
          </button>
          <button
            type="button"
            onClick={togglePlayback}
            disabled={!media || loading}
            className="focus-ring inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet text-white shadow-soft transition hover:bg-violetDark disabled:cursor-not-allowed disabled:opacity-45 xl:h-10 xl:w-10"
            aria-label={playing ? copy.pause(playerLabel) : copy.play(playerLabel)}
          >
            {playing ? <Pause size={17} /> : <Play size={17} />}
          </button>
          <button type="button" onClick={() => skipBy(15)} disabled={!media || loading} className="focus-ring inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-violet transition hover:bg-violet/10 disabled:cursor-not-allowed disabled:opacity-45" aria-label={copy.skipForward}>
            <RotateCw size={17} />
            <span className="absolute text-[9px] font-black leading-none">15</span>
          </button>
          <div className="relative hidden h-5 min-w-24 flex-1 xl:block">
            <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-violet" style={{width: `${progress}%`}} />
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(duration, currentTime, 1)}
              step="0.1"
              value={Math.min(currentTime, Math.max(duration, currentTime, 1))}
              onChange={(event) => updateSeek(event.target.value)}
              disabled={!media || loading}
              className="relative z-10 h-5 w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
              aria-label={copy.seek}
            />
          </div>
          <span className="w-11 shrink-0 text-center tabular-nums text-slate-600 xl:w-12">{formatClock(duration)}</span>
          <button type="button" onClick={toggleMute} disabled={!media || loading} className="focus-ring hidden h-8 w-8 shrink-0 items-center justify-center rounded-md text-violet transition hover:bg-violet/10 disabled:cursor-not-allowed disabled:opacity-45 xl:inline-flex" aria-label={volume === 0 ? copy.unmute : copy.mute}>
            {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <span className="hidden shrink-0 text-sm text-slate-600 xl:inline">1x</span>
        </div>
        {loading ? <p className="mt-2 text-xs font-bold text-ink/45">{copy.loading}</p> : null}
        {error ? <p className="mt-2 text-xs font-bold text-coral">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-ink/10 bg-paper/55 px-3 py-2 text-sm font-bold text-ink/60">
      {media ? mediaElement : null}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={togglePlayback}
          disabled={!media || loading}
          className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white shadow-soft transition hover:bg-violet disabled:cursor-not-allowed disabled:opacity-45"
          aria-label={playing ? copy.pause(playerLabel) : copy.play(playerLabel)}
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <div className="relative h-5 min-w-40 flex-1">
          <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-ink/10">
            <div className="h-full rounded-full bg-violet" style={{width: `${progress}%`}} />
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(duration, currentTime, 1)}
            step="0.1"
            value={Math.min(currentTime, Math.max(duration, currentTime, 1))}
            onChange={(event) => updateSeek(event.target.value)}
            disabled={!media || loading}
            className="relative z-10 h-5 w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            aria-label={copy.seek}
          />
        </div>
        <span className="tabular-nums">{formatClock(currentTime)}</span>
        <span className="tabular-nums">{formatClock(duration)}</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={toggleMute} disabled={!media || loading} className="focus-ring inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink/45 transition hover:bg-violet/10 hover:text-violet disabled:cursor-not-allowed disabled:opacity-45" aria-label={volume === 0 ? copy.unmute : copy.mute}>
            {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <div className="relative h-5 w-20 shrink-0">
            <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-ink/10">
              <div className="h-full rounded-full bg-violet" style={{width: `${Math.round(volume * 100)}%`}} />
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step="0.05"
              value={volume}
              onChange={(event) => updateVolume(event.target.value)}
              disabled={!media || loading}
              className="relative z-10 h-5 w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
              aria-label={copy.volume}
            />
          </div>
        </div>
      </div>
      {loading ? <p className="mt-2 text-xs font-bold text-ink/45">{copy.loading}</p> : null}
      {error ? <p className="mt-2 text-xs font-bold text-coral">{error}</p> : null}
    </div>
  );
}

export function MediaSeekButton({eventId, time, children, className}: {eventId: string; time: number; children: ReactNode; className?: string}) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("media-player:seek", {detail: {id: eventId, time}}))}
      className={className}
    >
      {children}
    </button>
  );
}
