import {createOpenApiTranscription} from "@/lib/openapi";

export async function POST(request: Request) {
  return createOpenApiTranscription(request, "YOUTUBE");
}
