import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIDA - AI DJ Assistant",
  description: "XR DJ Console with AI Coach",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
