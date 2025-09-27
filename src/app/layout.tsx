import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header";

export const metadata: Metadata = { title: "Kawaii Nights" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-gradient-to-b from-pink-50 to-rose-50 text-zinc-800 antialiased">
        <Header />
        <main className="mx-auto max-w-screen-xl px-4">{children}</main>
        <footer className="mt-16 py-10 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} Kawaii Nights
        </footer>
      </body>
    </html>
  );
}
