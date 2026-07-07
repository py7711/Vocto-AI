"use client";

import Image from "next/image";
import {useLocale} from "next-intl";
import {ArrowRight, BadgeCheck, Brain, Download, FileAudio, FileUp, Languages, LockKeyhole, UploadCloud, Zap, type LucideIcon} from "lucide-react";
import {SiteFooter, SiteHeader} from "@/components/site-shell";
import {getWorkspaceCopy} from "@/components/workspace/copy";
import {UtilityToolWidget} from "@/components/utility-tool-widget";
import {YoutubeSubtitleTool} from "@/components/youtube-subtitle-tool";
import {YoutubeVideoDownloader} from "@/components/youtube-video-downloader";
import {languageSlug, localizedSupportedLanguageName, supportedLanguageNames} from "@/lib/language-pages";
import {isLocale, type Locale} from "@/lib/locales";

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

type ToolChrome = {
  converter: string;
  tool: string;
  freeTool: string;
  format: string;
  language: string;
  useCase: string;
  export: string;
  tryItFree: string;
  pricing: string;
  freeSignup: string;
  uploadFile: string;
  pasteLink: string;
  clickTranscribe: string;
  exportShare: string;
  uploadFileText: string;
  pasteLinkText: string;
  transcribeText: string;
  exportShareText: string;
  proofFormatsTitle: string;
  proofFormatsText: string;
  proofLanguagesTitle: string;
  proofLanguagesText: string;
  proofExportsTitle: string;
  proofExportsText: string;
  threeStepTemplate: string;
  speedTemplate: string;
  insightTemplate: string;
  aiFastText: string;
  insightText: string;
  exportTitle: string;
  exportText: string;
  moreConverters: string;
  supportedLanguages: string;
  languagesText: string;
  seeAllLanguages: string;
  reasonsTitle: string;
  reasonSaveTitle: string;
  reasonSaveText: string;
  reasonAiTitle: string;
  reasonAiText: string;
  reasonFastTemplate: string;
  reasonFastText: string;
  pricingTitle: string;
  pricingText: string;
  perMonth: string;
  plans: ReadonlyArray<readonly [string, string, string]>;
  faqTitle: string;
  genericFaqs: ReadonlyArray<readonly [string, string]>;
  languageFaqs: ReadonlyArray<readonly [string, string]>;
  bestTitle: string;
  bestText: string;
  bestCards: ReadonlyArray<readonly [string, string]>;
  trustPoints: ReadonlyArray<readonly [string, string]>;
  relatedUtility: ReadonlyArray<readonly [string, string]>;
  youMightAlsoLike: string;
  useAfterTitle: string;
  useAfterText: string;
  privateTitle: string;
  privateText: string;
  transcribeFile: string;
};

