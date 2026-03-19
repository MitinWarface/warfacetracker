import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ],
    unoptimized: process.env.NODE_ENV === "development",
  },
  allowedDevOrigins: ["26.150.128.167", "localhost:3000"],
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "26.150.128.167:3000"],
      bodySizeLimit: "2mb",
    },
  },
  // Отключаем строгую проверку CORS для разработки
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
  // Vercel Postgres совместимость
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
