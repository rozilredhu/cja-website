/** Public site configuration (no secrets). */

export const siteConfig = {
  name: "Canadian Jats Association",
  shortName: "CJA",
  description:
    "Official community website of the Canadian Jats Association (CJA) — connecting Jat families across Canada. Non-for-profit founded in 2006.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://draft.cjacanada.ca",
  locale: "en_CA",
  /** Public contact email from cjacanada.com */
  email: "info@cjacanada.com",
  /** Mailing address from cjacanada.com contact panel */
  address: "230-2980 Drew Rd, Mississauga ON L4T0A7, Canada",
  themeColor: "#4285f4",
  backgroundColor: "#ffffff",
  social: {
    x: "https://twitter.com/cjacanada",
    facebook: "https://www.facebook.com/groups/1761711964079236/",
    youtube: "https://youtu.be/snPEyAif9xc",
  },
} as const;

export type NavLink = {
  href: string;
  label: string;
  children?: readonly { href: string; label: string }[];
};

/** Primary top nav — Events / Volunteer / About removed from header (pages remain reachable). */
export const navLinks: readonly NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/officials", label: "Officials" },
  { href: "/news", label: "News" },
  { href: "/gallery", label: "Gallery" },
  { href: "/heritage", label: "Heritage" },
  { href: "/documents", label: "Documents" },
  { href: "/social", label: "Social" },
  { href: "/contact", label: "Contact" },
  { href: "/members/login", label: "Login" },
] as const;

export const footerLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/past-executives", label: "Past Executives" },
  { href: "/members/register", label: "Join / Register" },
  { href: "/members/login", label: "Login" },
] as const;
