import type { NextConfig } from "next";

const githubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  ...(githubPages
    ? {
        output: "export" as const,
        basePath: "/sycomosite",
        trailingSlash: true,
        distDir: ".next-pages",
      }
    : {}),
  allowedDevOrigins: ["192.168.1.13"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
