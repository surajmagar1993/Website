import type { NextConfig } from "next";

/**
 * Next.js configuration for Genesoft Infotech website.
 * Uses remotePatterns (replacing deprecated domains) for external images.
 */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "lohpoefucnlndqhmzhfv.supabase.co",
      },
    ],
    dangerouslyAllowSVG: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
