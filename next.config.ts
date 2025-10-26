import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    PORT: "1976"
  },
  webpack: (config) => {
    return config;
  }
};

export default nextConfig;
