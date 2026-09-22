import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "African Founders — Directory of Founders Building Across Africa",
    template: "%s | African Founders",
  },
  description:
    "Every African founder, filterable by country, industry, role, and more. A comprehensive public directory of entrepreneurs and their ventures across Africa.",
  keywords: [
    "African founders",
    "Africa startups",
    "Nigerian founders",
    "Kenyan founders",
    "South African founders",
    "Ghanaian founders",
    "Egyptian founders",
    "Lagos startups",
    "Nairobi startups",
    "Cape Town startups",
    "fintech Africa",
    "tech startups Africa",
    "African entrepreneurs",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "African Founders",
    title: "African Founders — Directory of Founders Building Across Africa",
    description:
      "Every African founder, filterable by country, industry, role, and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "African Founders — Directory of Founders Building Across Africa",
    description:
      "Every African founder, filterable by country, industry, role, and more.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white font-sans text-yc-ink">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
