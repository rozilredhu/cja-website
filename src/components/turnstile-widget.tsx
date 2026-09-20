"use client";

import { useEffect, useId, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

type Props = {
  siteKey: string | null;
  bypass: boolean;
  name?: string;
};

const SCRIPT_ID = "cf-turnstile-script";

export function TurnstileWidget({
  siteKey,
  bypass,
  name = "cf-turnstile-response",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [token, setToken] = useState("");
  const reactId = useId();

  useEffect(() => {
    if (bypass || !siteKey || !containerRef.current) return;

    const render = () => {
      if (!window.turnstile || !containerRef.current) return;
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* ignore */
        }
      }
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (t) => setToken(t),
        "expired-callback": () => setToken(""),
        "error-callback": () => setToken(""),
        theme: "auto",
      });
    };

    if (window.turnstile) {
      render();
    } else {
      window.onTurnstileLoad = render;
      if (!document.getElementById(SCRIPT_ID)) {
        const script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit";
        script.async = true;
        document.head.appendChild(script);
      }
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* ignore */
        }
      }
    };
  }, [siteKey, bypass]);

  if (bypass || !siteKey) {
    return (
      <div className="turnstile-bypass" role="status">
        <input type="hidden" name={name} value="bypass" />
        <p className="form-hint">
          Bot protection is not configured — submissions are allowed in this
          environment (set <code>TURNSTILE_SITE_KEY</code> /{" "}
          <code>TURNSTILE_SECRET_KEY</code> to enable).
        </p>
      </div>
    );
  }

  return (
    <div className="turnstile-wrap" data-reactid={reactId}>
      <div ref={containerRef} />
      <input type="hidden" name={name} value={token} required />
    </div>
  );
}
