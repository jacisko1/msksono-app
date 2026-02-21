import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/logo.png", "icons/icon-192.svg", "icons/icon-512.svg", "icons/icon-maskable.svg"],
      manifest: {
        name: "MSK Ultrasound Academy",
        short_name: "MSK US",
        description: "Progressive Web App for musculoskeletal ultrasound education.",
        theme_color: "#00626c",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "icons/icon-192.svg",
            sizes: "192x192",
            type: "image/svg+xml"
          },
          {
            src: "icons/icon-512.svg",
            sizes: "512x512",
            type: "image/svg+xml"
          },
          {
            src: "icons/icon-maskable.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,json}"],
        navigateFallback: "/offline.html"
      },
      devOptions: {
        enabled: true
      }
    })
  ]
});
