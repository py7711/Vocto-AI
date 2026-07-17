export type BlogContentBlock =
  | {type: "paragraph"; text: string}
  | {type: "heading"; id: string; text: string}
  | {type: "subheading"; text: string}
  | {type: "list"; ordered?: boolean; items: string[]};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  coverAlt: string;
  date: string;
  author?: string;
  category: string;
  readTime: string;
  content?: BlogContentBlock[];
  sections: Array<{
    heading: string;
    body: string[];
  }>;
};

const enPosts: BlogPost[] = [
  {
    slug: "compress-large-audio-to-mp3-vlc-guide",
    title: "How to Compress Large Audio Files to MP3 Using VLC: Complete Guide for Windows & Mac",
    excerpt: "Compress large recordings into transcription-friendly MP3 files with VLC on Windows and Mac.",
    coverImage: "/blog/compress-large-audio-to-mp3-vlc-guide/cover.png",
    coverAlt: "How to Compress Large Audio Files to MP3 Using VLC: Complete Guide for Windows & Mac",
    date: "2026-03-05",
    author: "David Chen",
    category: "Audio tools",
    readTime: "6 min",
    content: [
      {type: "paragraph", text: "If your audio file is very large, uploads can be slow, fragile, or fail after a refresh. Converting the file to MP3 first is the fastest way to make uploads more stable."},
      {type: "paragraph", text: "This guide shows you how to compress large audio files with VLC Media Player on both Windows and Mac."},
      {type: "heading", id: "why-convert-large-audio-files-to-mp3-first", text: "Why Convert Large Audio Files to MP3 First?"},
      {type: "paragraph", text: "For long recordings like meetings, interviews, and lectures, source files are often WAV or high-bitrate M4A. These can become very large quickly."},
      {type: "paragraph", text: "Converting to MP3 before upload gives you:"},
      {
        type: "list",
        items: [
          "Smaller files: Usually 5x-20x smaller than WAV",
          "Faster uploads: Less waiting and fewer timeout risks",
          "Better reliability: Reduced chance of interruption during upload",
          "Enough quality for speech transcription: MP3 at reasonable bitrate is usually more than enough"
        ]
      },
      {type: "heading", id: "quick-size-estimate", text: "Quick Size Estimate"},
      {type: "paragraph", text: "For speech-heavy recordings:"},
      {
        type: "list",
        items: [
          "64 kbps mono MP3: about 28 MB per hour",
          "96 kbps mono MP3: about 42 MB per hour",
          "128 kbps stereo MP3: about 56 MB per hour"
        ]
      },
      {type: "paragraph", text: "Example: a 2.5-hour recording at 96 kbps is roughly 105 MB."},
      {type: "heading", id: "what-you-ll-need", text: "What You'll Need"},
      {
        type: "list",
        items: [
          "VLC Media Player (videolan.org)",
          "Your original audio file (WAV, M4A, FLAC, etc.)",
          "Enough free disk space for both original and converted files"
        ]
      },
      {type: "heading", id: "recommended-mp3-settings-for-transcription", text: "Recommended MP3 Settings for Transcription"},
      {type: "paragraph", text: "If you want the easiest path, just select Audio - MP3 and keep defaults."},
      {
        type: "list",
        items: [
          "Meetings / lectures / calls: 64-96 kbps, mono",
          "Interviews / podcasts: 96-128 kbps, mono or stereo",
          "Sample rate: 44.1 kHz is a safe default"
        ]
      },
      {type: "paragraph", text: "If you are unsure, keep default first. Then use 96 kbps mono only when you need to reduce size further."},
      {type: "heading", id: "step-by-step-guide-for-windows", text: "Step-by-Step Guide for Windows"},
      {type: "subheading", text: "Step 1: Install VLC"},
      {type: "paragraph", text: "Download and install VLC from videolan.org."},
      {type: "subheading", text: "Step 2: Open the Convert Tool"},
      {
        type: "list",
        ordered: true,
        items: [
          "Open VLC Media Player",
          "Click Media -> Convert / Save (or press Ctrl + R)",
          "Click Add and choose your large audio file",
          "Click Convert / Save"
        ]
      },
      {type: "subheading", text: "Step 3: Choose MP3 Output Settings"},
      {
        type: "list",
        ordered: true,
        items: [
          "Under Profile, choose Audio - MP3",
          "You can keep default settings and continue",
          "Optional (advanced): click the wrench icon only if you want to change bitrate/channels"
        ]
      },
      {type: "subheading", text: "Step 4: Export the File"},
      {
        type: "list",
        ordered: true,
        items: [
          "Click Browse to pick output location and filename",
          "Make sure the file ends with .mp3",
          "Click Start",
          "Wait for conversion to complete"
        ]
      },
      {type: "heading", id: "step-by-step-guide-for-mac", text: "Step-by-Step Guide for Mac"},
      {type: "subheading", text: "Step 1: Install VLC"},
      {type: "paragraph", text: "Download and install VLC from videolan.org."},
      {type: "subheading", text: "Step 2: Open Convert / Stream"},
      {
        type: "list",
        ordered: true,
        items: [
          "Open VLC Media Player",
          "Click File -> Convert / Stream (or press Option + Command + S)",
          "Click Open media and choose your large audio file"
        ]
      },
      {type: "subheading", text: "Step 3: Configure MP3 Compression"},
      {
        type: "list",
        ordered: true,
        items: [
          "In Choose Profile, select an Audio - MP3 profile",
          "Keep default settings",
          "Optional (advanced): click Customize only if you want to lower bitrate for smaller files",
          "Choose destination file and ensure .mp3 extension"
        ]
      },
      {type: "subheading", text: "Step 4: Start Conversion"},
      {
        type: "list",
        ordered: true,
        items: [
          "Click Save as File",
          "Click Go or Save to begin",
          "Wait until conversion is finished"
        ]
      },
      {type: "heading", id: "how-to-verify-the-result", text: "How to Verify the Result"},
      {type: "paragraph", text: "Before upload, do a quick check:"},
      {
        type: "list",
        items: [
          "Open the MP3 and listen to the first 30-60 seconds",
          "Check file size is significantly smaller",
          "Keep the original source file as backup"
        ]
      },
      {type: "heading", id: "troubleshooting", text: "Troubleshooting"},
      {
        type: "list",
        items: [
          "File still too large: lower bitrate (for example from 128 to 96 or 64 kbps)",
          "Voice sounds distorted: increase bitrate (for example from 64 to 96 kbps)",
          "No audio in output: re-run conversion and verify audio codec is enabled",
          "Conversion fails: check free disk space and write permissions"
        ]
      },
      {type: "paragraph", text: "If codec options feel confusing, skip them and use defaults first. In most cases, default MP3 output is enough for transcription."},
      {type: "heading", id: "conclusion", text: "Conclusion"},
      {type: "paragraph", text: "Compressing large audio files to MP3 with VLC is one of the most practical ways to avoid upload issues. The process is free, works on both Windows and Mac, and takes only a few minutes."},
      {type: "paragraph", text: "For long recordings, this small preprocessing step can save significant upload time and make your transcription workflow much more reliable."}
    ],
    sections: [
      {
        heading: "Why compression matters",
        body: [
          "Long meetings, lectures, and interviews often produce files that are too large for a smooth upload workflow.",
          "For speech, a clean mono MP3 or M4A usually preserves enough detail while keeping queue time and storage cost under control."
        ]
      },
      {
        heading: "Recommended settings",
        body: [
          "For meetings and courses, 16kHz to 24kHz mono audio at 64kbps to 96kbps is often enough. Interviews and podcasts can use 128kbps for more detail.",
          "Avoid extremely low bitrates because speaker labeling, punctuation, and proper nouns become harder to recover."
        ]
      },
      {
        heading: "Where Votxt fits",
        body: [
          "After upload, Votxt queues the task and falls back across Groq, Deepgram, and AssemblyAI depending on speaker-label requirements.",
          "Once complete, you can generate summaries, mind maps, translations, exports, and read-only share links."
        ]
      }
    ]
  },
  {
    slug: "giving-voice-to-final-stories-hospice-volunteer-journey",
    title: "Giving Voice to Final Stories: A Volunteer’s Journey with Hospice Work",
    excerpt: "A reflective story about preserving voices, memories, and final conversations.",
    coverImage: "/blog/giving-voice-to-final-stories-hospice-volunteer-journey/cover.jpg",
    coverAlt: "Giving Voice to Final Stories: A Volunteer’s Journey with Hospice Work",
    date: "2025-09-22",
    category: "Stories",
    readTime: "7 min",
    sections: [
      {
        heading: "Why final stories matter",
        body: [
          "Hospice volunteering often centers on listening: family memories, lessons, favorite places, and the words people want to leave behind.",
          "A clean transcript can help families preserve those conversations without forcing anyone to replay difficult audio again and again."
        ]
      },
      {
        heading: "Recording with care",
        body: [
          "Use a quiet room, ask permission clearly, and keep the recording setup simple so the conversation stays human.",
          "Speaker labels, timestamps, and light editing make the final document easier for relatives and caregivers to read."
        ]
      },
      {
        heading: "Turning voice into a keepsake",
        body: [
          "After transcription, export a readable PDF or Word document, then share it privately with the people who should have access.",
          "The goal is not only accuracy. It is preserving tone, memory, and dignity in a format families can keep."
        ]
      }
    ]
  },
  {
    slug: "extract-audio-from-video-vlc-guide",
    title: "How to Extract Audio from Video Using VLC Player: Complete Guide for Mac & Windows",
    excerpt: "Extract audio from video files before transcription using VLC Player.",
    coverImage: "/blog/extract-audio-from-video-vlc-guide/cover.jpg",
    coverAlt: "How to Extract Audio from Video Using VLC Player: Complete Guide for Mac & Windows",
    date: "2025-08-10",
    category: "Video tools",
    readTime: "6 min",
    sections: [
      {
        heading: "Open the video in VLC",
        body: [
          "VLC can extract audio from most common video formats on both Mac and Windows.",
          "Open the video file, choose the convert or export option, and select an audio profile such as MP3 or M4A."
        ]
      },
      {
        heading: "Choose transcription-friendly settings",
        body: [
          "For speech, a mono MP3 at a moderate bitrate is usually enough and keeps uploads smaller.",
          "If the source has music or multiple speakers, avoid over-compressing because it can reduce transcription accuracy."
        ]
      },
      {
        heading: "Upload the extracted audio",
        body: [
          "Once VLC creates the audio file, upload it to Votxt and choose the spoken language or auto-detect.",
          "You can then generate summaries, subtitles, translations, and exports from the transcript."
        ]
      }
    ]
  },
  {
    slug: "five-free-wav-to-text-converters",
    title: "WAV to Text Converter: 5 Free Online Tools Reviewed",
    excerpt: "A practical review of free online tools for converting WAV audio into text.",
    coverImage: "/blog/five-free-wav-to-text-converters/cover.jpg",
    coverAlt: "WAV to Text Converter: 5 Free Online Tools Reviewed",
    date: "2025-03-06",
    category: "Reviews",
    readTime: "5 min",
    sections: [
      {
        heading: "What makes a good WAV converter",
        body: [
          "WAV files are often large but high quality, so a good converter should upload reliably and preserve speech detail.",
          "Look for timestamped transcripts, export options, and enough free minutes to test real recordings."
        ]
      },
      {
        heading: "Compare the workflow",
        body: [
          "Some tools focus only on plain text, while others include subtitles, summaries, speaker labels, and translation.",
          "For interviews, classes, and research notes, the post-transcription workflow often matters as much as raw accuracy."
        ]
      },
      {
        heading: "Export what you need",
        body: [
          "Use TXT or DOCX for editing, PDF for sharing, and SRT or VTT when you need captions.",
          "Votxt keeps the transcript editable so you can clean up proper nouns before exporting."
        ]
      }
    ]
  },
  {
    slug: "audio-to-srt-online-free-guide",
    title: "How to Convert Audio to SRT Subtitles Online for Free",
    excerpt: "Create SRT subtitle files from audio recordings with a simple online workflow.",
    coverImage: "/blog/audio-to-srt-online-free-guide/cover.jpg",
    coverAlt: "How to Convert Audio to SRT Subtitles Online for Free",
    date: "2025-02-20",
    category: "Subtitles",
    readTime: "5 min",
    sections: [
      {heading: "Start with clear audio", body: ["Upload a clear recording and choose the right language before transcription.", "Cleaner audio produces better timing, punctuation, and subtitle segmentation."]},
      {heading: "Generate the transcript", body: ["Votxt turns the recording into editable text with timestamps.", "Review the text before exporting subtitles so names and terms are correct."]},
      {heading: "Export SRT", body: ["Choose SRT for video editors and most subtitle platforms.", "VTT, TXT, PDF, and other formats are available when you need alternatives."]}
    ]
  },
  {
    slug: "three-best-ways-to-convert-video-to-text",
    title: "3 Best Ways to Convert Videos to Text",
    excerpt: "Compare upload, public-link transcription, and audio extraction workflows.",
    coverImage: "/blog/three-best-ways-to-convert-video-to-text/cover.jpg",
    coverAlt: "3 Best Ways to Convert Videos to Text",
    date: "2024-12-20",
    category: "Video",
    readTime: "6 min",
    sections: [
      {heading: "Upload the video file", body: ["Direct upload is best when you already have the video on your device.", "Votxt supports common video formats and exports captions or documents after transcription."]},
      {heading: "Paste a public link", body: ["For public videos, a link workflow avoids manual downloads.", "The transcript can be edited, summarized, translated, and shared."]},
      {heading: "Extract audio first", body: ["Extracting audio can reduce file size before upload.", "This is useful for long videos when the speech track is all you need."]}
    ]
  },
  {
    slug: "mp4-to-text-online-free",
    title: "Convert MP4 to Text Online for Free in Just 3 Steps",
    excerpt: "Turn MP4 videos into readable transcripts, subtitles, and reusable notes.",
    coverImage: "/blog/mp4-to-text-online-free/cover.jpg",
    coverAlt: "Convert MP4 to Text Online for Free in Just 3 Steps",
    date: "2024-12-19",
    category: "MP4",
    readTime: "5 min",
    sections: [
      {heading: "Upload MP4", body: ["Choose the MP4 file from your device and start transcription.", "For large files, use a stable connection and keep the browser open until upload completes."]},
      {heading: "Review the result", body: ["Check speaker turns, names, and key terms in the editor.", "AI summaries and mind maps can help you review long videos faster."]},
      {heading: "Export or share", body: ["Export TXT, PDF, DOCX, SRT, VTT, or CSV.", "Share links are useful when someone only needs to read the transcript."]}
    ]
  },
  {
    slug: "mp3-to-srt-online-free",
    title: "Step-by-Step Guide to Convert MP3 to SRT Online for Free",
    excerpt: "Create subtitle-ready SRT files from MP3 audio without installing desktop software.",
    coverImage: "/blog/mp3-to-srt-online-free/cover.jpg",
    coverAlt: "Step-by-Step Guide to Convert MP3 to SRT Online for Free",
    date: "2024-12-16",
    category: "MP3",
    readTime: "5 min",
    sections: [
      {heading: "Upload MP3", body: ["Start with a clear MP3 recording and select the spoken language.", "Votxt processes the audio and generates timestamped text."]},
      {heading: "Edit timing and text", body: ["Review punctuation, names, and any specialized terms.", "Clean text makes subtitle exports easier to use downstream."]},
      {heading: "Download SRT", body: ["Export SRT for editors, courses, and video platforms.", "You can also download VTT, TXT, PDF, DOCX, and CSV."]}
    ]
  }
];

