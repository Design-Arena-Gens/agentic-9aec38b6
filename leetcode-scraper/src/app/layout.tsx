import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LeetCode Scraper",
  description:
    "Discover public LeetCode profiles with solved problem stats and recent submissions.",
  openGraph: {
    title: "LeetCode Scraper",
    description:
      "Inspect public LeetCode profiles with difficulty breakdowns and recent submissions.",
    url: "https://agentic-9aec38b6.vercel.app",
    siteName: "LeetCode Scraper",
  },
  twitter: {
    card: "summary_large_image",
    title: "LeetCode Scraper",
    description:
      "Inspect public LeetCode profiles with difficulty breakdowns and recent submissions.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
