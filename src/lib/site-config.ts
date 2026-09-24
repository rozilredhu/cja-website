/** Public site configuration (no secrets). */

export const siteConfig = {
  name: "Canadian Jats Association",
  shortName: "CJA",
  description:
    "Official community website of the Canadian Jats Association (CJA) — connecting Jat families across Canada. Not-for-profit founded in 2006.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://draft.cjacanada.ca",
  locale: "en_CA",
  /** Public contact email from cjacanada.com */
  email: "info@cjacanada.com",
  /** Mailing address from cjacanada.com contact panel */
  address: "230-2980 Drew Rd, Mississauga ON L4T0A7, Canada",
  themeColor: "#0b1f3a",
  backgroundColor: "#f7f4ef",
  social: {
    facebook: "https://www.facebook.com/p/Canadian-Jats-Association-61576962496974/",
    instagram: "https://www.instagram.com/cjacanadaofficial/",
    youtube: "https://youtu.be/snPEyAif9xc",
    x: "https://twitter.com/cjacanada",
  },
} as const;

export type NavLink = {
  href: string;
  label: string;
  children?: readonly { href: string; label: string }[];
};

/** Primary top nav — Events / Volunteer removed from header (pages remain reachable). About CJA dropdown includes Our Socials. */
export const navLinks: readonly NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/officials", label: "Officials" },
  { href: "/news", label: "News" },
  { href: "/hindu-calendar", label: "Calendar" },
  { href: "/gallery", label: "Gallery" },
  { href: "/heritage", label: "Heritage" },
  {
    href: "/about",
    label: "About CJA",
    children: [
      { href: "/about", label: "About CJA" },
      { href: "/social", label: "Our Socials" },
    ],
  },
  { href: "/contact", label: "Contact" },
  { href: "/members/login", label: "Login" },
] as const;

export const footerLinks = [
  { href: "/about", label: "About CJA" },
  { href: "/hindu-calendar", label: "Hindu Calendar" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/past-executives", label: "Past Executives" },
  { href: "/members/register", label: "Join / Register" },
  { href: "/members/login", label: "Login" },
] as const;

/** Footer social icons — Facebook, Instagram, YouTube (official CJA links). */
export const footerSocialLinks = [
  {
    key: "facebook",
    label: "Facebook",
    href: siteConfig.social.facebook,
  },
  {
    key: "instagram",
    label: "Instagram",
    href: siteConfig.social.instagram,
  },
  {
    key: "youtube",
    label: "YouTube",
    href: siteConfig.social.youtube,
  },
] as const;
