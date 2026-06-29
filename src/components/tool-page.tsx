"use client";

import Image from "next/image";
import {useLocale} from "next-intl";
import {ArrowRight, BadgeCheck, Brain, Download, FileAudio, FileUp, Languages, LockKeyhole, UploadCloud, Zap, type LucideIcon} from "lucide-react";
import {SiteFooter, SiteHeader} from "@/components/site-shell";
import {getWorkspaceCopy} from "@/components/workspace/copy";
import {UtilityToolWidget} from "@/components/utility-tool-widget";
import {YoutubeSubtitleTool} from "@/components/youtube-subtitle-tool";
import {YoutubeVideoDownloader} from "@/components/youtube-video-downloader";
import {languageSlug, supportedLanguageNames} from "@/lib/language-pages";

type ToolPageRecord = {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  mode: "file" | "link";
  kind?: "transcription" | "utility" | "youtube-subtitles" | "youtube-video-downloader";
  examples: string[];
  steps?: Array<[string, string]>;
  featurePrefix?: string;
  threeStepTitle?: string;
  speedTitle?: string;
  insightTitle?: string;
  related?: Array<[string, string]>;
  language?: string;
  utilitySections?: Array<[string, string]>;
  faqs?: Array<[string, string]>;
  accept?: string;
  selectLabel?: string;
  actionLabel?: string;
  utilitySubtitle?: string;
};

