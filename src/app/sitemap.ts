import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

const paths = [
  "/",
  "/about",
  "/contact",
  "/officials",
  "/past-executives",
  "/news",
  "/events",
  "/gallery",
  "/heritage",
  "/documents",
  "/social",
  "/volunteer",
  "/privacy",
  "/terms",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return paths.map((path) => ({
    url: `${siteConfig.url}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.6,
  }));
}
