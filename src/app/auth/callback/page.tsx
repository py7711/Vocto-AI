import {redirect} from "next/navigation";
import {authCallbackDestination, type AuthCallbackSearchParams} from "@/lib/auth-callback-compat";

export default function AuthCallbackAliasPage({searchParams}: {searchParams?: AuthCallbackSearchParams}) {
  redirect(authCallbackDestination("en", searchParams));
}
