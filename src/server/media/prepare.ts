import {spawn} from "node:child_process";

const DEFAULT_TIMEOUT_MS = 60_000;

function friendlyToolError(command: string, error: unknown) {
  if (error instanceof Error && "code" in error && error.code === "ENOENT") {
    return new Error(`${command} is not installed or is not available in PATH.`);
  }

  return error;
}

function collect(command: string, args: string[], timeoutMs = DEFAULT_TIMEOUT_MS) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, {stdio: ["ignore", "pipe", "pipe"]});
    const chunks: Buffer[] = [];
    const errors: Buffer[] = [];
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`${command} timed out after ${Math.round(timeoutMs / 1000)} seconds.`));
    }, timeoutMs);

    child.stdout.on("data", (chunk) => chunks.push(chunk));
    child.stderr.on("data", (chunk) => errors.push(chunk));
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(friendlyToolError(command, error));
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve(Buffer.concat(chunks).toString("utf8").trim());
      } else {
        reject(new Error(Buffer.concat(errors).toString("utf8") || `${command} exited with code ${code}`));
      }
    });
  });
}

function run(command: string, args: string[], timeoutMs = DEFAULT_TIMEOUT_MS) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {stdio: "inherit"});
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`${command} timed out after ${Math.round(timeoutMs / 1000)} seconds.`));
    }, timeoutMs);

    child.on("error", (error) => {
      clearTimeout(timer);
      reject(friendlyToolError(command, error));
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${code}`));
      }
    });
  });
}

export async function downloadYoutubeAudio(url: string, outputPath: string) {
  await run("yt-dlp", [
    "--extract-audio",
    "--audio-format",
    "mp3",
    "--audio-quality",
    "5",
    "--output",
    outputPath,
    url
  ]);
}

export async function resolveYoutubeAudioUrl(url: string) {
  const output = await collect("yt-dlp", ["--no-playlist", "--format", "bestaudio", "--get-url", url], 30_000);
  const [audioUrl] = output.split("\n").filter(Boolean);

  if (!audioUrl) {
    throw new Error("yt-dlp did not return an audio URL.");
  }

  return audioUrl;
}

export async function normalizeAudio(inputPath: string, outputPath: string) {
  await run("ffmpeg", ["-y", "-i", inputPath, "-vn", "-ac", "1", "-ar", "16000", "-b:a", "64k", outputPath]);
}
