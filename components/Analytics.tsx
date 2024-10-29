'use client';

export const Analytics = () => (
  <script
    defer
    src={process.env.NEXT_PUBLIC_ANALYTICS_SCRIPT}
    data-website-id={process.env.NEXT_PUBLIC_ANALYTICS_ID}
  ></script>
);