const toolChromeByLocale: Partial<Record<Locale, ToolChrome>> = {
  en: {
    converter: "Converter",
    tool: "Tool",
    freeTool: "Free tool",
    format: "Format",
    language: "Language",
    useCase: "Use case",
    export: "Export",
    tryItFree: "Try It Free",
    pricing: "Pricing",
    freeSignup: "Start for Free",
    uploadFile: "Upload a file",
    pasteLink: "Paste a link",
    clickTranscribe: "Click Transcribe",
    exportShare: "Export or Share",
    uploadFileText: "Choose an audio or video file from your device.",
    pasteLinkText: "Paste a public media URL from a supported platform.",
    transcribeText: "UniScribe creates an editable transcript with progress updates.",
    exportShareText: "Download captions and documents or create a share link.",
    proofFormatsTitle: "Supports 11 formats",
    proofFormatsText: "mp3, mp4, wav, m4a, webm, mov, mkv",
    proofLanguagesTitle: "Supports 63 languages",
    proofLanguagesText: "Auto detect and multilingual transcripts",
    proofExportsTitle: "Export in 6 formats",
    proofExportsText: "TXT, DOCX, PDF, SRT, VTT, CSV",
    threeStepTemplate: "{name} in Three Easy Steps",
    speedTemplate: "Convert {name} in Seconds",
    insightTemplate: "Generate Summaries, Mind Maps, and Key Insights from {name}",
    aiFastText: "With AI technology, you can quickly turn audio and video into text in just a few minutes. UniScribe supports 63 languages and a range of formats.",
    insightText: "Summarize long recordings, extract key points, create mind maps, and ask questions from the finished transcript without leaving UniScribe.",
    exportTitle: "Export Transcript in Various Formats (SRT, TXT, Word, PDF, CSV, VTT)",
    exportText: "Export transcribed text in TXT, DOCX, PDF, SRT, VTT, and CSV. You can also share a link for others to view the transcript directly.",
    moreConverters: "More Audio & Video to Text Converters",
    supportedLanguages: "Supported Languages",
    languagesText: "Below are the main languages supported for transcription and subtitles.",
    seeAllLanguages: "See all languages",
    reasonsTitle: "3 Reasons to Choose UniScribe",
    reasonSaveTitle: "Spend a Little to Save a Lot on Audio-to-Text",
    reasonSaveText: "UniScribe offers free monthly minutes, daily free files, and affordable paid plans when you need more.",
    reasonAiTitle: "More AI Features Beyond Audio-to-Text",
    reasonAiText: "Generate summaries, mind maps, key points, translations, captions, and exports from the same workspace.",
    reasonFastTemplate: "Convert {language} Audio to Text Fast and Accurate",
    reasonFastText: "Clear audio and the correct language setting help UniScribe produce faster, more accurate transcripts.",
    pricingTitle: "Affordable Pricing",
    pricingText: "Effortlessly transcribe audio and video, saving you time and helping you focus on what matters.",
    perMonth: "month",
    plans: [["Free", "$0", "120 minutes per month"], ["Basic", "$6", "1200 minutes per month"], ["Standard", "$12", "3000 minutes per month"], ["Pro", "$18", "6000 minutes per month"]],
    faqTitle: "Frequently Asked Questions",
    genericFaqs: [["Can I use this for free?", "Yes. The Free plan includes monthly minutes, daily file limits, transcript editing, and standard exports."], ["Which files are supported?", "UniScribe supports common audio and video formats including mp3, wav, m4a, flac, mp4, mov, mkv, webm, and wmv."], ["Can I export captions?", "Yes. Completed jobs export SRT and VTT, plus TXT, DOCX, PDF, CSV, and other transcript formats."]],
    languageFaqs: [["How do I transcribe this language?", "Upload your audio file, choose the right language, and start transcription. You can export the finished text in subtitle and document formats."], ["Can UniScribe translate transcripts?", "Yes. After transcription, UniScribe can generate AI translation and summary outputs."], ["Which export formats are available?", "TXT, DOCX, PDF, SRT, VTT, CSV, and structured exports are available for completed transcripts."]],
    bestTitle: "Best Practices for Audio & Video Transcription",
    bestText: "A few simple habits help UniScribe return cleaner transcripts, captions, summaries, and exports.",
    bestCards: [["Use clear audio", "A quiet recording with stable volume improves punctuation, timestamps, speaker labels, and proper nouns."], ["Choose the right input", "Upload a file from your device or paste a public video link when you do not want to download first."], ["Review before export", "Edit the transcript, then export TXT, DOCX, PDF, SRT, VTT, or CSV for the format you need."]],
    trustPoints: [["100% Secure", "Browser-based conversion keeps selected files on your device."], ["Fast & Free", "Fast, private, and free to use."], ["No Registration", "No registration or server upload required."]],
    relatedUtility: [["Audio to Text Converter", "Convert your audio files to text"], ["Video to Text Converter", "Extract text from your videos"]],
    youMightAlsoLike: "You might also like",
    useAfterTitle: "Use UniScribe after conversion",
    useAfterText: "When the file is ready, send it into UniScribe to create transcripts, subtitles, summaries, translations, mind maps, and shareable pages.",
    privateTitle: "Private browser processing",
    privateText: "These free tools are designed for quick local preparation. Pick a file, process it in your browser, then download the result.",
    transcribeFile: "Transcribe a file"
  },
  zh: {
    converter: "转换器", tool: "工具", freeTool: "免费工具", format: "格式", language: "语言", useCase: "使用场景", export: "导出", tryItFree: "免费试用", pricing: "价格", freeSignup: "免费开始", uploadFile: "上传文件", pasteLink: "粘贴链接", clickTranscribe: "点击转写", exportShare: "导出或分享", uploadFileText: "从设备选择音频或视频文件。", pasteLinkText: "粘贴受支持平台的公开视频链接。", transcribeText: "UniScribe 会生成可编辑转写，并实时更新进度。", exportShareText: "下载字幕和文档，或创建分享链接。", proofFormatsTitle: "支持 11 种格式", proofFormatsText: "mp3、mp4、wav、m4a、webm、mov、mkv", proofLanguagesTitle: "支持 63 种语言", proofLanguagesText: "自动识别并支持多语言转写", proofExportsTitle: "支持 6 种导出", proofExportsText: "TXT、DOCX、PDF、SRT、VTT、CSV", threeStepTemplate: "三步完成 {name}", speedTemplate: "快速转换 {name}", insightTemplate: "从 {name} 生成总结、思维导图和关键洞察", aiFastText: "借助 AI，你可以在几分钟内把音频和视频转成文字。UniScribe 支持 63 种语言和多种常见格式。", insightText: "无需离开 UniScribe，就能从转写结果生成摘要、关键点、思维导图和问答。", exportTitle: "导出多种格式的转写文本（SRT、TXT、Word、PDF、CSV、VTT）", exportText: "可导出 TXT、DOCX、PDF、SRT、VTT 和 CSV，也可以分享链接让他人直接查看。", moreConverters: "更多音视频转文字转换器", supportedLanguages: "支持的语言", languagesText: "以下是转写和字幕支持的主要语言。", seeAllLanguages: "查看全部语言", reasonsTitle: "选择 UniScribe 的 3 个理由", reasonSaveTitle: "少花一点，节省大量转写时间", reasonSaveText: "UniScribe 提供每月免费分钟数和每日免费文件，更多需求也有实惠套餐。", reasonAiTitle: "音频转文字之外还有更多 AI 能力", reasonAiText: "在同一个工作台生成摘要、思维导图、关键点、翻译、字幕和导出文件。", reasonFastTemplate: "快速准确地将 {language} 音频转成文字", reasonFastText: "清晰音频和正确语言设置能帮助 UniScribe 更快生成更准确的转写。", pricingTitle: "实惠价格", pricingText: "轻松转写音频和视频，节省时间，把注意力放在更重要的事情上。", perMonth: "月", plans: [["免费版", "$0", "每月 120 分钟"], ["基础版", "$6", "每月 1200 分钟"], ["标准版", "$12", "每月 3000 分钟"], ["专业版", "$18", "每月 6000 分钟"]], faqTitle: "常见问题", genericFaqs: [["可以免费使用吗？", "可以。免费版包含每月分钟数、每日文件限制、转写编辑和标准导出。"], ["支持哪些文件？", "UniScribe 支持 mp3、wav、m4a、flac、mp4、mov、mkv、webm、wmv 等常见音视频格式。"], ["可以导出字幕吗？", "可以。完成后的任务可导出 SRT、VTT，以及 TXT、DOCX、PDF、CSV 等格式。"]], languageFaqs: [["如何转写该语言？", "上传音频文件，选择正确语言并开始转写，完成后可导出字幕或文档格式。"], ["UniScribe 可以翻译转写吗？", "可以。转写完成后可生成 AI 翻译和摘要。"], ["支持哪些导出格式？", "完成的转写可导出 TXT、DOCX、PDF、SRT、VTT、CSV 和结构化格式。"]], bestTitle: "音视频转写最佳实践", bestText: "几个简单习惯能让 UniScribe 返回更清晰的转写、字幕、摘要和导出结果。", bestCards: [["使用清晰音频", "安静、音量稳定的录音有助于改善标点、时间戳、说话人标签和专有名词。"], ["选择正确输入", "可上传本地文件，也可在不想先下载时粘贴公开视频链接。"], ["导出前检查", "先编辑转写，再按需求导出 TXT、DOCX、PDF、SRT、VTT 或 CSV。"]], trustPoints: [["100% 安全", "浏览器内处理，所选文件保留在你的设备上。"], ["快速免费", "快速、私密，并且可免费使用。"], ["无需注册", "无需注册，也无需上传到服务器。"]], relatedUtility: [["音频转文字转换器", "将音频文件转换为文字"], ["视频转文字转换器", "从视频中提取文字"]], youMightAlsoLike: "你可能也喜欢", useAfterTitle: "转换后继续使用 UniScribe", useAfterText: "文件准备好后，可发送到 UniScribe 生成转写、字幕、摘要、翻译、思维导图和分享页。", privateTitle: "浏览器私密处理", privateText: "这些免费工具用于快速本地准备。选择文件，在浏览器中处理，然后下载结果。", transcribeFile: "转写文件"
  },
  "zh-TW": {
    converter: "轉換器", tool: "工具", freeTool: "免費工具", format: "格式", language: "語言", useCase: "使用場景", export: "匯出", tryItFree: "免費試用", pricing: "價格", freeSignup: "免費開始", uploadFile: "上傳檔案", pasteLink: "貼上連結", clickTranscribe: "點擊轉寫", exportShare: "匯出或分享", uploadFileText: "從裝置選擇音訊或影片檔。", pasteLinkText: "貼上支援平台的公開影片連結。", transcribeText: "UniScribe 會建立可編輯轉寫並更新進度。", exportShareText: "下載字幕和文件，或建立分享連結。", proofFormatsTitle: "支援 11 種格式", proofFormatsText: "mp3、mp4、wav、m4a、webm、mov、mkv", proofLanguagesTitle: "支援 63 種語言", proofLanguagesText: "自動識別並支援多語轉寫", proofExportsTitle: "支援 6 種匯出", proofExportsText: "TXT、DOCX、PDF、SRT、VTT、CSV", threeStepTemplate: "三步完成 {name}", speedTemplate: "快速轉換 {name}", insightTemplate: "從 {name} 產生摘要、心智圖和重點洞察", aiFastText: "透過 AI，你可以在幾分鐘內把音訊和影片轉成文字。UniScribe 支援 63 種語言和多種格式。", insightText: "不需離開 UniScribe，就能從轉寫結果產生摘要、重點、心智圖和問答。", exportTitle: "匯出多種格式的轉寫文字（SRT、TXT、Word、PDF、CSV、VTT）", exportText: "可匯出 TXT、DOCX、PDF、SRT、VTT 和 CSV，也可分享連結給他人查看。", moreConverters: "更多音影片轉文字轉換器", supportedLanguages: "支援的語言", languagesText: "以下是轉寫和字幕支援的主要語言。", seeAllLanguages: "查看全部語言", reasonsTitle: "選擇 UniScribe 的 3 個理由", reasonSaveTitle: "少花一點，節省大量轉寫時間", reasonSaveText: "UniScribe 提供每月免費分鐘數和每日免費檔案，更多需求也有實惠方案。", reasonAiTitle: "音訊轉文字之外還有更多 AI 能力", reasonAiText: "在同一工作台產生摘要、心智圖、重點、翻譯、字幕和匯出檔案。", reasonFastTemplate: "快速準確地將 {language} 音訊轉成文字", reasonFastText: "清晰音訊和正確語言設定能幫助 UniScribe 更快產生更準確的轉寫。", pricingTitle: "實惠價格", pricingText: "輕鬆轉寫音訊和影片，節省時間，把注意力放在更重要的事情上。", perMonth: "月", plans: [["免費版", "$0", "每月 120 分鐘"], ["基礎版", "$6", "每月 1200 分鐘"], ["標準版", "$12", "每月 3000 分鐘"], ["專業版", "$18", "每月 6000 分鐘"]], faqTitle: "常見問題", genericFaqs: [["可以免費使用嗎？", "可以。免費版包含每月分鐘數、每日檔案限制、轉寫編輯和標準匯出。"], ["支援哪些檔案？", "UniScribe 支援 mp3、wav、m4a、flac、mp4、mov、mkv、webm、wmv 等常見音影片格式。"], ["可以匯出字幕嗎？", "可以。完成後可匯出 SRT、VTT，以及 TXT、DOCX、PDF、CSV 等格式。"]], languageFaqs: [["如何轉寫該語言？", "上傳音訊檔，選擇正確語言並開始轉寫，完成後可匯出字幕或文件。"], ["UniScribe 可以翻譯轉寫嗎？", "可以。轉寫完成後可產生 AI 翻譯和摘要。"], ["支援哪些匯出格式？", "完成的轉寫可匯出 TXT、DOCX、PDF、SRT、VTT、CSV 和結構化格式。"]], bestTitle: "音影片轉寫最佳實踐", bestText: "幾個簡單習慣能讓 UniScribe 返回更清晰的轉寫、字幕、摘要和匯出結果。", bestCards: [["使用清晰音訊", "安靜、音量穩定的錄音有助於改善標點、時間戳、說話人標籤和專有名詞。"], ["選擇正確輸入", "可上傳本機檔案，也可在不想先下載時貼上公開影片連結。"], ["匯出前檢查", "先編輯轉寫，再按需求匯出 TXT、DOCX、PDF、SRT、VTT 或 CSV。"]], trustPoints: [["100% 安全", "瀏覽器內處理，所選檔案保留在你的裝置上。"], ["快速免費", "快速、私密，而且可免費使用。"], ["無需註冊", "無需註冊，也無需上傳到伺服器。"]], relatedUtility: [["音訊轉文字轉換器", "將音訊檔轉換為文字"], ["影片轉文字轉換器", "從影片中提取文字"]], youMightAlsoLike: "你可能也喜歡", useAfterTitle: "轉換後繼續使用 UniScribe", useAfterText: "檔案準備好後，可送到 UniScribe 產生轉寫、字幕、摘要、翻譯、心智圖和分享頁。", privateTitle: "瀏覽器私密處理", privateText: "這些免費工具用於快速本機準備。選擇檔案，在瀏覽器中處理，然後下載結果。", transcribeFile: "轉寫檔案"
  },
  ja: {
    converter: "変換ツール", tool: "ツール", freeTool: "無料ツール", format: "形式", language: "言語", useCase: "用途", export: "エクスポート", tryItFree: "無料で試す", pricing: "料金", freeSignup: "無料で開始", uploadFile: "ファイルをアップロード", pasteLink: "リンクを貼り付け", clickTranscribe: "文字起こしを開始", exportShare: "エクスポートまたは共有", uploadFileText: "デバイスから音声または動画ファイルを選択します。", pasteLinkText: "対応プラットフォームの公開メディア URL を貼り付けます。", transcribeText: "UniScribe が編集可能な文字起こしを作成し、進行状況を表示します。", exportShareText: "字幕や文書をダウンロードするか、共有リンクを作成します。", proofFormatsTitle: "11 形式に対応", proofFormatsText: "mp3, mp4, wav, m4a, webm, mov, mkv", proofLanguagesTitle: "63 言語に対応", proofLanguagesText: "自動判定と多言語文字起こし", proofExportsTitle: "6 形式でエクスポート", proofExportsText: "TXT, DOCX, PDF, SRT, VTT, CSV", threeStepTemplate: "{name} を 3 ステップで完了", speedTemplate: "{name} をすばやく変換", insightTemplate: "{name} から要約、マインドマップ、重要ポイントを生成", aiFastText: "AI により、音声や動画を数分でテキスト化できます。UniScribe は 63 言語と多くの形式に対応しています。", insightText: "UniScribe から離れずに、完成した文字起こしから要約、重要ポイント、マインドマップ、質問を作成できます。", exportTitle: "文字起こしを複数形式でエクスポート（SRT、TXT、Word、PDF、CSV、VTT）", exportText: "TXT、DOCX、PDF、SRT、VTT、CSV でエクスポートでき、共有リンクも作成できます。", moreConverters: "その他の音声・動画テキスト変換", supportedLanguages: "対応言語", languagesText: "文字起こしと字幕で主に対応している言語です。", seeAllLanguages: "すべての言語を見る", reasonsTitle: "UniScribe を選ぶ 3 つの理由", reasonSaveTitle: "少ない費用で文字起こし時間を節約", reasonSaveText: "無料分数と日次無料ファイルがあり、必要に応じて手頃な有料プランを使えます。", reasonAiTitle: "文字起こし以上の AI 機能", reasonAiText: "同じワークスペースで要約、マインドマップ、重要ポイント、翻訳、字幕、エクスポートを生成できます。", reasonFastTemplate: "{language} 音声をすばやく正確にテキスト化", reasonFastText: "明瞭な音声と正しい言語設定により、より速く正確な文字起こしが得られます。", pricingTitle: "手頃な料金", pricingText: "音声と動画を簡単に文字起こしし、時間を節約して重要な作業に集中できます。", perMonth: "月", plans: [["無料", "$0", "月 120 分"], ["Basic", "$6", "月 1200 分"], ["Standard", "$12", "月 3000 分"], ["Pro", "$18", "月 6000 分"]], faqTitle: "よくある質問", genericFaqs: [["無料で使えますか？", "はい。無料プランには月間分数、日次ファイル制限、編集、標準エクスポートが含まれます。"], ["対応ファイルは？", "mp3、wav、m4a、flac、mp4、mov、mkv、webm、wmv などに対応しています。"], ["字幕をエクスポートできますか？", "はい。完了したジョブは SRT、VTT、TXT、DOCX、PDF、CSV で出力できます。"]], languageFaqs: [["この言語を文字起こしするには？", "音声ファイルをアップロードし、正しい言語を選んで開始します。完了後に字幕や文書形式で出力できます。"], ["翻訳できますか？", "はい。文字起こし後に AI 翻訳と要約を生成できます。"], ["利用できるエクスポート形式は？", "TXT、DOCX、PDF、SRT、VTT、CSV などが利用できます。"]], bestTitle: "音声・動画文字起こしのベストプラクティス", bestText: "いくつかの習慣で、よりきれいな文字起こし、字幕、要約、エクスポートが得られます。", bestCards: [["明瞭な音声を使う", "静かで音量が安定した録音は、句読点、タイムスタンプ、話者ラベル、固有名詞の精度を高めます。"], ["適切な入力を選ぶ", "デバイスのファイルをアップロードするか、先にダウンロードしたくない場合は公開動画リンクを貼り付けます。"], ["エクスポート前に確認", "文字起こしを編集してから、必要な形式でエクスポートします。"]], trustPoints: [["100% 安全", "ブラウザ内処理で選択ファイルはデバイス上に残ります。"], ["高速・無料", "高速、プライベート、無料で使えます。"], ["登録不要", "登録やサーバーアップロードは不要です。"]], relatedUtility: [["音声テキスト変換", "音声ファイルをテキストに変換"], ["動画テキスト変換", "動画からテキストを抽出"]], youMightAlsoLike: "こちらもおすすめ", useAfterTitle: "変換後に UniScribe を使用", useAfterText: "ファイル準備後、UniScribe で文字起こし、字幕、要約、翻訳、マインドマップ、共有ページを作成できます。", privateTitle: "ブラウザでのプライベート処理", privateText: "無料ツールはローカルで素早く準備するためのものです。ファイルを選び、ブラウザで処理し、結果をダウンロードします。", transcribeFile: "ファイルを文字起こし"
  },
  ko: {
    converter: "변환기", tool: "도구", freeTool: "무료 도구", format: "형식", language: "언어", useCase: "사용 사례", export: "내보내기", tryItFree: "무료로 사용", pricing: "가격", freeSignup: "무료 시작", uploadFile: "파일 업로드", pasteLink: "링크 붙여넣기", clickTranscribe: "전사 시작", exportShare: "내보내기 또는 공유", uploadFileText: "기기에서 오디오 또는 비디오 파일을 선택하세요.", pasteLinkText: "지원 플랫폼의 공개 미디어 URL을 붙여넣으세요.", transcribeText: "UniScribe가 편집 가능한 전사문을 만들고 진행 상황을 표시합니다.", exportShareText: "자막과 문서를 다운로드하거나 공유 링크를 만드세요.", proofFormatsTitle: "11개 형식 지원", proofFormatsText: "mp3, mp4, wav, m4a, webm, mov, mkv", proofLanguagesTitle: "63개 언어 지원", proofLanguagesText: "자동 감지와 다국어 전사", proofExportsTitle: "6개 형식 내보내기", proofExportsText: "TXT, DOCX, PDF, SRT, VTT, CSV", threeStepTemplate: "{name} 3단계 완료", speedTemplate: "{name} 빠른 변환", insightTemplate: "{name}에서 요약, 마인드맵, 핵심 인사이트 생성", aiFastText: "AI로 오디오와 비디오를 몇 분 안에 텍스트로 바꿀 수 있습니다. UniScribe는 63개 언어와 다양한 형식을 지원합니다.", insightText: "UniScribe 안에서 완성된 전사문으로 요약, 핵심 포인트, 마인드맵, 질문을 만들 수 있습니다.", exportTitle: "전사문을 여러 형식으로 내보내기(SRT, TXT, Word, PDF, CSV, VTT)", exportText: "TXT, DOCX, PDF, SRT, VTT, CSV로 내보내고 공유 링크도 만들 수 있습니다.", moreConverters: "더 많은 오디오/비디오 텍스트 변환기", supportedLanguages: "지원 언어", languagesText: "전사와 자막에서 주로 지원되는 언어입니다.", seeAllLanguages: "모든 언어 보기", reasonsTitle: "UniScribe를 선택하는 3가지 이유", reasonSaveTitle: "적은 비용으로 전사 시간 절약", reasonSaveText: "무료 월간 분수와 일일 무료 파일을 제공하며, 더 필요하면 합리적인 유료 플랜을 사용할 수 있습니다.", reasonAiTitle: "텍스트 변환 이상의 AI 기능", reasonAiText: "같은 작업 공간에서 요약, 마인드맵, 핵심 포인트, 번역, 자막, 내보내기를 생성하세요.", reasonFastTemplate: "{language} 오디오를 빠르고 정확하게 텍스트로 변환", reasonFastText: "선명한 오디오와 올바른 언어 설정은 더 빠르고 정확한 전사에 도움이 됩니다.", pricingTitle: "합리적인 가격", pricingText: "오디오와 비디오를 쉽게 전사해 시간을 아끼고 중요한 일에 집중하세요.", perMonth: "월", plans: [["무료", "$0", "월 120분"], ["Basic", "$6", "월 1200분"], ["Standard", "$12", "월 3000분"], ["Pro", "$18", "월 6000분"]], faqTitle: "자주 묻는 질문", genericFaqs: [["무료로 사용할 수 있나요?", "예. 무료 플랜에는 월간 분수, 일일 파일 제한, 전사 편집, 기본 내보내기가 포함됩니다."], ["어떤 파일을 지원하나요?", "mp3, wav, m4a, flac, mp4, mov, mkv, webm, wmv 등 일반 형식을 지원합니다."], ["자막을 내보낼 수 있나요?", "예. 완료된 작업은 SRT, VTT와 TXT, DOCX, PDF, CSV로 내보낼 수 있습니다."]], languageFaqs: [["이 언어는 어떻게 전사하나요?", "오디오 파일을 업로드하고 올바른 언어를 선택한 뒤 전사를 시작하세요. 완료 후 자막이나 문서로 내보낼 수 있습니다."], ["전사문 번역이 가능한가요?", "예. 전사 후 AI 번역과 요약을 생성할 수 있습니다."], ["지원되는 내보내기 형식은?", "TXT, DOCX, PDF, SRT, VTT, CSV와 구조화 형식을 사용할 수 있습니다."]], bestTitle: "오디오/비디오 전사 모범 사례", bestText: "간단한 습관으로 더 깔끔한 전사, 자막, 요약, 내보내기 결과를 얻을 수 있습니다.", bestCards: [["선명한 오디오 사용", "조용하고 일정한 음량의 녹음은 문장부호, 타임스탬프, 화자 라벨, 고유명사 정확도에 도움이 됩니다."], ["올바른 입력 선택", "기기 파일을 업로드하거나 먼저 다운로드하지 않을 때 공개 비디오 링크를 붙여넣으세요."], ["내보내기 전 검토", "전사문을 편집한 뒤 필요한 형식으로 내보내세요."]], trustPoints: [["100% 안전", "브라우저 기반 처리로 선택한 파일은 기기에 남습니다."], ["빠르고 무료", "빠르고 비공개이며 무료로 사용할 수 있습니다."], ["가입 필요 없음", "가입이나 서버 업로드가 필요 없습니다."]], relatedUtility: [["오디오 텍스트 변환기", "오디오 파일을 텍스트로 변환"], ["비디오 텍스트 변환기", "비디오에서 텍스트 추출"]], youMightAlsoLike: "함께 보면 좋은 도구", useAfterTitle: "변환 후 UniScribe 사용", useAfterText: "파일이 준비되면 UniScribe에서 전사, 자막, 요약, 번역, 마인드맵, 공유 페이지를 만들 수 있습니다.", privateTitle: "브라우저 비공개 처리", privateText: "무료 도구는 빠른 로컬 준비용입니다. 파일을 선택하고 브라우저에서 처리한 뒤 결과를 다운로드하세요.", transcribeFile: "파일 전사"
  },
  es: {
    converter: "Convertidor", tool: "Herramienta", freeTool: "Herramienta gratis", format: "Formato", language: "Idioma", useCase: "Caso de uso", export: "Exportar", tryItFree: "Probar gratis", pricing: "Precios", freeSignup: "Empezar gratis", uploadFile: "Subir archivo", pasteLink: "Pegar enlace", clickTranscribe: "Transcribir", exportShare: "Exportar o compartir", uploadFileText: "Elige un archivo de audio o video desde tu dispositivo.", pasteLinkText: "Pega una URL publica de una plataforma compatible.", transcribeText: "UniScribe crea una transcripcion editable con progreso visible.", exportShareText: "Descarga subtitulos y documentos o crea un enlace compartido.", proofFormatsTitle: "11 formatos", proofFormatsText: "mp3, mp4, wav, m4a, webm, mov, mkv", proofLanguagesTitle: "63 idiomas", proofLanguagesText: "Deteccion automatica y transcripciones multilingues", proofExportsTitle: "6 formatos de exportacion", proofExportsText: "TXT, DOCX, PDF, SRT, VTT, CSV", threeStepTemplate: "{name} en tres pasos", speedTemplate: "Convierte {name} en segundos", insightTemplate: "Genera resumenes, mapas mentales e insights desde {name}", aiFastText: "Con IA puedes convertir audio y video en texto en pocos minutos. UniScribe admite 63 idiomas y muchos formatos.", insightText: "Resume grabaciones largas, extrae puntos clave, crea mapas mentales y preguntas desde la transcripcion.", exportTitle: "Exporta transcripciones en varios formatos (SRT, TXT, Word, PDF, CSV, VTT)", exportText: "Exporta TXT, DOCX, PDF, SRT, VTT y CSV, o comparte un enlace para ver la transcripcion.", moreConverters: "Mas convertidores de audio y video a texto", supportedLanguages: "Idiomas compatibles", languagesText: "Estos son los principales idiomas compatibles para transcripcion y subtitulos.", seeAllLanguages: "Ver todos los idiomas", reasonsTitle: "3 razones para elegir UniScribe", reasonSaveTitle: "Ahorra tiempo de transcripcion con poco coste", reasonSaveText: "UniScribe ofrece minutos gratis mensuales, archivos diarios gratis y planes asequibles.", reasonAiTitle: "Mas funciones de IA ademas de audio a texto", reasonAiText: "Genera resumenes, mapas mentales, puntos clave, traducciones, subtitulos y exportaciones.", reasonFastTemplate: "Convierte audio en {language} a texto rapido y preciso", reasonFastText: "Audio claro y el idioma correcto ayudan a obtener transcripciones mas rapidas y precisas.", pricingTitle: "Precios asequibles", pricingText: "Transcribe audio y video sin esfuerzo, ahorra tiempo y concentrate en lo importante.", perMonth: "mes", plans: [["Gratis", "$0", "120 minutos al mes"], ["Basic", "$6", "1200 minutos al mes"], ["Standard", "$12", "3000 minutos al mes"], ["Pro", "$18", "6000 minutos al mes"]], faqTitle: "Preguntas frecuentes", genericFaqs: [["¿Puedo usarlo gratis?", "Si. El plan gratis incluye minutos mensuales, limites diarios, edicion y exportaciones estandar."], ["¿Que archivos admite?", "UniScribe admite mp3, wav, m4a, flac, mp4, mov, mkv, webm, wmv y otros formatos comunes."], ["¿Puedo exportar subtitulos?", "Si. Puedes exportar SRT, VTT, TXT, DOCX, PDF y CSV."]], languageFaqs: [["¿Como transcribo este idioma?", "Sube el audio, elige el idioma correcto y comienza. Luego exporta como subtitulos o documento."], ["¿UniScribe puede traducir transcripciones?", "Si. Despues de transcribir puede generar traduccion y resumen con IA."], ["¿Que formatos de exportacion hay?", "TXT, DOCX, PDF, SRT, VTT, CSV y formatos estructurados."]], bestTitle: "Buenas practicas para transcribir audio y video", bestText: "Unos habitos simples ayudan a obtener transcripciones, subtitulos y resumenes mas limpios.", bestCards: [["Usa audio claro", "Una grabacion silenciosa y estable mejora puntuacion, marcas de tiempo, hablantes y nombres propios."], ["Elige la entrada correcta", "Sube un archivo o pega un enlace publico cuando no quieras descargar primero."], ["Revisa antes de exportar", "Edita la transcripcion y exporta en el formato que necesites."]], trustPoints: [["100% seguro", "El procesamiento en navegador mantiene tus archivos en el dispositivo."], ["Rapido y gratis", "Rapido, privado y gratis."], ["Sin registro", "No requiere registro ni subida a servidores."]], relatedUtility: [["Convertidor de audio a texto", "Convierte archivos de audio a texto"], ["Convertidor de video a texto", "Extrae texto de tus videos"]], youMightAlsoLike: "Tambien te puede gustar", useAfterTitle: "Usa UniScribe despues de convertir", useAfterText: "Cuando el archivo este listo, crea transcripciones, subtitulos, resumenes, traducciones, mapas mentales y paginas compartibles.", privateTitle: "Procesamiento privado en navegador", privateText: "Estas herramientas gratis sirven para preparacion local rapida. Elige un archivo, procesalo en el navegador y descarga el resultado.", transcribeFile: "Transcribir archivo"
  }
};

