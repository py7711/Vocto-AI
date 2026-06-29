"use client";

import {Pause, Play, Volume2, VolumeX} from "lucide-react";
import type {ReactNode, RefObject} from "react";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";

type MediaInfo = {
  url: string;
  fileName?: string | null;
  sourceType?: string | null;
  storedObject?: boolean;
};

type MediaPlayerProps = {
  endpoint: string;
  durationSeconds?: number | null;
  seekSignal?: {time: number; nonce: number} | null;
  seekEventId?: string;
  label?: string;
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

function isVideoSource(media: MediaInfo | null) {
  const value = `${media?.fileName ?? ""} ${media?.url ?? ""}`.toLowerCase();
  return /\.(mp4|mov|m4v|webm|mkv|avi|wmv)(\?|#|$)/.test(value);
}

export function MediaPlayer({endpoint, durationSeconds, seekSignal, seekEventId, label = "Original media"}: MediaPlayerProps) {
  const mediaRef = useRef<HTMLMediaElement | null>(null);
  const [media, setMedia] = useState<MediaInfo | null>(null);
  const [loading, setLoading] = useState(true);
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
    setLoading(true);
    setError(null);
    setMedia(null);
    fetch(endpoint, {cache: "no-store"})
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error ?? "Original media is unavailable.");
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
  }, [endpoint]);

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
      element.play().catch((cause) => setError(cause instanceof Error ? cause.message : "无法播放媒体。"));
    } else {
      element.pause();
    }
  }, [media]);

  const updateSeek = useCallback((value: string) => {
    const nextTime = Number(value);
    const element = mediaRef.current;
    if (!element || !Number.isFinite(nextTime)) return;
    element.currentTime = nextTime;
    setCurrentTime(nextTime);
  }, []);

  const updateVolume = useCallback((value: string) => {
    const nextVolume = Number(value);
    const element = mediaRef.current;
    if (!element || !Number.isFinite(nextVolume)) return;
    element.volume = nextVolume;
    element.muted = nextVolume === 0;
    setVolume(nextVolume);
  }, []);

  const mediaElement = isVideoSource(media) ? (
    <video
      ref={mediaRef as RefObject<HTMLVideoElement>}
      src={media?.url}
      preload="metadata"
      playsInline
      className="sr-only"
      onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || durationSeconds || 0)}
      onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
      onPlay={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
      onEnded={() => setPlaying(false)}
      onError={() => setError("无法加载原始媒体。")}
    />
  ) : (
    <audio
      ref={mediaRef as RefObject<HTMLAudioElement>}
      src={media?.url}
      preload="metadata"
      className="sr-only"
      onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || durationSeconds || 0)}
      onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
      onPlay={() => setPlaying(true)}
      onPause={() => setPlaying(false)}
      onEnded={() => setPlaying(false)}
      onError={() => setError("无法加载原始媒体。")}
    />
  );

  return (
    <div className="rounded-md border border-ink/10 bg-paper/55 px-3 py-2 text-sm font-bold text-ink/60">
      {media ? mediaElement : null}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={togglePlayback}
          disabled={!media || loading}
          className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white shadow-soft transition hover:bg-violet disabled:cursor-not-allowed disabled:opacity-45"
          aria-label={playing ? `Pause ${label}` : `Play ${label}`}
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
            aria-label="Seek media"
          />
        </div>
        <span className="tabular-nums">{formatClock(currentTime)}</span>
        <span className="tabular-nums">{formatClock(duration)}</span>
        <div className="flex items-center gap-2">
          {volume === 0 ? <VolumeX size={16} className="text-ink/45" /> : <Volume2 size={16} className="text-ink/45" />}
          <input
            type="range"
            min={0}
            max={1}
            step="0.05"
            value={volume}
            onChange={(event) => updateVolume(event.target.value)}
            disabled={!media || loading}
            className="h-1.5 w-20 accent-violet disabled:opacity-40"
            aria-label="Volume"
          />
        </div>
      </div>
      {loading ? <p className="mt-2 text-xs font-bold text-ink/45">Loading media...</p> : null}
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