const tools: ToolPageRecord[] = [
  {
    slug: "speech-to-text",
    title: "Free Online Speech to Text Converter",
    eyebrow: "Converter",
    mode: "file",
    description: "Convert speech to text with advanced AI technology. Fast, accurate, and reliable speech recognition for all your transcription needs.",
    examples: ["Speech recordings", "Voice notes", "Interviews"],
    steps: [
      ["Upload Audio File", "Upload audio and video files from your local device or simply paste an online video link."],
      ["Click Transcribe", "Click Transcribe and wait for the transcript. Most files finish quickly while progress updates in the workspace."],
      ["Export as Text", "Export transcribed text in TXT, PDF, DOCX, SRT, CSV, or VTT, or share a link to view it directly."]
    ],
    featurePrefix: "Speech",
    threeStepTitle: "Convert Speech to Text in Three Easy Steps",
    speedTitle: "Convert Speech to Text in Seconds",
    insightTitle: "Generate Summaries, Mind Maps, and Key Insights from Speech",
    related: [["MP3 to Text", "l/mp3-to-text"], ["MP4 to Text", "l/mp4-to-text-converter"], ["M4A to Text", "l/m4a-to-text"], ["WAV to Text", "l/wav-to-text"], ["AAC to Text", "l/aac-to-text"], ["Link to Text", "tools/video-link-to-text"], ["OPUS to Text", "l/opus-to-text"], ["WebM to Text", "l/webm-to-text"]]
  },
  {
    slug: "voice-to-text",
    title: "Free Online Voice to Text Converter",
    eyebrow: "Converter",
    mode: "file",
    description: "Upload a voice recording and turn it into searchable text, summaries, and exports.",
    examples: ["M4A voice memos", "Meeting audio", "Phone recordings"],
    featurePrefix: "Voice"
  },
  {
    slug: "audio-to-text",
    title: "Audio to Text Converter Powered by AI",
    eyebrow: "Tool",
    mode: "file",
    description: "Upload your audio and video files and quickly turn them into text with AI. UniScribe also creates translations, summaries, and mind maps, and lets you export the text in different formats.",
    examples: ["Audio files", "Video files", "Export formats"],
    steps: [
      ["Upload Audio File", "Upload audio and video files from your local device or simply paste an online video link."],
      ["Click Transcribe", "Click Transcribe and wait for the transcript. Most files finish quickly while progress updates in the workspace."],
      ["Export Transcript", "Export transcribed text in TXT, PDF, DOCX, SRT, CSV, or VTT, or share a link to view it directly."]
    ],
    featurePrefix: "Audio File",
    threeStepTitle: "Convert Audio to Text in Three Easy Steps",
    speedTitle: "Convert Audio Files to Text in No Time",
    insightTitle: "Generate Summaries, Mind Maps, and Key Insights from Audio File",
    related: [["Audio to TXT", "tools/audio-to-text"], ["Audio to SRT", "tools/audio-to-text"], ["Audio to Word", "tools/audio-to-text"], ["Audio to PDF", "tools/audio-to-text"], ["Audio to VTT", "tools/audio-to-text"], ["Video to Text", "l/video-to-text"], ["YouTube to Text", "tools/video-link-to-text"], ["MP3 to Text", "l/mp3-to-text"]]
  },
  {
    slug: "video-to-text",
    title: "Video to Text Converter Powered by AI",
    eyebrow: "Converter",
    mode: "file",
    description: "Turn a 1-hour video file into a text file in under 1 minute. Support for multiple formats and easy export options make transcription a breeze.",
    examples: ["Video files", "Captions", "Transcripts"],
    steps: [
      ["Upload Video File", "Upload audio and video files from your local device or simply paste an online video link."],
      ["Click Transcribe", "Click Transcribe and wait for the transcript. Most files finish quickly while progress updates in the workspace."],
      ["Export Transcript", "Export transcribed text in TXT, PDF, DOCX, SRT, CSV, or VTT, or share a link to view it directly."]
    ],
    featurePrefix: "Video File",
    threeStepTitle: "Convert Video to Text in Three Easy Steps",
    speedTitle: "Convert Video Files to Text in Seconds by AI",
    insightTitle: "Generate Summaries, Mind Maps, and Key Insights from Video File",
    related: [["Video to TXT", "l/video-to-text"], ["Video to SRT", "l/video-to-text"], ["Video to Word", "l/video-to-text"], ["Video to PDF", "l/video-to-text"], ["Video to VTT", "l/video-to-text"], ["Video to Transcript", "l/video-to-text"], ["M4A to Text", "l/m4a-to-text"], ["MP4 to Text", "l/mp4-to-text-converter"]]
  },
  {
    slug: "video-link-to-text",
    title: "Link to Text",
    eyebrow: "Tool",
    mode: "link",
    description: "Paste a public media link and transcribe the audio without downloading first.",
    examples: ["YouTube", "TikTok", "Instagram"],
    steps: [
      ["Paste a Link", "Paste a public media URL from a supported platform."],
      ["Click Transcribe", "UniScribe checks the link and sends the media through the same transcription queue."],
      ["Export or Share", "Export captions and documents or create a share link."]
    ],
    featurePrefix: "Media Link"
  },
  {
    slug: "youtube-subtitle-downloader",
    title: "YouTube Subtitle Downloader",
    eyebrow: "Free tool",
    mode: "link",
    kind: "youtube-subtitles",
    description: "Paste a public YouTube URL, inspect available captions, and download subtitles as SRT or VTT.",
    examples: ["YouTube captions", "SRT files", "VTT files"],
    steps: [
      ["Paste YouTube Link", "Paste a public YouTube video URL into the subtitle checker."],
      ["Choose Captions", "UniScribe lists manual and automatic subtitles when the video provides them."],
      ["Download SRT or VTT", "Pick a language and download captions for editing, publishing, or archiving."]
    ],
    featurePrefix: "YouTube Subtitle",
    threeStepTitle: "Download YouTube Subtitles in Three Easy Steps",
    speedTitle: "Save YouTube Captions as SRT or VTT",
    related: [["YouTube to Text", "tools/video-link-to-text"], ["Video to Text", "l/video-to-text"], ["Audio to Text", "tools/audio-to-text"], ["Video to Audio", "tools/video-to-audio-extractor"]],
    faqs: [
      ["Can I download automatic captions?", "Yes. If YouTube exposes automatic captions for the video, they appear in the language list."],
      ["Which subtitle formats are supported?", "The tool downloads SRT and VTT files."],
      ["Why do some videos show no subtitles?", "Some videos do not publish captions, or the remote provider may block subtitle extraction."]
    ]
  },
  {
    slug: "video-to-audio-extractor",
    title: "Video to Audio Extractor",
    eyebrow: "Free tool",
    mode: "file",
    kind: "utility",
    description: "Extract audio from video files online, then use the clean audio for transcription, subtitles, summaries, or archiving.",
    utilitySubtitle: "Extract audio from your videos and download it locally",
    accept: "video/*",
    selectLabel: "Select Video File",
    actionLabel: "Extract Audio",
    examples: ["MP4 files", "MOV videos", "Course recordings"],
    steps: [
      ["Upload Video File", "Choose a video file from your device. MP4, MOV, MKV, WebM, and other common formats are supported."],
      ["Extract Audio", "Create a smaller audio file that keeps the speech track clear for listening or transcription."],
      ["Download or Transcribe", "Use the extracted audio directly, or upload it to UniScribe to generate text, subtitles, and summaries."]
    ],
    featurePrefix: "Video Audio",
    threeStepTitle: "Extract Audio from Video in Three Easy Steps",
    speedTitle: "Turn Video into Clean Audio Before Transcription",
    related: [["Audio to Text", "tools/audio-to-text"], ["Video to Text", "l/video-to-text"], ["MP4 to Text", "l/mp4-to-text-converter"], ["WAV to MP3", "tools/wav-to-mp3-converter"]],
    utilitySections: [
      ["Extract speech from videos", "Separate the spoken audio from lectures, interviews, webinars, screen recordings, and social clips before sending them through a transcript workflow."],
      ["Reduce large upload sizes", "Audio files are usually much smaller than video files, so extraction can make long recordings easier to store, upload, and reuse."],
      ["Prepare files for captions", "Once the audio is ready, UniScribe can create editable transcripts, subtitle files, summaries, translations, and share links."]
    ],
    faqs: [
      ["How long does it take to extract audio?", "Most conversions finish quickly in your browser. Very large videos can take longer depending on file size and device performance."],
      ["Can I extract audio from any video format?", "The tool accepts common browser-supported video files, including MP4, MOV, WebM, and other standard formats."],
      ["Is my data secure?", "Yes. The conversion runs in your browser, so the selected file does not need to leave your device."],
      ["Why would I want to extract audio from a video?", "Audio files are easier to store, share, transcribe, and reuse when you only need the spoken track."]
    ]
  },
  {
    slug: "wav-to-mp3-converter",
    title: "WAV to MP3 Converter",
    eyebrow: "Free tool",
    mode: "file",
    kind: "utility",
    description: "Convert large WAV recordings into smaller speech-focused audio that is easier to upload, share, store, and transcribe.",
    utilitySubtitle: "Compress your WAV files into transcription-friendly audio quickly and easily",
    accept: ".wav",
    selectLabel: "Select WAV File",
    actionLabel: "Compress Audio",
    examples: ["WAV recordings", "Voice archives", "Podcast audio"],
    steps: [
      ["Upload WAV File", "Choose a WAV file from your device and keep the speech as clear as possible."],
      ["Compress Audio", "Create a smaller speech-focused audio file with settings that work well for voice recordings."],
      ["Use the MP3", "Download the MP3 or upload it to UniScribe for transcription, captions, summaries, and exports."]
    ],
    featurePrefix: "WAV Audio",
    threeStepTitle: "Convert WAV to MP3 in Three Easy Steps",
    speedTitle: "Make Large WAV Recordings Easier to Upload",
    related: [["WAV to Text", "l/wav-to-text"], ["MP3 to Text", "l/mp3-to-text"], ["Audio to Text", "tools/audio-to-text"], ["Video to Audio", "tools/video-to-audio-extractor"]],
    utilitySections: [
      ["Compress without losing speech clarity", "For meetings, classes, voice notes, and interviews, speech-focused audio is often much smaller while still preserving enough detail for review."],
      ["Prepare recordings for transcription", "A smaller MP3 can move through upload and processing faster than an uncompressed WAV file."],
      ["Keep export options open", "After transcription, UniScribe can export TXT, DOCX, PDF, SRT, VTT, CSV, and shareable transcript pages."]
    ],
    faqs: [
      ["How long does it take to convert WAV to MP3?", "Most WAV files convert quickly in your browser. Longer recordings take more time depending on file size and your device."],
      ["What quality will I get?", "The converted file is designed for clear speech and practical sharing while keeping the audio much smaller than the WAV source."],
      ["Is my data secure?", "Yes. Conversion happens locally in the browser, so the selected WAV file does not need to be uploaded to a server."],
      ["Why compress WAV audio?", "Compact speech audio is smaller, easier to share, and faster to upload for transcription or review."]
    ]
  },
  {
    slug: "youtube-video-downloader",
    title: "YouTube Video Downloader",
    eyebrow: "Free tool",
    mode: "link",
    kind: "youtube-video-downloader",
    description: "Check a public YouTube video, prepare a direct media link when available, and move quickly into transcription when you need text, subtitles, summaries, or exports.",
    utilitySubtitle: "Paste a YouTube URL to inspect and prepare the video",
    examples: ["YouTube videos", "Public links", "Transcription prep"],
    steps: [
      ["Paste YouTube Link", "Add a public YouTube video URL and check the video details before downloading or transcribing."],
      ["Prepare Download", "Generate a direct media URL when the public source can be resolved by the browser-compatible helper."],
      ["Download or Transcribe", "Open the media download link, or send the video into UniScribe for transcript, subtitle, summary, and translation workflows."]
    ],
    featurePrefix: "YouTube Video",
    threeStepTitle: "Download YouTube Videos in Three Easy Steps",
    speedTitle: "Prepare Public YouTube Videos for Transcription",
    related: [["YouTube Subtitle Downloader", "tools/youtube-subtitle-downloader"], ["Video Link to Text", "tools/video-link-to-text"], ["Video to Text", "l/video-to-text"], ["Video to Audio", "tools/video-to-audio-extractor"]],
    utilitySections: [
      ["Check video details first", "Preview the video title, thumbnail, provider, and duration before choosing the next action."],
      ["Use direct media links when available", "The helper prepares a public media URL when the source can be resolved by the local runtime."],
      ["Continue into UniScribe", "If you need searchable text instead of the raw video, send the link to UniScribe for transcript and subtitle generation."]
    ],
    faqs: [
      ["Can I download any YouTube video?", "The tool is intended for public videos you have the right to download or reuse. Some videos cannot provide a downloadable media URL."],
      ["Why does the generated link expire?", "YouTube media URLs are temporary and may stop working after a short time."],
      ["Can I transcribe the video instead?", "Yes. Use the transcription action to send the same link into UniScribe and create text, captions, summaries, and exports."]
    ]
  },
  {
    slug: "mp3-to-text",
    title: "Online MP3 to Text Converter Powered by AI",
    eyebrow: "Format",
    mode: "file",
    description: "Convert MP3 audio files into text in a few minutes. Export to SRT, TXT, Word, PDF, CSV, and more, with summaries, mind maps, and key insights.",
    examples: ["MP3 files", "Podcasts", "Classes"],
    steps: [
      ["Upload MP3 File", "Choose an MP3 file from your device. Uploading is fast, even for large files."],
      ["Click Transcribe", "Click Transcribe and wait for UniScribe to process your audio."],
      ["Export Text Result", "Export the transcript in TXT, PDF, DOCX, SRT, CSV, or VTT."]
    ],
    featurePrefix: "MP3 File",
    threeStepTitle: "How to Convert MP3 to Text in Three Steps?",
    speedTitle: "Convert MP3 Audio to Text Online in Seconds",
    insightTitle: "Generate Summaries, Mind Maps, and Key Insights from MP3 File",
    related: [["MP3 to TXT", "l/mp3-to-text"], ["MP3 to Word", "l/mp3-to-text"], ["MP3 to PDF", "l/mp3-to-text"], ["MP3 to SRT", "l/mp3-to-text"], ["MP3 to VTT", "l/mp3-to-text"], ["M4A to Text", "l/m4a-to-text"], ["MP4 to Text", "l/mp4-to-text-converter"], ["WAV to Text", "l/wav-to-text"]]
  },
  {
    slug: "mp4-to-text-converter",
    title: "MP4 to Text",
    eyebrow: "Format",
    mode: "file",
    description: "Turn MP4 videos into text, captions, and shareable transcript pages.",
    examples: ["Courses", "Webinars", "Clips"]
  },
  {
    slug: "wav-to-text",
    title: "WAV to Text",
    eyebrow: "Format",
    mode: "file",
    description: "Transcribe high-quality WAV audio into editable text and export formats.",
    examples: ["Studio audio", "Research", "Archives"]
  },
  {
    slug: "m4a-to-text",
    title: "M4A to Text",
    eyebrow: "Format",
    mode: "file",
    description: "Convert M4A voice memos, meeting recordings, and podcast audio into editable transcripts, captions, summaries, and exports.",
    examples: ["Voice memos", "Meetings", "Podcast clips"],
    featurePrefix: "M4A Audio",
    related: [["M4A to TXT", "l/m4a-to-text"], ["M4A to SRT", "l/m4a-to-text"], ["MP3 to Text", "l/mp3-to-text"], ["WAV to Text", "l/wav-to-text"], ["Audio to Text", "tools/audio-to-text"], ["Video to Text", "l/video-to-text"], ["AAC to Text", "l/aac-to-text"], ["WebM to Text", "l/webm-to-text"]]
  },
  {
    slug: "aac-to-text",
    title: "AAC to Text",
    eyebrow: "Format",
    mode: "file",
    description: "Upload AAC recordings and turn them into searchable text, subtitle files, AI summaries, and shareable transcript pages.",
    examples: ["AAC audio", "Mobile recordings", "Lecture clips"],
    featurePrefix: "AAC Audio",
    related: [["AAC to TXT", "l/aac-to-text"], ["AAC to SRT", "l/aac-to-text"], ["M4A to Text", "l/m4a-to-text"], ["MP3 to Text", "l/mp3-to-text"], ["WAV to Text", "l/wav-to-text"], ["Audio to Text", "tools/audio-to-text"], ["OPUS to Text", "l/opus-to-text"], ["WebM to Text", "l/webm-to-text"]]
  },
  {
    slug: "opus-to-text",
    title: "OPUS to Text",
    eyebrow: "Format",
    mode: "file",
    description: "Transcribe OPUS audio from calls, voice notes, and messaging apps into accurate text and export-ready captions.",
    examples: ["Voice notes", "Call audio", "Messaging exports"],
    featurePrefix: "OPUS Audio",
    related: [["OPUS to TXT", "l/opus-to-text"], ["OPUS to SRT", "l/opus-to-text"], ["WebM to Text", "l/webm-to-text"], ["MP3 to Text", "l/mp3-to-text"], ["M4A to Text", "l/m4a-to-text"], ["AAC to Text", "l/aac-to-text"], ["Audio to Text", "tools/audio-to-text"], ["Link to Text", "tools/video-link-to-text"]]
  },
  {
    slug: "webm-to-text",
    title: "WebM to Text",
    eyebrow: "Format",
    mode: "file",
    description: "Convert WebM audio or video recordings into transcripts, summaries, captions, translations, and downloadable documents.",
    examples: ["Browser recordings", "WebM videos", "Screen recordings"],
    featurePrefix: "WebM Media",
    related: [["WebM to TXT", "l/webm-to-text"], ["WebM to SRT", "l/webm-to-text"], ["Video to Text", "l/video-to-text"], ["Audio to Text", "tools/audio-to-text"], ["OPUS to Text", "l/opus-to-text"], ["MP4 to Text", "l/mp4-to-text-converter"], ["M4A to Text", "l/m4a-to-text"], ["Link to Text", "tools/video-link-to-text"]]
  },
  {
    slug: "flac-to-text",
    title: "FLAC to Text",
    eyebrow: "Format",
    mode: "file",
    description: "Convert lossless FLAC recordings into accurate text and summaries.",
    examples: ["Lossless audio", "Interviews", "Long recordings"]
  },
  {
    slug: "amr-to-text",
    title: "AMR to Text",
    eyebrow: "Format",
    mode: "file",
    description: "Transcribe compact AMR voice recordings from mobile devices.",
    examples: ["Mobile voice notes", "Calls", "Field recordings"]
  },
  {
    slug: "wma-to-text",
    title: "WMA to Text",
    eyebrow: "Format",
    mode: "file",
    description: "Convert WMA files into text, subtitles, and downloadable documents.",
    examples: ["Legacy audio", "Archives", "Meetings"]
  },
  {
    slug: "mkv-to-text",
    title: "MKV to Text",
    eyebrow: "Format",
    mode: "file",
    description: "Extract speech from MKV videos and turn it into an editable transcript.",
    examples: ["Recorded sessions", "Courses", "Video archives"]
  },
  {
    slug: "wmv-to-text",
    title: "WMV to Text",
    eyebrow: "Format",
    mode: "file",
    description: "Transcribe WMV video files and export transcripts or subtitles.",
    examples: ["Legacy videos", "Training", "Presentations"]
  }
];

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((part) => {
      const upper = part.toUpperCase();
      return ["AI", "PDF", "SRT", "TXT", "VTT", "MP3", "MP4", "M4A", "AAC", "AMR", "MKA", "MKV", "MOV", "MPEG", "OGG", "OPUS", "WAV", "WEBM", "WMA", "WMV"].includes(upper)
        ? upper
        : `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`;
    })
    .join(" ");
}

