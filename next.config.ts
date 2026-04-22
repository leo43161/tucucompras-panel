import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  /* output: 'export', */
  images: { unoptimized: true },
  trailingSlash: true,
  allowedDevOrigins: ['192.168.100.41', '10.20.20.5'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production' ? "https://amadamia.com.ar/tucucompras/api" : "http://localhost/tucucompras/api",
  },
};

export default nextConfig;
