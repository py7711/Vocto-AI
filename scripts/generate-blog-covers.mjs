import {access, mkdir, writeFile} from "node:fs/promises";
import path from "node:path";

// 生成博客封面 SVG。脚本只写入 public/blog/<slug>/cover.svg，
// 已存在人工压缩或编辑过的 cover.png 时会跳过，避免生成未引用的重复封面。
const covers = [
  {
    slug: "compress-large-audio-to-mp3-vlc-guide",
    title: "Compress Audio",
    tag: "MP3",
    accent: "#6366f1",
    secondary: "#00b87a",
    icon: "bars"
  },
  {
    slug: "giving-voice-to-final-stories-hospice-volunteer-journey",
    title: "Final Stories",
    tag: "Voice",
    accent: "#7c3aed",
    secondary: "#f59e0b",
    icon: "voice"
  },
  {
    slug: "extract-audio-from-video-vlc-guide",
    title: "Extract Audio",
    tag: "VLC",
    accent: "#2563eb",
    secondary: "#00b87a",
    icon: "video"
  },
  {
    slug: "five-free-wav-to-text-converters",
    title: "WAV to Text",
    tag: "Review",
    accent: "#6366f1",
    secondary: "#14b8a6",
    icon: "rank"
  },
  {
    slug: "audio-to-srt-online-free-guide",
    title: "Audio to SRT",
    tag: "Subtitles",
    accent: "#7c3aed",
    secondary: "#06b6d4",
    icon: "captions"
  },
  {
    slug: "three-best-ways-to-convert-video-to-text",
    title: "Video to Text",
    tag: "3 ways",
    accent: "#4f46e5",
    secondary: "#10b981",
    icon: "flow"
  },
  {
    slug: "mp4-to-text-online-free",
    title: "MP4 to Text",
    tag: "3 steps",
    accent: "#6366f1",
    secondary: "#0ea5e9",
    icon: "mp4"
  },
  {
    slug: "mp3-to-srt-online-free",
    title: "MP3 to SRT",
    tag: "Guide",
    accent: "#7c3aed",
    secondary: "#00b87a",
    icon: "srt"
  }
];

function waveform({x = 118, y = 254, color = "#6366f1"} = {}) {
  const heights = [30, 62, 42, 88, 54, 108, 70, 44, 82, 58, 34, 66, 96, 48, 76, 38];
  return heights
    .map((height, index) => {
      const barX = x + index * 24;
      const barY = y - height / 2;
      return `<rect x="${barX}" y="${barY}" width="10" height="${height}" rx="5" fill="${color}" opacity="${index % 3 === 0 ? "0.95" : "0.55"}"/>`;
    })
    .join("");
}

function iconMarkup(icon, accent, secondary) {
  if (icon === "video" || icon === "mp4") {
    return `
      <rect x="570" y="150" width="250" height="154" rx="24" fill="#fff" stroke="${accent}" stroke-width="8"/>
      <path d="M670 190l82 38-82 38z" fill="${accent}" opacity="0.9"/>
      <rect x="606" y="334" width="182" height="24" rx="12" fill="${secondary}" opacity="0.75"/>
      <rect x="570" y="384" width="250" height="78" rx="22" fill="#fff" stroke="#dbe3f1" stroke-width="4"/>
      <path d="M612 424h132" stroke="${accent}" stroke-width="12" stroke-linecap="round"/>
    `;
  }

  if (icon === "captions" || icon === "srt") {
    return `
      <rect x="558" y="138" width="282" height="198" rx="26" fill="#fff" stroke="${accent}" stroke-width="7"/>
      <rect x="602" y="188" width="118" height="18" rx="9" fill="${accent}" opacity="0.9"/>
      <rect x="602" y="224" width="190" height="18" rx="9" fill="#94a3b8" opacity="0.75"/>
      <rect x="602" y="260" width="158" height="18" rx="9" fill="#94a3b8" opacity="0.75"/>
      <rect x="594" y="378" width="226" height="54" rx="16" fill="${secondary}" opacity="0.18"/>
      <text x="626" y="413" fill="${accent}" font-family="Arial, sans-serif" font-size="26" font-weight="800">00:12 SRT</text>
    `;
  }

  if (icon === "flow" || icon === "rank") {
    return `
      <circle cx="604" cy="230" r="48" fill="#fff" stroke="${accent}" stroke-width="7"/>
      <circle cx="718" cy="230" r="48" fill="#fff" stroke="${secondary}" stroke-width="7"/>
      <circle cx="832" cy="230" r="48" fill="#fff" stroke="${accent}" stroke-width="7" opacity="0.8"/>
      <path d="M650 230h22M764 230h22" stroke="#94a3b8" stroke-width="9" stroke-linecap="round"/>
      <text x="591" y="240" fill="${accent}" font-family="Arial, sans-serif" font-size="31" font-weight="900">1</text>
      <text x="705" y="240" fill="${secondary}" font-family="Arial, sans-serif" font-size="31" font-weight="900">2</text>
      <text x="819" y="240" fill="${accent}" font-family="Arial, sans-serif" font-size="31" font-weight="900">3</text>
      <rect x="590" y="342" width="244" height="82" rx="24" fill="#fff" stroke="#dbe3f1" stroke-width="4"/>
      <path d="M628 383h166" stroke="${accent}" stroke-width="12" stroke-linecap="round"/>
    `;
  }

  if (icon === "voice") {
    return `
      <rect x="600" y="128" width="190" height="238" rx="32" fill="#fff" stroke="${accent}" stroke-width="7"/>
      <path d="M650 190h92M650 232h70M650 274h102" stroke="#94a3b8" stroke-width="13" stroke-linecap="round"/>
      <path d="M636 410c44-34 84-34 128 0" fill="none" stroke="${secondary}" stroke-width="11" stroke-linecap="round"/>
      <circle cx="608" cy="410" r="14" fill="${secondary}"/>
      <circle cx="792" cy="410" r="14" fill="${secondary}"/>
    `;
  }

  return `
    <rect x="604" y="128" width="178" height="226" rx="30" fill="#fff" stroke="${accent}" stroke-width="7"/>
    <path d="M648 184h88M648 228h66M648 272h104" stroke="#94a3b8" stroke-width="13" stroke-linecap="round"/>
    <rect x="588" y="386" width="222" height="58" rx="18" fill="#fff" stroke="#dbe3f1" stroke-width="4"/>
    <path d="M626 415h146" stroke="${secondary}" stroke-width="13" stroke-linecap="round"/>
  `;
}

