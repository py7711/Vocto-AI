import {redirect} from "next/navigation";

export default function Page({searchParams}: {searchParams?: {mode?: string}}) {
  const mode = searchParams?.mode ? `?mode=${encodeURIComponent(searchParams.mode)}` : "";
  redirect(`/en/upload${mode}`);
}
