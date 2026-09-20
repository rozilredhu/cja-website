import type { NewsArticle } from "./types";

export const newsArticles: NewsArticle[] = [
  {
    slug: "welcome-to-cja-website",
    title: "Welcome to the new CJA community website",
    excerpt:
      "We are building a modern home for Canadian Jat families — news, events, leadership, and more.",
    publishedAt: "2026-09-01",
    author: "CJA Communications",
    featured: true,
    body: [
      "The Canadian Jats Association is launching a refreshed community website to keep members informed and connected across Canada.",
      "Phase 1 focuses on public pages, member accounts, a community directory, and admin tools. Content on this page is sample data only until CJA publishes live announcements.",
      "Bookmark this site and follow our social channels for upcoming festival dates, AGM notices, and volunteer opportunities.",
    ],
  },
  {
    slug: "diwali-celebration-announcement",
    title: "Diwali celebration — save the date (sample)",
    excerpt:
      "Join CJA for a community Diwali evening with cultural performances, dinner, and family activities.",
    publishedAt: "2026-08-15",
    author: "Events Team",
    featured: true,
    body: [
      "CJA invites families to a sample Diwali celebration. Venue and ticket details will be confirmed closer to the date.",
      "Volunteers are welcome for registration, décor, and youth activities — use the Volunteer form to express interest.",
      "This article is sample content for development; replace with real event details before production.",
    ],
  },
  {
    slug: "membership-renewal-reminder",
    title: "Membership renewal reminder (sample)",
    excerpt:
      "A friendly reminder that annual membership renewals help fund community programs.",
    publishedAt: "2026-07-20",
    author: "Membership Secretary",
    body: [
      "Thank you to everyone who supports CJA through membership. Renewals help sponsor cultural events, youth programs, and community outreach.",
      "Online membership tools arrive in a later Phase 1 module. For now, contact us via the Contact form with membership questions.",
    ],
  },
];
