// 兼容旧 /api/api-keys/:id/reset 路径；重置逻辑复用账号设置下的 API Key 路由。
export {POST} from "@/app/api/account/api-keys/[apiKeyId]/route";
