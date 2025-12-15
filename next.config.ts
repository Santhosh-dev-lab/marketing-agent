import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /node_modules/ },
      { message: /sourceMapURL/ },
      { message: /Failed to parse source map/ },
    ];
    return config;
  },
};

export default nextConfig;