type LocalizedBlogPostMeta = Pick<BlogPost, "title" | "excerpt" | "coverAlt" | "category" | "readTime">;
type LocalizedBlogPostMetaBySlug = Record<string, LocalizedBlogPostMeta>;
type BlogArticleContentCopy = {
  overviewHeading: string;
  workflowHeading: string;
  nextHeading: string;
  overview: (post: BlogPost) => string[];
  workflow: (post: BlogPost) => string[];
  next: (post: BlogPost) => string[];
};

const localizedBlogMeta: Record<string, LocalizedBlogPostMetaBySlug> = {
  zh: {
    "compress-large-audio-to-mp3-vlc-guide": {title: "如何用 VLC 将大型音频压缩为 MP3：Windows 与 Mac 完整指南", excerpt: "用 VLC 将大型录音压缩为更适合转写上传的 MP3 文件。", coverAlt: "如何用 VLC 将大型音频压缩为 MP3", category: "音频工具", readTime: "6 分钟"},
    "giving-voice-to-final-stories-hospice-volunteer-journey": {title: "为最后的故事留下声音：一位临终关怀志愿者的记录", excerpt: "关于保存声音、记忆和最后对话的真实故事。", coverAlt: "为最后的故事留下声音", category: "故事", readTime: "7 分钟"},
    "extract-audio-from-video-vlc-guide": {title: "如何用 VLC 从视频中提取音频：Mac 与 Windows 完整指南", excerpt: "在转写前用 VLC 从视频文件中提取音频。", coverAlt: "如何用 VLC 从视频中提取音频", category: "视频工具", readTime: "6 分钟"},
    "five-free-wav-to-text-converters": {title: "WAV 转文字转换器：5 个免费在线工具测评", excerpt: "测评可将 WAV 音频转换为文字的免费在线工具。", coverAlt: "WAV 转文字转换器：5 个免费在线工具测评", category: "音频转文字", readTime: "6 分钟"},
    "audio-to-srt-online-free-guide": {title: "如何免费在线将音频转换为 SRT 字幕", excerpt: "用简单在线流程从录音生成 SRT 字幕文件。", coverAlt: "如何免费在线将音频转换为 SRT 字幕", category: "字幕", readTime: "5 分钟"},
    "three-best-ways-to-convert-video-to-text": {title: "将视频转换为文字的 3 种最佳方法", excerpt: "比较上传文件、公开视频链接转写和先提取音频三种流程。", coverAlt: "将视频转换为文字的 3 种最佳方法", category: "视频", readTime: "6 分钟"},
    "mp4-to-text-online-free": {title: "免费在线将 MP4 转文字：只需 3 步", excerpt: "把 MP4 视频转换为可阅读转写、字幕和可复用笔记。", coverAlt: "免费在线将 MP4 转文字", category: "MP4", readTime: "5 分钟"},
    "mp3-to-srt-online-free": {title: "免费在线将 MP3 转 SRT 的分步指南", excerpt: "无需安装桌面软件，即可从 MP3 音频生成字幕 SRT 文件。", coverAlt: "免费在线将 MP3 转 SRT", category: "MP3", readTime: "5 分钟"}
  },
  "zh-TW": {
    "compress-large-audio-to-mp3-vlc-guide": {title: "如何用 VLC 將大型音訊壓縮為 MP3：Windows 與 Mac 完整指南", excerpt: "用 VLC 將大型錄音壓縮為更適合轉寫上傳的 MP3 檔。", coverAlt: "如何用 VLC 將大型音訊壓縮為 MP3", category: "音訊工具", readTime: "6 分鐘"},
    "giving-voice-to-final-stories-hospice-volunteer-journey": {title: "為最後的故事留下聲音：一位安寧照護志工的記錄", excerpt: "關於保存聲音、記憶和最後對話的故事。", coverAlt: "為最後的故事留下聲音", category: "故事", readTime: "7 分鐘"},
    "extract-audio-from-video-vlc-guide": {title: "如何用 VLC 從影片中擷取音訊：Mac 與 Windows 完整指南", excerpt: "在轉寫前用 VLC 從影片檔擷取音訊。", coverAlt: "如何用 VLC 從影片中擷取音訊", category: "影片工具", readTime: "6 分鐘"},
    "five-free-wav-to-text-converters": {title: "WAV 轉文字轉換器：5 個免費線上工具評測", excerpt: "評測可將 WAV 音訊轉成文字的免費線上工具。", coverAlt: "WAV 轉文字轉換器：5 個免費線上工具評測", category: "音訊轉文字", readTime: "6 分鐘"},
    "audio-to-srt-online-free-guide": {title: "如何免費線上將音訊轉換為 SRT 字幕", excerpt: "用簡單線上流程從錄音建立 SRT 字幕檔。", coverAlt: "如何免費線上將音訊轉換為 SRT 字幕", category: "字幕", readTime: "5 分鐘"},
    "three-best-ways-to-convert-video-to-text": {title: "將影片轉換為文字的 3 種最佳方法", excerpt: "比較上傳檔案、公開影片連結轉寫和先擷取音訊三種流程。", coverAlt: "將影片轉換為文字的 3 種最佳方法", category: "影片", readTime: "6 分鐘"},
    "mp4-to-text-online-free": {title: "免費線上將 MP4 轉文字：只需 3 步", excerpt: "把 MP4 影片轉換為可閱讀轉寫、字幕和可重用筆記。", coverAlt: "免費線上將 MP4 轉文字", category: "MP4", readTime: "5 分鐘"},
    "mp3-to-srt-online-free": {title: "免費線上將 MP3 轉 SRT 的分步指南", excerpt: "無需安裝桌面軟體，即可從 MP3 音訊建立字幕 SRT 檔。", coverAlt: "免費線上將 MP3 轉 SRT", category: "MP3", readTime: "5 分鐘"}
  },
  ja: {
    "compress-large-audio-to-mp3-vlc-guide": {title: "VLC で大きな音声ファイルを MP3 に圧縮する方法", excerpt: "VLC を使って、大きな録音を文字起こし向けの MP3 に変換します。", coverAlt: "VLC で大きな音声ファイルを MP3 に圧縮する方法", category: "音声ツール", readTime: "6分"},
    "giving-voice-to-final-stories-hospice-volunteer-journey": {title: "最後の物語に声を残す：ホスピスボランティアの記録", excerpt: "声、記憶、最後の会話を残すことについてのストーリー。", coverAlt: "最後の物語に声を残す", category: "ストーリー", readTime: "7分"},
    "extract-audio-from-video-vlc-guide": {title: "VLC で動画から音声を抽出する方法", excerpt: "文字起こし前に VLC で動画ファイルから音声を抽出します。", coverAlt: "VLC で動画から音声を抽出する方法", category: "動画ツール", readTime: "6分"},
    "five-free-wav-to-text-converters": {title: "WAV 文字起こし変換ツール：無料オンラインツール 5 選", excerpt: "WAV 音声をテキスト化できる無料オンラインツールを比較します。", coverAlt: "WAV 文字起こし変換ツール", category: "音声テキスト化", readTime: "6分"},
    "audio-to-srt-online-free-guide": {title: "音声を無料で SRT 字幕に変換する方法", excerpt: "録音から SRT 字幕ファイルを作成するシンプルなオンライン手順です。", coverAlt: "音声を無料で SRT 字幕に変換する方法", category: "字幕", readTime: "5分"},
    "three-best-ways-to-convert-video-to-text": {title: "動画をテキスト化する 3 つの方法", excerpt: "アップロード、公開リンク文字起こし、音声抽出のワークフローを比較します。", coverAlt: "動画をテキスト化する 3 つの方法", category: "動画", readTime: "6分"},
    "mp4-to-text-online-free": {title: "MP4 を無料でテキスト化する 3 ステップ", excerpt: "MP4 動画を読みやすい文字起こし、字幕、ノートに変換します。", coverAlt: "MP4 を無料でテキスト化", category: "MP4", readTime: "5分"},
    "mp3-to-srt-online-free": {title: "MP3 を無料で SRT に変換する手順", excerpt: "デスクトップソフトなしで MP3 から字幕用 SRT を作成します。", coverAlt: "MP3 を無料で SRT に変換", category: "MP3", readTime: "5分"}
  },
  ko: {
    "compress-large-audio-to-mp3-vlc-guide": {title: "VLC로 큰 오디오 파일을 MP3로 압축하는 방법", excerpt: "VLC로 긴 녹음을 전사 업로드에 적합한 MP3로 압축하세요.", coverAlt: "VLC로 큰 오디오 파일을 MP3로 압축하는 방법", category: "오디오 도구", readTime: "6분"},
    "giving-voice-to-final-stories-hospice-volunteer-journey": {title: "마지막 이야기에 목소리를 남기다: 호스피스 봉사자의 여정", excerpt: "목소리, 기억, 마지막 대화를 보존하는 이야기입니다.", coverAlt: "마지막 이야기에 목소리를 남기다", category: "이야기", readTime: "7분"},
    "extract-audio-from-video-vlc-guide": {title: "VLC로 비디오에서 오디오를 추출하는 방법", excerpt: "전사 전에 VLC로 비디오 파일에서 오디오를 추출하세요.", coverAlt: "VLC로 비디오에서 오디오 추출", category: "비디오 도구", readTime: "6분"},
    "five-free-wav-to-text-converters": {title: "WAV 텍스트 변환기: 무료 온라인 도구 5가지 리뷰", excerpt: "WAV 오디오를 텍스트로 바꾸는 무료 온라인 도구를 비교합니다.", coverAlt: "WAV 텍스트 변환기", category: "오디오 텍스트", readTime: "6분"},
    "audio-to-srt-online-free-guide": {title: "오디오를 무료로 SRT 자막으로 변환하는 방법", excerpt: "간단한 온라인 흐름으로 녹음에서 SRT 자막 파일을 만드세요.", coverAlt: "오디오를 SRT 자막으로 변환", category: "자막", readTime: "5분"},
    "three-best-ways-to-convert-video-to-text": {title: "비디오를 텍스트로 변환하는 3가지 방법", excerpt: "파일 업로드, 공개 링크 전사, 오디오 추출 워크플로를 비교합니다.", coverAlt: "비디오를 텍스트로 변환하는 방법", category: "비디오", readTime: "6분"},
    "mp4-to-text-online-free": {title: "MP4를 무료로 텍스트로 변환하는 3단계", excerpt: "MP4 영상을 읽기 쉬운 전사문, 자막, 노트로 바꾸세요.", coverAlt: "MP4 텍스트 변환", category: "MP4", readTime: "5분"},
    "mp3-to-srt-online-free": {title: "MP3를 무료로 SRT로 변환하는 단계별 가이드", excerpt: "데스크톱 소프트웨어 없이 MP3 오디오에서 SRT 자막을 만드세요.", coverAlt: "MP3를 SRT로 변환", category: "MP3", readTime: "5분"}
  },
  de: {
    "compress-large-audio-to-mp3-vlc-guide": {title: "Grosse Audiodateien mit VLC in MP3 komprimieren", excerpt: "Komprimiere lange Aufnahmen mit VLC zu transkriptionsfreundlichen MP3-Dateien.", coverAlt: "Audiodateien mit VLC in MP3 komprimieren", category: "Audio-Tools", readTime: "6 Min."},
    "giving-voice-to-final-stories-hospice-volunteer-journey": {title: "Letzten Geschichten eine Stimme geben: Eine Hospiz-Reise", excerpt: "Eine Geschichte uber das Bewahren von Stimmen, Erinnerungen und letzten Gesprachen.", coverAlt: "Letzten Geschichten eine Stimme geben", category: "Geschichten", readTime: "7 Min."},
    "extract-audio-from-video-vlc-guide": {title: "Audio mit VLC aus Video extrahieren", excerpt: "Extrahiere vor der Transkription Audio aus Videodateien mit VLC.", coverAlt: "Audio mit VLC aus Video extrahieren", category: "Video-Tools", readTime: "6 Min."},
    "five-free-wav-to-text-converters": {title: "WAV-zu-Text-Konverter: 5 kostenlose Online-Tools im Test", excerpt: "Ein Vergleich kostenloser Online-Tools fur WAV-Transkription.", coverAlt: "WAV-zu-Text-Konverter", category: "Audio zu Text", readTime: "6 Min."},
    "audio-to-srt-online-free-guide": {title: "Audio kostenlos online in SRT-Untertitel umwandeln", excerpt: "Erstelle SRT-Untertitel aus Audioaufnahmen mit einem einfachen Online-Workflow.", coverAlt: "Audio in SRT-Untertitel umwandeln", category: "Untertitel", readTime: "5 Min."},
    "three-best-ways-to-convert-video-to-text": {title: "Die 3 besten Wege, Videos in Text umzuwandeln", excerpt: "Vergleiche Upload, Public-Link-Transkription und Audio-Extraktion.", coverAlt: "Videos in Text umwandeln", category: "Video", readTime: "6 Min."},
    "mp4-to-text-online-free": {title: "MP4 kostenlos online in Text umwandeln: in 3 Schritten", excerpt: "Verwandle MP4-Videos in Transkripte, Untertitel und wiederverwendbare Notizen.", coverAlt: "MP4 kostenlos in Text umwandeln", category: "MP4", readTime: "5 Min."},
    "mp3-to-srt-online-free": {title: "MP3 kostenlos online in SRT umwandeln", excerpt: "Erstelle untertitelfertige SRT-Dateien aus MP3-Audio ohne Desktop-Software.", coverAlt: "MP3 in SRT umwandeln", category: "MP3", readTime: "5 Min."}
  },
  es: {
    "compress-large-audio-to-mp3-vlc-guide": {title: "Como comprimir audios grandes a MP3 con VLC", excerpt: "Comprime grabaciones grandes en MP3 listos para transcripcion con VLC.", coverAlt: "Comprimir audios grandes a MP3 con VLC", category: "Audio", readTime: "6 min"},
    "giving-voice-to-final-stories-hospice-volunteer-journey": {title: "Dar voz a las ultimas historias: viaje de voluntariado en hospicio", excerpt: "Una historia sobre conservar voces, recuerdos y conversaciones finales.", coverAlt: "Dar voz a las ultimas historias", category: "Historias", readTime: "7 min"},
    "extract-audio-from-video-vlc-guide": {title: "Como extraer audio de un video con VLC", excerpt: "Extrae audio de archivos de video antes de transcribirlos.", coverAlt: "Extraer audio de video con VLC", category: "Video", readTime: "6 min"},
    "five-free-wav-to-text-converters": {title: "Convertidores WAV a texto: 5 herramientas gratis revisadas", excerpt: "Comparativa de herramientas online gratis para convertir WAV en texto.", coverAlt: "Convertidores WAV a texto", category: "Audio a texto", readTime: "6 min"},
    "audio-to-srt-online-free-guide": {title: "Como convertir audio a subtitulos SRT gratis online", excerpt: "Crea archivos SRT desde grabaciones de audio con un flujo online simple.", coverAlt: "Audio a subtitulos SRT", category: "Subtitulos", readTime: "5 min"},
    "three-best-ways-to-convert-video-to-text": {title: "3 mejores formas de convertir videos a texto", excerpt: "Compara subida de archivos, enlaces publicos y extraccion de audio.", coverAlt: "Convertir videos a texto", category: "Video", readTime: "6 min"},
    "mp4-to-text-online-free": {title: "Convertir MP4 a texto gratis online en 3 pasos", excerpt: "Convierte videos MP4 en transcripciones, subtitulos y notas reutilizables.", coverAlt: "MP4 a texto gratis online", category: "MP4", readTime: "5 min"},
    "mp3-to-srt-online-free": {title: "Guia paso a paso para convertir MP3 a SRT gratis online", excerpt: "Crea SRT desde audio MP3 sin instalar software de escritorio.", coverAlt: "MP3 a SRT gratis online", category: "MP3", readTime: "5 min"}
  },
  fr: {
    "compress-large-audio-to-mp3-vlc-guide": {title: "Compresser de gros fichiers audio en MP3 avec VLC", excerpt: "Compressez de longs enregistrements en MP3 plus faciles a transcrire.", coverAlt: "Compresser de gros fichiers audio en MP3 avec VLC", category: "Audio", readTime: "6 min"},
    "giving-voice-to-final-stories-hospice-volunteer-journey": {title: "Donner une voix aux derniers recits : parcours benevole en soins palliatifs", excerpt: "Une histoire sur la preservation des voix, souvenirs et dernieres conversations.", coverAlt: "Donner une voix aux derniers recits", category: "Recits", readTime: "7 min"},
    "extract-audio-from-video-vlc-guide": {title: "Extraire l'audio d'une video avec VLC", excerpt: "Extrayez l'audio d'une video avant de lancer la transcription.", coverAlt: "Extraire l'audio d'une video avec VLC", category: "Video", readTime: "6 min"},
    "five-free-wav-to-text-converters": {title: "Convertisseurs WAV en texte : 5 outils gratuits testes", excerpt: "Comparatif d'outils gratuits pour transformer un WAV en texte.", coverAlt: "Convertisseurs WAV en texte", category: "Audio en texte", readTime: "6 min"},
    "audio-to-srt-online-free-guide": {title: "Convertir gratuitement un audio en sous-titres SRT en ligne", excerpt: "Creez des fichiers SRT depuis un enregistrement avec un flux simple.", coverAlt: "Audio vers sous-titres SRT", category: "Sous-titres", readTime: "5 min"},
    "three-best-ways-to-convert-video-to-text": {title: "3 meilleures facons de convertir une video en texte", excerpt: "Comparez import, transcription par lien public et extraction audio.", coverAlt: "Convertir une video en texte", category: "Video", readTime: "6 min"},
    "mp4-to-text-online-free": {title: "Convertir un MP4 en texte gratuitement en 3 etapes", excerpt: "Transformez des videos MP4 en transcriptions, sous-titres et notes reutilisables.", coverAlt: "MP4 en texte gratuitement", category: "MP4", readTime: "5 min"},
    "mp3-to-srt-online-free": {title: "Guide pour convertir gratuitement un MP3 en SRT", excerpt: "Creez des sous-titres SRT depuis un MP3 sans logiciel de bureau.", coverAlt: "MP3 vers SRT", category: "MP3", readTime: "5 min"}
  },
  pt: {
    "compress-large-audio-to-mp3-vlc-guide": {title: "Como compactar audios grandes para MP3 com VLC", excerpt: "Compacte gravacoes grandes em MP3 mais estaveis para transcricao.", coverAlt: "Compactar audios grandes para MP3 com VLC", category: "Audio", readTime: "6 min"},
    "giving-voice-to-final-stories-hospice-volunteer-journey": {title: "Dar voz as ultimas historias: jornada voluntaria em hospice", excerpt: "Uma historia sobre preservar vozes, memorias e conversas finais.", coverAlt: "Dar voz as ultimas historias", category: "Historias", readTime: "7 min"},
    "extract-audio-from-video-vlc-guide": {title: "Como extrair audio de video usando VLC", excerpt: "Extraia audio de videos antes da transcricao com VLC.", coverAlt: "Extrair audio de video usando VLC", category: "Video", readTime: "6 min"},
    "five-free-wav-to-text-converters": {title: "Conversores WAV para texto: 5 ferramentas gratis avaliadas", excerpt: "Analise de ferramentas online gratis para converter WAV em texto.", coverAlt: "Conversores WAV para texto", category: "Audio para texto", readTime: "6 min"},
    "audio-to-srt-online-free-guide": {title: "Como converter audio em legendas SRT gratis online", excerpt: "Crie arquivos SRT a partir de gravacoes com um fluxo online simples.", coverAlt: "Audio para legendas SRT", category: "Legendas", readTime: "5 min"},
    "three-best-ways-to-convert-video-to-text": {title: "3 melhores formas de converter videos em texto", excerpt: "Compare upload, transcricao por link publico e extracao de audio.", coverAlt: "Converter videos em texto", category: "Video", readTime: "6 min"},
    "mp4-to-text-online-free": {title: "Converter MP4 em texto gratis online em 3 passos", excerpt: "Transforme videos MP4 em transcricoes, legendas e notas reutilizaveis.", coverAlt: "MP4 para texto gratis", category: "MP4", readTime: "5 min"},
    "mp3-to-srt-online-free": {title: "Guia para converter MP3 em SRT gratis online", excerpt: "Crie SRT pronto para legendas a partir de MP3 sem software de desktop.", coverAlt: "MP3 para SRT gratis", category: "MP3", readTime: "5 min"}
  },
  id: {
    "compress-large-audio-to-mp3-vlc-guide": {title: "Cara mengompres audio besar ke MP3 dengan VLC", excerpt: "Kompres rekaman besar menjadi MP3 yang lebih stabil untuk transkripsi.", coverAlt: "Kompres audio besar ke MP3 dengan VLC", category: "Alat audio", readTime: "6 menit"},
    "giving-voice-to-final-stories-hospice-volunteer-journey": {title: "Memberi suara pada cerita terakhir: perjalanan relawan hospice", excerpt: "Cerita tentang menjaga suara, kenangan, dan percakapan terakhir.", coverAlt: "Memberi suara pada cerita terakhir", category: "Cerita", readTime: "7 menit"},
    "extract-audio-from-video-vlc-guide": {title: "Cara mengekstrak audio dari video dengan VLC", excerpt: "Ambil audio dari file video sebelum transkripsi.", coverAlt: "Ekstrak audio dari video dengan VLC", category: "Alat video", readTime: "6 menit"},
    "five-free-wav-to-text-converters": {title: "Konverter WAV ke teks: 5 alat online gratis", excerpt: "Ulasan alat gratis untuk mengubah audio WAV menjadi teks.", coverAlt: "Konverter WAV ke teks", category: "Audio ke teks", readTime: "6 menit"},
    "audio-to-srt-online-free-guide": {title: "Cara mengubah audio ke subtitle SRT gratis online", excerpt: "Buat file subtitle SRT dari rekaman audio dengan alur online sederhana.", coverAlt: "Audio ke subtitle SRT", category: "Subtitle", readTime: "5 menit"},
    "three-best-ways-to-convert-video-to-text": {title: "3 cara terbaik mengubah video menjadi teks", excerpt: "Bandingkan unggah file, transkripsi tautan publik, dan ekstraksi audio.", coverAlt: "Video menjadi teks", category: "Video", readTime: "6 menit"},
    "mp4-to-text-online-free": {title: "Ubah MP4 ke teks gratis online dalam 3 langkah", excerpt: "Ubah video MP4 menjadi transkrip, subtitle, dan catatan yang bisa dipakai ulang.", coverAlt: "MP4 ke teks gratis", category: "MP4", readTime: "5 menit"},
    "mp3-to-srt-online-free": {title: "Panduan mengubah MP3 ke SRT gratis online", excerpt: "Buat SRT dari audio MP3 tanpa memasang aplikasi desktop.", coverAlt: "MP3 ke SRT gratis", category: "MP3", readTime: "5 menit"}
  },
  ru: {
    "compress-large-audio-to-mp3-vlc-guide": {title: "Как сжать большой аудиофайл в MP3 через VLC", excerpt: "Сжимайте длинные записи в MP3, удобный для загрузки и транскрибации.", coverAlt: "Сжатие аудио в MP3 через VLC", category: "Аудио", readTime: "6 мин"},
    "giving-voice-to-final-stories-hospice-volunteer-journey": {title: "Дать голос последним историям: путь волонтера хосписа", excerpt: "История о сохранении голосов, памяти и последних разговоров.", coverAlt: "Дать голос последним историям", category: "Истории", readTime: "7 мин"},
    "extract-audio-from-video-vlc-guide": {title: "Как извлечь аудио из видео с помощью VLC", excerpt: "Извлеките аудио из видео перед транскрибацией.", coverAlt: "Извлечь аудио из видео через VLC", category: "Видео", readTime: "6 мин"},
    "five-free-wav-to-text-converters": {title: "Конвертер WAV в текст: 5 бесплатных онлайн-инструментов", excerpt: "Обзор бесплатных инструментов для превращения WAV-аудио в текст.", coverAlt: "WAV в текст", category: "Аудио в текст", readTime: "6 мин"},
    "audio-to-srt-online-free-guide": {title: "Как бесплатно конвертировать аудио в SRT-субтитры онлайн", excerpt: "Создавайте SRT-файлы из аудиозаписей простым онлайн-процессом.", coverAlt: "Аудио в SRT", category: "Субтитры", readTime: "5 мин"},
    "three-best-ways-to-convert-video-to-text": {title: "3 лучших способа преобразовать видео в текст", excerpt: "Сравнение загрузки файла, публичной ссылки и извлечения аудио.", coverAlt: "Видео в текст", category: "Видео", readTime: "6 мин"},
    "mp4-to-text-online-free": {title: "MP4 в текст бесплатно онлайн за 3 шага", excerpt: "Преобразуйте MP4-видео в транскрипты, субтитры и заметки.", coverAlt: "MP4 в текст", category: "MP4", readTime: "5 мин"},
    "mp3-to-srt-online-free": {title: "Как бесплатно конвертировать MP3 в SRT онлайн", excerpt: "Создавайте SRT-субтитры из MP3 без установки настольных программ.", coverAlt: "MP3 в SRT", category: "MP3", readTime: "5 мин"}
  },
  vi: {
    "compress-large-audio-to-mp3-vlc-guide": {title: "Cach nen tep am thanh lon thanh MP3 bang VLC", excerpt: "Nen ban ghi dai thanh MP3 on dinh hon cho viec tai len va chep loi.", coverAlt: "Nen am thanh lon thanh MP3 bang VLC", category: "Cong cu am thanh", readTime: "6 phut"},
    "giving-voice-to-final-stories-hospice-volunteer-journey": {title: "Giu lai giong noi cho nhung cau chuyen cuoi cung", excerpt: "Cau chuyen ve viec luu giu giong noi, ky uc va nhung cuoc tro chuyen cuoi.", coverAlt: "Giu lai giong noi cho cau chuyen cuoi", category: "Cau chuyen", readTime: "7 phut"},
    "extract-audio-from-video-vlc-guide": {title: "Cach tach am thanh tu video bang VLC", excerpt: "Tach am thanh tu tep video truoc khi chep loi.", coverAlt: "Tach am thanh tu video bang VLC", category: "Cong cu video", readTime: "6 phut"},
    "five-free-wav-to-text-converters": {title: "Cong cu WAV sang van ban: 5 lua chon mien phi", excerpt: "Danh gia cac cong cu online mien phi de chuyen WAV thanh van ban.", coverAlt: "WAV sang van ban", category: "Am thanh sang van ban", readTime: "6 phut"},
    "audio-to-srt-online-free-guide": {title: "Cach chuyen am thanh thanh phu de SRT mien phi online", excerpt: "Tao tep SRT tu ban ghi am voi quy trinh online don gian.", coverAlt: "Am thanh sang SRT", category: "Phu de", readTime: "5 phut"},
    "three-best-ways-to-convert-video-to-text": {title: "3 cach tot nhat de chuyen video thanh van ban", excerpt: "So sanh tai tep, chep loi bang lien ket cong khai va tach am thanh.", coverAlt: "Video thanh van ban", category: "Video", readTime: "6 phut"},
    "mp4-to-text-online-free": {title: "Chuyen MP4 thanh van ban mien phi online trong 3 buoc", excerpt: "Bien video MP4 thanh ban chep loi, phu de va ghi chu co the dung lai.", coverAlt: "MP4 sang van ban", category: "MP4", readTime: "5 phut"},
    "mp3-to-srt-online-free": {title: "Huong dan chuyen MP3 thanh SRT mien phi online", excerpt: "Tao SRT tu am thanh MP3 ma khong can phan mem desktop.", coverAlt: "MP3 sang SRT", category: "MP3", readTime: "5 phut"}
  },
  ar: {
    "compress-large-audio-to-mp3-vlc-guide": {title: "كيفية ضغط ملفات الصوت الكبيرة إلى MP3 باستخدام VLC", excerpt: "حوّل التسجيلات الكبيرة إلى ملفات MP3 أكثر ملاءمة للرفع والتفريغ.", coverAlt: "ضغط الصوت إلى MP3 باستخدام VLC", category: "أدوات صوت", readTime: "6 دقائق"},
    "giving-voice-to-final-stories-hospice-volunteer-journey": {title: "إعطاء صوت للقصص الأخيرة: رحلة متطوع في رعاية المحتضرين", excerpt: "قصة عن حفظ الأصوات والذكريات والمحادثات الأخيرة.", coverAlt: "إعطاء صوت للقصص الأخيرة", category: "قصص", readTime: "7 دقائق"},
    "extract-audio-from-video-vlc-guide": {title: "كيفية استخراج الصوت من الفيديو باستخدام VLC", excerpt: "استخرج الصوت من ملفات الفيديو قبل التفريغ.", coverAlt: "استخراج الصوت من الفيديو باستخدام VLC", category: "أدوات فيديو", readTime: "6 دقائق"},
    "five-free-wav-to-text-converters": {title: "محولات WAV إلى نص: 5 أدوات مجانية عبر الإنترنت", excerpt: "مراجعة أدوات مجانية لتحويل صوت WAV إلى نص.", coverAlt: "WAV إلى نص", category: "الصوت إلى نص", readTime: "6 دقائق"},
    "audio-to-srt-online-free-guide": {title: "كيفية تحويل الصوت إلى ترجمات SRT مجاناً عبر الإنترنت", excerpt: "أنشئ ملفات SRT من التسجيلات الصوتية بخطوات بسيطة.", coverAlt: "الصوت إلى SRT", category: "ترجمات", readTime: "5 دقائق"},
    "three-best-ways-to-convert-video-to-text": {title: "أفضل 3 طرق لتحويل الفيديو إلى نص", excerpt: "قارن بين رفع الملف وتفريغ الرابط العام واستخراج الصوت.", coverAlt: "الفيديو إلى نص", category: "فيديو", readTime: "6 دقائق"},
    "mp4-to-text-online-free": {title: "تحويل MP4 إلى نص مجاناً عبر الإنترنت في 3 خطوات", excerpt: "حوّل فيديوهات MP4 إلى تفريغات وترجمات وملاحظات قابلة لإعادة الاستخدام.", coverAlt: "MP4 إلى نص", category: "MP4", readTime: "5 دقائق"},
    "mp3-to-srt-online-free": {title: "دليل تحويل MP3 إلى SRT مجاناً عبر الإنترنت", excerpt: "أنشئ ملفات SRT من صوت MP3 دون تثبيت برامج سطح مكتب.", coverAlt: "MP3 إلى SRT", category: "MP3", readTime: "5 دقائق"}
  },
  it: {
    "compress-large-audio-to-mp3-vlc-guide": {title: "Come comprimere audio grandi in MP3 con VLC", excerpt: "Comprimi registrazioni lunghe in MP3 piu stabili per la trascrizione.", coverAlt: "Comprimere audio in MP3 con VLC", category: "Audio", readTime: "6 min"},
    "giving-voice-to-final-stories-hospice-volunteer-journey": {title: "Dare voce alle ultime storie: viaggio di un volontario hospice", excerpt: "Una storia su voci, ricordi e conversazioni finali da preservare.", coverAlt: "Dare voce alle ultime storie", category: "Storie", readTime: "7 min"},
    "extract-audio-from-video-vlc-guide": {title: "Come estrarre audio da un video con VLC", excerpt: "Estrai l'audio dai video prima della trascrizione.", coverAlt: "Estrarre audio da video con VLC", category: "Video", readTime: "6 min"},
    "five-free-wav-to-text-converters": {title: "Convertitori WAV in testo: 5 strumenti gratuiti recensiti", excerpt: "Confronto di strumenti online gratuiti per trasformare WAV in testo.", coverAlt: "WAV in testo", category: "Audio in testo", readTime: "6 min"},
    "audio-to-srt-online-free-guide": {title: "Come convertire audio in sottotitoli SRT gratis online", excerpt: "Crea file SRT da registrazioni audio con un flusso online semplice.", coverAlt: "Audio in SRT", category: "Sottotitoli", readTime: "5 min"},
    "three-best-ways-to-convert-video-to-text": {title: "3 modi migliori per convertire video in testo", excerpt: "Confronta upload, link pubblico ed estrazione audio.", coverAlt: "Video in testo", category: "Video", readTime: "6 min"},
    "mp4-to-text-online-free": {title: "Convertire MP4 in testo gratis online in 3 passaggi", excerpt: "Trasforma video MP4 in trascrizioni, sottotitoli e note riutilizzabili.", coverAlt: "MP4 in testo", category: "MP4", readTime: "5 min"},
    "mp3-to-srt-online-free": {title: "Guida per convertire MP3 in SRT gratis online", excerpt: "Crea SRT da audio MP3 senza software desktop.", coverAlt: "MP3 in SRT", category: "MP3", readTime: "5 min"}
  },
  th: {
    "compress-large-audio-to-mp3-vlc-guide": {title: "วิธีบีบอัดไฟล์เสียงขนาดใหญ่เป็น MP3 ด้วย VLC", excerpt: "บีบอัดไฟล์บันทึกเสียงให้เป็น MP3 ที่อัปโหลดและถอดเสียงได้เสถียรกว่า", coverAlt: "บีบอัดเสียงเป็น MP3 ด้วย VLC", category: "เครื่องมือเสียง", readTime: "6 นาที"},
    "giving-voice-to-final-stories-hospice-volunteer-journey": {title: "เก็บเสียงให้เรื่องราวสุดท้าย: เส้นทางอาสาสมัครฮอสพิซ", excerpt: "เรื่องราวเกี่ยวกับการเก็บรักษาเสียง ความทรงจำ และบทสนทนาสุดท้าย", coverAlt: "เก็บเสียงให้เรื่องราวสุดท้าย", category: "เรื่องราว", readTime: "7 นาที"},
    "extract-audio-from-video-vlc-guide": {title: "วิธีแยกเสียงจากวิดีโอด้วย VLC", excerpt: "แยกเสียงจากไฟล์วิดีโอก่อนนำไปถอดเสียง", coverAlt: "แยกเสียงจากวิดีโอด้วย VLC", category: "เครื่องมือวิดีโอ", readTime: "6 นาที"},
    "five-free-wav-to-text-converters": {title: "ตัวแปลง WAV เป็นข้อความ: 5 เครื่องมือฟรีออนไลน์", excerpt: "รีวิวเครื่องมือฟรีสำหรับแปลงเสียง WAV เป็นข้อความ", coverAlt: "WAV เป็นข้อความ", category: "เสียงเป็นข้อความ", readTime: "6 นาที"},
    "audio-to-srt-online-free-guide": {title: "วิธีแปลงเสียงเป็นคำบรรยาย SRT ฟรีออนไลน์", excerpt: "สร้างไฟล์ SRT จากเสียงบันทึกด้วยขั้นตอนออนไลน์ง่ายๆ", coverAlt: "เสียงเป็น SRT", category: "คำบรรยาย", readTime: "5 นาที"},
    "three-best-ways-to-convert-video-to-text": {title: "3 วิธีที่ดีที่สุดในการแปลงวิดีโอเป็นข้อความ", excerpt: "เปรียบเทียบการอัปโหลดไฟล์ ลิงก์สาธารณะ และการแยกเสียง", coverAlt: "วิดีโอเป็นข้อความ", category: "วิดีโอ", readTime: "6 นาที"},
    "mp4-to-text-online-free": {title: "แปลง MP4 เป็นข้อความฟรีออนไลน์ใน 3 ขั้นตอน", excerpt: "เปลี่ยนวิดีโอ MP4 เป็นข้อความ คำบรรยาย และโน้ตที่นำกลับมาใช้ได้", coverAlt: "MP4 เป็นข้อความ", category: "MP4", readTime: "5 นาที"},
    "mp3-to-srt-online-free": {title: "คู่มือแปลง MP3 เป็น SRT ฟรีออนไลน์", excerpt: "สร้าง SRT จากเสียง MP3 โดยไม่ต้องติดตั้งโปรแกรมเดสก์ท็อป", coverAlt: "MP3 เป็น SRT", category: "MP3", readTime: "5 นาที"}
  },
  uk: {
    "compress-large-audio-to-mp3-vlc-guide": {title: "Як стиснути великий аудіофайл у MP3 через VLC", excerpt: "Стискайте довгі записи у MP3, зручний для завантаження й транскрипції.", coverAlt: "Стиснення аудіо у MP3 через VLC", category: "Аудіо", readTime: "6 хв"},
    "giving-voice-to-final-stories-hospice-volunteer-journey": {title: "Дати голос останнім історіям: шлях волонтера хоспісу", excerpt: "Історія про збереження голосів, спогадів і останніх розмов.", coverAlt: "Дати голос останнім історіям", category: "Історії", readTime: "7 хв"},
    "extract-audio-from-video-vlc-guide": {title: "Як витягти аудіо з відео за допомогою VLC", excerpt: "Витягніть аудіо з відеофайлу перед транскрипцією.", coverAlt: "Витягти аудіо з відео через VLC", category: "Відео", readTime: "6 хв"},
    "five-free-wav-to-text-converters": {title: "Конвертер WAV у текст: 5 безкоштовних онлайн-інструментів", excerpt: "Огляд безкоштовних інструментів для перетворення WAV-аудіо на текст.", coverAlt: "WAV у текст", category: "Аудіо в текст", readTime: "6 хв"},
    "audio-to-srt-online-free-guide": {title: "Як безкоштовно конвертувати аудіо в SRT-субтитри онлайн", excerpt: "Створюйте SRT-файли з аудіозаписів простим онлайн-процесом.", coverAlt: "Аудіо в SRT", category: "Субтитри", readTime: "5 хв"},
    "three-best-ways-to-convert-video-to-text": {title: "3 найкращі способи перетворити відео на текст", excerpt: "Порівняння завантаження файлу, публічного посилання й витягнення аудіо.", coverAlt: "Відео в текст", category: "Відео", readTime: "6 хв"},
    "mp4-to-text-online-free": {title: "MP4 у текст безкоштовно онлайн за 3 кроки", excerpt: "Перетворюйте MP4-відео на транскрипти, субтитри й нотатки.", coverAlt: "MP4 у текст", category: "MP4", readTime: "5 хв"},
    "mp3-to-srt-online-free": {title: "Як безкоштовно конвертувати MP3 у SRT онлайн", excerpt: "Створюйте SRT-субтитри з MP3 без настільного ПЗ.", coverAlt: "MP3 у SRT", category: "MP3", readTime: "5 хв"}
  },
  tr: {
    "compress-large-audio-to-mp3-vlc-guide": {title: "VLC ile buyuk ses dosyalarini MP3'e sikistirma", excerpt: "Uzun kayitlari transkripsiyon icin daha kararlı MP3 dosyalarina donusturun.", coverAlt: "VLC ile sesi MP3'e sikistirma", category: "Ses araclari", readTime: "6 dk"},
    "giving-voice-to-final-stories-hospice-volunteer-journey": {title: "Son hikayelere ses vermek: hospice gonullusunun yolculugu", excerpt: "Sesleri, anilari ve son konusmalari saklamak hakkinda bir hikaye.", coverAlt: "Son hikayelere ses vermek", category: "Hikayeler", readTime: "7 dk"},
    "extract-audio-from-video-vlc-guide": {title: "VLC ile videodan ses nasil cikarilir", excerpt: "Transkripsiyon oncesinde video dosyalarindan ses cikarın.", coverAlt: "VLC ile videodan ses cikar", category: "Video araclari", readTime: "6 dk"},
    "five-free-wav-to-text-converters": {title: "WAV metin donusturucu: 5 ucretsiz online arac", excerpt: "WAV sesini metne ceviren ucretsiz online araclari karsilastirin.", coverAlt: "WAV metne donusturucu", category: "Ses metne", readTime: "6 dk"},
    "audio-to-srt-online-free-guide": {title: "Sesi ucretsiz online SRT altyaziya donusturme", excerpt: "Basit bir online akışla ses kayitlarindan SRT dosyasi olusturun.", coverAlt: "Ses SRT'ye", category: "Altyazi", readTime: "5 dk"},
    "three-best-ways-to-convert-video-to-text": {title: "Videoyu metne donusturmenin en iyi 3 yolu", excerpt: "Dosya yukleme, acik link transkripsiyonu ve ses cikarmayi karsilastirin.", coverAlt: "Video metne", category: "Video", readTime: "6 dk"},
    "mp4-to-text-online-free": {title: "MP4'u 3 adimda ucretsiz online metne donusturun", excerpt: "MP4 videolari transkript, altyazi ve yeniden kullanilabilir notlara cevirin.", coverAlt: "MP4 metne", category: "MP4", readTime: "5 dk"},
    "mp3-to-srt-online-free": {title: "MP3'u ucretsiz online SRT'ye donusturme rehberi", excerpt: "Masaustu yazilim kurmadan MP3 sesinden SRT altyazi olusturun.", coverAlt: "MP3 SRT'ye", category: "MP3", readTime: "5 dk"}
  },
  nl: {
    "compress-large-audio-to-mp3-vlc-guide": {title: "Grote audiobestanden naar MP3 comprimeren met VLC", excerpt: "Maak lange opnames kleiner en stabieler voor transcriptie-upload.", coverAlt: "Audio comprimeren naar MP3 met VLC", category: "Audio", readTime: "6 min"},
    "giving-voice-to-final-stories-hospice-volunteer-journey": {title: "Laatste verhalen een stem geven: reis van een hospicevrijwilliger", excerpt: "Een verhaal over stemmen, herinneringen en laatste gesprekken bewaren.", coverAlt: "Laatste verhalen een stem geven", category: "Verhalen", readTime: "7 min"},
    "extract-audio-from-video-vlc-guide": {title: "Audio uit video halen met VLC", excerpt: "Haal audio uit videobestanden voordat je ze transcribeert.", coverAlt: "Audio uit video halen met VLC", category: "Video", readTime: "6 min"},
    "five-free-wav-to-text-converters": {title: "WAV naar tekst: 5 gratis online tools beoordeeld", excerpt: "Vergelijk gratis online tools om WAV-audio naar tekst om te zetten.", coverAlt: "WAV naar tekst", category: "Audio naar tekst", readTime: "6 min"},
    "audio-to-srt-online-free-guide": {title: "Audio gratis online naar SRT-ondertitels converteren", excerpt: "Maak SRT-bestanden van audio-opnames met een eenvoudige online workflow.", coverAlt: "Audio naar SRT", category: "Ondertitels", readTime: "5 min"},
    "three-best-ways-to-convert-video-to-text": {title: "3 beste manieren om video naar tekst te converteren", excerpt: "Vergelijk uploaden, openbare links en eerst audio extraheren.", coverAlt: "Video naar tekst", category: "Video", readTime: "6 min"},
    "mp4-to-text-online-free": {title: "MP4 gratis online naar tekst in 3 stappen", excerpt: "Zet MP4-video's om in transcripties, ondertitels en herbruikbare notities.", coverAlt: "MP4 naar tekst", category: "MP4", readTime: "5 min"},
    "mp3-to-srt-online-free": {title: "MP3 gratis online naar SRT converteren", excerpt: "Maak SRT-ondertitels van MP3-audio zonder desktopsoftware.", coverAlt: "MP3 naar SRT", category: "MP3", readTime: "5 min"}
  },
  pl: {
    "compress-large-audio-to-mp3-vlc-guide": {title: "Jak skompresowac duze pliki audio do MP3 w VLC", excerpt: "Kompresuj dlugie nagrania do MP3 wygodnego do przesylania i transkrypcji.", coverAlt: "Kompresja audio do MP3 w VLC", category: "Audio", readTime: "6 min"},
    "giving-voice-to-final-stories-hospice-volunteer-journey": {title: "Dac glos ostatnim historiom: droga wolontariusza hospicjum", excerpt: "Historia o zachowaniu glosow, wspomnien i ostatnich rozmow.", coverAlt: "Dac glos ostatnim historiom", category: "Historie", readTime: "7 min"},
    "extract-audio-from-video-vlc-guide": {title: "Jak wyodrebnic audio z wideo za pomoca VLC", excerpt: "Wyodrebnij audio z pliku wideo przed transkrypcja.", coverAlt: "Audio z wideo w VLC", category: "Wideo", readTime: "6 min"},
    "five-free-wav-to-text-converters": {title: "Konwerter WAV na tekst: 5 darmowych narzedzi online", excerpt: "Przeglad darmowych narzedzi do zamiany WAV na tekst.", coverAlt: "WAV na tekst", category: "Audio na tekst", readTime: "6 min"},
    "audio-to-srt-online-free-guide": {title: "Jak bezplatnie przekonwertowac audio na napisy SRT online", excerpt: "Tworz pliki SRT z nagran audio prostym procesem online.", coverAlt: "Audio na SRT", category: "Napisy", readTime: "5 min"},
    "three-best-ways-to-convert-video-to-text": {title: "3 najlepsze sposoby konwersji wideo na tekst", excerpt: "Porownaj przesylanie pliku, link publiczny i ekstrakcje audio.", coverAlt: "Wideo na tekst", category: "Wideo", readTime: "6 min"},
    "mp4-to-text-online-free": {title: "MP4 na tekst online za darmo w 3 krokach", excerpt: "Zamien filmy MP4 w transkrypcje, napisy i notatki.", coverAlt: "MP4 na tekst", category: "MP4", readTime: "5 min"},
    "mp3-to-srt-online-free": {title: "Jak przekonwertowac MP3 na SRT online za darmo", excerpt: "Tworz napisy SRT z MP3 bez instalowania programu desktopowego.", coverAlt: "MP3 na SRT", category: "MP3", readTime: "5 min"}
  },
  hu: {
    "compress-large-audio-to-mp3-vlc-guide": {title: "Nagy hangfajlok tomoritese MP3-ba VLC-vel", excerpt: "Hosszu felveteleket alakits stabilabban feltoltheto MP3 fajlka.", coverAlt: "Hang tomoritese MP3-ba VLC-vel", category: "Audio", readTime: "6 perc"},
    "giving-voice-to-final-stories-hospice-volunteer-journey": {title: "Hangot adni az utolso torteneteknek: hospice onkentes utja", excerpt: "Tortenet hangok, emlekek es utolso beszelgetesek megorzeserol.", coverAlt: "Hangot adni az utolso torteneteknek", category: "Tortenetek", readTime: "7 perc"},
    "extract-audio-from-video-vlc-guide": {title: "Hang kinyerese videobol VLC-vel", excerpt: "Transzkripcio elott nyerd ki a hangot a videofajlbol.", coverAlt: "Hang kinyerese videobol VLC-vel", category: "Video", readTime: "6 perc"},
    "five-free-wav-to-text-converters": {title: "WAV szovegge alakito: 5 ingyenes online eszkoz", excerpt: "Ingyenes online eszkozok WAV hang szovegge alakitasahoz.", coverAlt: "WAV szovegge alakito", category: "Audio szovegge", readTime: "6 perc"},
    "audio-to-srt-online-free-guide": {title: "Hang konvertalasa SRT feliratta ingyen online", excerpt: "Keszits SRT fajlt hangfelvetelbol egyszeru online folyamattal.", coverAlt: "Hang SRT feliratta", category: "Felirat", readTime: "5 perc"},
    "three-best-ways-to-convert-video-to-text": {title: "A video szovegge alakitasanak 3 legjobb modja", excerpt: "Hasonlitsd ossze a feltoltest, nyilvanos linket es hangkinyerest.", coverAlt: "Video szovegge", category: "Video", readTime: "6 perc"},
    "mp4-to-text-online-free": {title: "MP4 szovegge alakitasa ingyen online 3 lepesben", excerpt: "Alakits MP4 videokat atiratokka, feliratokka es jegyzetekke.", coverAlt: "MP4 szovegge", category: "MP4", readTime: "5 perc"},
    "mp3-to-srt-online-free": {title: "MP3 konvertalasa SRT-re ingyen online", excerpt: "Keszits SRT feliratot MP3 hangbol asztali program nelkul.", coverAlt: "MP3 SRT-re", category: "MP3", readTime: "5 perc"}
  }
};

