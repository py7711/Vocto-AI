import {Workspace} from "@/components/workspace";
import type {CurrentUser} from "@/components/workspace/types";
import {getCurrentUser} from "@/lib/auth";
import {jsonSafe} from "@/lib/json";

export default async function HomePage() {
  const user = await getCurrentUser();
  return <Workspace variant="marketing" initialUser={jsonSafe(user) as CurrentUser | null} />;
}
