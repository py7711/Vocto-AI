type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  coverAlt: string;
  date: string;
  category: string;
  readTime: string;
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
    coverAlt: "Audio compression workspace illustration with waveform, file size bars, and MP3 export card.",
    date: "2026-03-05",
    category: "Audio tools",
    readTime: "6 min",
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
        heading: "Where UniScribe fits",
        body: [
          "After upload, UniScribe queues the task and falls back across Groq, Deepgram, and AssemblyAI depending on speaker-label requirements.",
          "Once complete, you can generate summaries, Q&A, translations, exports, and read-only share links."
        ]
      }
    ]
  },
  {
    slug: "giving-voice-to-final-stories-hospice-volunteer-journey",
    title: "Giving Voice to Final Stories: A Volunteer’s Journey with Hospice Work",
    excerpt: "A reflective story about preserving voices, memories, and final conversations.",
    coverImage: "/blog/giving-voice-to-final-stories-hospice-volunteer-journey/cover.png",
    coverAlt: "Warm voice archive illustration with conversation notes, memory cards, and a gentle audio waveform.",
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
    coverImage: "/blog/extract-audio-from-video-vlc-guide/cover.png",
    coverAlt: "Video-to-audio extraction illustration with a video frame, waveform track, and exported audio file.",
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
          "Once VLC creates the audio file, upload it to UniScribe and choose the spoken language or auto-detect.",
          "You can then generate summaries, subtitles, translations, and exports from the transcript."
        ]
      }
    ]
  },
  {
    slug: "five-free-wav-to-text-converters",
    title: "WAV to Text Converter: 5 Free Online Tools Reviewed",
    excerpt: "A practical review of free online tools for converting WAV audio into text.",
    coverImage: "/blog/five-free-wav-to-text-converters/cover.png",
    coverAlt: "WAV to text comparison illustration with audio waveforms and ranked transcript tool cards.",
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
          "UniScribe keeps the transcript editable so you can clean up proper nouns before exporting."
        ]
      }
    ]
  },
  {
    slug: "audio-to-srt-online-free-guide",
    title: "How to Convert Audio to SRT Subtitles Online for Free",
    excerpt: "Create SRT subtitle files from audio recordings with a simple online workflow.",
    coverImage: "/blog/audio-to-srt-online-free-guide/cover.png",
    coverAlt: "Audio to SRT subtitle illustration with timed caption blocks under a waveform timeline.",
    date: "2025-02-20",
    category: "Subtitles",
    readTime: "5 min",
    sections: [
      {heading: "Start with clear audio", body: ["Upload a clear recording and choose the right language before transcription.", "Cleaner audio produces better timing, punctuation, and subtitle segmentation."]},
      {heading: "Generate the transcript", body: ["UniScribe turns the recording into editable text with timestamps.", "Review the text before exporting subtitles so names and terms are correct."]},
      {heading: "Export SRT", body: ["Choose SRT for video editors and most subtitle platforms.", "VTT, TXT, PDF, and other formats are available when you need alternatives."]}
    ]
  },
  {
    slug: "three-best-ways-to-convert-video-to-text",
    title: "3 Best Ways to Convert Videos to Text",
    excerpt: "Compare upload, public-link transcription, and audio extraction workflows.",
    coverImage: "/blog/three-best-ways-to-convert-video-to-text/cover.png",
    coverAlt: "Three video transcription workflow paths showing upload, link import, and audio extraction.",
    date: "2024-12-20",
    category: "Video",
    readTime: "6 min",
    sections: [
      {heading: "Upload the video file", body: ["Direct upload is best when you already have the video on your device.", "UniScribe supports common video formats and exports captions or documents after transcription."]},
      {heading: "Paste a public link", body: ["For public videos, a link workflow avoids manual downloads.", "The transcript can be edited, summarized, translated, and shared."]},
      {heading: "Extract audio first", body: ["Extracting audio can reduce file size before upload.", "This is useful for long videos when the speech track is all you need."]}
    ]
  },
  {
    slug: "mp4-to-text-online-free",
    title: "Convert MP4 to Text Online for Free in Just 3 Steps",
    excerpt: "Turn MP4 videos into readable transcripts, subtitles, and reusable notes.",
    coverImage: "/blog/mp4-to-text-online-free/cover.svg",
    coverAlt: "MP4 to text illustration with a video tile transforming into transcript and subtitle panels.",
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
    coverImage: "/blog/mp3-to-srt-online-free/cover.svg",
    coverAlt: "MP3 to SRT illustration with an audio file, waveform, and timestamped subtitle export.",
    date: "2024-12-16",
    category: "MP3",
    readTime: "5 min",
    sections: [
      {heading: "Upload MP3", body: ["Start with a clear MP3 recording and select the spoken language.", "UniScribe processes the audio and generates timestamped text."]},
      {heading: "Edit timing and text", body: ["Review punctuation, names, and any specialized terms.", "Clean text makes subtitle exports easier to use downstream."]},
      {heading: "Download SRT", body: ["Export SRT for editors, courses, and video platforms.", "You can also download VTT, TXT, PDF, DOCX, and CSV."]}
    ]
  }
];


export function getBlogPosts(_locale: string): BlogPost[] {
  return enPosts;
}

export function getBlogPost(locale: string, slug: string) {
  const posts = getBlogPosts(locale);
  return posts.find((post) => post.slug === slug) ?? null;
}

export function getAllBlogSlugs() {
  return enPosts.map((post) => post.slug);
}