const localizedBlogContentCopy: Record<string, BlogArticleContentCopy> = {
  ar: {
    overviewHeading: "لماذا يهم هذا الموضوع",
    workflowHeading: "سير العمل الموصى به",
    nextHeading: "ما الخطوة التالية",
    overview: (post) => [`${post.title} يشرح طريقة عملية للتعامل مع ${post.category} بدون تعقيد زائد.`, post.excerpt],
    workflow: () => ["ابدأ بملف واضح، وتحقق من اللغة المنطوقة، ثم اختر إعدادات تحافظ على وضوح الكلام قبل الرفع.", "بعد إنشاء النص، راجع الأسماء والمصطلحات والتوقيتات حتى تصبح النتيجة جاهزة للاستخدام."],
    next: () => ["استخدم Votxt لإنتاج النص والملخصات والترجمات وروابط المشاركة، ثم صدّر النتيجة بالتنسيق المناسب لفريقك."]
  },
  de: {
    overviewHeading: "Warum dieses Thema wichtig ist",
    workflowHeading: "Empfohlener Ablauf",
    nextHeading: "Nächster Schritt",
    overview: (post) => `${post.title} zeigt einen praktischen Weg fur ${post.category}, ohne den Workflow unnotig kompliziert zu machen.`.split("\n").concat(post.excerpt),
    workflow: () => ["Beginne mit einer klaren Datei, prufe die gesprochene Sprache und wahle Einstellungen, die Sprache vor dem Upload verstandlich halten.", "Nach der Transkription solltest du Namen, Fachbegriffe und Zeitmarken kurz prufen, damit das Ergebnis direkt nutzbar ist."],
    next: () => ["Mit Votxt kannst du Transkript, Zusammenfassung, Ubersetzung, Exporte und private Freigabelinks an einem Ort erstellen."]
  },
  es: {
    overviewHeading: "Por qué importa",
    workflowHeading: "Flujo recomendado",
    nextHeading: "Qué hacer después",
    overview: (post) => [`${post.title} explica una forma práctica de trabajar con ${post.category} sin complicar el proceso.`, post.excerpt],
    workflow: () => ["Empieza con un archivo claro, confirma el idioma hablado y elige ajustes que mantengan la voz entendible antes de subirlo.", "Después de generar la transcripción, revisa nombres, términos y marcas de tiempo para dejar el resultado listo."],
    next: () => ["Usa Votxt para crear transcripciones, resúmenes, traducciones, exportaciones y enlaces privados para compartir."]
  },
  fr: {
    overviewHeading: "Pourquoi c'est important",
    workflowHeading: "Flux recommandé",
    nextHeading: "Étape suivante",
    overview: (post) => [`${post.title} présente une méthode pratique pour gérer ${post.category} sans alourdir le workflow.`, post.excerpt],
    workflow: () => ["Commencez avec un fichier clair, vérifiez la langue parlée et choisissez des réglages qui gardent la voix intelligible avant l'import.", "Après la transcription, relisez les noms, les termes importants et les horodatages pour obtenir un résultat prêt à partager."],
    next: () => ["Avec Votxt, créez le texte, les résumés, les traductions, les exports et les liens de partage privés au même endroit."]
  },
  hu: {
    overviewHeading: "Miért fontos ez",
    workflowHeading: "Ajánlott folyamat",
    nextHeading: "Következő lépés",
    overview: (post) => [`A(z) ${post.title} gyakorlati utat mutat a(z) ${post.category} témában, felesleges bonyolítás nélkül.`, post.excerpt],
    workflow: () => ["Kezdj tiszta fájllal, ellenőrizd a beszélt nyelvet, és válassz olyan beállítást, amely feltöltés előtt megőrzi a beszéd érthetőségét.", "Az átirat után nézd át a neveket, szakkifejezéseket és időbélyegeket, hogy a szöveg rögtön használható legyen."],
    next: () => ["A Votxt-ben egy helyen készíthetsz átiratot, összefoglalót, fordítást, exportot és privát megosztási linket."]
  },
  id: {
    overviewHeading: "Mengapa ini penting",
    workflowHeading: "Alur yang disarankan",
    nextHeading: "Langkah berikutnya",
    overview: (post) => [`${post.title} menjelaskan cara praktis menangani ${post.category} tanpa membuat alur kerja menjadi rumit.`, post.excerpt],
    workflow: () => ["Mulai dari file yang jelas, pastikan bahasa yang diucapkan, lalu pilih pengaturan yang menjaga suara tetap mudah dipahami sebelum unggahan.", "Setelah transkripsi dibuat, tinjau nama, istilah penting, dan penanda waktu agar hasilnya siap dipakai."],
    next: () => ["Gunakan Votxt untuk membuat transkrip, ringkasan, terjemahan, ekspor, dan tautan berbagi privat dalam satu tempat."]
  },
  it: {
    overviewHeading: "Perché è importante",
    workflowHeading: "Flusso consigliato",
    nextHeading: "Passaggio successivo",
    overview: (post) => [`${post.title} mostra un modo pratico per gestire ${post.category} senza complicare il flusso di lavoro.`, post.excerpt],
    workflow: () => ["Parti da un file chiaro, controlla la lingua parlata e scegli impostazioni che mantengano la voce comprensibile prima del caricamento.", "Dopo la trascrizione, rivedi nomi, termini e timestamp per rendere il risultato pronto all'uso."],
    next: () => ["Con Votxt puoi creare trascrizioni, riepiloghi, traduzioni, esportazioni e link privati di condivisione in un unico posto."]
  },
  ja: {
    overviewHeading: "なぜ重要か",
    workflowHeading: "おすすめの進め方",
    nextHeading: "次のステップ",
    overview: (post) => [`${post.title} は、${post.category} を扱うための実用的な手順をわかりやすくまとめています。`, post.excerpt],
    workflow: () => ["まず聞き取りやすいファイルを用意し、話されている言語を確認して、アップロード前に音声の明瞭さを保つ設定を選びます。", "文字起こし後は、名前、専門用語、タイムスタンプを確認し、共有や編集に使いやすい状態に整えます。"],
    next: () => ["Votxt では、文字起こし、要約、翻訳、エクスポート、非公開共有リンクを一つの画面で作成できます。"]
  },
  ko: {
    overviewHeading: "왜 중요한가",
    workflowHeading: "추천 작업 흐름",
    nextHeading: "다음 단계",
    overview: (post) => [`${post.title} 문서는 ${post.category} 작업을 복잡하지 않게 처리하는 실용적인 방법을 설명합니다.`, post.excerpt],
    workflow: () => ["먼저 음성이 또렷한 파일을 준비하고, 말한 언어를 확인한 뒤 업로드 전에 말소리가 잘 유지되는 설정을 선택하세요.", "전사가 끝나면 이름, 전문 용어, 타임스탬프를 확인해 바로 사용할 수 있는 결과로 다듬습니다."],
    next: () => ["Votxt에서 전사문, 요약, 번역, 내보내기, 비공개 공유 링크를 한곳에서 만들 수 있습니다."]
  },
  nl: {
    overviewHeading: "Waarom dit belangrijk is",
    workflowHeading: "Aanbevolen workflow",
    nextHeading: "Volgende stap",
    overview: (post) => [`${post.title} laat een praktische manier zien om met ${post.category} te werken zonder het proces onnodig ingewikkeld te maken.`, post.excerpt],
    workflow: () => ["Begin met een duidelijke opname, controleer de gesproken taal en kies instellingen die spraak goed verstaanbaar houden voor het uploaden.", "Controleer na de transcriptie namen, termen en tijdstempels zodat het resultaat klaar is om te delen of te bewerken."],
    next: () => ["Met Votxt maak je transcripties, samenvattingen, vertalingen, exports en prive-deellinks vanuit een werkruimte."]
  },
  pl: {
    overviewHeading: "Dlaczego to ważne",
    workflowHeading: "Zalecany proces",
    nextHeading: "Następny krok",
    overview: (post) => [`${post.title} pokazuje praktyczny sposób pracy z tematem ${post.category} bez niepotrzebnego komplikowania procesu.`, post.excerpt],
    workflow: () => ["Zacznij od czytelnego pliku, sprawdź język wypowiedzi i wybierz ustawienia, które zachowują zrozumiałość mowy przed przesłaniem.", "Po transkrypcji przejrzyj nazwy, terminy i znaczniki czasu, aby wynik był gotowy do użycia."],
    next: () => ["W Votxt przygotujesz transkrypcję, podsumowania, tłumaczenia, eksporty i prywatne linki udostępniania w jednym miejscu."]
  },
  pt: {
    overviewHeading: "Por que isso importa",
    workflowHeading: "Fluxo recomendado",
    nextHeading: "Próximo passo",
    overview: (post) => [`${post.title} mostra uma forma prática de lidar com ${post.category} sem complicar o fluxo de trabalho.`, post.excerpt],
    workflow: () => ["Comece com um arquivo claro, confirme o idioma falado e escolha configurações que preservem a voz antes do upload.", "Depois da transcrição, revise nomes, termos e marcações de tempo para deixar o resultado pronto para uso."],
    next: () => ["Use o Votxt para criar transcrições, resumos, traduções, exportações e links privados de compartilhamento em um só lugar."]
  },
  ru: {
    overviewHeading: "Почему это важно",
    workflowHeading: "Рекомендуемый процесс",
    nextHeading: "Следующий шаг",
    overview: (post) => [`${post.title} показывает практичный способ работать с темой «${post.category}» без лишнего усложнения.`, post.excerpt],
    workflow: () => ["Начните с понятного файла, проверьте язык речи и выберите настройки, которые сохраняют разборчивость голоса перед загрузкой.", "После транскрибации проверьте имена, термины и временные метки, чтобы результат был готов к использованию."],
    next: () => ["В Votxt можно создать транскрипт, резюме, перевод, экспорт и приватную ссылку для просмотра в одном месте."]
  },
  th: {
    overviewHeading: "เหตุผลที่สำคัญ",
    workflowHeading: "ขั้นตอนที่แนะนำ",
    nextHeading: "ขั้นตอนถัดไป",
    overview: (post) => [`${post.title} อธิบายวิธีจัดการ ${post.category} อย่างเป็นขั้นตอนโดยไม่ทำให้เวิร์กโฟลว์ซับซ้อนเกินไป`, post.excerpt],
    workflow: () => ["เริ่มจากไฟล์ที่เสียงชัด ตรวจสอบภาษาที่พูด แล้วเลือกการตั้งค่าที่ช่วยให้เสียงพูดยังคงเข้าใจง่ายก่อนอัปโหลด", "หลังถอดเสียง ให้ตรวจชื่อ คำเฉพาะ และเวลา เพื่อให้ผลลัพธ์พร้อมนำไปใช้หรือแชร์ต่อ"],
    next: () => ["ใช้ Votxt เพื่อสร้างข้อความถอดเสียง สรุป คำแปล ไฟล์ส่งออก และลิงก์แชร์แบบส่วนตัวได้ในที่เดียว"]
  },
  tr: {
    overviewHeading: "Neden önemli",
    workflowHeading: "Önerilen akış",
    nextHeading: "Sonraki adım",
    overview: (post) => [`${post.title}, ${post.category} konusunda pratik ve sade bir çalışma yolu sunar.`, post.excerpt],
    workflow: () => ["Net bir dosyayla başlayın, konuşulan dili doğrulayın ve yüklemeden önce konuşmanın anlaşılır kalmasını sağlayan ayarları seçin.", "Transkripsiyondan sonra adları, terimleri ve zaman damgalarını gözden geçirerek sonucu kullanıma hazır hale getirin."],
    next: () => ["Votxt ile transkript, özet, çeviri, dışa aktarma ve özel paylaşım bağlantılarını tek yerde oluşturabilirsiniz."]
  },
  uk: {
    overviewHeading: "Чому це важливо",
    workflowHeading: "Рекомендований процес",
    nextHeading: "Наступний крок",
    overview: (post) => [`${post.title} показує практичний спосіб працювати з темою «${post.category}» без зайвого ускладнення.`, post.excerpt],
    workflow: () => ["Почніть із чіткого файлу, перевірте мову мовлення й оберіть налаштування, які зберігають розбірливість голосу перед завантаженням.", "Після транскрипції перегляньте імена, терміни й часові позначки, щоб результат був готовий до використання."],
    next: () => ["У Votxt можна створити транскрипт, підсумок, переклад, експорт і приватне посилання для перегляду в одному місці."]
  },
  vi: {
    overviewHeading: "Vì sao điều này quan trọng",
    workflowHeading: "Quy trình gợi ý",
    nextHeading: "Bước tiếp theo",
    overview: (post) => [`${post.title} trình bày cách xử lý ${post.category} theo hướng thực tế mà không làm quy trình trở nên phức tạp.`, post.excerpt],
    workflow: () => ["Bắt đầu với tệp âm thanh rõ, kiểm tra ngôn ngữ được nói và chọn thiết lập giúp giọng nói vẫn dễ hiểu trước khi tải lên.", "Sau khi có bản chép lời, hãy rà soát tên riêng, thuật ngữ và mốc thời gian để kết quả sẵn sàng sử dụng."],
    next: () => ["Dùng Votxt để tạo bản chép lời, tóm tắt, bản dịch, tệp xuất và liên kết chia sẻ riêng tư trong cùng một nơi."]
  },
  zh: {
    overviewHeading: "为什么这很重要",
    workflowHeading: "推荐流程",
    nextHeading: "下一步",
    overview: (post) => [`《${post.title}》提供了一套处理「${post.category}」场景的实用方法，不需要把流程变复杂。`, post.excerpt],
    workflow: () => ["先准备清晰的文件，确认实际说话语言，再选择能保留语音清晰度的上传前设置。", "生成转写后，检查人名、专有名词和时间戳，让结果可以直接用于编辑、字幕或分享。"],
    next: () => ["你可以在 Votxt 中继续生成转写、摘要、翻译、导出文件和私密分享链接。"]
  },
  "zh-TW": {
    overviewHeading: "為什麼這很重要",
    workflowHeading: "建議流程",
    nextHeading: "下一步",
    overview: (post) => [`《${post.title}》提供一套處理「${post.category}」情境的實用方法，不需要把流程變複雜。`, post.excerpt],
    workflow: () => ["先準備清晰的檔案，確認實際說話語言，再選擇能保留語音清晰度的上傳前設定。", "產生轉寫後，檢查人名、專有名詞和時間戳，讓結果可以直接用於編輯、字幕或分享。"],
    next: () => ["你可以在 Votxt 中繼續產生轉寫、摘要、翻譯、匯出檔案和私密分享連結。"]
  }
};

