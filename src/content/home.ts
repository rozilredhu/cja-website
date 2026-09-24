import { aboutContent } from "./about";

export const homeContent = {
  heroEyebrow: "Canadian Jats Association",
  heroTitle: "Connecting Jat families across Canada",
  heroBody:
    "A non-for-profit for the Jat community in Canada — networking, newcomer support, and cultural celebrations including Holi and Diwali. Formed in 2006; based in the Greater Toronto Area.",
  heroCtas: [] as { href: string; label: string }[],
  /** Homepage About teaser — mission + short vision cue from aboutContent */
  aboutPreview: {
    title: "About CJA",
    mission: aboutContent.mission,
    visionTeaser: aboutContent.vision.slice(0, 180).trimEnd() + "…",
    href: "/about",
    cta: "Learn more about CJA",
  },
  /** Members-only matrimonial — public teaser pointing at login */
  matrimonialPreview: {
    title: "Matrimonial",
    body: "Members can create a matrimonial profile for admin review, then browse opposite-gender profiles and message through the platform. Phone and email stay private.",
    note: "Members-only feature — sign in to manage or browse profiles.",
    href: "/members/login",
    cta: "Member login",
  },
  /** Members-only directory — public teaser pointing at login */
  directoryPreview: {
    title: "Community Directory",
    body: "Opt in to share your profile with fellow members, list a business, and browse the member and business directories. Sensitive details stay privacy-controlled.",
    note: "Browse is members-only — register or sign in to use the directory.",
    href: "/members/login",
    cta: "Member login",
  },
  /** Public Services marketplace teaser */
  servicesPreview: {
    title: "Services",
    body: "Browse babysitters, plumbers, electricians, lawyers, realtors, and mortgage agents. Filter by category, city, and price — no login required to search.",
    note: "Providers need a member account and a $10 / $25 / $90 CAD listing plan plus admin approval.",
    href: "/services",
    cta: "Browse Services",
  },
  socialStripTitle: "Follow CJA",
  socialStripBody:
    "Find CJA on Facebook, Instagram, and YouTube — official links on the Social page.",
};
