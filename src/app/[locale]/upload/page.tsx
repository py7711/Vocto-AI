import type {Metadata} from "next";
import {Workspace} from "@/components/workspace";
import {getWorkspaceCopy} from "@/components/workspace/copy";
import type {CurrentUser} from "@/components/workspace/types";
import {getCurrentUser} from "@/lib/auth";
import {jsonSafe} from "@/lib/json";
import {buildPrivateMetadata} from "@/lib/seo";

export function generateMetadata({params}: {params: {locale: string}}): Metadata {
  const copy = getWorkspaceCopy(params.locale);
  return buildPrivateMetadata(copy.uploadAFile, params.locale, "/upload");
}

export default async function UploadPage() {
  const user = await getCurrentUser();
  return <Workspace variant="upload" initialUser={jsonSafe(user) as CurrentUser | null} />;
}
