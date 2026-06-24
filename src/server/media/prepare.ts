import {spawn} from "node:child_process";

function collect(command: string, args: string[]) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn(command, args, {stdio: ["ignore", "pipe", "pipe"]});
    const chunks: Buffer[] = [];
    const errors: Buffer[] = [];

    child.stdout.on("data", (chunk) => chunks.push(chunk));
    child.stderr.on("data", (chunk) => errors.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(Buffer.concat(chunks).toString("utf8").trim());
      } else {
        reject(new Error(Buffer.concat(errors).toString("utf8") || `${command} exited with code ${code}`));
      }
    });
  });
}

function run(command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {stdio: "inherit"});
    child.on("error", reject);
    child.on("close", (code) => {
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
  const output = await collect("yt-dlp", ["--no-playlist", "--format", "bestaudio", "--get-url", url]);
  const [audioUrl] = output.split("\n").filter(Boolean);

  if (!audioUrl) {
    throw new Error("yt-dlp did not return an audio URL.");
  }

  return audioUrl;
}

export async function normalizeAudio(inputPath: string, outputPath: string) {
  await run("ffmpeg", ["-y", "-i", inputPath, "-vn", "-ac", "1", "-ar", "16000", "-b:a", "64k", outputPath]);
}
