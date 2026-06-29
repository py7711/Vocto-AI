import {redirect} from "next/navigation";

export default function LanguageAliasPage({params}: {params: {slug: string}}) {
  redirect(`/en/languages/${params.slug}`);
}
