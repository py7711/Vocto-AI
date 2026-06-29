import {SharePage} from "@/components/share-page";

export default function ShareRoute({params}: {params: {locale: string; token: string}}) {
  return <SharePage locale={params.locale} token={params.token} />;
}
