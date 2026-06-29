import {GET as listTranscriptions} from "@/app/api/transcriptions/page/route";

export async function GET(request: Request, {params}: {params: {folderId: string}}) {
  // 旧客户端通过 /folders/:id/transcriptions 拉取文件夹内任务；当前列表接口使用 folder 查询参数。
  const url = new URL(request.url);
  url.searchParams.set("folder", params.folderId);
  return listTranscriptions(new Request(url, {headers: request.headers}));
}
