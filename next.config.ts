import type { NextConfig } from "next";
import { ARTICLES } from "./lib/wissen";

const nextConfig: NextConfig = {
  // Articles moved to root-level keyword URLs keep their old /ratgeber/<slug> links working (308)
  async redirects() {
    return ARTICLES.filter((a) => a.path).map((a) => ({
      source: `/ratgeber/${a.slug}`,
      destination: a.path!,
      permanent: true,
    }));
  },
};

export default nextConfig;
