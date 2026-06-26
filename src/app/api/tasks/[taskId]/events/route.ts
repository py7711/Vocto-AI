import {redis} from "@/lib/redis";
import {assertTaskAccess, taskAccessErrorResponse} from "@/lib/tasks";

export const dynamic = "force-dynamic";

export async function GET(request: Request, {params}: {params: {taskId: string}}) {
  try {
    await assertTaskAccess(params.taskId, "read", request.headers);
  } catch (error) {
    const accessError = taskAccessErrorResponse(error);
    if (accessError) {
      return Response.json(accessError.body, {status: accessError.status});
    }
    return Response.json({error: "无法订阅任务状态。"}, {status: 400});
  }

  const encoder = new TextEncoder();
  const subscriber = redis.duplicate();

  const stream = new ReadableStream({
    async start(controller) {
      // 每个任务使用独立频道，Worker 更新状态后会发布完整任务快照。
      await subscriber.subscribe(`task:${params.taskId}`);
      subscriber.on("message", (_channel, message) => {
        controller.enqueue(encoder.encode(`event: update\ndata: ${message}\n\n`));
      });
      // 就绪事件让前端知道 SSE 已建立，后续再等待更新事件。
      controller.enqueue(encoder.encode(`event: ready\ndata: {"taskId":"${params.taskId}"}\n\n`));
    },
    async cancel() {
      // 浏览器关闭连接时主动释放 Redis 订阅，避免长连接泄漏。
      await subscriber.unsubscribe(`task:${params.taskId}`);
      subscriber.disconnect();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}
