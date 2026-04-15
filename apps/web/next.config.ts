import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@head-editor/shared", "@head-editor/head-engine"]
};

export default nextConfig;
