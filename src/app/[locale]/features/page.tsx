import type {Metadata} from "next";
import {Workspace} from "@/components/workspace";

export const metadata: Metadata = {
  title: "Features | UniScribe - AI Audio & Video Transcription",
  description: "Explore UniScribe's AI-powered transcription features for converting audio and video to text with summaries, mind maps, exports, and 87 languages."
};

export default function FeaturesPage() {
  return <Workspace variant="marketing" />;
}
