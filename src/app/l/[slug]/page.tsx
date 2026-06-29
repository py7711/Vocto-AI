import {redirect} from "next/navigation";

export default function LandingAliasPage({params}: {params: {slug: string}}) {
  redirect(`/en/l/${params.slug}`);
}
