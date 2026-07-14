import type {Metadata} from "next";
import {getSharePageTitle, SharePage} from "@/components/share-page";
import {buildPrivateMetadata} from "@/lib/seo";

export function generateMetadata({params}: {params: {locale: string; token: string}}): Metadata {
  return buildPrivateMetadata(getSharePageTitle(params.locale), params.locale, `/share/${params.token}`);
}

export default function ShareRoute({params}: {params: {locale: string; token: string}}) {
  return <SharePage locale={params.locale} token={params.token} />;
}
