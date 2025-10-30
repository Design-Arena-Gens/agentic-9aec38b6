import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.leetcode.com",
      },
      {
        protocol: "https",
        hostname: "leetcode.com",
      },
      {
        protocol: "https",
        hostname: "leetcode-cn.com",
      },
    ],
  },
};

export default nextConfig;
