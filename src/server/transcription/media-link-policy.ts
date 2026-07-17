import {resolveMediaSourceProvider} from "@/server/media/source-provider";

type MediaLinkInput<T> = {
  sourceType: "UPLOAD" | "YOUTUBE" | "GOOGLE_DRIVE";
  sourceUrl: string;
  runMediaPipeline: () => Promise<T>;
  runGemini: () => Promise<T>;
};

export async function runMediaLinkTranscription<T>(input: MediaLinkInput<T>): Promise<T> {
  if (input.sourceType !== "YOUTUBE") return input.runMediaPipeline();
  if (resolveMediaSourceProvider(input.sourceUrl) === "youtube") return input.runGemini();
  return input.runMediaPipeline();
}
