import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {assertTaskAccess, publishTaskUpdate, taskAccessErrorResponse} from "@/lib/tasks";
import {logApiError} from "@/lib/api-logger";

const ratingSchema = z.object({
  rating: z.number().int().min(1).max(5),
  note: z.string().max(1024).optional()
});

export async function POST(request: Request, {params}: {params: {taskId: string}}) {
  try {
    const access = await assertTaskAccess(params.taskId, "write", request.headers);
    if (!access.user) {
      return NextResponse.json({error: "请先登录后再评价此转写。"}, {status: 401});
    }

    const input = ratingSchema.parse(await request.json());
    const rating = await prisma.transcriptRating.upsert({
      where: {
        mediaTaskId_userId: {
          mediaTaskId: params.taskId,
          userId: access.user.id
        }
      },
      update: {
        rating: input.rating,
        note: input.note
      },
      create: {
        mediaTaskId: params.taskId,
        userId: access.user.id,
        rating: input.rating,
        note: input.note
      }
    });

    const aggregate = await prisma.transcriptRating.aggregate({
      where: {mediaTaskId: params.taskId},
      _avg: {rating: true},
      _count: {rating: true}
    });

    await publishTaskUpdate(params.taskId);
    return NextResponse.json({
      currentUserRating: rating,
      ratingSummary: {
        average: aggregate._avg.rating,
        count: aggregate._count.rating
      }
    });
  } catch (error) {
    logApiError(error, request);
    const accessError = taskAccessErrorResponse(error);
    if (accessError) return NextResponse.json(accessError.body, {status: accessError.status});
    const message = error instanceof Error ? error.message : "无法保存转写评分。";
    return NextResponse.json({error: message}, {status: 400});
  }
}
