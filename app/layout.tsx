import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";

import { AICopilot } from "@/components/copilot/chat-widget";
import { Toaster } from "sonner";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Finora | Modern Finance for Moroccan SMEs",
  description: "AI-powered financial SaaS for Moroccan SMEs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.className} antialiased selection:bg-jade/20 selection:text-jade overflow-x-hidden`}>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
