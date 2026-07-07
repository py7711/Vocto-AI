import {ResetPasswordPage} from "@/components/auth-pages";
import {authMetadata} from "@/lib/auth-metadata";

export function generateMetadata({params}: {params: {locale: string}}) {
  return authMetadata(params.locale, "reset");
}

export default function ResetPasswordRoute() {
  return <ResetPasswordPage />;
}
