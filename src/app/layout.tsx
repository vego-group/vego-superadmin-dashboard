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
  title: "MyVego Dashboard",
  description: "Smart Mobility Management System",
  icons: {
    icon: "/myvego_logo.png",
    apple: "/myvego_logo.png",
  },
  openGraph: {
    title: "MyVego Dashboard",
    description: "Smart Mobility Management System",
    url: "https://www.myvego.com",
    siteName: "MyVego",
    images: [
      {
        url: "/myvego_logo.png",
        width: 800,
        height: 600,
        alt: "MyVego Dashboard",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyVego Dashboard",
    description: "Smart Mobility Management System",
    images: ["/myvego_logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}