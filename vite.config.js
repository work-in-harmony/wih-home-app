import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import federation from "@originjs/vite-plugin-federation";
import ExportedModules from './src/ExportedModules';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
     tailwindcss(),
     federation({
      name: "Home-app",
      filename: "HomeApp.js",
      exposes: ExportedModules,
      remotes: {
        HostApp: "https://wih-host-app.vercel.app/assets/HostApp.js",
      },
      shared: {
        react: { singleton: true, eager: true },
        "react-dom": { singleton: true, eager: true },
        "react-router-dom": { singleton: true, eager: true },
      },
    }),
    {
      name: "vite-plugin-notify-host-on-rebuild",
      apply(config, { command }) {
        return Boolean(command === "build" && config.build?.watch);
      },
      async buildEnd(error) {
        if (!error) {
          try {
            await fetch("http://localhost:5173/__fullReload"); // http://localhost:5000
          } catch (e) {
            console.log(e);
          }
        }
      },
    },
  ],
  build: {
    modulePreload: false,
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
  },
});
