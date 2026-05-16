import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Kavach — Your family's health, protected.",
  description:
    "Kavach helps caregivers organise medical records, generate a one-page doctor summary, and share it securely.",
  manifest: "/manifest.json",
  themeColor: "#1a1a2e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
