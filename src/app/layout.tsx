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
  title: "NOIR | Ecosystem Activity Index",
  description:
    "Real-time development activity metrics for the Noir ecosystem across GitHub. Track commits, developers, and project growth.",
  openGraph: {
    title: "NOIR Ecosystem Activity Index",
    description:
      "Real-time development activity metrics for the Noir ecosystem across GitHub.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NOIR Ecosystem Activity Index",
    description:
      "Real-time development activity metrics for the Noir ecosystem across GitHub.",
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
