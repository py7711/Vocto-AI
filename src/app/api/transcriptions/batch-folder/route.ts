import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {assertTaskAccess, taskAccessErrorResponse} from "@/lib/tasks";

const schema = z.object({
  transcriptionIds: z.array(z.string().min(1)).min(1).max(100),
  folderId: z.string().nullable().optional()
});

export async function PATCH(request: Request) {
  try {
    const input = schema.parse(await request.json().catch(() => ({})));
    const checked = await Promise.all(input.transcriptionIds.map((id) => assertTaskAccess(id, "write", request.headers)));
    const user = checked.find((item) => item.user)?.user ?? null;
    if (input.folderId && user) {
      const folder = await prisma.folder.findFirst({where: {id: input.folderId, userId: user.id}, select: {id: true}});
      if (!folder) return NextResponse.json({error: "文件夹不存在。"}, {status: 404});
    }
    const result = await prisma.mediaTask.updateMany({
      where: {id: {in: input.transcriptionIds}},
      data: {folderId: input.folderId ?? null}
    });
    return NextResponse.json({ok: true, count: result.count});
  } catch (error) {
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    return NextResponse.json({error: error instanceof Error ? error.message : "无法批量移动转写。"}, {status: error instanceof z.ZodError ? 422 : 400});
  }
}