const fallbackRomanceToolChrome = toolChromeByLocale.es!;

for (const locale of ["ar", "de", "fr", "hu", "id", "it", "nl", "pl", "pt", "ru", "th", "tr", "uk", "vi"] as const) {
  toolChromeByLocale[locale] = {
    ...fallbackRomanceToolChrome,
    ...(locale === "fr" ? {converter: "Convertisseur", tool: "Outil", freeTool: "Outil gratuit", pricing: "Tarifs", tryItFree: "Essayer gratuitement", freeSignup: "Commencer gratuitement", uploadFile: "Importer un fichier", pasteLink: "Coller un lien", clickTranscribe: "Transcrire", exportShare: "Exporter ou partager", moreConverters: "Autres convertisseurs audio et video en texte", supportedLanguages: "Langues prises en charge", seeAllLanguages: "Voir toutes les langues", pricingTitle: "Tarifs accessibles", faqTitle: "Questions frequentes"} : {}),
    ...(locale === "de" ? {converter: "Konverter", tool: "Tool", freeTool: "Kostenloses Tool", pricing: "Preise", tryItFree: "Kostenlos testen", freeSignup: "Kostenlos starten", uploadFile: "Datei hochladen", pasteLink: "Link einfugen", clickTranscribe: "Transkribieren", exportShare: "Exportieren oder teilen", moreConverters: "Weitere Audio- und Video-zu-Text-Konverter", supportedLanguages: "Unterstutzte Sprachen", seeAllLanguages: "Alle Sprachen ansehen", pricingTitle: "Faire Preise", faqTitle: "Haufige Fragen"} : {}),
    ...(locale === "pt" ? {converter: "Conversor", tool: "Ferramenta", freeTool: "Ferramenta gratis", pricing: "Precos", tryItFree: "Testar gratis", freeSignup: "Comecar gratis", uploadFile: "Enviar arquivo", pasteLink: "Colar link", clickTranscribe: "Transcrever", exportShare: "Exportar ou compartilhar", moreConverters: "Mais conversores de audio e video para texto", supportedLanguages: "Idiomas suportados", seeAllLanguages: "Ver todos os idiomas", pricingTitle: "Precos acessiveis", faqTitle: "Perguntas frequentes"} : {}),
    ...(locale === "ru" ? {converter: "Конвертер", tool: "Инструмент", freeTool: "Бесплатный инструмент", pricing: "Цены", tryItFree: "Попробовать бесплатно", freeSignup: "Начать бесплатно", uploadFile: "Загрузить файл", pasteLink: "Вставить ссылку", clickTranscribe: "Расшифровать", exportShare: "Экспорт или ссылка", moreConverters: "Другие конвертеры аудио и видео в текст", supportedLanguages: "Поддерживаемые языки", seeAllLanguages: "Все языки", pricingTitle: "Доступные цены", faqTitle: "Вопросы и ответы"} : {}),
    ...(locale === "it" ? {converter: "Convertitore", tool: "Strumento", freeTool: "Strumento gratuito", pricing: "Prezzi", tryItFree: "Prova gratis", freeSignup: "Inizia gratis", uploadFile: "Carica file", pasteLink: "Incolla link", clickTranscribe: "Trascrivi", exportShare: "Esporta o condividi", moreConverters: "Altri convertitori audio e video in testo", supportedLanguages: "Lingue supportate", seeAllLanguages: "Vedi tutte le lingue", pricingTitle: "Prezzi convenienti", faqTitle: "Domande frequenti"} : {}),
    ...(locale === "id" ? {converter: "Konverter", tool: "Alat", freeTool: "Alat gratis", pricing: "Harga", tryItFree: "Coba gratis", freeSignup: "Mulai gratis", uploadFile: "Unggah file", pasteLink: "Tempel tautan", clickTranscribe: "Transkripsi", exportShare: "Ekspor atau bagikan", moreConverters: "Konverter audio dan video ke teks lainnya", supportedLanguages: "Bahasa yang didukung", seeAllLanguages: "Lihat semua bahasa", pricingTitle: "Harga terjangkau", faqTitle: "Pertanyaan umum"} : {}),
    ...(locale === "nl" ? {converter: "Converter", tool: "Tool", freeTool: "Gratis tool", pricing: "Prijzen", tryItFree: "Gratis proberen", freeSignup: "Gratis starten", uploadFile: "Bestand uploaden", pasteLink: "Link plakken", clickTranscribe: "Transcriberen", exportShare: "Exporteren of delen", moreConverters: "Meer audio- en video-naar-tekstconverters", supportedLanguages: "Ondersteunde talen", seeAllLanguages: "Alle talen bekijken", pricingTitle: "Betaalbare prijzen", faqTitle: "Veelgestelde vragen"} : {}),
    ...(locale === "pl" ? {converter: "Konwerter", tool: "Narzędzie", freeTool: "Darmowe narzędzie", pricing: "Ceny", tryItFree: "Wypróbuj za darmo", freeSignup: "Zacznij za darmo", uploadFile: "Prześlij plik", pasteLink: "Wklej link", clickTranscribe: "Transkrybuj", exportShare: "Eksportuj lub udostępnij", moreConverters: "Więcej konwerterów audio i wideo na tekst", supportedLanguages: "Obsługiwane języki", seeAllLanguages: "Zobacz wszystkie języki", pricingTitle: "Przystępne ceny", faqTitle: "Częste pytania"} : {}),
    ...(locale === "tr" ? {converter: "Donusturucu", tool: "Arac", freeTool: "Ucretsiz arac", pricing: "Fiyatlar", tryItFree: "Ucretsiz dene", freeSignup: "Ucretsiz basla", uploadFile: "Dosya yukle", pasteLink: "Baglanti yapistir", clickTranscribe: "Transkribe et", exportShare: "Disa aktar veya paylas", moreConverters: "Daha fazla ses ve video metin donusturucu", supportedLanguages: "Desteklenen diller", seeAllLanguages: "Tum dilleri gor", pricingTitle: "Uygun fiyatlar", faqTitle: "Sik sorulan sorular"} : {}),
    ...(locale === "uk" ? {converter: "Конвертер", tool: "Інструмент", freeTool: "Безкоштовний інструмент", pricing: "Ціни", tryItFree: "Спробувати безкоштовно", freeSignup: "Почати безкоштовно", uploadFile: "Завантажити файл", pasteLink: "Вставити посилання", clickTranscribe: "Транскрибувати", exportShare: "Експорт або поширення", moreConverters: "Інші конвертери аудіо й відео в текст", supportedLanguages: "Підтримувані мови", seeAllLanguages: "Усі мови", pricingTitle: "Доступні ціни", faqTitle: "Поширені питання"} : {}),
    ...(locale === "vi" ? {converter: "Trình chuyển đổi", tool: "Công cụ", freeTool: "Công cụ miễn phí", pricing: "Giá", tryItFree: "Dùng thử miễn phí", freeSignup: "Bắt đầu miễn phí", uploadFile: "Tải tệp lên", pasteLink: "Dán liên kết", clickTranscribe: "Chuyển văn bản", exportShare: "Xuất hoặc chia sẻ", moreConverters: "Thêm công cụ chuyển âm thanh và video thành văn bản", supportedLanguages: "Ngôn ngữ hỗ trợ", seeAllLanguages: "Xem tất cả ngôn ngữ", pricingTitle: "Giá hợp lý", faqTitle: "Câu hỏi thường gặp"} : {}),
    ...(locale === "ar" ? {converter: "محول", tool: "أداة", freeTool: "أداة مجانية", pricing: "الأسعار", tryItFree: "جرّب مجاناً", freeSignup: "ابدأ مجاناً", uploadFile: "رفع ملف", pasteLink: "لصق رابط", clickTranscribe: "تفريغ", exportShare: "تصدير أو مشاركة", moreConverters: "محولات صوت وفيديو إلى نص أخرى", supportedLanguages: "اللغات المدعومة", seeAllLanguages: "كل اللغات", pricingTitle: "أسعار مناسبة", faqTitle: "الأسئلة الشائعة"} : {}),
    ...(locale === "th" ? {converter: "ตัวแปลง", tool: "เครื่องมือ", freeTool: "เครื่องมือฟรี", pricing: "ราคา", tryItFree: "ทดลองใช้ฟรี", freeSignup: "เริ่มฟรี", uploadFile: "อัปโหลดไฟล์", pasteLink: "วางลิงก์", clickTranscribe: "ถอดเสียง", exportShare: "ส่งออกหรือแชร์", moreConverters: "ตัวแปลงเสียงและวิดีโอเป็นข้อความเพิ่มเติม", supportedLanguages: "ภาษาที่รองรับ", seeAllLanguages: "ดูทุกภาษา", pricingTitle: "ราคาคุ้มค่า", faqTitle: "คำถามที่พบบ่อย"} : {}),
    ...(locale === "hu" ? {converter: "Konverter", tool: "Eszkoz", freeTool: "Ingyenes eszkoz", pricing: "Arak", tryItFree: "Probald ki ingyen", freeSignup: "Kezdes ingyen", uploadFile: "Fajl feltoltese", pasteLink: "Link beillesztese", clickTranscribe: "Atiras", exportShare: "Export vagy megosztas", moreConverters: "Tovabbi audio es video szovegge alakitok", supportedLanguages: "Tamogatott nyelvek", seeAllLanguages: "Osszes nyelv", pricingTitle: "Megfizetheto arak", faqTitle: "Gyakori kerdesek"} : {})
  };
}

