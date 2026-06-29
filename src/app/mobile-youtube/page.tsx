import {redirect} from "next/navigation";

export default function MobileYoutubePage({searchParams}: {searchParams?: Record<string, string | string[] | undefined>}) {
  // 旧移动端会打开 /mobile-youtube；现在统一转到上传页的链接模式，并保留原查询参数。
  const query = new URLSearchParams({mode: "link"});
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (key === "mode") continue;
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
    } else if (value !== undefined) {
      query.set(key, value);
    }
  }
  redirect(`/en/upload?${query.toString()}`);
}
