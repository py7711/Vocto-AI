import type {Metadata} from "next";
import {SettingsPage} from "@/components/settings-page";
import {getWorkspaceCopy} from "@/components/workspace/copy";
import type {CurrentUser} from "@/components/workspace/types";
import {getCurrentUser} from "@/lib/auth";
import {jsonSafe} from "@/lib/json";

export function generateMetadata({params}: {params: {locale: string}}): Metadata {
  const copy = getWorkspaceCopy(params.locale);
  return {
    title: `${copy.settings} | UniScribe`
  };
}

export default async function Page() {
  const user = await getCurrentUser();
  return <SettingsPage initialUser={jsonSafe(user) as CurrentUser | null} />;
}
