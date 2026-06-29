import {redirect} from "next/navigation";

export default function ToolAliasPage({params, searchParams}: {params: {slug: string}; searchParams?: Record<string, string | string[] | undefined>}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, item));
    } else if (value !== undefined) {
      query.set(key, value);
    }
  }
  const suffix = query.toString() ? `?${query.toString()}` : "";
  redirect(`/en/tools/${params.slug}${suffix}`);
}
