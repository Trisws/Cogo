import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ClientOnly } from "@/components/app-shell/client-only";
import { PhoneFrame } from "@/components/app-shell/phone-frame";
import { SplashFallback } from "@/components/app-shell/splash-fallback";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CoGo — Share road, Share future",
  description: "CoGo — nền tảng ghép chuyến đi chung nội đô, tiết kiệm chi phí và giảm phát thải.",
};

export const viewport: Viewport = {
  themeColor: "#1f8a53",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          <ClientOnly fallback={<PhoneFrame><SplashFallback /></PhoneFrame>}>
            <PhoneFrame>{children}</PhoneFrame>
          </ClientOnly>
          <Toaster position="top-center" />
        </TooltipProvider>
      </body>
    </html>
  );
}
