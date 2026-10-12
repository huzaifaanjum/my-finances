import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import ServiceWorker from "@/components/layout/ServiceWorker";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "My Finances", template: "%s · My Finances" },
  description: "Personal savings planner",
  robots: { index: false, follow: false },
  applicationName: "My Finances",
  appleWebApp: { capable: true, title: "Finances", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#09090b",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
