"use client";

import {useRef, useState} from "react";
import {Download, FileAudio, FileUp, Loader2, ShieldCheck, X} from "lucide-react";
import lamejs from "lamejs";

type UtilityKind = "wav-to-mp3-converter" | "video-to-audio-extractor";

type UtilityToolWidgetProps = {
  kind: UtilityKind;
  accept?: string;
  selectLabel?: string;
  actionLabel?: string;
};

type ResultFile = {
  name: string;
  url: string;
  mimeType: string;
  size: number;
};

function readableSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function stem(name: string) {
  return name.replace(/\.[^.]+$/, "") || "uniscribe-export";
}

function toInt16Samples(channel: Float32Array) {
  const samples = new Int16Array(channel.length);
  for (let index = 0; index < channel.length; index += 1) {
    const value = Math.max(-1, Math.min(1, channel[index] ?? 0));
    samples[index] = value < 0 ? value * 0x8000 : value * 0x7fff;
  }
  return samples;
}

function downmixAndResample(audioBuffer: AudioBuffer, targetRate = 16000) {
  const ratio = audioBuffer.sampleRate / targetRate;
  const length = Math.max(1, Math.floor(audioBuffer.duration * targetRate));
  const output = new Float32Array(length);

  for (let channelIndex = 0; channelIndex < audioBuffer.numberOfChannels; channelIndex += 1) {
    const channel = audioBuffer.getChannelData(channelIndex);
    for (let index = 0; index < length; index += 1) {
      const sourceIndex = Math.min(channel.length - 1, Math.floor(index * ratio));
      output[index] += (channel[sourceIndex] ?? 0) / audioBuffer.numberOfChannels;
    }
  }

  return {samples: toInt16Samples(output), sampleRate: targetRate};
}

function encodeMp3(samples: Int16Array, sampleRate: number) {
  const encoder = new lamejs.Mp3Encoder(1, sampleRate, 64);
  const chunks: ArrayBuffer[] = [];
  const blockSize = 1152;
  const toArrayBuffer = (chunk: Int8Array) => {
    const buffer = new ArrayBuffer(chunk.length);
    new Uint8Array(buffer).set(chunk);
    return buffer;
  };

  for (let offset = 0; offset < samples.length; offset += blockSize) {
    const encoded = encoder.encodeBuffer(samples.subarray(offset, offset + blockSize));
    if (encoded.length) chunks.push(toArrayBuffer(encoded));
  }

  const tail = encoder.flush();
  if (tail.length) chunks.push(toArrayBuffer(tail));
  return new Blob(chunks, {type: "audio/mpeg"});
}

async function convertWavToMp3(file: File) {
  if (!file.name.toLowerCase().endsWith(".wav") && file.type !== "audio/wav" && file.type !== "audio/x-wav") {
    throw new Error("请选择 WAV 文件。");
  }

  const audioContext = new AudioContext();
  try {
    const audioBuffer = await audioContext.decodeAudioData(await file.arrayBuffer());
    const compact = downmixAndResample(audioBuffer);
    const blob = encodeMp3(compact.samples, compact.sampleRate);
    return {
      name: `${stem(file.name)}-speech.mp3`,
      url: URL.createObjectURL(blob),
      mimeType: blob.type,
      size: blob.size
    };
  } finally {
    await audioContext.close().catch(() => undefined);
  }
}

async function extractAudioFromVideo(file: File) {
  if (!file.type.startsWith("video/")) {
    throw new Error("请选择视频文件。");
  }

  const sourceUrl = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.src = sourceUrl;
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("浏览器无法解码这个视频格式。"));
    });

    const captureStream = (video as HTMLVideoElement & {captureStream?: () => MediaStream; mozCaptureStream?: () => MediaStream}).captureStream
      ?? (video as HTMLVideoElement & {mozCaptureStream?: () => MediaStream}).mozCaptureStream;
    if (!captureStream) throw new Error("当前浏览器不支持本地提取视频音频。");

    const stream = captureStream.call(video);
    const audioTracks = stream.getAudioTracks();
    if (!audioTracks.length) throw new Error("这个视频中没有找到音轨。");
    const audioStream = new MediaStream(audioTracks);
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
    const recorder = new MediaRecorder(audioStream, {mimeType});
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size) chunks.push(event.data);
    };

    const stopped = new Promise<void>((resolve, reject) => {
      recorder.onstop = () => resolve();
      recorder.onerror = () => reject(new Error("音频提取失败。"));
    });

    recorder.start();
    await video.play();
    await new Promise<void>((resolve) => {
      video.onended = () => resolve();
    });
    if (recorder.state !== "inactive") recorder.stop();
    await stopped;
    audioTracks.forEach((track) => track.stop());

    const blob = new Blob(chunks, {type: mimeType});
    return {
      name: `${stem(file.name)}.webm`,
      url: URL.createObjectURL(blob),
      mimeType: "audio/webm",
      size: blob.size
    };
  } finally {
    video.pause();
    URL.revokeObjectURL(sourceUrl);
  }
}

export function UtilityToolWidget({kind, accept, selectLabel = "选择文件", actionLabel = "转换"}: UtilityToolWidgetProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ResultFile | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function clearResult() {
    if (result?.url) URL.revokeObjectURL(result.url);
    setResult(null);
  }

  async function runConversion() {
    if (!file) return;
    clearResult();
    setBusy(true);
    setError(null);
    try {
      const nextResult = kind === "wav-to-mp3-converter" ? await convertWavToMp3(file) : await extractAudioFromVideo(file);
      setResult(nextResult);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full rounded-xl border border-ink/10 bg-white p-5 shadow-lifted">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          clearResult();
          setError(null);
          setFile(event.target.files?.[0] ?? null);
        }}
      />
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          clearResult();
          setError(null);
          setFile(event.dataTransfer.files[0] ?? null);
        }}
        className="grid min-h-48 place-items-center rounded-xl border-2 border-dashed border-violet/25 bg-paper/50 px-4 py-8 text-center"
      >
        <div>
          <FileAudio className="mx-auto text-violet" size={36} />
          <p className="mt-3 text-lg font-black text-ink">{file?.name ?? "Drop a file here"}</p>
          <p className="mt-1 text-sm font-bold text-ink/50">{file ? readableSize(file.size) : "Files are processed locally in your browser"}</p>
          <button type="button" onClick={() => inputRef.current?.click()} className="btn-primary mt-5">
            <FileUp size={18} />
            {selectLabel}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={runConversion} disabled={!file || busy} className="btn-outline">
          {busy ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
          {busy ? "Processing..." : actionLabel}
        </button>
        {file ? (
          <button
            type="button"
            onClick={() => {
              clearResult();
              setFile(null);
              setError(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="btn-ghost"
          >
            <X size={16} />
            Clear
          </button>
        ) : null}
      </div>

      {result ? (
        <div className="mt-4 rounded-lg border border-sage/20 bg-sage/10 p-4 text-left">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-black text-ink">{result.name}</p>
              <p className="mt-1 text-sm font-bold text-ink/55">{result.mimeType} · {readableSize(result.size)}</p>
            </div>
            <a href={result.url} download={result.name} className="btn-primary">
              <Download size={17} />
              Download
            </a>
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-4 rounded-lg border border-coral/25 bg-coral/10 px-3 py-2 text-sm font-bold text-coral">{error}</p> : null}
      <p className="mt-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wide text-ink/45">
        <ShieldCheck size={15} />
        Browser-based conversion - files never leave your device
      </p>
    </div>
  );
}
