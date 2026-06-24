import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";

export async function GET(_: Request, {params}: {params: {taskId: string}}) {
  const task = await prisma.mediaTask.findUnique({
    where: {id: params.taskId},
    include: {
      transcript: true,
      insights: true,
      exports: true
    }
  });

  if (!task) {
    return NextResponse.json({error: "Task not found"}, {status: 404});
  }

  return NextResponse.json(task);
}
