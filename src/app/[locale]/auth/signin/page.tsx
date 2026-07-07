import {AuthPage} from "@/components/auth-pages";
import {authMetadata} from "@/lib/auth-metadata";

export function generateMetadata({params}: {params: {locale: string}}) {
  return authMetadata(params.locale, "signin");
}

export default function SignInPage() {
  return <AuthPage mode="signin" />;
}
