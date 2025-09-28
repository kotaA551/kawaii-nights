// src/app/[locale]/layout.tsx
import type { ReactNode } from "react";
import type { LayoutProps } from "next";
import Header from "@/components/Header";

// 対応するロケールを列挙（必要に応じて増減）
export const SUPPORTED_LOCALES = ["en", "ja"] as const;

// SSG する場合（任意）
export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

// ★ Next 15 では params が Promise。await して取り出す
export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params; // ← ここがポイント

  return (
    <html lang={locale}>
      <body className="min-h-dvh bg-gradient-to-b from-pink-50 to-rose-50 text-zinc-800 antialiased">
        <Header />
        <main className="mx-auto max-w-screen-xl px-4">{children as ReactNode}</main>
        <footer className="mt-16 py-10 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} Kawaii Nights
        </footer>
      </body>
    </html>
  );
}
