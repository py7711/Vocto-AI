import type {Metadata} from "next";
import {BlogPage} from "@/components/content-pages";
import {getWorkspaceCopy} from "@/components/workspace/copy";

export function generateMetadata({params}: {params: {locale: string}}): Metadata {
  const copy = getWorkspaceCopy(params.locale);
  return {
    title: `${copy.blog} | UniScribe`
  };
}

export default function BlogRoute() {
  return <BlogPage />;
}