Object.assign(toolChromeByLocale.de!, {
  uploadFileText: "Wählen Sie eine Audio- oder Videodatei von Ihrem Gerät aus.",
  pasteLinkText: "Fügen Sie eine öffentliche Medien-URL von einer unterstützten Plattform ein.",
  transcribeText: "UniScribe erstellt ein bearbeitbares Transkript und zeigt den Fortschritt an.",
  exportShareText: "Laden Sie Untertitel und Dokumente herunter oder erstellen Sie einen Freigabelink.",
  proofFormatsTitle: "11 Formate unterstützt",
  proofFormatsText: "mp3, mp4, wav, m4a, webm, mov, mkv",
  proofLanguagesTitle: "63 Sprachen unterstützt",
  proofLanguagesText: "Automatische Erkennung und mehrsprachige Transkription",
  proofExportsTitle: "Export in 6 Formaten",
  proofExportsText: "TXT, DOCX, PDF, SRT, VTT, CSV",
  threeStepTemplate: "{name} in drei Schritten",
  speedTemplate: "{name} in Sekunden konvertieren",
  insightTemplate: "Zusammenfassungen, Mindmaps und Erkenntnisse aus {name} erstellen",
  aiFastText: "Mit KI können Sie Audio und Video in wenigen Minuten in Text umwandeln. UniScribe unterstützt 63 Sprachen und viele gängige Formate.",
  insightText: "Erstellen Sie Zusammenfassungen, Schlüsselpunkte, Mindmaps und Fragen direkt aus dem fertigen Transkript.",
  exportTitle: "Transkripte in mehreren Formaten exportieren (SRT, TXT, Word, PDF, CSV, VTT)",
  exportText: "Exportieren Sie TXT, DOCX, PDF, SRT, VTT und CSV oder teilen Sie einen Link zum Transkript.",
  languagesText: "Dies sind die wichtigsten Sprachen für Transkription und Untertitel.",
  reasonSaveTitle: "Mit wenig Aufwand viel Transkriptionszeit sparen",
  reasonSaveText: "UniScribe bietet monatliche Freiminuten, kostenlose tägliche Dateien und bezahlbare Tarife.",
  reasonAiTitle: "Mehr KI-Funktionen als nur Audio zu Text",
  reasonAiText: "Erstellen Sie Zusammenfassungen, Mindmaps, Schlüsselpunkte, Übersetzungen, Untertitel und Exporte in einem Arbeitsbereich.",
  reasonFastTemplate: "{language}-Audio schnell und präzise in Text umwandeln",
  reasonFastText: "Klare Audioqualität und die richtige Spracheinstellung helfen UniScribe, schnellere und genauere Transkripte zu erzeugen.",
  pricingText: "Transkribieren Sie Audio und Video mühelos, sparen Sie Zeit und konzentrieren Sie sich auf das Wesentliche.",
  plans: [["Kostenlos", "$0", "120 Minuten pro Monat"], ["Basic", "$6", "1200 Minuten pro Monat"], ["Standard", "$12", "3000 Minuten pro Monat"], ["Pro", "$18", "6000 Minuten pro Monat"]],
  genericFaqs: [["Kann ich es kostenlos nutzen?", "Ja. Der kostenlose Tarif enthält monatliche Minuten, tägliche Dateilimits, Bearbeitung und Standardexporte."], ["Welche Dateien werden unterstützt?", "UniScribe unterstützt gängige Audio- und Videoformate wie mp3, wav, m4a, flac, mp4, mov, mkv, webm und wmv."], ["Kann ich Untertitel exportieren?", "Ja. Fertige Aufgaben können als SRT, VTT, TXT, DOCX, PDF und CSV exportiert werden."]],
  languageFaqs: [["Wie transkribiere ich diese Sprache?", "Laden Sie die Audiodatei hoch, wählen Sie die richtige Sprache und starten Sie die Transkription. Danach können Sie Untertitel oder Dokumente exportieren."], ["Kann UniScribe Transkripte übersetzen?", "Ja. Nach der Transkription kann UniScribe KI-Übersetzungen und Zusammenfassungen erstellen."], ["Welche Exportformate gibt es?", "TXT, DOCX, PDF, SRT, VTT, CSV und strukturierte Exporte sind verfügbar."]],
  bestText: "Ein paar einfache Gewohnheiten sorgen für sauberere Transkripte, Untertitel, Zusammenfassungen und Exporte.",
  bestCards: [["Klare Audioqualität verwenden", "Eine ruhige Aufnahme mit stabiler Lautstärke verbessert Zeichensetzung, Zeitstempel, Sprecherlabels und Eigennamen."], ["Die richtige Eingabe wählen", "Laden Sie eine Datei hoch oder fügen Sie einen öffentlichen Videolink ein, wenn Sie zuerst nichts herunterladen möchten."], ["Vor dem Export prüfen", "Bearbeiten Sie das Transkript und exportieren Sie es danach als TXT, DOCX, PDF, SRT, VTT oder CSV."]],
  trustPoints: [["100% sicher", "Browserbasierte Verarbeitung behält ausgewählte Dateien auf Ihrem Gerät."], ["Schnell und kostenlos", "Schnell, privat und kostenlos nutzbar."], ["Keine Registrierung", "Keine Registrierung und kein Server-Upload erforderlich."]],
  relatedUtility: [["Audio-zu-Text-Konverter", "Audiodateien in Text umwandeln"], ["Video-zu-Text-Konverter", "Text aus Videos extrahieren"]],
  youMightAlsoLike: "Das könnte Ihnen auch gefallen",
  useAfterTitle: "UniScribe nach der Konvertierung verwenden",
  useAfterText: "Wenn die Datei bereit ist, senden Sie sie an UniScribe, um Transkripte, Untertitel, Zusammenfassungen, Übersetzungen, Mindmaps und Freigabeseiten zu erstellen.",
  privateTitle: "Private Verarbeitung im Browser",
  privateText: "Diese kostenlosen Tools sind für schnelle lokale Vorbereitung gedacht. Wählen Sie eine Datei, verarbeiten Sie sie im Browser und laden Sie das Ergebnis herunter.",
  transcribeFile: "Datei transkribieren"
});

