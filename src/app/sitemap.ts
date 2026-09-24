import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { getEventSlugs } from "@/modules/public/events";
import { getHeritageArticleSlugs } from "@/modules/public/heritage";
import { getNewsSlugs } from "@/modules/public/news";

const staticPaths = [
  "/",
  "/about",
  "/contact",
  "/officials",
  "/past-executives",
  "/news",
  "/events",
  "/gallery",
  "/heritage",
  "/heritage/timeline",
  "/heritage/gallery",
  "/documents",
  "/social",
  "/contact/volunteer",
  "/services",
  "/privacy",
  "/terms",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticEntries = staticPaths.map((path) => ({
    url: `${siteConfig.url}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: (path === "/" ? "weekly" : "monthly") as
      | "weekly"
      | "monthly",
    priority: path === "/" ? 1 : 0.6,
  }));

  const newsSlugs = await getNewsSlugs();
  const newsEntries = newsSlugs.map((slug) => ({
    url: `${siteConfig.url}/news/${slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const eventEntries = getEventSlugs().map((slug) => ({
    url: `${siteConfig.url}/events/${slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const heritageEntries = getHeritageArticleSlugs().map((slug) => ({
    url: `${siteConfig.url}/heritage/articles/${slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.4,
  }));

  return [
    ...staticEntries,
    ...newsEntries,
    ...eventEntries,
    ...heritageEntries,
  ];
}
