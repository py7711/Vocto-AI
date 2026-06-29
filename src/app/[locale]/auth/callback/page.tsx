import {redirect} from "next/navigation";
import {authCallbackDestination, type AuthCallbackSearchParams} from "@/lib/auth-callback-compat";

export default function LocalizedAuthCallbackPage({params, searchParams}: {params: {locale: string}; searchParams?: AuthCallbackSearchParams}) {
  redirect(authCallbackDestination(params.locale, searchParams));
}
