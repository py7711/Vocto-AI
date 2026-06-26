import {NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/auth";
import {getCurrentTeamSnapshot} from "@/lib/teams";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({user: null}, {status: 401});
  }

  const team = await getCurrentTeamSnapshot();
  return NextResponse.json({user, team});
}
