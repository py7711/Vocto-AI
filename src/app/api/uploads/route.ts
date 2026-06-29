// 兼容旧工作台和历史客户端使用的 `/api/uploads` 单文件上传地址。
// 新代码优先使用 `/api/upload/generate-signed-url`，这里保持相同返回结构，避免旧入口 404。
export {POST} from "@/app/api/upload/generate-signed-url/route";
