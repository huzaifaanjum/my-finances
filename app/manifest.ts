import type { MetadataRoute } from "next";

/** Served at /manifest.webmanifest — lets the app install to the home screen and open full-screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "My Finances",
    short_name: "Finances",
    description: "Personal savings planner",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#09090b",
    theme_color: "#09090b",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/512?maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
