import {redirect} from "next/navigation";

export default function TermsAliasRoute({params}: {params: {locale: string}}) {
  // 保留短路径兼容旧链接，实际内容统一维护在 terms-of-service 页面。
  redirect(`/${params.locale}/terms-of-service`);
}
