"use client";

import {useEffect, useState} from "react";
import {useLocale} from "next-intl";
import {Download, ExternalLink, Loader2, Search, ShieldCheck} from "lucide-react";

type VideoInfo = {
  sourceUrl: string;
  title: string;
  durationSeconds?: number;
  thumbnailUrl?: string;
  providerName?: string;
};

function formatDuration(seconds?: number) {
  if (!seconds) return "";
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

export function YoutubeVideoDownloader() {
  const locale = useLocale();
  const [url, setUrl] = useState("");
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("url");
    if (initial) setUrl(initial);
  }, []);

  async function inspectVideo() {
    const target = url.trim();
    if (!target) return;
    setBusy(true);
    setError(null);
    setInfo(null);
    setDownloadUrl("");
    try {
      const response = await fetch("/api/tools/youtube-info", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({url: target})
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "无法读取视频信息。");
      setInfo(body as VideoInfo);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  async function prepareDownload() {
    const target = (info?.sourceUrl || url).trim();
    if (!target) return;
    setDownloading(true);
    setError(null);
    try {
      const response = await fetch("/api/tools/youtube-video-download-url", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({url: target})
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "无法准备视频下载地址。");
      setDownloadUrl(String(body.downloadUrl ?? ""));
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
          <input value={url} onChange={(event) => setUrl(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none" placeholder="Paste a YouTube video URL" />
        </label>
        <button type="button" onClick={inspectVideo} disabled={!url.trim() || busy} className="btn-primary h-12">
          {busy ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
          Check video
        </button>
      </div>

      {info ? (
        <div className="mt-4 grid gap-4 rounded-lg border border-ink/10 bg-paper/55 p-3 md:grid-cols-[160px_1fr]">
          {info.thumbnailUrl ? (
            // YouTube 缩略图域名可能随地区和视频来源变化，原生 img 避免维护过宽的图片域名白名单。
            // eslint-disable-next-line @next/next/no-img-element
            <img src={info.thumbnailUrl} alt="" className="aspect-video w-full rounded-md object-cover" />
          ) : <div className="aspect-video rounded-md bg-ink/10" />}
          <div className="min-w-0">
            <p className="break-words font-black text-ink">{info.title}</p>
            <p className="mt-1 text-sm font-bold text-ink/55">{info.providerName ?? "YouTube"} {formatDuration(info.durationSeconds) ? `· ${formatDuration(info.durationSeconds)}` : ""}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={prepareDownload} disabled={downloading} className="btn-outline h-10">
                {downloading ? <Loader2 className="animate-spin" size={17} /> : <Download size={17} />}
                Prepare download
              </button>
              <a href={`/${locale}/upload?mode=link&url=${encodeURIComponent(info.sourceUrl || url)}`} className="btn-ghost h-10">
                Transcribe instead
              </a>
            </div>
          </div>
        </div>
      ) : null}

      {downloadUrl ? (
        <div className="mt-4 rounded-lg border border-sage/20 bg-sage/10 p-4 text-left">
          <p className="font-black text-ink">Download link ready</p>
          <p className="mt-1 break-all text-sm font-bold text-ink/55">The link is generated from the public YouTube media source and can expire.</p>
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-3">
            <ExternalLink size={17} />
            Open download
          </a>
        </div>
      ) : null}

      {error ? <p className="mt-4 rounded-lg border border-coral/25 bg-coral/10 px-3 py-2 text-sm font-bold text-coral">{error}</p> : null}
      <p className="mt-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wide text-ink/45">
        <ShieldCheck size={15} />
        Public videos only - respect creator rights and platform terms
      </p>
    </div>
  );
}
