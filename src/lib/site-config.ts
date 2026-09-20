/** Public site configuration (no secrets). */

export const siteConfig = {
  name: "Canadian Jats Association",
  shortName: "CJA",
  description:
    "Official community website of the Canadian Jats Association (CJA) — connecting Jat families across Canada.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://draft.cjacanada.ca",
  locale: "en_CA",
  email: "info@cjacanada.ca",
  themeColor: "#1a237e",
  backgroundColor: "#ffffff",
  social: {
    // Placeholders until CJA confirms handles
    x: "",
    facebook: "",
    youtube: "",
  },
} as const;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/officials", label: "Officials" },
  { href: "/news", label: "News" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/heritage", label: "Heritage" },
  { href: "/documents", label: "Documents" },
  { href: "/social", label: "Social" },
  { href: "/contact", label: "Contact" },
  { href: "/volunteer", label: "Volunteer" },
  { href: "/members/login", label: "Login" },
  { href: "/admin/login", label: "Admin" },
] as const;

export const footerLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/past-executives", label: "Past Executives" },
  { href: "/members/register", label: "Join / Register" },
  { href: "/members/login", label: "Member login" },
  { href: "/admin/login", label: "Admin" },
] as const;
