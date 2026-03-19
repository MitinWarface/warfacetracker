import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Оптимизация для слабого интернета
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.wf.mail.ru",
      },
      {
        protocol: "https",
        hostname: "cdn.wfts.su",
      },
      {
        protocol: "https",
        hostname: "wfts.su",
      },
      {
        protocol: "https",
        hostname: "*.warface.com",
      },
      {
        protocol: "https",
        hostname: "wf.cdn.gmru.net",
      },
      {
        protocol: "https",
        hostname: "ru.warface.com",
      },
      {
        protocol: "https",
        hostname: "api.warface.ru",
      },
    ],
    // Оптимизация изображений
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96],
    minimumCacheTTL: 60,
  },
  
  allowedDevOrigins: ["26.150.128.167", "localhost:3000"],
  
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "26.150.128.167:3000"],
      bodySizeLimit: "1mb", // Уменьшено для скорости
    },
  },
  
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
  
  // Кэширование для production
  async rewrites() {
    return [];
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
