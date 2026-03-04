import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "10.115.3.12",
        port: "8055",
        pathname: "/assets/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
      },
    ],
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
