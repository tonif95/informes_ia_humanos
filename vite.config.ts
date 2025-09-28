import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  // --- AÑADE ESTE BLOQUE PARA QUE FUNCIONE EN RENDER ---
  preview: {
    host: true,
    port: 8080,
    // --- AÑADE ESTA LÍNEA ---
    allowedHosts: true,
  },
  // ----------------------------------------------------
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
