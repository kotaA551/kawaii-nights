// src/lib/googleLoader.ts
import { Loader } from "@googlemaps/js-api-loader";

export const googleLoader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  version: "weekly",
  libraries: ["places", "marker"],  // 両方まとめる
});
