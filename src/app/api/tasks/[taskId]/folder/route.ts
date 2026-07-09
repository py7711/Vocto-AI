import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {assertTaskAccess, taskAccessErrorResponse} from "@/lib/tasks";
import {getRequestOrigin} from "@/lib/request-origin";
import {serializeShareLinkForOwner} from "@/lib/share-links";
import {logApiError} from "@/lib/api-logger";

const moveTaskSchema = z.object({
  folderId: z.string().nullable()
});

export async function PATCH(request: Request, {params}: {params: {taskId: string}}) {
  try {
    const access = await assertTaskAccess(params.taskId, "write", request.headers);
    if (!access.user) return NextResponse.json({error: "请先登录后再移动转写。"}, {status: 401});
    const user = access.user;

    const input = moveTaskSchema.parse(await request.json());
    if (input.folderId) {
      const folder = await prisma.folder.findFirst({
        where: {id: input.folderId, userId: access.user.id},
        select: {id: true}
      });
      if (!folder) return NextResponse.json({error: "文件夹不存在。"}, {status: 404});
    }

    const task = await prisma.mediaTask.update({
      where: {id: params.taskId},
      data: {folderId: input.folderId},
      include: {
        transcript: {select: {id: true}},
        folder: {select: {id: true, name: true, position: true}},
        insights: {select: {type: true, content: true, createdAt: true, updatedAt: true}},
        shareLinks: {
          where: {enabled: true},
          select: {
            id: true,
            tokenHash: true,
            title: true,
            enabled: true,
            expiresAt: true,
            accessCount: true,
            lastAccessAt: true,
            createdAt: true
          },
          orderBy: {createdAt: "desc"},
          take: 1
        }
      }
    });

    return NextResponse.json({
      ...task,
      shareLinks: task.shareLinks.map((shareLink) =>
        serializeShareLinkForOwner(shareLink, {appUrl: getRequestOrigin(request), locale: user.locale})
      )
    });
  } catch (error) {
    logApiError(error, request);
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法移动转写。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
