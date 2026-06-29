import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {deleteObject} from "@/lib/storage";
import {assertTaskAccess, taskAccessErrorResponse} from "@/lib/tasks";
import {releaseQuotaForFailedTask} from "@/lib/usage";

const batchSchema = z.object({
  taskIds: z.array(z.string().min(1)).min(1).max(100),
  action: z.enum(["delete", "move", "delete_originals"]),
  folderId: z.string().nullable().optional()
});

const releasableStatuses = new Set(["UPLOADING", "QUEUED", "PROCESSING", "TRANSCRIBING", "ANALYZING", "FAILED", "CANCELED"]);

export async function PATCH(request: Request) {
  try {
    const input = batchSchema.parse(await request.json());
    const checked = await Promise.all(input.taskIds.map((taskId) => assertTaskAccess(taskId, "write", request.headers)));
    const user = checked.find((item) => item.user)?.user ?? null;

    if (input.action === "move") {
      if (input.folderId && user) {
        const folder = await prisma.folder.findFirst({
          where: {id: input.folderId, userId: user.id},
          select: {id: true}
        });
        if (!folder) return NextResponse.json({error: "文件夹不存在。"}, {status: 404});
      }

      const result = await prisma.mediaTask.updateMany({
        where: {id: {in: input.taskIds}},
        data: {folderId: input.folderId ?? null}
      });
      return NextResponse.json({ok: true, count: result.count});
    }

    if (input.action === "delete_originals") {
      const tasks = await prisma.mediaTask.findMany({
        where: {id: {in: input.taskIds}},
        select: {id: true, objectKey: true}
      });
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
        ? await prisma.mediaTask.updateMany({
            where: {id: {in: deletableIds}},
            data: {
              objectKey: null,
              sourceUrl: "",
              normalizedUrl: null
            }
          })
        : {count: 0};

      return NextResponse.json({ok: true, count: result.count, failed});
    }

    const tasks = await prisma.mediaTask.findMany({
      where: {id: {in: input.taskIds}},
      select: {id: true, status: true}
    });
    for (const task of tasks) {
      if (releasableStatuses.has(task.status)) {
        await releaseQuotaForFailedTask(task.id);
      }
    }

    const result = await prisma.mediaTask.deleteMany({
      where: {id: {in: input.taskIds}}
    });
    return NextResponse.json({ok: true, count: result.count});
  } catch (error) {
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法执行批量操作。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
