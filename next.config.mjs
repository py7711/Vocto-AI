import createNextIntlPlugin from "next-intl/plugin";
import {legacyRewrites} from "./config/legacy-rewrites.mjs";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

// 只在这里放 Next.js 框架级配置；旧短路径兼容规则统一维护在 config/legacy-rewrites.mjs。
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.votxt.co"
      }
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb"
    }
  },
  async rewrites() {
    return legacyRewrites;
  }
};

export default withNextIntl(nextConfig);