function getLocalizedContentCopy(locale: string) {
  return localizedBlogContentCopy[locale] ?? localizedBlogContentCopy[locale.toLowerCase().split("-")[0]];
}

function createLocalizedBlogSections(locale: string, post: BlogPost): BlogPost["sections"] | undefined {
  const copy = getLocalizedContentCopy(locale);
  if (!copy) return undefined;

  return [
    {heading: copy.overviewHeading, body: copy.overview(post)},
    {heading: copy.workflowHeading, body: copy.workflow(post)},
    {heading: copy.nextHeading, body: copy.next(post)}
  ];
}

function applyLocalizedBlogMeta(locale: string, post: BlogPost): BlogPost {
  const meta = localizedBlogMeta[locale]?.[post.slug] ?? localizedBlogMeta[locale.toLowerCase().split("-")[0]]?.[post.slug];
  const localizedPost = meta ? {...post, ...meta} : post;
  const sections = createLocalizedBlogSections(locale, localizedPost);
  return sections ? {...localizedPost, content: undefined, sections} : localizedPost;
}


export function getBlogPosts(locale: string): BlogPost[] {
  return enPosts.map((post) => applyLocalizedBlogMeta(locale, post));
}

export function getBlogPost(locale: string, slug: string) {
  const posts = getBlogPosts(locale);
  return posts.find((post) => post.slug === slug) ?? null;
}

