// src/app/[locale]/layout.tsx
import type { ReactNode } from "react";
import Header from "@/components/Header";

export const SUPPORTED_LOCALES = ["en", "ja"] as const;

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

// ★ Next.js 15: params は Promise になる
type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  return (
    <html lang={locale}>
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
