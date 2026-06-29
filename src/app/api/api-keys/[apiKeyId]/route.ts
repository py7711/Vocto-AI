// 兼容旧 /api/api-keys/:id 路径；规范管理入口在 /api/account/api-keys/:id。
export {DELETE, PATCH} from "@/app/api/account/api-keys/[apiKeyId]/route";