function toolText(locale: string): ToolChrome {
  return toolChromeByLocale[isLocale(locale) ? locale : "en"] ?? toolChromeByLocale.en!;
}

const englishToolSubjects = {
  "speech-to-text": "Speech to Text",
  "voice-to-text": "Voice to Text",
  "audio-to-text": "Audio to Text",
  "video-to-text": "Video to Text",
  "video-link-to-text": "Link to Text",
  "youtube-to-text": "YouTube to Text",
  "youtube-subtitle-downloader": "YouTube subtitles",
  "youtube-video-downloader": "YouTube video",
  "video-to-audio-extractor": "Video to Audio",
  "wav-to-mp3-converter": "WAV to MP3",
  "mp3-to-text": "MP3 to Text",
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
  languageAudio: "{language} Audio"
} as const;

type ToolSubjectKey = keyof typeof englishToolSubjects;

const toolSubjectLabelsByLocale: Partial<Record<Locale, Partial<Record<ToolSubjectKey, string>>>> = {
  en: englishToolSubjects,
  zh: {
    "speech-to-text": "语音转文字", "voice-to-text": "人声转文字", "audio-to-text": "音频转文字", "video-to-text": "视频转文字", "video-link-to-text": "链接转文字", "youtube-to-text": "YouTube 转文字", "youtube-subtitle-downloader": "YouTube 字幕", "youtube-video-downloader": "YouTube 视频", "video-to-audio-extractor": "视频转音频", "wav-to-mp3-converter": "WAV 转 MP3", "mp3-to-text": "MP3 转文字", "mp4-to-text-converter": "MP4 转文字", "wav-to-text": "WAV 转文字", "m4a-to-text": "M4A 转文字", "aac-to-text": "AAC 转文字", "opus-to-text": "OPUS 转文字", "webm-to-text": "WebM 转文字", "flac-to-text": "FLAC 转文字", "amr-to-text": "AMR 转文字", "wma-to-text": "WMA 转文字", "mkv-to-text": "MKV 转文字", "wmv-to-text": "WMV 转文字", languageAudio: "{language} 音频"
  },
  "zh-TW": {
    "speech-to-text": "語音轉文字", "voice-to-text": "人聲轉文字", "audio-to-text": "音訊轉文字", "video-to-text": "影片轉文字", "video-link-to-text": "連結轉文字", "youtube-to-text": "YouTube 轉文字", "youtube-subtitle-downloader": "YouTube 字幕", "youtube-video-downloader": "YouTube 影片", "video-to-audio-extractor": "影片轉音訊", "wav-to-mp3-converter": "WAV 轉 MP3", "mp3-to-text": "MP3 轉文字", "mp4-to-text-converter": "MP4 轉文字", "wav-to-text": "WAV 轉文字", "m4a-to-text": "M4A 轉文字", "aac-to-text": "AAC 轉文字", "opus-to-text": "OPUS 轉文字", "webm-to-text": "WebM 轉文字", "flac-to-text": "FLAC 轉文字", "amr-to-text": "AMR 轉文字", "wma-to-text": "WMA 轉文字", "mkv-to-text": "MKV 轉文字", "wmv-to-text": "WMV 轉文字", languageAudio: "{language} 音訊"
  },
  ja: {
    "speech-to-text": "音声をテキスト化", "voice-to-text": "声をテキスト化", "audio-to-text": "音声をテキスト化", "video-to-text": "動画をテキスト化", "video-link-to-text": "リンクをテキスト化", "youtube-to-text": "YouTube をテキスト化", "youtube-subtitle-downloader": "YouTube 字幕", "youtube-video-downloader": "YouTube 動画", "video-to-audio-extractor": "動画を音声化", "wav-to-mp3-converter": "WAV を MP3 に変換", "mp3-to-text": "MP3 をテキスト化", "mp4-to-text-converter": "MP4 をテキスト化", "wav-to-text": "WAV をテキスト化", "m4a-to-text": "M4A をテキスト化", "aac-to-text": "AAC をテキスト化", "opus-to-text": "OPUS をテキスト化", "webm-to-text": "WebM をテキスト化", "flac-to-text": "FLAC をテキスト化", "amr-to-text": "AMR をテキスト化", "wma-to-text": "WMA をテキスト化", "mkv-to-text": "MKV をテキスト化", "wmv-to-text": "WMV をテキスト化", languageAudio: "{language} 音声"
  },
  ko: {
    "speech-to-text": "음성을 텍스트로", "voice-to-text": "목소리를 텍스트로", "audio-to-text": "오디오를 텍스트로", "video-to-text": "비디오를 텍스트로", "video-link-to-text": "링크를 텍스트로", "youtube-to-text": "YouTube를 텍스트로", "youtube-subtitle-downloader": "YouTube 자막", "youtube-video-downloader": "YouTube 비디오", "video-to-audio-extractor": "비디오를 오디오로", "wav-to-mp3-converter": "WAV를 MP3로", "mp3-to-text": "MP3를 텍스트로", "mp4-to-text-converter": "MP4를 텍스트로", "wav-to-text": "WAV를 텍스트로", "m4a-to-text": "M4A를 텍스트로", "aac-to-text": "AAC를 텍스트로", "opus-to-text": "OPUS를 텍스트로", "webm-to-text": "WebM을 텍스트로", "flac-to-text": "FLAC을 텍스트로", "amr-to-text": "AMR을 텍스트로", "wma-to-text": "WMA를 텍스트로", "mkv-to-text": "MKV를 텍스트로", "wmv-to-text": "WMV를 텍스트로", languageAudio: "{language} 오디오"
  },
  es: {
    "speech-to-text": "voz a texto", "voice-to-text": "voz a texto", "audio-to-text": "audio a texto", "video-to-text": "video a texto", "video-link-to-text": "enlace a texto", "youtube-to-text": "YouTube a texto", "youtube-subtitle-downloader": "subtitulos de YouTube", "youtube-video-downloader": "video de YouTube", "video-to-audio-extractor": "video a audio", "wav-to-mp3-converter": "WAV a MP3", "mp3-to-text": "MP3 a texto", "mp4-to-text-converter": "MP4 a texto", "wav-to-text": "WAV a texto", "m4a-to-text": "M4A a texto", "aac-to-text": "AAC a texto", "opus-to-text": "OPUS a texto", "webm-to-text": "WebM a texto", "flac-to-text": "FLAC a texto", "amr-to-text": "AMR a texto", "wma-to-text": "WMA a texto", "mkv-to-text": "MKV a texto", "wmv-to-text": "WMV a texto", languageAudio: "audio en {language}"
  }
};

