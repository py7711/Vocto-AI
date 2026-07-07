"use client";

import {useState} from "react";
import {useLocale} from "next-intl";
import {Download, Loader2, Search, ShieldCheck} from "lucide-react";
import {CompactSelect} from "@/components/target-controls";
import {getYoutubeToolCopy} from "@/components/youtube-tool-copy";

type VideoInfo = {
  sourceUrl: string;
  title: string;
  durationSeconds?: number;
  thumbnailUrl?: string;
  providerName?: string;
};

type SubtitleItem = {
  languageCode: string;
  languageName: string;
  formats: string[];
  automatic: boolean;
};

function formatDuration(seconds?: number) {
  if (!seconds) return "";
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export function YoutubeSubtitleTool() {
  const text = getYoutubeToolCopy(useLocale());
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<"srt" | "vtt">("srt");
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [subtitles, setSubtitles] = useState<SubtitleItem[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function inspectVideo() {
    setBusy(true);
    setError(null);
    setInfo(null);
    setSubtitles([]);
    setSelectedLanguage("");
    try {
      const [infoResponse, subtitlesResponse] = await Promise.all([
        fetch("/api/tools/youtube-info", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({url})
        }),
        fetch("/api/tools/youtube-subtitles", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({url})
        })
      ]);
      const infoBody = await infoResponse.json().catch(() => ({}));
      const subtitlesBody = await subtitlesResponse.json().catch(() => ({}));
      if (!infoResponse.ok) throw new Error(infoBody.error ?? text.infoError);
      if (!subtitlesResponse.ok) throw new Error(subtitlesBody.error ?? text.subtitlesError);
      const nextSubtitles = (subtitlesBody.subtitles ?? []) as SubtitleItem[];
      setInfo(infoBody as VideoInfo);
      setSubtitles(nextSubtitles);
      setSelectedLanguage(nextSubtitles[0]?.languageCode ?? "");
      if (!nextSubtitles.length) setError(text.noSubtitles);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function downloadSubtitle() {
    if (!selectedLanguage) return;
    setDownloading(true);
    setError(null);
    try {
      const response = await fetch("/api/tools/youtube-subtitle-download", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({url, languageCode: selectedLanguage, format, title: info?.title})
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? text.downloadError);
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const disposition = response.headers.get("content-disposition") ?? "";
      const fileName = disposition.match(/filename="([^"]+)"/)?.[1] ?? `youtube-subtitle.${format}`;
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(objectUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="w-full rounded-xl border border-ink/10 bg-white p-5 shadow-lifted">
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <label className="field flex h-12 items-center gap-2 bg-white">
          <Search size={18} className="text-ink/40" />
          <input value={url} onChange={(event) => setUrl(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none" placeholder={text.placeholder} />
        </label>
        <button type="button" onClick={inspectVideo} disabled={!url.trim() || busy} className="btn-primary h-12">
          {busy ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
          {text.checkSubtitles}
        </button>
      </div>

      {info ? (
        <div className="mt-4 grid gap-4 rounded-lg border border-ink/10 bg-paper/55 p-3 md:grid-cols-[140px_1fr]">
          {info.thumbnailUrl ? (
            // YouTube 缩略图域名可能随地区和视频来源变化，原生 img 避免维护过宽的图片域名白名单。
            // eslint-disable-next-line @next/next/no-img-element
            <img src={info.thumbnailUrl} alt="" className="aspect-video w-full rounded-md object-cover" />
          ) : <div className="aspect-video rounded-md bg-ink/10" />}
          <div className="min-w-0">
            <p className="break-words font-black text-ink">{info.title}</p>
            <p className="mt-1 text-sm font-bold text-ink/55">{info.providerName ?? "YouTube"} {formatDuration(info.durationSeconds) ? `· ${formatDuration(info.durationSeconds)}` : ""}</p>
          </div>
        </div>
      ) : null}

      {subtitles.length ? (
        <div className="mt-4 grid gap-3 rounded-lg border border-ink/10 bg-white p-3 md:grid-cols-[1fr_120px_auto]">
          <CompactSelect
            value={selectedLanguage}
            onChange={setSelectedLanguage}
            options={subtitles.map((subtitle) => [
              subtitle.languageCode,
              `${subtitle.languageName} (${subtitle.languageCode})${subtitle.automatic ? ` ${text.automaticSuffix}` : ""}`
            ] as const)}
            ariaLabel={text.subtitleLanguageAria}
          />
          <CompactSelect
            value={format}
            onChange={(value) => setFormat(value as "srt" | "vtt")}
            options={[
              ["srt", "SRT"],
              ["vtt", "VTT"]
            ]}
            ariaLabel={text.subtitleFormatAria}
          />
          <button type="button" onClick={downloadSubtitle} disabled={downloading || !selectedLanguage} className="btn-outline h-10">
            {downloading ? <Loader2 className="animate-spin" size={17} /> : <Download size={17} />}
            {text.download}
          </button>
        </div>
      ) : null}

      {error ? <p className="mt-4 rounded-lg border border-coral/25 bg-coral/10 px-3 py-2 text-sm font-bold text-coral">{error}</p> : null}
      <p className="mt-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wide text-ink/45">
        <ShieldCheck size={15} />
        {text.captionsOnly}
      </p>
    </div>
  );
}