function svgFor(cover) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750" role="img" aria-labelledby="title desc">
  <title id="title">${cover.title}</title>
  <desc id="desc">Votxt 博客封面：${cover.title}</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f1f0ff"/>
      <stop offset="48%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#e8fbf5"/>
    </linearGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.96"/>
      <stop offset="100%" stop-color="#f8fafc" stop-opacity="0.88"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="22" stdDeviation="22" flood-color="#475569" flood-opacity="0.16"/>
    </filter>
  </defs>
  <rect width="1200" height="750" fill="url(#bg)"/>
  <circle cx="1036" cy="92" r="142" fill="${cover.secondary}" opacity="0.11"/>
  <circle cx="166" cy="642" r="184" fill="${cover.accent}" opacity="0.09"/>
  <path d="M0 558c172-58 274-58 446 0s284 58 456 0 212-58 298 0v192H0z" fill="#ffffff" opacity="0.5"/>
  <g filter="url(#shadow)">
    <rect x="78" y="88" width="1044" height="574" rx="44" fill="url(#panel)" stroke="#dbe3f1" stroke-width="3"/>
  </g>
  <rect x="122" y="132" width="164" height="44" rx="22" fill="${cover.accent}" opacity="0.12"/>
  <text x="150" y="162" fill="${cover.accent}" font-family="Arial, sans-serif" font-size="22" font-weight="800">${cover.tag}</text>
  <text x="122" y="252" fill="#111827" font-family="Arial, sans-serif" font-size="64" font-weight="900" letter-spacing="-1">${cover.title}</text>
  <text x="126" y="309" fill="#64748b" font-family="Arial, sans-serif" font-size="26" font-weight="700">Transcription workflow guide</text>
  ${waveform({color: cover.accent})}
  ${iconMarkup(cover.icon, cover.accent, cover.secondary)}
  <rect x="122" y="492" width="328" height="72" rx="24" fill="#fff" stroke="#dbe3f1" stroke-width="3"/>
  <circle cx="164" cy="528" r="18" fill="${cover.secondary}" opacity="0.88"/>
  <path d="M206 528h188" stroke="#94a3b8" stroke-width="12" stroke-linecap="round"/>
  <rect x="122" y="590" width="184" height="22" rx="11" fill="${cover.accent}" opacity="0.16"/>
</svg>
`;
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

let generated = 0;
let skipped = 0;

for (const cover of covers) {
  const dir = path.join(process.cwd(), "public", "blog", cover.slug);
  if (await exists(path.join(dir, "cover.png"))) {
    skipped += 1;
    continue;
  }

  await mkdir(dir, {recursive: true});
  await writeFile(path.join(dir, "cover.svg"), svgFor(cover), "utf8");
  generated += 1;
}

console.log(`已生成 ${generated} 张博客 SVG 封面，跳过 ${skipped} 张已有 PNG 封面。`);
