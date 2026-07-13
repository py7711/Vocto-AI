import type {Metadata} from "next";
import {redirect} from "next/navigation";
import {Workspace} from "@/components/workspace";
import {getWorkspaceCopy} from "@/components/workspace/copy";
import type {CurrentUser} from "@/components/workspace/types";
import {getCurrentUser} from "@/lib/auth";
import {jsonSafe} from "@/lib/json";

export function generateMetadata({params}: {params: {locale: string}}): Metadata {
  const copy = getWorkspaceCopy(params.locale);
  return {
    title: `${copy.dashboardNav} | Votxt`
  };
}

export default async function DashboardPage({params}: {params: {locale: string}}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${params.locale}/auth/signin?next=${encodeURIComponent(`/${params.locale}/dashboard`)}`);
  }

  return <Workspace variant="dashboard" initialUser={jsonSafe(user) as CurrentUser} />;
}
