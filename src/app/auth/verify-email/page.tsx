import {redirect} from "next/navigation";

export default function VerifyEmailAliasPage({searchParams}: {searchParams?: {token?: string}}) {
  const token = searchParams?.token ? `?token=${encodeURIComponent(searchParams.token)}` : "";
  redirect(`/en/auth/verify-email${token}`);
}
