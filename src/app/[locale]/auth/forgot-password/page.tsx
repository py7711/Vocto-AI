import {ForgotPasswordPage} from "@/components/auth-pages";
import {authMetadata} from "@/lib/auth-metadata";

export function generateMetadata({params}: {params: {locale: string}}) {
  return authMetadata(params.locale, "forgot");
}

export default function ForgotPasswordRoute() {
  return <ForgotPasswordPage />;
}
