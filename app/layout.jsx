import { Analytics } from "@vercel/analytics/react";
import { Metadata } from "next";

import "../styles/index.scss";

export const metadata = {
  title: "glomojis",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
      <Analytics />
    </html>
  );
}
