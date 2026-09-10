import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Samiti - Committee Fund & Payment Tracker",
  description: "Transparent monthly ₹1,000 contribution tracker, UPI payment verification, and fund utilization ledger.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-100/70 text-slate-900 antialiased min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
