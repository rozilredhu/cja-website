import {
  heritageArticles,
  heritageGallery,
  heritageIntro,
  heritageSections,
  heritageTimeline,
} from "@/content/heritage";

export function getHeritageIntro() {
  return heritageIntro;
}

export function getHeritageSections() {
  return heritageSections;
}

export function getHeritageArticles() {
  return heritageArticles;
}

export function getHeritageArticle(slug: string) {
  return heritageArticles.find((a) => a.slug === slug);
}

export function getHeritageArticleSlugs() {
  return heritageArticles.map((a) => a.slug);
}

export function getHeritageTimeline() {
  return heritageTimeline;
}

export function getHeritageGallery() {
  return heritageGallery;
}
