import {SharePage} from "@/components/share-page";

export default function ShareRoute({params}: {params: {token: string}}) {
  return <SharePage token={params.token} />;
}
