import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";
export const metadata = { title: "Kawaii Nights" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-gradient-to-b from-pink-50 to-rose-50 text-zinc-800 antialiased">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-zinc-200">
          <div className="mx-auto max-w-screen-xl px-4 h-14 flex items-center gap-3">
            <a href="/" className="font-black text-pink-600 tracking-wide">
              Kawaii Nights
            </a>
            <nav className="ml-auto flex items-center gap-4 text-sm">
              <a className="hover:text-pink-600" href="#recommend">Recommended</a>
              <a className="hover:text-pink-600" href="#videos">Social Videos</a>
              <a className="hover:text-pink-600" href="#reviews">New Reviews</a>
              <a className="rounded-full px-3 py-1 bg-pink-600 text-white font-semibold hover:opacity-90" href="#post">List Your Venue</a>
              <ThemeToggle />
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-screen-xl px-4">{children}</main>

        <footer className="mt-16 py-10 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} Kawaii Nights
        </footer>
      </body>
    </html>
  );
}
