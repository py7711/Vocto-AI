import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListPartsCommand,
  PutObjectCommand,
  type PutObjectCommandInput,
  S3Client,
  UploadPartCommand
} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {env} from "@/lib/env";

function getStorageClient() {
  if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
    throw new Error("Cloudflare R2 凭据未配置。");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY
    }
  });
}

export async function createUploadUrl(input: {
  key: string;
  contentType: string;
  sizeBytes: number;
}) {
  // 单文件上传使用短期 PUT 签名 URL。ContentLength 写入签名参数后，
  // 浏览器上传的字节数需要和预签名时一致，能避免客户端绕过前端限制上传超大对象。
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: input.key,
    ContentType: input.contentType,
    ContentLength: input.sizeBytes
  });

  const uploadUrl = await getSignedUrl(getStorageClient(), command, {expiresIn: 900});
  const publicUrl = env.R2_PUBLIC_BASE_URL
    ? `${env.R2_PUBLIC_BASE_URL.replace(/\/$/, "")}/${input.key}`
    : `r2://${env.R2_BUCKET}/${input.key}`;

  return {uploadUrl, publicUrl};
}

export async function createMultipartUpload(input: {
  key: string;
  contentType: string;
}) {
  // 大文件走 multipart，前端先创建 uploadId，再逐个 part 获取签名 URL。
  // uploadId 必须由客户端后续 complete/abort 原样带回，否则 R2 无法定位未完成上传。
  const command = new CreateMultipartUploadCommand({
    Bucket: env.R2_BUCKET,
    Key: input.key,
    ContentType: input.contentType
  });
  const response = await getStorageClient().send(command);
  if (!response.UploadId) {
    throw new Error("R2 未返回分片上传 ID。");
  }
  return {
    key: input.key,
    uploadId: response.UploadId,
    publicUrl: publicObjectUrl(input.key)
  };
}

export async function createMultipartPartUrl(input: {
  key: string;
  uploadId: string;
  partNumber: number;
}) {
  // 每个分片单独签名，避免一次性暴露完整对象写入权限。
  // partNumber 从 1 开始，complete 时必须按编号升序提交 ETag。
  const command = new UploadPartCommand({
    Bucket: env.R2_BUCKET,
    Key: input.key,
    UploadId: input.uploadId,
    PartNumber: input.partNumber
  });
  return getSignedUrl(getStorageClient(), command, {expiresIn: 900});
}

export async function listMultipartParts(input: {
  key: string;
  uploadId: string;
}) {
  const parts: Array<{PartNumber: number; ETag?: string; Size?: number}> = [];
  let marker: string | undefined;
  do {
    // R2/S3 的 ListParts 会分页返回；这里循环拉完所有 part，
    // 方便前端恢复上传或在 complete 前确认已经上传的分片。
    const response = await getStorageClient().send(
      new ListPartsCommand({
        Bucket: env.R2_BUCKET,
        Key: input.key,
        UploadId: input.uploadId,
        PartNumberMarker: marker
      })
    );
    parts.push(
      ...(response.Parts ?? []).map((part) => ({
        PartNumber: part.PartNumber ?? 0,
        ETag: part.ETag,
        Size: part.Size
      }))
    );
    marker = response.IsTruncated && response.NextPartNumberMarker ? String(response.NextPartNumberMarker) : undefined;
  } while (marker);
  return parts.filter((part) => part.PartNumber > 0);
}

export async function completeMultipartUpload(input: {
  key: string;
  uploadId: string;
  parts: Array<{PartNumber: number; ETag: string}>;
}) {
  // S3 CompleteMultipartUpload 要求分片按 PartNumber 升序排列。
  // 前端可能并发上传并以任意顺序回传 ETag，因此服务端统一排序。
  const response = await getStorageClient().send(
    new CompleteMultipartUploadCommand({
      Bucket: env.R2_BUCKET,
      Key: input.key,
      UploadId: input.uploadId,
      MultipartUpload: {
        Parts: input.parts
          .map((part) => ({PartNumber: part.PartNumber, ETag: part.ETag}))
          .sort((a, b) => (a.PartNumber ?? 0) - (b.PartNumber ?? 0))
      }
    })
  );
  return {
    key: input.key,
    location: response.Location,
    publicUrl: publicObjectUrl(input.key)
  };
}

export async function abortMultipartUpload(input: {
  key: string;
  uploadId: string;
}) {
  await getStorageClient().send(
    new AbortMultipartUploadCommand({
      Bucket: env.R2_BUCKET,
      Key: input.key,
      UploadId: input.uploadId
    })
  );
}

export function publicObjectUrl(key: string) {
  // 没有配置公网域名时返回 r2:// 伪 URL，表示对象已经入库但不能直接公开访问。
  // 下载接口会在这种情况下再生成短期 GET 签名 URL。
  return env.R2_PUBLIC_BASE_URL
    ? `${env.R2_PUBLIC_BASE_URL.replace(/\/$/, "")}/${key}`
    : `r2://${env.R2_BUCKET}/${key}`;
}

export async function putObject(input: {
  key: string;
  body: PutObjectCommandInput["Body"];
  contentType: string;
  contentLength?: number;
}) {
  const contentLength = input.contentLength ?? (input.body instanceof Uint8Array ? input.body.byteLength : undefined);
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: input.key,
    Body: input.body,
    ContentType: input.contentType,
    ContentLength: contentLength
  });

  await getStorageClient().send(command);
  return {
    key: input.key,
    publicUrl: publicObjectUrl(input.key),
    sizeBytes: contentLength ?? 0
  };
}

export async function createDownloadUrl(key: string) {
  if (env.R2_PUBLIC_BASE_URL) {
    return publicObjectUrl(key);
  }

  // 私有桶没有公开域名时，只发放 15 分钟下载地址，避免转写原始文件长期裸露。
  const command = new GetObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: key
  });

  return getSignedUrl(getStorageClient(), command, {expiresIn: 900});
}

export async function deleteObject(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: key
  });

  await getStorageClient().send(command);
}
