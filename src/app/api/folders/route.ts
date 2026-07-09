import {NextResponse} from "next/server";
import {z} from "zod";
import {getCurrentUser} from "@/lib/auth";
import {prisma} from "@/lib/prisma";
import {logApiError} from "@/lib/api-logger";

const folderSchema = z.object({
  name: z.string().trim().min(1).max(120)
});

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({folders: []});

    const folders = await prisma.folder.findMany({
      where: {userId: user.id},
      orderBy: [{position: "asc"}, {createdAt: "asc"}],
      include: {_count: {select: {mediaTasks: true}}}
    });

    return NextResponse.json({folders});
  } catch (error) {
    logApiError(error, request);
    const message = error instanceof Error ? error.message : "无法读取文件夹。";
    return NextResponse.json({error: message}, {status: 400});
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({error: "请先登录后再创建文件夹。"}, {status: 401});

    const input = folderSchema.parse(await request.json());
    const last = await prisma.folder.aggregate({
      where: {userId: user.id},
      _max: {position: true}
    });
    const folder = await prisma.folder.create({
      data: {
        userId: user.id,
        name: input.name,
        position: (last._max.position ?? -1) + 1
      },
      include: {_count: {select: {mediaTasks: true}}}
    });

    return NextResponse.json(folder);
  } catch (error) {
    logApiError(error, request);
    const message = error instanceof Error ? error.message : "无法创建文件夹。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
