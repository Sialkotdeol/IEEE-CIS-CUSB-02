import path from "node:path";
import type { NextConfig } from "next";

// Pin the project root. Without this, Next walks up the folders, finds a stray
// package-lock.json (e.g. in the home folder) and treats that folder as the root.
const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  turbopack: { root: projectRoot },
  outputFileTracingRoot: projectRoot,
  // Allow mobile testing on the local network
  experimental: {
    // Some next.js versions use this under experimental
  },
  // @ts-ignore
  allowedDevOrigins: ['192.168.68.104', 'http://192.168.68.104:3000', '192.168.68.103', 'http://192.168.68.103:3000', 'localhost', '127.0.0.1', '172.25.179.69', 'http://172.25.179.69:3002'],
  async redirects() {
    return [
      // Contribute-X has concluded; send old links to its past-event page.
      { source: '/contribute-x', destination: '/past-events/contribute-x', permanent: false },
    ];
  },
};

export default nextConfig;
