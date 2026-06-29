const languageNames: Record<string, string> = Object.fromEntries([
  "Afrikaans",
  "Albanian",
  "Arabic",
  "Azerbaijani",
  "Basque",
  "Belarusian",
  "Bengali",
  "Bosnian",
  "Bulgarian",
  "Cantonese",
  "Catalan",
  "Chinese",
  "Croatian",
  "Czech",
  "Danish",
  "Dutch",
  "English",
  "Estonian",
  "Finnish",
  "French",
  "Galician",
  "German",
  "Greek",
  "Gujarati",
  "Hebrew",
  "Hindi",
  "Hungarian",
  "Indonesian",
  "Italian",
  "Japanese",
  "Kannada",
  "Kazakh",
  "Korean",
  "Latvian",
  "Lithuanian",
  "Macedonian",
  "Malay",
  "Malayalam",
  "Marathi",
  "Norwegian",
  "Persian",
  "Polish",
  "Portuguese",
  "Punjabi",
  "Romanian",
  "Russian",
  "Serbian",
  "Slovak",
  "Slovenian",
  "Spanish",
  "Swahili",
  "Swedish",
  "Tagalog",
  "Tamil",
  "Telugu",
  "Thai",
  "Turkish",
  "Ukrainian",
  "Urdu",
  "Vietnamese",
  "Welsh"
].map((language) => [`transcribe-${language.toLowerCase().replace(/\s+/g, "-")}-audio`, language]));

const pageTitles: Record<string, string> = {
  "speech-to-text": "Free Online Speech to Text Converter",
  "voice-to-text": "Free Online Voice to Text Converter",
  "audio-to-text": "Convert Audio to Text for Free Online | Fast and Accurate",
  "video-to-text": "Convert Video to Text in Seconds for Free",
  "video-link-to-text": "Link to Text",
  "mp3-to-text": "MP3 Audio to Text Converter Online for Free - No Download",
  "mp4-to-text-converter": "MP4 to Text",
  "wav-to-text": "WAV to Text",
  "m4a-to-text": "M4A to Text",
  "aac-to-text": "AAC to Text",
  "opus-to-text": "OPUS to Text",
  "webm-to-text": "WebM to Text",
  "flac-to-text": "FLAC to Text",
  "amr-to-text": "AMR to Text",
  "wma-to-text": "WMA to Text",
  "mkv-to-text": "MKV to Text",
  "wmv-to-text": "WMV to Text",
  "video-to-audio-extractor": "Free Browser-Based Video to Audio Extractor | UniScribe Tools",
  "wav-to-mp3-converter": "Free Browser-Based WAV to MP3 Converter | UniScribe Tools",
  "youtube-subtitle-downloader": "YouTube Subtitle Downloader | Download SRT and VTT Captions",
  "youtube-video-downloader": "YouTube Video Downloader | UniScribe Tools"
};

const canonicalToolSlugs = new Set(["audio-to-text", "video-link-to-text", "video-to-audio-extractor", "wav-to-mp3-converter", "youtube-subtitle-downloader", "youtube-video-downloader"]);

export function isCanonicalToolSlug(slug: string) {
  return canonicalToolSlugs.has(slug);
}

export function getToolPageTitle(slug: string) {
  const language = languageNames[slug];
  if (language) {
    return `Transcribe ${language} Audio to Text in Seconds for Free`;
  }
  return pageTitles[slug] ?? slug.split("-").map((part) => {
    const upper = part.toUpperCase();
    return ["AI", "PDF", "SRT", "TXT", "VTT", "MP3", "MP4", "M4A", "AAC", "AMR", "MKA", "MKV", "MOV", "MPEG", "OGG", "OPUS", "WAV", "WEBM", "WMA", "WMV"].includes(upper)
      ? upper
      : `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`;
  }).join(" ");
}
