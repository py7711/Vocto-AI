"use client";

import {useEffect, useMemo, useState} from "react";
import {Loader2, Save} from "lucide-react";
import type {TranscriptSegment} from "@/components/workspace/types";

type TranslationEditorProps = {
  taskId: string;
  locale: string;
  content: any;
  transcriptSegments?: TranscriptSegment[];
  busy?: boolean;
  saveError?: string;
  saveLabel?: string;
  onSaved?: (content: any) => void;
  onError?: (message: string) => void;
};

function contentText(content: any) {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (typeof content.text === "string") return content.text;
  if (typeof content.translation === "string") return content.translation;
  return "";
}

function initialSegments(content: any, transcriptSegments: TranscriptSegment[] = []) {
  if (Array.isArray(content?.segments)) {
    return content.segments.map((segment: any, index: number) => ({
      start: Number(segment.start ?? transcriptSegments[index]?.start ?? 0),
      end: Number(segment.end ?? transcriptSegments[index]?.end ?? transcriptSegments[index]?.start ?? 0),
      speaker: segment.speaker ?? transcriptSegments[index]?.speaker,
      text: String(segment.text ?? "")
    }));
  }

  const text = contentText(content);
  const lines = text.split(/\n+/).map((line: string) => line.trim()).filter(Boolean);
  if (transcriptSegments.length) {
    return transcriptSegments.map((segment, index) => ({
      start: segment.start,
      end: segment.end,
      speaker: segment.speaker,
      text: lines[index] ?? (index === 0 ? text : "")
    }));
  }

  return text ? [{start: 0, end: 0, text}] : [];
}

function stamp(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

export function TranslationEditor({taskId, locale, content, transcriptSegments = [], busy, saveError = "Unable to save translation.", saveLabel = "Save translation", onSaved, onError}: TranslationEditorProps) {
  const [draftSegments, setDraftSegments] = useState<TranscriptSegment[]>([]);
  const [saving, setSaving] = useState(false);
  const fallbackText = useMemo(() => contentText(content), [content]);

  useEffect(() => {
    setDraftSegments(initialSegments(content, transcriptSegments));
  }, [content, transcriptSegments]);

  function updateSegment(index: number, text: string) {
    setDraftSegments((items) => items.map((item, itemIndex) => (itemIndex === index ? {...item, text} : item)));
  }

  async function saveTranslation() {
    if (!draftSegments.length && !fallbackText.trim()) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/tasks/${taskId}/translations/${encodeURIComponent(locale)}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(draftSegments.length ? {segments: draftSegments} : {text: fallbackText})
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? saveError);
      onSaved?.(body.content);
    } catch (cause) {
      onError?.(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setSaving(false);
    }
  }

  if (!content) {
    return null;
  }

  return (
    <div className="grid gap-3">
      {draftSegments.length ? (
        <div className="grid max-h-80 gap-2 overflow-auto pr-1">
          {draftSegments.map((segment, index) => (
            <label key={`${segment.start}-${index}`} className="grid gap-1 rounded-lg border border-ink/10 bg-paper/45 p-2">
              <span className="text-xs font-black text-violet">{stamp(segment.start)} {segment.speaker ? `· ${segment.speaker}` : ""}</span>
              <textarea value={segment.text} onChange={(event) => updateSegment(index, event.target.value)} className="focus-ring min-h-16 w-full resize-y rounded-md border border-ink/10 bg-white p-2 text-sm leading-6 text-ink/78 outline-none focus-visible:border-violet" />
            </label>
          ))}
        </div>
      ) : (
        <p>{fallbackText}</p>
      )}
      <button type="button" onClick={saveTranslation} disabled={busy || saving || (!draftSegments.length && !fallbackText.trim())} className="btn-outline w-fit px-3 py-2">
        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
        {saveLabel}
      </button>
    </div>
  );
}
