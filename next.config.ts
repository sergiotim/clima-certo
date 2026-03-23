import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Security: remove X-Powered-By header
  poweredByHeader: false,

  // Allow OpenWeatherMap icon images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "openweathermap.org",
        pathname: "/img/wn/**",
      },
    ],
  },

  // Dev debugging: log fetch URLs in server console
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
