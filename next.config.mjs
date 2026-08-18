/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Serve responsive AVIF/WebP via /_next/image (sharp is pinned in
    // package.json overrides). Remote avatars come from Supabase Storage.
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
}

export default nextConfig
