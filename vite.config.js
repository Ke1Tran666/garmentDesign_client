import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
  },

  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) {
              return "vendor-react";
            }
            if (id.includes("apexcharts") || id.includes("react-apexcharts")) {
              return "vendor-charts";
            }
            if (id.includes("lucide-react") || id.includes("hugeicons") || id.includes("react-icons")) {
              return "vendor-icons";
            }
            if (id.includes("motion")) {
              return "vendor-motion";
            }
            if (id.includes("@dnd-kit")) {
              return "vendor-dnd";
            }
            if (id.includes("xlsx")) {
              return "vendor-xlsx";
            }
            if (id.includes("axios")) {
              return "vendor-axios";
            }
            return "vendor";
          }
        },
      },
    },
  },

  server: {
    host: true,
    allowedHosts: true,

    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Referrer-Policy": "no-referrer-when-downgrade",
    },
  },
});
