import {NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/auth";
import {fetchDriveJson, getFreshDriveConnection} from "@/lib/google-drive";

type DriveFilesResponse = {
  files?: Array<{
    id: string;
    name: string;
    mimeType?: string;
    size?: string;
    webViewLink?: string;
    thumbnailLink?: string;
    videoMediaMetadata?: {durationMillis?: string};
  }>;
};

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({error: "请先登录。"}, {status: 401});

  const connection = await getFreshDriveConnection(user.id);
  if (!connection) return NextResponse.json({error: "尚未连接 Google Drive。"}, {status: 404});

  const requestUrl = new URL(request.url);
  const query = requestUrl.searchParams.get("q")?.trim();
  const driveUrl = new URL("https://www.googleapis.com/drive/v3/files");
  const mediaFilter = "(mimeType contains 'audio/' or mimeType contains 'video/')";
  driveUrl.searchParams.set("q", query ? `${mediaFilter} and name contains '${query.replace(/'/g, "\\'")}' and trashed=false` : `${mediaFilter} and trashed=false`);
  driveUrl.searchParams.set("pageSize", "25");
  driveUrl.searchParams.set("orderBy", "modifiedTime desc");
  driveUrl.searchParams.set("fields", "files(id,name,mimeType,size,webViewLink,thumbnailLink,videoMediaMetadata)");

  const data = await fetchDriveJson<DriveFilesResponse>(connection, driveUrl.toString());
  return NextResponse.json({
    files: (data.files ?? []).map((file) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      sizeBytes: file.size ? Number(file.size) : undefined,
      webViewLink: file.webViewLink,
      thumbnailUrl: file.thumbnailLink,
      durationSeconds: file.videoMediaMetadata?.durationMillis ? Math.round(Number(file.videoMediaMetadata.durationMillis) / 1000) : undefined
    }))
  });
}
