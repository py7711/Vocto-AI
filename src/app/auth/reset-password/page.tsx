import {redirect} from "next/navigation";

export default function ResetPasswordAliasPage({searchParams}: {searchParams?: {token?: string}}) {
  const token = searchParams?.token ? `?token=${encodeURIComponent(searchParams.token)}` : "";
  redirect(`/en/auth/reset-password${token}`);
}