const fallbackToolSubjects = toolSubjectLabelsByLocale.es!;
const formatLocales = ["ar", "de", "fr", "hu", "id", "it", "nl", "pl", "pt", "ru", "th", "tr", "uk", "vi"] as const;
const formatSubjectFormats = ["YouTube", "MP3", "MP4", "WAV", "M4A", "AAC", "OPUS", "WebM", "FLAC", "AMR", "WMA", "MKV", "WMV"] as const;
const formatToTextSubjectKeys = [
  "youtube-to-text",
  "mp3-to-text",
  "mp4-to-text-converter",
  "wav-to-text",
  "m4a-to-text",
  "aac-to-text",
  "opus-to-text",
  "webm-to-text",
  "flac-to-text",
  "amr-to-text",
  "wma-to-text",
  "mkv-to-text",
  "wmv-to-text"
] as const;
const formatToTextTemplates: Record<(typeof formatLocales)[number], string> = {
  ar: "{format} إلى نص",
  de: "{format} zu Text",
  fr: "{format} en texte",
  hu: "{format} szöveggé",
  id: "{format} ke teks",
  it: "{format} in testo",
  nl: "{format} naar tekst",
  pl: "{format} na tekst",
  pt: "{format} para texto",
  ru: "{format} в текст",
  th: "{format} เป็นข้อความ",
  tr: "{format} metne",
  uk: "{format} у текст",
  vi: "{format} thành văn bản"
};

