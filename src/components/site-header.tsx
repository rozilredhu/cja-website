"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { navLinks, siteConfig, type NavLink } from "@/lib/site-config";

function NavItem({
  link,
  openSub,
  setOpenSub,
  closeMobile,
}: {
  link: NavLink;
  openSub: string | null;
  setOpenSub: (href: string | null) => void;
  closeMobile: () => void;
}) {
  const hasChildren = Boolean(link.children?.length);
  const subId = useId();
  const itemRef = useRef<HTMLLIElement>(null);
  const isExpanded = openSub === link.href;

  const closeSub = useCallback(() => setOpenSub(null), [setOpenSub]);

  useEffect(() => {
    if (!hasChildren || !isExpanded) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        closeSub();
        const trigger = itemRef.current?.querySelector<HTMLElement>(
          "[data-nav-sub-trigger]",
        );
        trigger?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [hasChildren, isExpanded, closeSub]);

  if (!hasChildren) {
    return (
      <li>
        <Link href={link.href} onClick={closeMobile}>
          {link.label}
        </Link>
      </li>
    );
  }

  return (
    <li
      ref={itemRef}
      className={`nav-item-has-children${isExpanded ? " is-sub-open" : ""}`}
      onMouseEnter={() => setOpenSub(link.href)}
      onMouseLeave={() => setOpenSub(null)}
      onFocusCapture={() => setOpenSub(link.href)}
      onBlurCapture={(event) => {
        const next = event.relatedTarget as Node | null;
        if (next && itemRef.current?.contains(next)) return;
        setOpenSub(null);
      }}
    >
      <div className="nav-item-row">
        {link.menuOnly ? (
          <button
            type="button"
            className="nav-parent-label"
            data-nav-sub-trigger
            aria-expanded={isExpanded}
            aria-haspopup="true"
            aria-controls={subId}
            onClick={() => setOpenSub(isExpanded ? null : link.href)}
          >
            {link.label}
            <span aria-hidden className="nav-chevron">
              {isExpanded ? "▴" : "▾"}
            </span>
          </button>
        ) : (
          <>
            <Link href={link.href} onClick={closeMobile}>
              {link.label}
            </Link>
            <button
              type="button"
              className="nav-sub-toggle"
              data-nav-sub-trigger
              aria-expanded={isExpanded}
              aria-haspopup="true"
              aria-controls={subId}
              aria-label={`${link.label} submenu`}
              onClick={(event) => {
                event.preventDefault();
                setOpenSub(isExpanded ? null : link.href);
              }}
            >
              <span aria-hidden>{isExpanded ? "▴" : "▾"}</span>
            </button>
          </>
        )}
      </div>
      <ul id={subId} className="nav-sub" role="list">
        {link.children!.map((child) => (
          <li key={`${child.href}-${child.label}`}>
            <Link
              href={child.href}
              onClick={() => {
                closeSub();
                closeMobile();
              }}
            >
              {child.label}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const closeMobile = useCallback(() => {
    setOpen(false);
    setOpenSub(null);
  }, []);

  useEffect(() => {
    if (!open && !openSub) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (openSub) {
        setOpenSub(null);
        return;
      }
      if (open) {
        setOpen(false);
        const toggle = document.querySelector<HTMLElement>(".nav-toggle");
        toggle?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, openSub]);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link
          href="/"
          className="brand"
          aria-label={siteConfig.name}
          onClick={closeMobile}
        >
          <Image
            src="/images/brand/CJA_Icon.svg"
            alt=""
            width={120}
            height={52}
            className="brand-logo"
            priority
            unoptimized
          />
          <span className="sr-only">{siteConfig.name}</span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => {
            setOpen((v) => !v);
            setOpenSub(null);
          }}
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
              <NavItem
                key={link.href}
                link={link}
                openSub={openSub}
                setOpenSub={setOpenSub}
                closeMobile={closeMobile}
              />
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
