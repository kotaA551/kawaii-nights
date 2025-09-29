import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Kawaii Nights",
  description: "Find nearby ConCafes, Girls Bars, and Host Clubs instantly.",
  icons: { icon: "/favicon.ico" },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover", // iOS セーフエリア対応
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-white text-zinc-800 antialiased">
        <Header />
        <main className="mx-auto max-w-screen-xl px-4 pb-[max(env(safe-area-inset-bottom),8px)]">
          {children}
        </main>
      </body>
    </html>
  );
}