function genericToolPage(slug: string): ToolPageRecord {
  const title = titleFromSlug(slug);
  const isLinkPage = slug.includes("youtube") || slug.includes("link");
  const isSummaryPage = slug.includes("summary") || slug.includes("notes");
  const isIndustryPage = slug.includes("medical") || slug.includes("legal") || slug.includes("meeting") || slug.includes("seminar") || slug.includes("lecture") || slug.includes("podcast");
  const output = slug.match(/-to-(pdf|srt|txt|vtt|word|transcript)$/)?.[1]?.toUpperCase();
  const subject = title.replace(/ Converter$| Generator$/g, "");

  return {
    slug,
    title,
    eyebrow: isIndustryPage ? "Use case" : output ? "Export" : "Converter",
    mode: isLinkPage ? "link" : "file",
    description: output
      ? `Convert recordings into ${output} with UniScribe. Upload audio or video, generate an accurate transcript, then export it in the format you need.`
      : isSummaryPage
        ? "Turn meetings, classes, podcasts, and recordings into transcripts, summaries, mind maps, key points, and export-ready notes."
        : `Use UniScribe for ${subject.toLowerCase()}. Upload audio or video, paste a public media link, generate text with AI, and export captions or documents.`,
    examples: isLinkPage ? ["YouTube links", "Public videos", "Exports"] : ["Audio files", "Video files", "Transcripts"],
    featurePrefix: subject,
    related: [["Speech to Text", "l/speech-to-text"], ["Voice to Text", "l/voice-to-text"], ["Audio to Text", "tools/audio-to-text"], ["Video to Text", "l/video-to-text"], ["MP3 to Text", "l/mp3-to-text"], ["WAV to Text", "l/wav-to-text"], ["YouTube to Text", "l/youtube-to-text"], ["MP4 to Text", "l/mp4-to-text-converter"]]
  };
}