export function getAllBlogSlugs() {
  return enPosts.map((post) => post.slug);
}

const compactBlogSeoTitles: Partial<Record<string, Record<string, string>>> = {
  zh: {
    "compress-large-audio-to-mp3-vlc-guide": "VLC 压缩音频为 MP3 指南",
    "giving-voice-to-final-stories-hospice-volunteer-journey": "临终故事与声音保存志愿者旅程",
    "extract-audio-from-video-vlc-guide": "VLC 从视频提取音频教程",
    "five-free-wav-to-text-converters": "5 款免费 WAV 转文字工具",
    "audio-to-srt-online-free-guide": "免费在线音频转 SRT 字幕",
    "three-best-ways-to-convert-video-to-text": "视频转文字的 3 种最佳方法",
    "mp4-to-text-online-free": "免费在线 MP4 转文字教程",
    "mp3-to-srt-online-free": "免费在线 MP3 转 SRT 教程"
  },
  "zh-TW": {
    "compress-large-audio-to-mp3-vlc-guide": "VLC 壓縮音訊為 MP3 指南",
    "giving-voice-to-final-stories-hospice-volunteer-journey": "臨終故事與聲音保存志工旅程",
    "extract-audio-from-video-vlc-guide": "VLC 從影片擷取音訊教學",
    "five-free-wav-to-text-converters": "5 款免費 WAV 轉文字工具",
    "audio-to-srt-online-free-guide": "免費線上音訊轉 SRT 字幕",
    "three-best-ways-to-convert-video-to-text": "影片轉文字的 3 種最佳方法",
    "mp4-to-text-online-free": "免費線上 MP4 轉文字教學",
    "mp3-to-srt-online-free": "免費線上 MP3 轉 SRT 教學"
  }
};

export function getBlogSeoTitle(locale: string, slug: string, fallback: string) {
  return compactBlogSeoTitles[locale]?.[slug] ?? fallback;
}
