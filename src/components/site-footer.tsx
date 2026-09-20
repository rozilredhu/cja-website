import Link from "next/link";
import { footerLinks, siteConfig } from "@/lib/site-config";

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
