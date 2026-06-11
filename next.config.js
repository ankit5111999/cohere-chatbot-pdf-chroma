/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // swcMinify removed — enabled by default and no longer a valid option in Next.js 16
  turbopack: {
    // topLevelAwait is supported natively by Turbopack; no extra config needed.
    // Empty config silences the webpack/turbopack mismatch error.
  },
};
 
export default nextConfig;
