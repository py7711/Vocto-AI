import type {Metadata} from "next";
import {getSharePageTitle, SharePage} from "@/components/share-page";

export function generateMetadata({params}: {params: {locale: string}}): Metadata {
  return {
    title: `${getSharePageTitle(params.locale)} | Votxt`
  };
}

export default function ShareRoute({params}: {params: {locale: string; token: string}}) {
  return <SharePage locale={params.locale} token={params.token} />;
}
