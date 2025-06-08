/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: "standalone",
  experimental: {
    // Removed the unsupported outputFileTracingExcludeFiles option
  },
  // Add this to disable static prerendering for /admin
  dynamicRoutes: {
    "/admin": {
      dynamic: "force-dynamic"
    }
  }
};

export default nextConfig;