const languagePages: ToolPageRecord[] = supportedLanguageNames.map((language) => ({
  slug: `transcribe-${languageSlug(language)}-audio`,
  title: `Transcribe ${language} Audio to Text Powered by AI`,
  eyebrow: "Language",
  mode: "file",
  description: `Turn a 1-hour ${language} audio file into text in under 1 minute. Support for multiple formats and easy export options make transcription a breeze.`,
  examples: ["Audio files", "Video files", "Subtitles"],
  language,
  steps: [
    ["Upload Your Audio File", "Click the Choose a File button and select your audio file. Supported formats include mp3, mp4, m4a, wav, webm, mov, aac, ogg, and opus."],
    [`Select ${language} and Transcribe`, "Choose the correct language to improve transcript accuracy, then click Transcribe."],
    ["Export Text Result", "Click Export and choose SRT, VTT, DOCX, TXT, PDF, or CSV."]
  ]
}));

function findToolPage(slug: string) {
  return [...tools, ...languagePages].find((item) => item.slug === slug);
}

export function ToolPage({slug, page: providedPage}: {slug: string; page?: ToolPageRecord}) {
  const locale = useLocale();
  const copy = getWorkspaceCopy(locale);
  const page = providedPage ?? findToolPage(slug) ?? genericToolPage(slug);
  const related = page.related ?? (page.language
    ? languagePages.filter((item) => item.slug !== page.slug).slice(0, 12).map((item) => [item.language ?? item.title, `languages/${item.slug}`] as [string, string])
    : tools.filter((item) => item.slug !== page.slug).slice(0, 8).map((item) => [item.title, item.kind === "utility" || item.slug === "audio-to-text" || item.slug === "video-link-to-text" ? `tools/${item.slug}` : `l/${item.slug}`] as [string, string]));
  const uploadHref = `/${locale}/upload?mode=${page.mode}`;
  const proofPoints: Array<[LucideIcon, string, string]> = [
    [FileAudio, "Supports 11 formats", "mp3, mp4, wav, m4a, webm, mov, mkv"],
    [Languages, "Supports 87 languages", "Auto detect and multilingual transcripts"],
    [Download, "Export in 6 formats", "TXT, DOCX, PDF, SRT, VTT, CSV"]
  ];
  const workflow = page.steps ?? [
    [page.mode === "link" ? "Paste a link" : "Upload a file", page.mode === "link" ? "Paste a public media URL from a supported platform." : "Choose an audio or video file from your device."],
    ["Click Transcribe", "UniScribe creates an editable transcript with progress updates."],
    ["Export or Share", "Download captions and documents or create a share link."]
  ] as Array<[string, string]>;
  const featurePrefix = page.featurePrefix ?? page.title.replace(/^Free Online | Converter$| Powered by AI$/g, "").trim();
  const isLanguagePage = Boolean(page.language);
  const isUtilityPage = page.kind === "utility";
  const isYoutubeSubtitlePage = page.kind === "youtube-subtitles";
  const isYoutubeVideoDownloaderPage = page.kind === "youtube-video-downloader";
  const threeStepTitle = page.threeStepTitle ?? (isLanguagePage ? `Transcribe ${page.language} Audio to Text in Three Easy Steps` : `${page.title.replace(/^(Free Online |Online )/, "").replace(/ Converter Powered by AI$/, "").replace(/ Powered by AI$/, "")} in Three Easy Steps`);
  const speedTitle = page.speedTitle ?? `Convert ${featurePrefix} to Text in Seconds`;
  const insightTitle = page.insightTitle ?? `Generate Summaries, Mind Maps, and Key Insights from ${featurePrefix}`;
  const languages = supportedLanguageNames.slice(0, 8);
  const bestPractices = [
    ["Use clear audio", "A quiet recording with stable volume improves punctuation, timestamps, speaker labels, and proper nouns."],
    ["Choose the right input", "Upload a file from your device or paste a public video link when you do not want to download first."],
    ["Review before export", "Edit the transcript, then export TXT, DOCX, PDF, SRT, VTT, or CSV for the format you need."]
  ] as const;
  const toolFaqs = page.faqs ?? (isLanguagePage
    ? [
        [`How do I transcribe ${page.language} audio to text?`, `Upload your audio file, choose ${page.language}, and start transcription. You can export the finished text in subtitle and document formats.`],
        [`Can UniScribe translate ${page.language} transcripts?`, "Yes. After transcription, UniScribe can generate AI translation and summary outputs."],
        ["Which export formats are available?", "TXT, DOCX, PDF, SRT, VTT, CSV, and structured exports are available for completed transcripts."]
      ]
    : [
        [`Can I use ${page.title.replace(/ Powered by AI|Free Online |Online /g, "")} for free?`, "Yes. The Free plan includes monthly minutes, daily file limits, transcript editing, and standard exports."],
        ["Which files are supported?", "UniScribe supports common audio and video formats including mp3, wav, m4a, flac, mp4, mov, mkv, webm, and wmv."],
        ["Can I export captions?", "Yes. Completed jobs export SRT and VTT, plus TXT, DOCX, PDF, CSV, and other transcript formats."]
      ]);

  if (isUtilityPage || isYoutubeSubtitlePage || isYoutubeVideoDownloaderPage) {
    const relatedUtility = [
      ["Audio to Text Converter", "Convert your audio files to text", `/${locale}/tools/audio-to-text`],
      ["Video to Text Converter", "Extract text from your videos", `/${locale}/l/video-to-text`]
    ] as const;
    const trustPoints: Array<[LucideIcon, string, string]> = [
      [LockKeyhole, "100% Secure", "Browser-based conversion - files never leave your device"],
      [Zap, "Fast & Free", "Fast, private, and completely free to use"],
      [BadgeCheck, "No Registration", "No registration or upload to servers required"]
    ];

    return (
      <main className="min-h-screen bg-paper pt-24">
        <SiteHeader />
        <section className="px-4 py-12 md:px-8">
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="space-y-4 text-center">
              <h1 className="text-4xl font-black tracking-tight text-ink md:text-5xl">{page.title}</h1>
              <h2 className="text-xl font-bold leading-8 text-ink/65">{page.utilitySubtitle ?? page.description}</h2>
            </div>
            <div className="grid gap-4 text-center md:grid-cols-3">
              {trustPoints.map(([Icon, title, text]) => (
                <article key={title} className="flex flex-col items-center gap-2 rounded-lg bg-white p-4 shadow-soft">
                  <Icon size={24} className="text-violet" />
                  <h2 className="text-lg font-black text-ink">{title}</h2>
                  <h3 className="text-sm font-bold leading-6 text-ink/60">{text}</h3>
                </article>
              ))}
            </div>
            {isYoutubeSubtitlePage ? (
              <YoutubeSubtitleTool />
            ) : isYoutubeVideoDownloaderPage ? (
              <YoutubeVideoDownloader />
            ) : (
              <UtilityToolWidget kind={page.slug as "wav-to-mp3-converter" | "video-to-audio-extractor"} accept={page.accept} selectLabel={page.selectLabel} actionLabel={page.actionLabel} />
            )}
          </div>
        </section>
        <section className="px-4 py-12 md:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-black tracking-tight text-ink">{threeStepTitle}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {workflow.map(([title, text], index) => {
                const Icon = index === 0 ? FileUp : index === 1 ? Zap : Download;
                return (
                  <article key={title} className="rounded-xl border border-ink/10 bg-white p-6 shadow-soft">
                    <Icon className="text-violet" size={24} />
                    <h3 className="mt-4 text-lg font-black">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-ink/65">{text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
        <section className="border-y border-ink/10 bg-white px-4 py-12 md:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-3xl font-black tracking-tight text-ink">{speedTitle}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {(page.utilitySections ?? []).map(([title, text]) => (
                <article key={title} className="rounded-xl border border-ink/10 bg-paper p-6 shadow-soft">
                  <BadgeCheck className="text-violet" size={22} />
                  <h3 className="mt-4 text-lg font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink/65">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="px-4 pb-6 pt-4 md:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-black tracking-tight text-ink">You might also like</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {relatedUtility.map(([title, text, href]) => (
                <a key={title} href={href} className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white p-4 shadow-soft transition hover:border-violet/25 hover:text-violet">
                  <FileAudio size={22} className="text-violet" />
                  <span>
                    <span className="block font-black">{title}</span>
                    <span className="block text-sm font-bold text-ink/55">{text}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>
        <section className="px-4 py-12 md:px-8">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-ink">Use UniScribe after conversion</h2>
              <p className="mt-3 text-sm leading-6 text-ink/65">When the file is ready, send the audio or video into UniScribe to create transcripts, subtitles, summaries, translations, mind maps, and shareable pages.</p>
              <a href={`/${locale}/upload?mode=file`} className="btn-primary mt-6">Transcribe a file</a>
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-ink">Private browser processing</h2>
              <p className="mt-3 text-sm leading-6 text-ink/65">These free tools are designed for quick local preparation. Pick a file, process it in your browser, then download the result before choosing whether to upload anything.</p>
            </div>
          </div>
        </section>
        <section className="px-4 py-16 md:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-black tracking-tight text-ink">Frequently Asked Questions</h2>
            <div className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
              {toolFaqs.map(([question, answer]) => (
                <article key={question} className="py-5">
                  <h3 className="font-black text-ink">{question}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink/65">{answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper pt-20">
      <SiteHeader />
      <section className="border-b border-violet/10 bg-lavender px-4 pb-14 pt-12 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <p className="eyebrow">{page.eyebrow}</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-tight tracking-tight text-violet md:text-6xl">{page.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-ink/68">{page.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={uploadHref} className="btn-primary">
                <UploadCloud size={18} />
                Try It Free
              </a>
              <a href={`/${locale}/pricing`} className="btn-outline">
                Pricing
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
          <div className="relative min-h-[320px] overflow-hidden rounded-xl border border-ink/10 bg-white shadow-lifted">
            <Image src="/uniscribe-assets/transcription.png" alt={`${page.title} workspace preview`} fill sizes="(min-width: 1024px) 420px, 100vw" className="object-cover object-top" priority />
          </div>
        </div>
        <div className="mx-auto mt-8 grid max-w-7xl gap-3 md:grid-cols-3">
          {proofPoints.map(([Icon, title, text]) => (
            <article key={title} className="rounded-lg border border-ink/10 bg-white/75 p-4 shadow-soft">
              <Icon className="text-violet" size={22} />
              <h3 className="mt-3 font-black">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-ink/60">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-16 md:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black tracking-tight text-ink">{threeStepTitle}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {workflow.map(([title, text], index) => {
              const Icon = index === 0 ? UploadCloud : index === 1 ? Brain : Download;
              return (
              <article key={title} className="rounded-xl border border-ink/10 bg-white p-6 shadow-soft">
                <Icon className="text-violet" size={24} />
                <h3 className="mt-4 text-lg font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/65">{text}</p>
              </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-ink/10 bg-white px-4 py-16 md:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-black tracking-tight text-ink">{isLanguagePage ? "Supported Languages" : "More Audio & Video to Text Converters"}</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {related.map(([label, href]) => (
              <a key={`${label}-${href}`} href={`/${locale}/${href}`} className="rounded-md border border-ink/10 bg-paper px-4 py-2 text-sm font-black text-ink/70 shadow-soft transition hover:border-violet/25 hover:text-violet">
                {label}
              </a>
            ))}
          </div>
          <a href={uploadHref} className="btn-primary mt-8">{copy.freeSignup}</a>
        </div>
      </section>

      {isUtilityPage ? (
        <section className="border-y border-ink/10 bg-white px-4 py-16 md:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-black tracking-tight text-ink">{speedTitle}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {(page.utilitySections ?? []).map(([title, text]) => (
                <article key={title} className="rounded-xl border border-ink/10 bg-white p-6 shadow-soft">
                  <BadgeCheck className="text-violet" size={22} />
                  <h3 className="mt-4 text-lg font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink/65">{text}</p>
                </article>
              ))}
            </div>
            <a href={uploadHref} className="btn-primary mt-8">Try It Free</a>
          </div>
        </section>
      ) : !isLanguagePage ? (
        <section className="border-y border-ink/10 bg-white px-4 py-16 md:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-ink">{speedTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-ink/65">With AI technology, you can quickly turn your audio and video files into text in just a few minutes. UniScribe supports 87 languages and a range of formats.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {page.examples.map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper px-4 py-2 text-sm font-black text-ink/70">
                    <BadgeCheck className="text-violet" size={17} />
                    {item}
                  </span>
                ))}
              </div>
              <a href={uploadHref} className="btn-primary mt-6">Try It Free</a>
            </div>
            <div className="relative min-h-[300px] overflow-hidden rounded-xl border border-ink/10 bg-paper shadow-soft">
              <Image src="/uniscribe-assets/transcription.png" alt="UniScribe transcription preview" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover object-top" />
            </div>
          </div>
        </section>
      ) : null}

      {!isLanguagePage && !isUtilityPage ? (
        <section className="px-4 py-16 md:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="relative min-h-[300px] overflow-hidden rounded-xl border border-ink/10 bg-paper shadow-soft">
              <Image src="/uniscribe-assets/summary.png" alt="UniScribe AI summary preview" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover object-top" />
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-ink">{insightTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-ink/65">Summarize long recordings, extract key points, create mind maps, and ask questions from the finished transcript without leaving UniScribe.</p>
              <a href={uploadHref} className="btn-primary mt-6">Try It Free</a>
            </div>
          </div>
        </section>
      ) : null}

      {!isLanguagePage && !isUtilityPage ? (
        <section className="border-y border-ink/10 bg-white px-4 py-16 md:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-ink">Export Transcript in Various Formats (SRT, TXT, Word, PDF, CSV, VTT)</h2>
              <p className="mt-3 text-sm leading-6 text-ink/65">Export transcribed text in txt, docx, pdf, srt, vtt, and csv. You can also share a link for others to view the transcript directly.</p>
              <a href={uploadHref} className="btn-primary mt-6">Try It Free</a>
            </div>
            <div className="relative min-h-[300px] overflow-hidden rounded-xl border border-ink/10 bg-paper shadow-soft">
              <Image src="/uniscribe-assets/export.png" alt="UniScribe export preview" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover object-top" />
            </div>
          </div>
        </section>
      ) : null}

      {isLanguagePage ? (
        <section className="px-4 py-16 md:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-black tracking-tight text-ink">3 Reasons to Choose UniScribe</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                ["Spend a Little to Save a Lot on Audio-to-Text", "UniScribe offers 120 minutes of free transcription every month, with a daily limit of 3 files. If you need more minutes, paid plans stay affordable."],
                ["More AI Features Available Beyond Audio-to-Text", "Generate summaries, mind maps, key points, translations, captions, and exports from the same workspace."],
                [`Convert ${page.language} Audio to Text Fast and Accurate`, "Clear audio and the correct language setting help UniScribe produce faster, more accurate transcripts."]
              ].map(([title, text]) => (
                <article key={title} className="rounded-xl border border-ink/10 bg-white p-6 shadow-soft">
                  <BadgeCheck className="text-violet" size={22} />
                  <h3 className="mt-4 text-lg font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink/65">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="px-4 py-16 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-ink">Supported Languages</h2>
                <p className="mt-2 text-sm leading-6 text-ink/60">Below are the main languages supported for transcription and subtitles.</p>
              </div>
              <Languages className="text-violet" size={34} />
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {languages.map((item) => (
                <a key={item} href={`/${locale}/languages/transcribe-${languageSlug(item)}-audio`} className="rounded-xl border border-ink/10 bg-white p-4 font-black shadow-soft transition hover:-translate-y-0.5 hover:border-violet/25 hover:text-violet">{item}</a>
              ))}
            </div>
            <a href={`/${locale}/languages`} className="btn-outline mt-6">See all languages</a>
          </div>
        </section>
      )}
      <section className="px-4 py-16 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-ink">Affordable Pricing</h2>
            <p className="mt-3 text-sm leading-6 text-ink/65">Effortlessly transcribe audio and video, saving you time and helping you focus on what matters.</p>
            <div className="mt-5 grid gap-3 text-sm">
              {[
                ["Free", "$0", "120 minutes per month"],
                ["Basic", "$6", "1200 minutes per month"],
                ["Standard", "$12", "3000 minutes per month"],
                ["Pro", "$18", "6000 minutes per month"]
              ].map(([name, price, quota]) => (
                <a key={name} href={`/${locale}/pricing`} className="flex items-center justify-between rounded-lg border border-ink/10 bg-white px-4 py-3 font-black shadow-soft transition hover:border-violet/25 hover:text-violet">
                  <span>{name}</span>
                  <span className="text-ink/55">{price} / month · {quota}</span>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-ink">Frequently Asked Questions</h2>
            <div className="mt-5 grid gap-3">
              {toolFaqs.map(([question, answer]) => (
                <article key={question} className="rounded-xl border border-ink/10 bg-white p-5 shadow-soft">
                  <h3 className="font-black text-ink">{question}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink/65">{answer}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
      {!isLanguagePage && !isUtilityPage ? (
        <section className="px-4 py-16 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-black tracking-tight text-ink">Best Practices for Audio & Video Transcription</h2>
              <p className="mt-3 text-sm leading-6 text-ink/65">A few simple habits help UniScribe return cleaner transcripts, captions, summaries, and exports.</p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {bestPractices.map(([title, text]) => (
                <article key={title} className="rounded-xl border border-ink/10 bg-white p-6 shadow-soft">
                  <BadgeCheck className="text-violet" size={22} />
                  <h3 className="mt-4 text-lg font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink/65">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <SiteFooter />
    </main>
  );
}
