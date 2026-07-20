import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // demo pulls hundreds of remote posters — skip the optimizer for reliability/speed
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "s4.anilist.co" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
};

export default nextConfig;
