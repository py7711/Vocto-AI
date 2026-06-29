import "server-only";

import {z} from "zod";
import {
  abortMultipartUpload,
  completeMultipartUpload,
  createMultipartPartUrl,
  createMultipartUpload,
  listMultipartParts,
  publicObjectUrl
} from "@/lib/storage";

const createSchema = z.object({
  // create 接口同时接收新旧字段名：filename/contentType/sizeBytes 是当前命名，
  // fileName/fileType/fileSize/transcriptionFileId 来自早期上传客户端。
  filename: z.string().min(1).optional(),
  fileName: z.string().min(1).optional(),
  fileType: z.string().min(1).optional(),
  contentType: z.string().min(1).optional(),
  fileSize: z.number().int().positive().optional(),
  sizeBytes: z.number().int().positive().optional(),
  transcriptionFileId: z.string().optional()
}).passthrough();

const completeSchema = z.object({
  parts: z.array(z.object({
    PartNumber: z.number().int().positive(),
    ETag: z.string().min(1)
  })).min(1)
});

type MultipartToken = {
  key: string;
  r2UploadId: string;
  fileName?: string;
  contentType?: string;
  sizeBytes?: number;
};

function encodeUploadToken(input: MultipartToken) {
  // 旧客户端只保存一个 opaque uploadId，R2 实际需要 key + uploadId 两个值。
  // 这里把两者打包进 base64url token，后续分片签名/完成/中止接口再解开使用。
  return Buffer.from(JSON.stringify(input), "utf8").toString("base64url");
}

function decodeUploadToken(uploadId: string): MultipartToken {
  // uploadId 是旧端保存的 opaque token，解码失败时统一返回会话失效错误，
  // 避免把内部 R2 key 或 uploadId 细节暴露给客户端。
  try {
    const decoded = JSON.parse(Buffer.from(uploadId, "base64url").toString("utf8")) as MultipartToken;
    if (!decoded.key || !decoded.r2UploadId) throw new Error("上传会话无效。");
    return decoded;
  } catch {
    throw new Error("上传会话已失效。");
  }
}

function cleanFileName(input: string) {
  return input.replace(/[^\w.\-]+/g, "_").replace(/^_+|_+$/g, "").slice(-120) || "upload";
}

function contentTypeFromExtension(fileType: string | undefined) {
  const extension = fileType?.replace(/^\./, "").toLowerCase();
  if (!extension) return "application/octet-stream";
  if (["mp3", "mpeg"].includes(extension)) return "audio/mpeg";
  if (extension === "wav") return "audio/wav";
  if (extension === "m4a") return "audio/mp4";
  if (extension === "mp4") return "video/mp4";
  if (extension === "mov") return "video/quicktime";
  if (extension === "webm") return "video/webm";
  return "application/octet-stream";
}

export async function createSourceMultipartUpload(body: unknown) {
  const input = createSchema.parse(body);
  const baseName = input.fileName ?? input.filename ?? input.transcriptionFileId ?? "upload";
  const extension = input.fileType?.replace(/^\./, "");
  const cleanName = cleanFileName(extension && !baseName.endsWith(`.${extension}`) ? `${baseName}.${extension}` : baseName);
  const key = `uploads/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${cleanName}`;
  const contentType = input.contentType ?? contentTypeFromExtension(input.fileType);
  const created = await createMultipartUpload({key, contentType});
  const uploadId = encodeUploadToken({
    key,
    r2UploadId: created.uploadId,
    fileName: cleanName,
    contentType,
    sizeBytes: input.sizeBytes ?? input.fileSize
  });

  return {
    // fileId/transcriptionFileId 是旧端任务创建接口会继续传回来的别名，
    // uploadId/key/publicUrl 是当前对象存储流程使用的字段。
    uploadId,
    key,
    fileId: key,
    transcriptionFileId: key,
    fileName: cleanName,
    contentType,
    sizeBytes: input.sizeBytes ?? input.fileSize,
    publicUrl: created.publicUrl
  };
}

export async function listSourceMultipartParts(uploadId: string) {
  const token = decodeUploadToken(uploadId);
  const parts = await listMultipartParts({key: token.key, uploadId: token.r2UploadId});
  return {parts};
}

export async function signSourceMultipartPart(uploadId: string, partNumber: number) {
  if (!Number.isInteger(partNumber) || partNumber < 1 || partNumber > 10000) {
    throw new Error("分片编号无效。");
  }
  const token = decodeUploadToken(uploadId);
  const url = await createMultipartPartUrl({key: token.key, uploadId: token.r2UploadId, partNumber});
  return {
    // uploadUrl/signedUrl/url 三个字段指向同一个预签名地址，覆盖不同历史客户端的读取习惯。
    url,
    uploadUrl: url,
    signedUrl: url,
    method: "PUT",
    headers: {}
  };
}

export async function completeSourceMultipartUpload(uploadId: string, body: unknown) {
  const token = decodeUploadToken(uploadId);
  const input = completeSchema.parse(body);
  const completed = await completeMultipartUpload({
    key: token.key,
    uploadId: token.r2UploadId,
    parts: input.parts
  });
  return {
    // 完成后仍返回旧字段别名，保证上传结果可直接流入旧版转写任务创建 payload。
    ok: true,
    key: token.key,
    fileId: token.key,
    transcriptionFileId: token.key,
    fileName: token.fileName ?? token.key.split("/").pop(),
    contentType: token.contentType,
    sizeBytes: token.sizeBytes,
    publicUrl: completed.publicUrl || publicObjectUrl(token.key),
    location: completed.location
  };
}

export async function abortSourceMultipartUpload(uploadId: string) {
  const token = decodeUploadToken(uploadId);
  await abortMultipartUpload({key: token.key, uploadId: token.r2UploadId});
  return {ok: true};
}
