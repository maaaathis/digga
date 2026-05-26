"use client";

import { useTheme } from "next-themes";
import { type FC, useEffect, useRef } from "react";

type RenderOptions = {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
  "timeout-callback"?: () => void;
  theme?: "light" | "dark" | "auto";
  appearance?: "always" | "execute" | "interaction-only";
  size?: "normal" | "flexible" | "compact";
};

type TurnstileApi = {
  render: (el: HTMLElement, options: RenderOptions) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";
let scriptPromise: Promise<void> | null = null;

function waitForApi(resolve: () => void): void {
  if (window.turnstile) {
    resolve();
    return;
  }
  const interval = setInterval(() => {
    if (window.turnstile) {
      clearInterval(interval);
      resolve();
    }
  }, 50);
  // Give up after 10s so we never leak the interval.
  setTimeout(() => clearInterval(interval), 10_000);
}

function loadTurnstile(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    );
    if (existing) {
      waitForApi(resolve);
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => waitForApi(resolve);
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Failed to load Turnstile"));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

type TurnstileWidgetProps = {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  resetSignal?: number;
};

const TurnstileWidget: FC<TurnstileWidgetProps> = ({
  siteKey,
  onVerify,
  onExpire,
  resetSignal = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbacksRef = useRef({ onVerify, onExpire });
  const { resolvedTheme } = useTheme();

  callbacksRef.current = { onVerify, onExpire };

  useEffect(() => {
    let cancelled = false;

    loadTurnstile()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        if (widgetIdRef.current) return;

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          appearance: "always",
          size: "flexible",
          theme: resolvedTheme === "dark" ? "dark" : "auto",
          callback: (token) => callbacksRef.current.onVerify(token),
          "expired-callback": () => callbacksRef.current.onExpire?.(),
          "error-callback": () => callbacksRef.current.onExpire?.(),
          "timeout-callback": () => callbacksRef.current.onExpire?.(),
        });
      })
      .catch((error) => console.error(error));

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
        widgetIdRef.current = null;
      }
    };
    // siteKey is stable per render; theme is read once on mount intentionally.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  useEffect(() => {
    if (resetSignal === 0) return;
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch {}
    }
  }, [resetSignal]);

  return <div ref={containerRef} className="min-h-[65px]" />;
};

export default TurnstileWidget;
