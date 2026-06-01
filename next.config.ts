import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root (several lockfiles exist higher up the tree).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
