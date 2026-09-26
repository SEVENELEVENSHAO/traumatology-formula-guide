import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Traumatology Formula Guide",
  description: "A source-attributed study guide for traumatology formulas and their relationships.",
  manifest: "./manifest.webmanifest",
};

export const viewport: Viewport = { themeColor: "#17201d", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
