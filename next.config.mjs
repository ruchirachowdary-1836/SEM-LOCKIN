/** @type {import('next').NextConfig} */
// Static export for GitHub Pages. The site is served from
// https://<user>.github.io/SEM-LOCKIN/, so every route and asset needs that prefix.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
