import { Metadata } from "next";
import "../styles/index.scss";

export const metadata = {
  title: "HDR Infuser",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
