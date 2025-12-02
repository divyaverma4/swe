import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  images: {
    // Allow Supabase public storage across buckets and optionally bypass optimizer
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'psfumeaxgcsemrlzbuwq.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
