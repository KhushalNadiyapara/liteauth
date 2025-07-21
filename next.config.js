/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // ❌ REMOVE deprecated or unsupported fields
    // esmExternals: false, // 🔥 REMOVE this line
    // serverComponentsExternalPackages: ['your-package'], // 🔥 REMOVE or update
  },

  // ✅ If you still need to specify external packages for server components
  serverExternalPackages: ['your-package'], // ✅ NEW correct location
};

export default nextConfig;