function formatSubjectsForLocale(locale: (typeof formatLocales)[number]) {
  return Object.fromEntries(
    formatToTextSubjectKeys.map((key, index) => [
      key,
      formatToTextTemplates[locale].replace("{format}", formatSubjectFormats[index])
    ])
  ) as Partial<Record<ToolSubjectKey, string>>;
}

for (const locale of formatLocales) {
  toolSubjectLabelsByLocale[locale] = {
    ...fallbackToolSubjects,
    ...formatSubjectsForLocale(locale),
    ...(locale === "fr" ? {"speech-to-text": "parole en texte", "voice-to-text": "voix en texte", "audio-to-text": "audio en texte", "video-to-text": "video en texte", "video-link-to-text": "lien en texte", "video-to-audio-extractor": "video en audio", languageAudio: "audio en {language}"} : {}),
    ...(locale === "de" ? {"speech-to-text": "Sprache zu Text", "voice-to-text": "Stimme zu Text", "audio-to-text": "Audio zu Text", "video-to-text": "Video zu Text", "video-link-to-text": "Link zu Text", "video-to-audio-extractor": "Video zu Audio", languageAudio: "{language}-Audio"} : {}),
    ...(locale === "pt" ? {"speech-to-text": "fala para texto", "voice-to-text": "voz para texto", "audio-to-text": "audio para texto", "video-to-text": "video para texto", "video-link-to-text": "link para texto", "video-to-audio-extractor": "video para audio", languageAudio: "audio em {language}"} : {}),
    ...(locale === "ru" ? {"speech-to-text": "речь в текст", "voice-to-text": "голос в текст", "audio-to-text": "аудио в текст", "video-to-text": "видео в текст", "video-link-to-text": "ссылка в текст", "youtube-subtitle-downloader": "субтитры YouTube", "youtube-video-downloader": "видео YouTube", "video-to-audio-extractor": "видео в аудио", languageAudio: "аудио на {language}"} : {}),
    ...(locale === "it" ? {"speech-to-text": "parlato in testo", "voice-to-text": "voce in testo", "audio-to-text": "audio in testo", "video-to-text": "video in testo", "video-link-to-text": "link in testo", "video-to-audio-extractor": "video in audio", languageAudio: "audio in {language}"} : {}),
    ...(locale === "id" ? {"speech-to-text": "ucapan ke teks", "voice-to-text": "suara ke teks", "audio-to-text": "audio ke teks", "video-to-text": "video ke teks", "video-link-to-text": "tautan ke teks", "video-to-audio-extractor": "video ke audio", languageAudio: "audio {language}"} : {}),
    ...(locale === "nl" ? {"speech-to-text": "spraak naar tekst", "voice-to-text": "stem naar tekst", "audio-to-text": "audio naar tekst", "video-to-text": "video naar tekst", "video-link-to-text": "link naar tekst", "video-to-audio-extractor": "video naar audio", languageAudio: "{language} audio"} : {}),
    ...(locale === "pl" ? {"speech-to-text": "mowa na tekst", "voice-to-text": "głos na tekst", "audio-to-text": "audio na tekst", "video-to-text": "wideo na tekst", "video-link-to-text": "link na tekst", "video-to-audio-extractor": "wideo na audio", languageAudio: "audio w języku {language}"} : {}),
    ...(locale === "tr" ? {"speech-to-text": "konuşmayı metne", "voice-to-text": "sesi metne", "audio-to-text": "sesi metne", "video-to-text": "videoyu metne", "video-link-to-text": "bağlantıyı metne", "video-to-audio-extractor": "videoyu sese", languageAudio: "{language} ses"} : {}),
    ...(locale === "uk" ? {"speech-to-text": "мовлення в текст", "voice-to-text": "голос у текст", "audio-to-text": "аудіо в текст", "video-to-text": "відео в текст", "video-link-to-text": "посилання в текст", "youtube-subtitle-downloader": "субтитри YouTube", "youtube-video-downloader": "відео YouTube", "video-to-audio-extractor": "відео в аудіо", languageAudio: "аудіо мовою {language}"} : {}),
    ...(locale === "vi" ? {"speech-to-text": "lời nói thành văn bản", "voice-to-text": "giọng nói thành văn bản", "audio-to-text": "âm thanh thành văn bản", "video-to-text": "video thành văn bản", "video-link-to-text": "liên kết thành văn bản", "video-to-audio-extractor": "video thành âm thanh", languageAudio: "âm thanh {language}"} : {}),
    ...(locale === "ar" ? {"speech-to-text": "الكلام إلى نص", "voice-to-text": "الصوت إلى نص", "audio-to-text": "الصوت إلى نص", "video-to-text": "الفيديو إلى نص", "video-link-to-text": "الرابط إلى نص", "youtube-subtitle-downloader": "ترجمات YouTube", "youtube-video-downloader": "فيديو YouTube", "video-to-audio-extractor": "الفيديو إلى صوت", languageAudio: "صوت {language}"} : {}),
    ...(locale === "th" ? {"speech-to-text": "คำพูดเป็นข้อความ", "voice-to-text": "เสียงเป็นข้อความ", "audio-to-text": "เสียงเป็นข้อความ", "video-to-text": "วิดีโอเป็นข้อความ", "video-link-to-text": "ลิงก์เป็นข้อความ", "video-to-audio-extractor": "วิดีโอเป็นเสียง", languageAudio: "เสียงภาษา {language}"} : {}),
    ...(locale === "hu" ? {"speech-to-text": "beszéd szöveggé", "voice-to-text": "hang szöveggé", "audio-to-text": "audio szöveggé", "video-to-text": "videó szöveggé", "video-link-to-text": "link szöveggé", "video-to-audio-extractor": "videó audióvá", languageAudio: "{language} audio"} : {})
  };
}

function formatTemplate(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "");
}

function localeSubjects(locale: string) {
  return toolSubjectLabelsByLocale[isLocale(locale) ? locale : "en"] ?? toolSubjectLabelsByLocale.en!;
}

function toolSubject(page: ToolPageRecord, locale: string) {
  const subjects = localeSubjects(locale);
  const safeLocale = isLocale(locale) ? locale : "en";
  if (page.language) return formatTemplate(subjects.languageAudio ?? englishToolSubjects.languageAudio, {language: localizedSupportedLanguageName(page.language, safeLocale)});
  const directSubject = subjects[page.slug as ToolSubjectKey] ?? englishToolSubjects[page.slug as ToolSubjectKey];
  if (directSubject) return directSubject;
  return page.title.replace(/^Free Online |Online | Converter Powered by AI| Powered by AI| Converter$/g, "").trim();
}

function localizedToolTitle(page: ToolPageRecord, text: ToolChrome, locale: string) {
  const subject = toolSubject(page, locale);
  if (page.language) return formatTemplate(text.reasonFastTemplate, {language: page.language});
  if (page.kind === "utility" || page.kind === "youtube-subtitles" || page.kind === "youtube-video-downloader") return subject;
  return formatTemplate(text.speedTemplate, {name: subject});
}

function localizedEyebrow(page: ToolPageRecord, text: ToolChrome) {
  if (page.language) return text.language;
  if (page.kind === "utility" || page.kind === "youtube-subtitles" || page.kind === "youtube-video-downloader") return text.freeTool;
  if (page.eyebrow === "Format") return text.format;
  if (page.eyebrow === "Use case") return text.useCase;
  if (page.eyebrow === "Export") return text.export;
  if (page.eyebrow === "Tool") return text.tool;
  return text.converter;
}

