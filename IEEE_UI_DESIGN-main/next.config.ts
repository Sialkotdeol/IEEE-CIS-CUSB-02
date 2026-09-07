import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow mobile testing on the local network
  experimental: {
    // Some next.js versions use this under experimental
  },
  // @ts-ignore
  allowedDevOrigins: ['192.168.68.104', 'http://192.168.68.104:3000', '192.168.68.103', 'http://192.168.68.103:3000', 'localhost', '127.0.0.1', '172.25.179.69', 'http://172.25.179.69:3002']
};

export default nextConfig;
