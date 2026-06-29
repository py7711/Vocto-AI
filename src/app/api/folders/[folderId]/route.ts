import {NextResponse} from "next/server";
import {z} from "zod";
import {getCurrentUser} from "@/lib/auth";
import {prisma} from "@/lib/prisma";

const updateFolderSchema = z.object({
  name: z.string().trim().min(1).max(120)
});

export async function PATCH(request: Request, {params}: {params: {folderId: string}}) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({error: "请先登录后再编辑文件夹。"}, {status: 401});

    const input = updateFolderSchema.parse(await request.json());
    await prisma.folder.updateMany({
      where: {id: params.folderId, userId: user.id},
      data: {name: input.name}
    });
    const folder = await prisma.folder.findFirst({
      where: {id: params.folderId, userId: user.id},
      include: {_count: {select: {mediaTasks: true}}}
    });
    if (!folder) return NextResponse.json({error: "文件夹不存在。"}, {status: 404});

    return NextResponse.json(folder);
  } catch (error) {
    const message = error instanceof Error ? error.message : "无法更新文件夹。";
    return NextResponse.json({error: message}, {status: 400});
  }
}

export async function DELETE(_request: Request, {params}: {params: {folderId: string}}) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({error: "请先登录后再删除文件夹。"}, {status: 401});

    const result = await prisma.folder.deleteMany({
      where: {id: params.folderId, userId: user.id}
    });
    if (!result.count) return NextResponse.json({error: "文件夹不存在。"}, {status: 404});

    return NextResponse.json({ok: true});
  } catch (error) {
    const message = error instanceof Error ? error.message : "无法删除文件夹。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
