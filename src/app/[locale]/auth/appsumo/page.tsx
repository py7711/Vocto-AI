import {AppSumoActivationPage} from "@/components/appsumo-activation-page";
import {authMetadata} from "@/lib/auth-metadata";

export function generateMetadata({params}: {params: {locale: string}}) {
  return authMetadata(params.locale, "appsumo");
}

export default function AppSumoPage() {
  return <AppSumoActivationPage />;
}
