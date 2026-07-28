import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nexora — Disaster Management & Volunteer Recruitment",
  description: "Disaster Management & Volunteer Recruitment Platform for Bangladesh",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}