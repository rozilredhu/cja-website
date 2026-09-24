"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { navLinks, siteConfig } from "@/lib/site-config";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <Image
            src="/images/brand/CJA_Icon.svg"
            alt=""
            width={120}
            height={52}
            className="brand-logo"
            priority
            unoptimized
          />
          <span className="brand-text">
            <strong>{siteConfig.shortName}</strong>
            <span className="brand-sub">Canadian Jats Association</span>
          </span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <span aria-hidden>{open ? "✕" : "☰"}</span>
        </button>

        <nav
          id="primary-nav"
          className={`primary-nav ${open ? "is-open" : ""}`}
          aria-label="Primary"
        >
          <ul>
            {navLinks.map((link) => (
              <li
                key={link.href}
                className={link.children?.length ? "nav-item-has-children" : undefined}
              >
                <Link href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
                {link.children?.length ? (
                  <ul className="nav-sub">
                    {link.children.map((child) => (
                      <li key={child.href}>
                        <Link href={child.href} onClick={() => setOpen(false)}>
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
