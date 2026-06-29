import {redirect} from "next/navigation";

export default function PrivacyAliasRoute({params}: {params: {locale: string}}) {
  // 保留短路径兼容旧链接，实际内容统一维护在 privacy-policy 页面。
  redirect(`/${params.locale}/privacy-policy`);
}
