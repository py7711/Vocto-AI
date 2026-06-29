import {redirect} from "next/navigation";

export default function BlogPostAliasPage({params}: {params: {slug: string}}) {
  redirect(`/en/blog/${params.slug}`);
}
