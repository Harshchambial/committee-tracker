import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Vikas Samiti - Committee Fund & Payment Tracker",
  description: "Transparent monthly ₹1,000 contribution tracker, UPI payment verification, and fund utilization ledger.",
  applicationName: "Vikas Samiti",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vikas Samiti",
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icon.svg',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-100/70 text-slate-900 antialiased min-h-screen font-sans">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
