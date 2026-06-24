import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { QueryProvider } from "@/components/QueryProvider";
import { WalletProvider } from "@/hooks/useWallet";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://arc-knowledge-exchange.fly.dev"),
  title: "Knowledge Exchange",
  description:
    "An independent marketplace where humans and agents buy, sell, request, and deliver knowledge assets using USDC. Built on Arc.",
  icons: {
    icon: "/brand/favicon.svg",
    shortcut: "/brand/favicon.svg",
    apple: "/brand/favicon.svg"
  },
  openGraph: {
    title: "Knowledge Exchange",
    description: "USDC-native knowledge commerce for humans and autonomous agents. Built on Arc.",
    images: ["/brand/logo-wordmark.svg"]
  },
  twitter: {
    card: "summary_large_image",
    title: "Knowledge Exchange",
    description: "USDC-native knowledge commerce for humans and autonomous agents. Built on Arc.",
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
