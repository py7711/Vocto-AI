import {redis} from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(_: Request, {params}: {params: {taskId: string}}) {
  const encoder = new TextEncoder();
  const subscriber = redis.duplicate();

  const stream = new ReadableStream({
    async start(controller) {
      await subscriber.subscribe(`task:${params.taskId}`);
      subscriber.on("message", (_channel, message) => {
        controller.enqueue(encoder.encode(`event: update\ndata: ${message}\n\n`));
      });
      controller.enqueue(encoder.encode(`event: ready\ndata: {"taskId":"${params.taskId}"}\n\n`));
    },
    async cancel() {
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
