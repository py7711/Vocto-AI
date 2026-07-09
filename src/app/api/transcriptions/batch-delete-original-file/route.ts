import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {deleteObject} from "@/lib/storage";
import {assertTaskAccess, taskAccessErrorResponse} from "@/lib/tasks";
import {logApiError} from "@/lib/api-logger";

const schema = z.object({
  transcriptionIds: z.array(z.string().min(1)).min(1).max(100)
});

export async function DELETE(request: Request) {
  try {
    const input = schema.parse(await request.json().catch(() => ({})));
    await Promise.all(input.transcriptionIds.map((id) => assertTaskAccess(id, "write", request.headers)));
    const tasks = await prisma.mediaTask.findMany({where: {id: {in: input.transcriptionIds}}, select: {id: true, objectKey: true}});
    const failed: string[] = [];
    for (const task of tasks) {
      if (!task.objectKey) continue;
      try {
        await deleteObject(task.objectKey);
      } catch {
        failed.push(task.id);
      }
    }
    const deletableIds = tasks.filter((task) => !failed.includes(task.id)).map((task) => task.id);
    const result = deletableIds.length
      ? await prisma.mediaTask.updateMany({where: {id: {in: deletableIds}}, data: {objectKey: null, sourceUrl: "", normalizedUrl: null}})
      : {count: 0};
    return NextResponse.json({ok: true, count: result.count, failed});
  } catch (error) {
    logApiError(error, request);
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    return NextResponse.json({error: error instanceof Error ? error.message : "无法批量删除原始文件。"}, {status: error instanceof z.ZodError ? 422 : 400});
  }
}
