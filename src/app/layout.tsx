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
  title: "Aztec Pulse | Ecosystem Health Dashboard",
  description:
    "Comprehensive ecosystem health dashboard for the Aztec Network. Track token metrics, TVL, network status, and developer activity.",
  openGraph: {
    title: "Aztec Pulse | Ecosystem Health Dashboard",
    description:
      "Comprehensive ecosystem health dashboard for the Aztec Network.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aztec Pulse | Ecosystem Health Dashboard",
    description:
      "Comprehensive ecosystem health dashboard for the Aztec Network.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
