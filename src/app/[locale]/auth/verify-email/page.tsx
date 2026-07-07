import {VerifyEmailPage} from "@/components/auth-pages";
import {authMetadata} from "@/lib/auth-metadata";

export function generateMetadata({params}: {params: {locale: string}}) {
  return authMetadata(params.locale, "verify");
}

export default function VerifyEmailRoute() {
  return <VerifyEmailPage />;
}
