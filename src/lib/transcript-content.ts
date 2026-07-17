type TranscriptContent = {
  editedText?: string | null;
  segments?: unknown;
};

export function transcriptText(transcript: TranscriptContent | null | undefined) {
  const editedText = transcript?.editedText?.trim();
  if (editedText) return editedText;
  if (!Array.isArray(transcript?.segments)) return "";
  return transcript.segments
    .map((segment) => {
      if (!segment || typeof segment !== "object") return "";
      const text = (segment as {text?: unknown}).text;
      return typeof text === "string" ? text.trim() : "";
    })
    .filter(Boolean)
    .join("\n\n");
}
