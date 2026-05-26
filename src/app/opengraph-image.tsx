import { ImageResponse } from "next/og";

import { SITE_NAME, SITE_TAGLINE } from "@/lib/data";

export const runtime = "edge";
export const alt = `${SITE_NAME} · ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#fafafa",
          color: "#0a0a0a",
          padding: "80px",
          justifyContent: "space-between",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "16px",
              background: "#0a0a0a",
              color: "#fafafa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            d
          </div>
          <span style={{ fontSize: 28, fontWeight: 600 }}>{SITE_NAME}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h1
            style={{
              fontSize: 76,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              margin: 0,
            }}
          >
            Domain research that
            <br />
            tells you everything.
          </h1>
          <p style={{ fontSize: 32, color: "#525252", margin: 0 }}>
            DNS, RDAP, WHOIS, subdomains. One search, every angle.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#737373",
            fontSize: 22,
          }}
        >
          <span>{SITE_TAGLINE}</span>
          <span style={{ fontFamily: "monospace" }}>digga.dev</span>
        </div>
      </div>
    ),
    size,
  );
}
