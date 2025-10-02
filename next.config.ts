import type { NextConfig } from "next";
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'maps.googleapis.com' },       // v1のmediaエンドポイント
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // リダイレクト先
      { protocol: 'https', hostname: '*.supabase.co' },             // Supabase画像
    ],
  },
};
export default nextConfig;
