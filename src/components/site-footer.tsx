import Link from "next/link";
import { footerLinks, footerSocialLinks, siteConfig } from "@/lib/site-config";

function SocialIcon({ name }: { name: (typeof footerSocialLinks)[number]["key"] }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": true as const,
    focusable: false as const,
  };

  if (name === "facebook") {
    return (
      <svg {...common}>
        <path d="M22 12.07C22 6.48 17.52 2 11.93 2S1.86 6.48 1.86 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.02H7.9v-2.91h2.4V9.84c0-2.37 1.4-3.69 3.56-3.69 1.03 0 2.12.19 2.12.19v2.33h-1.2c-1.18 0-1.55.74-1.55 1.49v1.79h2.64l-.42 2.91h-2.22V22c4.78-.75 8.44-4.91 8.44-9.93z" />
      </svg>
    );
  }

  if (name === "instagram") {
    return (
      <svg {...common}>
        <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4c0 3.2-2.6 5.8-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8C2 4.6 4.6 2 7.8 2zm-.2 2C5.67 4 4 5.67 4 7.6v8.8C4 18.33 5.67 20 7.6 20h8.8c1.93 0 3.6-1.67 3.6-3.6V7.6C20 5.67 18.33 4 16.4 4H7.6zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.5-3.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M23.5 6.2a2.9 2.9 0 0 0-2.05-2.05C19.5 3.75 12 3.75 12 3.75s-7.5 0-9.45.4A2.9 2.9 0 0 0 .5 6.2 30.3 30.3 0 0 0 0 12a30.3 30.3 0 0 0 .5 5.8 2.9 2.9 0 0 0 2.05 2.05c1.95.4 9.45.4 9.45.4s7.5 0 9.45-.4a2.9 2.9 0 0 0 2.05-2.05A30.3 30.3 0 0 0 24 12a30.3 30.3 0 0 0-.5-5.8zM9.75 15.57V8.43L15.82 12l-6.07 3.57z" />
    </svg>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <p className="footer-brand">{siteConfig.name}</p>
          <p className="footer-tagline">
            Connecting Jat families across Canada.
          </p>
          <ul className="footer-social" aria-label="Social media">
            {footerSocialLinks.map((item) => (
              <li key={item.key}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="footer-social-link"
                >
                  <SocialIcon name={item.key} />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <ul className="footer-links">
          {footerLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </div>
      <p className="footer-copy">
        © {year} {siteConfig.name}. All rights reserved.
      </p>
    </footer>
  );
}
