// 兼容旧 /api/api-keys 路径，实际管理逻辑统一维护在 /api/account/api-keys。
export {GET, POST} from "@/app/api/account/api-keys/route";
