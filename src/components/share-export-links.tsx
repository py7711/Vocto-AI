"use client";

import {useMemo, useState} from "react";
import {Download} from "lucide-react";

const formats = ["txt", "srt", "vtt", "json", "md", "csv", "docx", "pdf"];

function buildQuery(input: {
  showSpeaker: boolean;
  showTimestamp: boolean;
  subtitleMaxChars: number;
  subtitleMaxDurationSeconds: number;
}) {
  const params = new URLSearchParams({
    showSpeaker: String(input.showSpeaker),
    showTimestamp: String(input.showTimestamp),
    subtitleMaxChars: String(input.subtitleMaxChars),
    subtitleMaxDurationSeconds: String(input.subtitleMaxDurationSeconds)
  });
  return `?${params.toString()}`;
}

export function ShareExportLinks({token}: {token: string}) {
  const [showSpeaker, setShowSpeaker] = useState(true);
  const [showTimestamp, setShowTimestamp] = useState(true);
  const [subtitleMaxChars, setSubtitleMaxChars] = useState(84);
  const [subtitleMaxDurationSeconds, setSubtitleMaxDurationSeconds] = useState(6);
  const query = useMemo(
    () => buildQuery({showSpeaker, showTimestamp, subtitleMaxChars, subtitleMaxDurationSeconds}),
    [showSpeaker, showTimestamp, subtitleMaxChars, subtitleMaxDurationSeconds]
  );

  return (
    <div>
      <div className="grid gap-2 rounded-md border border-ink/10 bg-paper/45 p-3 text-xs font-bold text-ink/60">
        <label className="flex items-center justify-between gap-2">
          Speaker names
          <input type="checkbox" checked={showSpeaker} onChange={(event) => setShowSpeaker(event.target.checked)} className="h-4 w-4 accent-violet" />
        </label>
        <label className="flex items-center justify-between gap-2">
          Timestamps
          <input type="checkbox" checked={showTimestamp} onChange={(event) => setShowTimestamp(event.target.checked)} className="h-4 w-4 accent-violet" />
        </label>
        <label className="grid gap-1">
          Subtitle max chars
          <input type="number" min={1} max={2000} value={subtitleMaxChars} onChange={(event) => setSubtitleMaxChars(Number(event.target.value) || 84)} className="field h-9 bg-white text-sm" />
        </label>
        <label className="grid gap-1">
          Subtitle max seconds
          <input type="number" min={0.1} max={60} step={0.1} value={subtitleMaxDurationSeconds} onChange={(event) => setSubtitleMaxDurationSeconds(Number(event.target.value) || 6)} className="field h-9 bg-white text-sm" />
        </label>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {formats.map((format) => (
          <a key={format} href={`/api/share/${encodeURIComponent(token)}/exports/${format}${query}`} className="focus-ring inline-flex items-center justify-center gap-1 rounded-md border border-ink/15 bg-paper/60 px-2 py-2 text-xs font-black uppercase transition hover:border-tide/40 hover:text-tide">
            <Download size={15} />
            {format}
          </a>
        ))}
      </div>
    </div>
  );
}
