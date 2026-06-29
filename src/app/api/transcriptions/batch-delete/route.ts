import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {assertTaskAccess, taskAccessErrorResponse} from "@/lib/tasks";
import {releaseQuotaForFailedTask} from "@/lib/usage";

const schema = z.object({
  transcriptionIds: z.array(z.string().min(1)).min(1).max(100),
  taskIds: z.array(z.string().min(1)).optional()
});

const releasableStatuses = new Set(["UPLOADING", "QUEUED", "PROCESSING", "TRANSCRIBING", "ANALYZING", "FAILED", "CANCELED"]);

export async function DELETE(request: Request) {
  try {
    const input = schema.parse(await request.json().catch(() => ({})));
    const ids = input.taskIds?.length ? input.taskIds : input.transcriptionIds;
    await Promise.all(ids.map((id) => assertTaskAccess(id, "write", request.headers)));
    const tasks = await prisma.mediaTask.findMany({where: {id: {in: ids}}, select: {id: true, status: true}});
    for (const task of tasks) {
      if (releasableStatuses.has(task.status)) await releaseQuotaForFailedTask(task.id);
    }
    const result = await prisma.mediaTask.deleteMany({where: {id: {in: ids}}});
    return NextResponse.json({ok: true, count: result.count});
  } catch (error) {
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    return NextResponse.json({error: error instanceof Error ? error.message : "无法批量删除转写。"}, {status: error instanceof z.ZodError ? 422 : 400});
  }
}
