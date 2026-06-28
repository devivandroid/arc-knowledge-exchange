import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { QueryProvider } from "@/components/QueryProvider";
import { WalletProvider } from "@/hooks/useWallet";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://kx-platform.fly.dev"),
  title: "KX Platform",
  description:
    "The programmable trust & commerce layer for humans, autonomous agents and organizations. Built on Arc.",
  icons: {
    icon: "/brand/favicon.svg",
    shortcut: "/brand/favicon.svg",
    apple: "/brand/favicon.svg"
  },
  openGraph: {
    title: "KX Platform",
    description:
      "Human & Agent Commerce Platform for programmable USDC workflows. Built on Arc.",
    images: ["/brand/logo-wordmark.svg"]
  },
  twitter: {
    card: "summary_large_image",
    title: "KX Platform",
    description:
      "Human & Agent Commerce Platform for programmable USDC workflows. Built on Arc.",
    images: ["/brand/logo-wordmark.svg"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <QueryProvider>
          <WalletProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </WalletProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
