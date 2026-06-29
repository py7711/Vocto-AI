import {redirect} from "next/navigation";

export default function Page({params}: {params: {token: string}}) {
  redirect(`/en/share/${params.token}`);
}
