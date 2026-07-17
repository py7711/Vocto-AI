"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {extractYoutubeVideoId} from "@/lib/youtube-url";

type YouTubeVideoPlayerProps = {
  videoUrl: string;
  seekSignal?: {time: number; nonce: number} | null;
  label?: string;
};

export function YouTubeVideoPlayer({videoUrl, seekSignal, label}: YouTubeVideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const pendingPlayRef = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const videoId = useMemo(() => extractYoutubeVideoId(videoUrl), [videoUrl]);
  const src = videoId
    ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1&playsinline=1&rel=0`
    : null;

  useEffect(() => {
    function handlePlayerMessage(event: MessageEvent) {
      if (event.origin !== "https://www.youtube.com") return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      try {
        const message = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (message?.event === "onReady") setReady(true);
        if (message?.event === "infoDelivery" && message.info) {
          const currentTime = typeof message.info.currentTime === "number" ? message.info.currentTime : undefined;
          if (pendingPlayRef.current !== null && currentTime !== undefined && Math.abs(currentTime - pendingPlayRef.current) < 1) {
            iframeRef.current?.contentWindow?.postMessage(JSON.stringify({event: "command", func: "playVideo", args: []}), "https://www.youtube.com");
            pendingPlayRef.current = null;
          }
        }
      } catch {
        // 忽略其他嵌入内容发送的无关消息。
      }
    }
    window.addEventListener("message", handlePlayerMessage);
    return () => window.removeEventListener("message", handlePlayerMessage);
  }, []);

  useEffect(() => {
    if (!ready || !seekSignal) return;
    const player = iframeRef.current?.contentWindow;
    if (!player || !videoId) return;
    pendingPlayRef.current = Math.max(0, seekSignal.time);
    player.postMessage(JSON.stringify({
      event: "command",
      func: "loadVideoById",
      args: [videoId, Math.max(0, seekSignal.time)]
    }), "https://www.youtube.com");
  }, [ready, seekSignal, videoId]);

  if (!src) return null;

  return (
    <div className="aspect-video w-full bg-black">
      <iframe
        ref={iframeRef}
        src={src}
        title={label || "YouTube video"}
        data-player-ready={ready ? "true" : "false"}
        className="h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={() => {
          iframeRef.current?.contentWindow?.postMessage(JSON.stringify({event: "listening"}), "https://www.youtube.com");
        }}
      />
    </div>
  );
}
