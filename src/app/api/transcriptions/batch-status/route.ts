import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {assertTaskAccess} from "@/lib/tasks";

const schema = z.object({
  transcriptionFileIds: z.array(z.string().min(1)).min(1).max(100)
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json().catch(() => ({})));
    const rows = await Promise.all(input.transcriptionFileIds.map(async (id) => {
      try {
        await assertTaskAccess(id, "read", request.headers);
        const task = await prisma.mediaTask.findUnique({
          where: {id},
          select: {
            id: true,
            status: true,
            progress: true,
            statusMessage: true,
            errorCode: true,
            provider: true,
            detectedLanguage: true,
            durationSeconds: true,
            completedAt: true,
            updatedAt: true
          }
        });
        if (!task) return {id, transcriptionFileId: id, status: "NOT_FOUND", error: "文件不存在"};
        return {
          ...task,
          transcriptionFileId: task.id
        };
      } catch {
        return {id, transcriptionFileId: id, status: "NOT_FOUND", error: "文件不存在"};
      }
    }));

    return NextResponse.json({data: rows});
  } catch (error) {
    return NextResponse.json(
      {error: error instanceof Error ? error.message : "无法读取批量状态。"},
      {status: error instanceof z.ZodError ? 422 : 400}
    );
  }
}