function relatedSlug(href: string) {
  return href.split("/").filter(Boolean).at(-1) ?? href;
}

function localizedRelatedLabel(href: string, fallback: string, locale: string) {
  const subjects = localeSubjects(locale);
  const slug = relatedSlug(href) as ToolSubjectKey;
  const subject = subjects[slug] ?? englishToolSubjects[slug];
  if (subject) return subject;
  return fallback;
}

export function ToolPage({slug, page: providedPage}: {slug: string; page?: ToolPageRecord}) {
  const locale = useLocale();
  const copy = getWorkspaceCopy(locale);
  const page = providedPage ?? findToolPage(slug) ?? genericToolPage(slug);
  const text = toolText(locale);
  const pageTitle = localizedToolTitle(page, text, locale);
  const pageEyebrow = localizedEyebrow(page, text);
  const pageDescription = page.mode === "link" ? `${text.pasteLinkText} ${text.transcribeText}` : text.aiFastText;
  const related = page.related ?? (page.language
    ? languagePages.filter((item) => item.slug !== page.slug).slice(0, 12).map((item) => [item.language ?? item.title, `languages/${item.slug}`] as [string, string])
    : tools.filter((item) => item.slug !== page.slug).slice(0, 8).map((item) => [item.title, item.kind === "utility" || item.slug === "audio-to-text" || item.slug === "video-link-to-text" ? `tools/${item.slug}` : `l/${item.slug}`] as [string, string]));
  const uploadHref = `/${locale}/upload?mode=${page.mode}`;
  const proofPoints: Array<[LucideIcon, string, string]> = [
    [FileAudio, text.proofFormatsTitle, text.proofFormatsText],
    [Languages, text.proofLanguagesTitle, text.proofLanguagesText],
    [Download, text.proofExportsTitle, text.proofExportsText]
  ];
  const workflow = [
    [page.mode === "link" ? text.pasteLink : text.uploadFile, page.mode === "link" ? text.pasteLinkText : text.uploadFileText],
    [text.clickTranscribe, text.transcribeText],
    [text.exportShare, text.exportShareText]
  ] as Array<[string, string]>;
  const featurePrefix = toolSubject(page, locale);
  const isLanguagePage = Boolean(page.language);
  const isUtilityPage = page.kind === "utility";
  const isYoutubeSubtitlePage = page.kind === "youtube-subtitles";
  const isYoutubeVideoDownloaderPage = page.kind === "youtube-video-downloader";
  const threeStepTitle = formatTemplate(text.threeStepTemplate, {name: featurePrefix});
  const speedTitle = formatTemplate(text.speedTemplate, {name: featurePrefix});
  const insightTitle = formatTemplate(text.insightTemplate, {name: featurePrefix});
  const languages = supportedLanguageNames.slice(0, 8);
  const bestPractices = text.bestCards;
  const toolFaqs = isLanguagePage ? text.languageFaqs : text.genericFaqs;

  if (isUtilityPage || isYoutubeSubtitlePage || isYoutubeVideoDownloaderPage) {
    const relatedUtility = text.relatedUtility.map(([title, description], index) => [
      title,
      description,
      index === 0 ? `/${locale}/tools/audio-to-text` : `/${locale}/l/video-to-text`
    ] as const);
    const trustPoints: Array<[LucideIcon, string, string]> = [
      [LockKeyhole, text.trustPoints[0][0], text.trustPoints[0][1]],
      [Zap, text.trustPoints[1][0], text.trustPoints[1][1]],
      [BadgeCheck, text.trustPoints[2][0], text.trustPoints[2][1]]
    ];

    return (
      <main className="min-h-screen bg-paper pt-24">
        <SiteHeader />
        <section className="px-4 py-12 md:px-8">
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="space-y-4 text-center">
              <h1 className="text-4xl font-black tracking-tight text-ink md:text-5xl">{pageTitle}</h1>
              <h2 className="text-xl font-bold leading-8 text-ink/65">{text.privateText}</h2>
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
              <UtilityToolWidget kind={page.slug as "wav-to-mp3-converter" | "video-to-audio-extractor"} accept={page.accept} selectLabel={text.uploadFile} actionLabel={text.exportShare} />
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
              {bestPractices.map(([title, text]) => (
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
            <h2 className="text-2xl font-black tracking-tight text-ink">{text.youMightAlsoLike}</h2>
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
              <h2 className="text-3xl font-black tracking-tight text-ink">{text.useAfterTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-ink/65">{text.useAfterText}</p>
              <a href={`/${locale}/upload?mode=file`} className="btn-primary mt-6">{text.transcribeFile}</a>
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-ink">{text.privateTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-ink/65">{text.privateText}</p>
            </div>
          </div>
        </section>
        <section className="px-4 py-16 md:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-black tracking-tight text-ink">{text.faqTitle}</h2>
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
            <p className="eyebrow">{pageEyebrow}</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-black leading-tight tracking-tight text-violet md:text-6xl">{pageTitle}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-ink/68">{pageDescription}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={uploadHref} className="btn-primary">
                <UploadCloud size={18} />
                {text.tryItFree}
              </a>
              <a href={`/${locale}/pricing`} className="btn-outline">
                {text.pricing}
                <ArrowRight size={16} />
              </a>
            </div>
          </div>
          <div className="relative min-h-[320px] overflow-hidden rounded-xl border border-ink/10 bg-white shadow-lifted">
            <Image src="/uniscribe-assets/transcription.png" alt={`${pageTitle} workspace preview`} fill sizes="(min-width: 1024px) 420px, 100vw" className="object-cover object-top" priority />
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
          <h2 className="text-3xl font-black tracking-tight text-ink">{isLanguagePage ? text.supportedLanguages : text.moreConverters}</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {related.map(([label, href]) => (
              <a key={`${label}-${href}`} href={`/${locale}/${href}`} className="rounded-md border border-ink/10 bg-paper px-4 py-2 text-sm font-black text-ink/70 shadow-soft transition hover:border-violet/25 hover:text-violet">
                {localizedRelatedLabel(href, label, locale)}
              </a>
            ))}
          </div>
          <a href={uploadHref} className="btn-primary mt-8">{copy.freeSignup ?? text.freeSignup}</a>
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
            <a href={uploadHref} className="btn-primary mt-8">{text.tryItFree}</a>
          </div>
        </section>
      ) : !isLanguagePage ? (
        <section className="border-y border-ink/10 bg-white px-4 py-16 md:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-ink">{speedTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-ink/65">{text.aiFastText}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {[text.proofFormatsTitle, text.proofLanguagesTitle, text.proofExportsTitle].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-paper px-4 py-2 text-sm font-black text-ink/70">
                    <BadgeCheck className="text-violet" size={17} />
                    {item}
                  </span>
                ))}
              </div>
              <a href={uploadHref} className="btn-primary mt-6">{text.tryItFree}</a>
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
              <p className="mt-3 text-sm leading-6 text-ink/65">{text.insightText}</p>
              <a href={uploadHref} className="btn-primary mt-6">{text.tryItFree}</a>
            </div>
          </div>
        </section>
      ) : null}

      {!isLanguagePage && !isUtilityPage ? (
        <section className="border-y border-ink/10 bg-white px-4 py-16 md:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-ink">{text.exportTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-ink/65">{text.exportText}</p>
              <a href={uploadHref} className="btn-primary mt-6">{text.tryItFree}</a>
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
            <h2 className="text-3xl font-black tracking-tight text-ink">{text.reasonsTitle}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                [text.reasonSaveTitle, text.reasonSaveText],
                [text.reasonAiTitle, text.reasonAiText],
                [formatTemplate(text.reasonFastTemplate, {language: page.language ?? ""}), text.reasonFastText]
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
                <h2 className="text-3xl font-black tracking-tight text-ink">{text.supportedLanguages}</h2>
                <p className="mt-2 text-sm leading-6 text-ink/60">{text.languagesText}</p>
              </div>
              <Languages className="text-violet" size={34} />
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {languages.map((item) => (
                <a key={item} href={`/${locale}/languages/transcribe-${languageSlug(item)}-audio`} className="rounded-xl border border-ink/10 bg-white p-4 font-black shadow-soft transition hover:-translate-y-0.5 hover:border-violet/25 hover:text-violet">{localizedSupportedLanguageName(item, isLocale(locale) ? locale : "en")}</a>
              ))}
            </div>
            <a href={`/${locale}/languages`} className="btn-outline mt-6">{text.seeAllLanguages}</a>
          </div>
        </section>
      )}
      <section className="px-4 py-16 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-ink">{text.pricingTitle}</h2>
            <p className="mt-3 text-sm leading-6 text-ink/65">{text.pricingText}</p>
            <div className="mt-5 grid gap-3 text-sm">
              {text.plans.map(([name, price, quota]) => (
                <a key={name} href={`/${locale}/pricing`} className="flex items-center justify-between rounded-lg border border-ink/10 bg-white px-4 py-3 font-black shadow-soft transition hover:border-violet/25 hover:text-violet">
                  <span>{name}</span>
                  <span className="text-ink/55">{price} / {text.perMonth} · {quota}</span>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-ink">{text.faqTitle}</h2>
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
              <h2 className="text-3xl font-black tracking-tight text-ink">{text.bestTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-ink/65">{text.bestText}</p>
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
