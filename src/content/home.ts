import { aboutContent } from "./about";

export const homeContent = {
  heroEyebrow: "Canadian Jats Association",
  heroTitle: "Connecting Jat families across Canada",
  heroBody:
    "A not-for-profit for the Jat community in Canada — networking, newcomer support, and cultural celebrations including Holi and Diwali. Formed in 2006; based in the Greater Toronto Area.",
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
  /**
   * Homepage sponsors — same set and order as cjacanada.com / draft scrape
   * (images copied from the previous CJA static site assets).
   */
  sponsors: {
    title: "Our Sponsors",
    body: "Thank you to the community businesses and professionals who support CJA.",
    items: [
      {
        name: "Ruhil Holdings",
        image: "/images/sponsors/ruhil.png",
        alt: "Ruhil Holdings — Real Estate, Tech Solutions, Eco-Organic Farming",
      },
      {
        name: "Anshul Ruhil",
        image: "/images/sponsors/anshulruhil.png",
        alt: "Anshul Ruhil, CEO and Founder of Ruhil Holdings",
      },
      {
        name: "Sunshine Dental",
        image: "/images/sponsors/sunshine.png",
        alt: "Sunshine Dental clinic, Brampton",
      },
      {
        name: "Atlantic Immigration Lawyer",
        image: "/images/sponsors/atlantic.png",
        alt: "Atlantic Immigration Lawyer — Amardeep Singh",
      },
      {
        name: "Ravi Hooda",
        image: "/images/sponsors/ravihooda.png",
        alt: "Ravi Hooda and Rashmi Hooda — Century 21 Red Star Realty",
      },
      {
        name: "Parveen Dalal",
        image: "/images/sponsors/parveen.png",
        alt: "Parveen Dalal — Century 21 Red Star Realty Inc.",
      },
      {
        name: "Sweet Tooth Dentistry",
        image: "/images/sponsors/sweettooth.png",
        alt: "Sweet Tooth Dentistry — Dr Amit Narwal DDS",
      },
      {
        name: "Sanjeev Malik",
        image: "/images/sponsors/sanjeevmalik.png",
        alt: "Sanjeev Malik — Financial Security Advisor",
      },
    ],
  },
  socialStripTitle: "Follow CJA",
  socialStripBody:
    "Find CJA on Facebook, Instagram, and YouTube — official links on the Social page.",
};
