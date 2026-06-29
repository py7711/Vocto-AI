import {NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/auth";

function countryFromHeaders(headers: Headers) {
  const candidates = [
    headers.get("cf-ipcountry"),
    headers.get("x-vercel-ip-country"),
    headers.get("x-country-code")
  ];
  const country = candidates.find((value) => /^[A-Za-z]{2}$/.test(String(value ?? "").trim()));
  return country?.trim().toUpperCase() ?? null;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({error: "请先登录。"}, {status: 401});

  return NextResponse.json({
    synced: true,
    countryCode: countryFromHeaders(request.headers),
    userId: user.id
  });
}
